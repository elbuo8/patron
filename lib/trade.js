/*eslint no-console: "allow"*/

function executeTrade(client, action, quantity, cb) {
  const params = {
    product_id:  client.productID,
    size: quantity,
    type: 'market'
  };

  client[action](params, (err, r, receipt) => {
    if (err) {
      return cb(err);
    }
  });
}
function trade(client, opts, cb) {
  const quantity = opts.quantity;
  const action = opts.action;
  console.log('Will', action, quantity);

  if (process.env.NODE_ENV === 'production') {
    return executeTrade(client, action, quantity, cb);
  }

  return cb(null, { action });
}

module.exports = trade;
