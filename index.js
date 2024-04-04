
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
})()