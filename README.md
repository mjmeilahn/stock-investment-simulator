# Stock Market Game
<h3>FAKE Money. Real Data. Would you like to play a game?</h3>

<p>Everyone starts with $100k to invest - but this amount can be changed inside account.json.</p>

***

HOW TO GET STARTED

1. Clone & Download this Repo.
2. Create a local .env file in this repo with the line below.
> FINNHUB_API_KEY="XXXXXXXXXXXXXXXX"
3. Create a Finnhub API Token (they're free); swap out the X's in the .env with the API Token.
4. Use the following commands via CLI to play:

***

VIEW ACCOUNT:
> node index.js account

VIEW A STOCK PRICE:
> node index.js symbol="AAPL"

BUY A STOCK:
> node index.js buy="AAPL, 10"

SELL A STOCK:
> node index.js sell="AAPL"

SELL A PARTIAL AMOUNT OF STOCK:
> node index.js sell="AAPL, 2"

VIEW PROFIT / LOSS REPORT:
> node index.js report
