# Stock Investment Simulator
FAKE Money. Real Data. Would you like to play a game?

1. Clone & Download this Repo.
2. Create a Finnhub API Token.
3. Use the following commands via CLI to play:

VIEW ACCOUNT:
node index.js account

VIEW A STOCK PRICE:
node index.js symbol="AAPL"

BUY A STOCK:
node index.js buy="AAPL, 10"

SELL A STOCK. SELLS ALL SHARES BY DEFAULT:
node index.js sell="AAPL"
node index.js sell="AAPL, 2" (selling 2 shares of a larger amount)