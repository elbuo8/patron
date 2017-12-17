'use strict';
/*eslint no-console: "allow"*/
function getProductTickerSafe(client, cb) {
  client.getProductTicker((err, r, data) => {
    if (err || r.statusCode !== 200) {
      // call itself until it gets the price
      return setTimeout(() => {
        return getProductTickerSafe(client, cb);
      }, 600);
    } else {
      return cb(null, parseFloat(data.price, 10));
    }
  });
}

function getInitialPrice(client, opts, cb) {
  if (opts.action === 'sell' && opts.initialPrice) {
    return cb(null, opts.initialPrice);
  }

  return getProductTickerSafe(client, cb);
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
      getProductTickerSafe(client, (err, price) => {
        if (err) {
          console.log(err);
          return scheduleUpdate();
        }

        const currentPrice = price;

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
