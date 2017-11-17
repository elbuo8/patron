/*eslint no-console: "allow"*/
const Gdax = require('gdax');

function clientFactory(market = 'BTC', simulate = true) {
  const productId = `${market.toUpperCase()}-USD`;

  if (simulate) {
    return new Gdax.PublicClient(productId);
  }

  const key = process.env.GDAX_API_KEY;
  const secret = process.env.GDAX_API_SECRET;
  const passphrase = process.env.GDAX_API_PASSPHRASE;
  const gdaxEndpoint = process.env.GDAX_API_ENDPOINT;

  console.log('You are about to use real money.');
  const client = new Gdax.AuthenticatedClient(key, secret, passphrase, gdaxEndpoint);
  // cuz gdax client is buggy
  client.productID = productId;
  return client;
}

module.exports = clientFactory;
