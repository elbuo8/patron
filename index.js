/*eslint no-console: "allow"*/
const monitor = require('./lib/monitor');
const trade = require('./lib/trade');

function dispatchAction(client, action, quantity, percent, cb) {
  monitor(client, { percent, action }, (err, data) => {
    if (err) {
      return cb(err);
    }
    console.log(action, 'position at', data.price);
    trade(client, { quantity, action }, (err) => {
      if (err) {
        return cb(err);
      }
      console.log('done', action, 'position');
      // should come from trade fn
      const transaction = {};
      if (action === 'buy') {
        transaction.acquired = quantity/data.price;
      } else if (action === 'sell') {
        transaction.sold = quantity * data.price;
      }
      return cb(null, transaction);
    });
  });
}

function run(client, fund=100, buyPercent=0.03, sellPercent=0.05) {
  const buyQuantity = fund / 2;
  fund -= buyQuantity;
  dispatchAction(client, 'buy', buyQuantity, buyPercent, (err, position) => {
    if (err) {
      throw err;
    }

    dispatchAction(client, 'sell', position.acquired, sellPercent, (err, receipt) => {
      if (err) {
        throw err;
      }

      fund += receipt.sold;
      console.log('Fund:', fund);
      run(client, fund, buyPercent, sellPercent);
    });
  });
}

//run();
module.exports = run;
