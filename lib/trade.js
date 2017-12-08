/*eslint no-console: "allow"*/

function executeTrade(client, action, quantity, cb) {
  const params = {
    product_id: client.productID,
    type: 'market'
  };

  if (action === 'buy') {
    params.funds = quantity;
  } else {
    params.size = quantity;
  }

  client[action](params, (err, r, receipt) => {
    if (err) {
      return cb(err);
    } else if (r.statusCode !== 200) {
      console.log(receipt);
      return cb(new Error(`Couldnt process the ${action} order in GDAX`));
    }

    function getOrderStatus() {
      client.getOrder(receipt.id, (err, r, order) => {
        if (err) {
          console.log(err);
          return scheduleUpdate();
        } else if (r.statusCode !== 200) {
          //console.log('gdax monitor status code', r.statusCode);
          return scheduleUpdate();
        } else if (order.status !== 'done' && order.settled !== true) {
          return scheduleUpdate();
        }
        console.log(order);
        if (action === 'buy') {
          let quantity = parseFloat(order.executed_value, 10);
          let price = quantity / parseFloat(order.filled_size, 10);
          return cb(null, { action, price, quantity });
        } else {
          let quantity = parseFloat(order.filled_size, 10);
          let price = parseFloat(order.executed_value, 10) - parseFloat(order.fill_fees) / quantity;
          return cb(null, {action, price, quantity });
        }
      });
    }

    function scheduleUpdate() {
      setTimeout(getOrderStatus.bind(this), 600);
    }

    return scheduleUpdate();
  });
}
function trade(client, opts, cb) {
  const quantity = opts.quantity;
  const action = opts.action;
  const price = opts.price;
  console.log('Will', action, quantity, '@', price);

  if (process.env.NODE_ENV === 'production') {
    return executeTrade(client, action, quantity, cb);
  }

  return cb(null, { action, price, quantity });
}

module.exports = trade;
