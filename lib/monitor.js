/*eslint no-console: "allow"*/

function getInitialPrice(client, opts, cb) {
  if (opts.action === 'sell') {
    return cb(null, opts.buyIn);
  }

  client.getProductTicker((err, r, data) => {
    if (err) {
      return cb(err);
    }

    return cb(null, parseFloat(data.price, 10));
  });
}

function monitor(client, opts, cb) {
  getInitialPrice(client, opts, (err, initialPrice) => {
    if (err) {
      return cb(err);
    }
    const percent = opts.percent;
    const action = opts.action;
    let spread = initialPrice * percent;

    console.log('initialPrice,', initialPrice, 'spread', spread);
    if (action === 'buy') {
      console.log('acquire @', initialPrice - spread);
    } else if (action === 'sell') {
      console.log('sell @', initialPrice + spread);
    }
    const timer = setInterval(() => {
      client.getProductTicker((err, r, data) => {
        if (err) {
          //clearInterval(timer);
          //return cb(err);
          console.log(err);
          return;
        }

        const currentPrice = parseFloat(data.price, 10);

        console.log('currentPrice', currentPrice, 'date', Date.now());
        if (action === 'buy') {
          if (currentPrice <= initialPrice - spread) {
            // buy
            clearInterval(timer);
            return cb(null, { price: currentPrice });
          } else if (currentPrice >= initialPrice + spread) {
            // adjust
            // switch for logger
            initialPrice = currentPrice;
            spread = initialPrice * percent;
            console.log('acquire @', initialPrice - spread);
          }
        } else if (action === 'sell') {
          if (currentPrice >= initialPrice + spread) {
            clearInterval(timer);
            return cb(null, { price: currentPrice });
          }
        } else {
          return cb(new Error('missing action'));
        }
      });
    }, 600);
  });
}

module.exports = monitor;
