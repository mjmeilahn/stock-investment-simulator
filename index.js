
;(async function () {
  const fs = require('fs')
  const axios = require('axios')
  const fileStocks = fs.readFileSync('./invest-stocks.json', 'utf-8')
  let stocks = JSON.parse(fileStocks)
  const fileAccount = fs.readFileSync('./invest-account.json', 'utf-8')
  const balance = +JSON.parse(fileAccount).total
  const command = process.argv[2]

  axios.defaults.baseURL = 'https://finnhub.io/api/v1'
  axios.defaults.headers.common['X-Finnhub-Token'] = process.env.FINNHUB_API_KEY

  /*
  GENERATE PROFIT / LOSS REPORT:
  node index.js report

  VIEW ACCOUNT:
  node index.js account

  VIEW A STOCK PRICE:
  node index.js symbol="AAPL"

  BUY A STOCK (Symbol, Shares):
  node index.js buy="AAPL, 10"

  SELL A STOCK. SELLS ALL SHARES BY DEFAULT:
  node index.js sell="AAPL"
  node index.js sell="AAPL, 2" (selling 2 shares of a larger amount)

  SELL ALL STOCKS:
  node index.js everythingMustGo
  */

  if (command === undefined) {
    return console.log('\nNo arguments passed.\n')
  }

  // VIEW BANK ACCOUNT TOTALS
  else if (command.includes('account')) {
    console.log(`TOTAL: $${balance.toFixed(2)}`)
  }

  // VIEW A STOCK PRICE
  else if (command.includes('symbol')) {
    const symbol = command.split('=')[1]
    const res = await axios.get(`/quote?symbol=${symbol}`)
    const price = res.data.c

    console.log(`${symbol} = $${price.toFixed(2)}`)
  }

  // BUY A STOCK
  else if (command.includes('buy')) {
    const commandSplit = command.split('=')[1]
    const symbolShareSplit = commandSplit.split(',')
    const symbol = symbolShareSplit[0]
    const shares = +symbolShareSplit[1].trim()

    const res = await axios.get(`/quote?symbol=${symbol}`)
    const boughtPrice = res.data.c
    const cost = (boughtPrice * shares)
    const newTotal = (balance - cost).toFixed(2)

    if (newTotal <= 0) return console.log('GAME OVER. YOU ARE BROKE.')

    const account = JSON.stringify({ total: +newTotal }, null, 4)
    fs.writeFileSync('./invest-account.json', account)

    const investment = {
      symbol,
      boughtPrice,
      shares,
      date: Date.now(),
    }

    stocks = [...stocks, investment]

    const content = JSON.stringify(stocks, null, 4)
    fs.writeFileSync('./invest-stocks.json', content)

    console.log(investment)
  }

  // SELL A STOCK
  else if (command.includes('sell')) {
    const commandSplit = command.split('=')[1]
    let symbol = ''
    let partialShares = 0
    let sellPartial = false

    if (commandSplit.includes(',')) {
      sellPartial = true
      const symbolShareSplit = commandSplit.split(',')
      symbol = symbolShareSplit[0]
      partialShares = +symbolShareSplit[1].trim()
    }
    else {
      symbol = commandSplit
    }

    if (stocks.filter(s => s.symbol === symbol).length === 0) {
      return console.log('You do not own any stocks with this symbol.')
    }

    if (sellPartial === true) {
      let count = 0
      stocks.filter(s => {
        if (s.symbol === symbol) {
          count += s.shares
        }
      })

      if (count < partialShares) {
        return console.log('You asked to sell more shares than you have.')
      }
    }

    let shares = 0
    stocks.map(s => {
      if (s.symbol === symbol) {
        shares += +s.shares
      }
    })
    const res = await axios.get(`/quote?symbol=${symbol}`)
    const todayPrice = +res.data.c.toFixed(2)
    let deposit = +(todayPrice * shares).toFixed(2)

    const newStocks = []
    stocks.map(s => {
      if (s.symbol !== symbol && s.shares > 0) {
        newStocks.push(s)
      }
    })

    const soldStocks = []

    // SELLING PARTIAL AMOUNT OF SHARES LOGIC GOES HERE
    if (sellPartial === true) {
      let keptShares = shares - partialShares

      stocks.map((s, i) => {
        if (s.symbol === symbol && s.shares <= keptShares) {
          if (s.shares > 0) newStocks.push(s)
          keptShares -= s.shares
        }
        else if (s.symbol === symbol && s.shares > keptShares) {
          soldStocks.push({
            symbol,
            boughtPrice: s.boughtPrice,
            shares: s.shares - keptShares,
            date: s.date,
          })
          stocks[i].shares = keptShares
          keptShares = stocks[i].shares - keptShares

          if (stocks[i].shares > 0) newStocks.push(stocks[i])
        }
      })

      deposit = (todayPrice * partialShares).toFixed(2)
    }
    else {
      soldStocks.push(...stocks.filter(s => s.symbol === symbol && s.shares > 0))
    }

    const content = JSON.stringify(newStocks, null, 4)
    fs.writeFileSync('./invest-stocks.json', content)

    const total = (balance + +deposit).toFixed(2)
    const account = JSON.stringify({ total: +total }, null, 4)
    fs.writeFileSync('./invest-account.json', account)

    soldStocks.map(s => {
      console.log(`----------${s.symbol}----------`)
      console.log(`Bought Price: ${s.boughtPrice.toFixed(2)}`)
      console.log(`Selling Price: ${todayPrice.toFixed(2)}`)
      console.log(`$ Profit Per Share: ${(todayPrice - s.boughtPrice).toFixed(2)}`)
      console.log(`% Profit Per Share: ${(((todayPrice - s.boughtPrice) / s.boughtPrice) * 100).toFixed(1)}`)
      console.log(`TOTAL $ PROFIT: ${((todayPrice - s.boughtPrice) * s.shares).toFixed(2)}`)
      console.log(`TOTAL % PROFIT: ${((((todayPrice - s.boughtPrice) / s.boughtPrice) * 100) * s.shares).toFixed(1)}`)
    })

    console.log(`------------------------------`)
    console.log('OLD ACCOUNT VALUE: ' + balance.toFixed(2))
    console.log('NEW ACCOUNT VALUE: ' + total)
  }

  // SELL ALL STOCKS
  else if (command.includes('everythingMustGo')) {
    let deposit = 0
    const soldStocks = []

    async function loopStocks () {
      for (const s of stocks) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // API LIMITS
        const res = await axios.get(`/quote?symbol=${s.symbol}`)
        const todayPrice = res.data.c
        deposit += todayPrice * s.shares

        soldStocks.push({
          symbol: s.symbol,
          boughtPrice: s.boughtPrice,
          shares: s.shares,
          date: s.date,
          todayPrice,
        })
      }
    }
    await loopStocks()

    deposit = deposit.toFixed(2)
    deposit = +deposit
    const total = (balance + deposit).toFixed(2)

    const content = JSON.stringify([], null, 4)
    fs.writeFileSync('./invest-stocks.json', content)

    const account = JSON.stringify({ total: +total }, null, 4)
    fs.writeFileSync('./invest-account.json', account)

    soldStocks.map(s => {
      console.log(`----------${s.symbol}----------`)
      console.log(`Bought Price: ${s.boughtPrice.toFixed(2)}`)
      console.log(`Selling Price: ${s.todayPrice.toFixed(2)}`)
      console.log(`$ Profit Per Share: ${(s.todayPrice - s.boughtPrice).toFixed(2)}`)
      console.log(`% Profit Per Share: ${(((s.todayPrice - s.boughtPrice) / s.boughtPrice) * 100).toFixed(1)}`)
      console.log(`TOTAL $ PROFIT: ${((s.todayPrice - s.boughtPrice) * s.shares).toFixed(2)}`)
      console.log(`TOTAL % PROFIT: ${((((s.todayPrice - s.boughtPrice) / s.boughtPrice) * 100) * s.shares).toFixed(1)}`)
    })

    console.log(`------------------------------`)
    console.log('OLD ACCOUNT VALUE: ' + balance.toFixed(2))
    console.log('NEW ACCOUNT VALUE: ' + total)
  }

})()