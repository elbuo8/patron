/*eslint no-console: "allow"*/
const monitor = require('./lib/monitor');
const trade = require('./lib/trade');

function dispatchAction(client, action, opts, cb) {
  const quantity = opts.quantity;
  const percent = opts.percent;

  const monitorOpts = { percent, action };
  if (action === 'sell') {
    monitorOpts.initialPrice = opts.initialPrice;
  }
  monitor(client, monitorOpts, (err, data) => {
    if (err) {
      return cb(err);
    }
    console.log(action, 'position at', data.price);
    trade(client, { quantity, action, price: data.price }, (err, result) => {
      if (err) {
        return cb(err);
      }
      console.log('done', action, 'position');
      const transaction = { price: result.price };
      if (action === 'buy') {
        transaction.acquired = result.quantity / result.price;
      } else if (action === 'sell') {
        transaction.sold = result.quantity * result.price;
      }
      return cb(null, transaction);
    });
  });
}

function run(client, fund=100, buyPercent=0.03, sellPercent=0.05) {
  const buyQuantity = fund / 2;
  fund -= buyQuantity;
  dispatchAction(client, 'buy', { percent: buyPercent, quantity: buyQuantity }, (err, position) => {
    if (err) {
      throw err;
    }

    dispatchAction(client, 'sell', { percent: sellPercent, quantity: position.acquired, initialPrice: position.price }, (err, receipt) => {
      if (err) {
        throw err;
      }

      fund += receipt.sold;
      console.log('Fund:', fund);
      return run(client, fund, buyPercent, sellPercent);
    });
  });
}

//run();
module.exports = run;
