function getOrders(client, opts={ status: 'all' }, cb) {
  opts.product_id = client.productId;
  client.getOrders(opts, (err, r, data) => {
    if (r && r.statusCode !== 200) {
      err = new Error(`GDAX call failed with HTTP: ${r.statusCode}`);
    }

    return cb(err, data);
  });
}

function getAccounts(client, cb) {
  client.getAccounts((err, r, data) => {
    if (r && r.statusCode !== 200) {
      err = new Error(`GDAX call failed with HTTP: ${r.statusCode}`);
    }

    return cb(err, data);
  });
}

module.exports.getOrders = getOrders;
module.exports.getAccounts = getAccounts;
