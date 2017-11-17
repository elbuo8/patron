'use strict';
/*eslint no-console: "allow"*/
const logUpdate = require('log-update');

function getInitialPrice(client, opts, cb) {
  if (opts.action === 'sell' && opts.initialPrice) {
    return cb(null, opts.initialPrice);
  }

  client.getProductTicker((err, r, data) => {
    if (err) {
      return cb(err);
    } else if (r.statusCode !== 200) {
      return cb(new Error('GDAX call failed'));
    }

    return cb(null, parseFloat(data.price, 10));
  });
}

function monitor(client, opts, cb) {
  getInitialPrice(client, opts, (err, initialPrice) => {
    if (err) {
      return cb(err);
    }
    const action = opts.action;
    const percent = opts.percent;
    let spread = initialPrice * percent;

    console.log('initialPrice', initialPrice, 'spread', spread);
    if (action === 'buy') {
      console.log('acquire @', initialPrice - spread);
    } else if (action === 'sell') {
      console.log('sell @', initialPrice + spread);
    }

    function update() {
      client.getProductTicker((err, r, data) => {
        if (err) {
          console.log(err);
          return scheduleUpdate();
        } else if (r.statusCode !== 200) {
          console.log('gdax monitor status code', r.statusCode);
          return scheduleUpdate();
        }

        const currentPrice = parseFloat(data.price, 10);

        // logUpdate(`\ncurrentPrice ${currentPrice}\n`);
        if (action === 'buy') {
          if (currentPrice <= initialPrice - spread) {
            // buy
            return cb(null, { price: currentPrice });
          } else if (currentPrice >= initialPrice + spread) {
            // adjust
            initialPrice = currentPrice;
            spread = initialPrice * percent;
            console.log('acquire @', initialPrice - spread);
          }
        } else if (action === 'sell') {
          if (currentPrice >= initialPrice + spread) {
            return cb(null, { price: currentPrice });
          }
        }
        return scheduleUpdate();
      });
    }

    function scheduleUpdate() {
      setTimeout(update.bind(this), 600);
    }

    return scheduleUpdate();
  });
}

module.exports = monitor;
module.exports.getInitialPrice = getInitialPrice;
