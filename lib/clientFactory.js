const Gdax = require('gdax');

function clientFactory(market = 'BTC', endpoint = undefined) {
  const productId = `${market.toUpperCase()}-USD`;
  return new Gdax.PublicClient(productId, endpoint);
}

module.exports = clientFactory;
