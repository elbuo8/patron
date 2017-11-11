import { describe } from 'ava-spec';
import monitor from '../lib/monitor';
import { getInitialPrice } from '../lib/monitor';


describe('#getInitialPrice', (it) => {
  it.cb('should cb with .initialPrice if action is sell', (t) => {
    getInitialPrice({}, { action: 'sell', initialPrice: 1 }, (err, price) => {
      t.ifError(err);
      t.is(price, 1);
      t.end();
    });
  });

  it.cb('should cb with error when client fails (non-http)', (t) => {
    const client = {
      getProductTicker: (cb) => { return cb(new Error()); }
    };
    getInitialPrice(client, {}, (err) => {
      t.truthy(err);
      t.end();
    });
  });

  it.cb('should cb with error when cliet fails (http)', (t) => {
    const client = {
      getProductTicker: (cb) => { return cb(null, { statusCode: 500}); }
    };
    getInitialPrice(client, {}, (err) => {
      t.truthy(err);
      t.end();
    });
  });

  it.cb('should cb with price as a float', (t) => {
    const client = {
      getProductTicker: (cb) => { return cb(null, { statusCode: 200 }, { price: '100.32' }); }
    };
    getInitialPrice(client, {}, (err, price) => {
      t.ifError(err);
      t.is(price, 100.32);
      t.end();
    });
  });
});

describe('#monitor', (it) => {
  it.cb('should cb with error if #getInitialPrice fails', (t) => {
    const client = {
      getProductTicker: (cb) => { return cb(new Error()); }
    };
    monitor(client, {}, (err) => {
      t.truthy(err);
      t.end();
    });
  });

  it.cb('should cb with (initialPrice + percent) for action "sell"', (t) => {
    let calls = 0;
    const client = {
      getProductTicker: (cb) => {
        if (calls === 0) {
          calls++;
          return cb(null, { statusCode: 200 }, { price: '15.3' });
        } else if (calls === 1) {
          calls++;
          return cb(null, { statusCode: 200 }, { price: '15.4' });
        } else if(calls === 2) {
          calls++;
          // errors should keep trying
          return cb(new Error());
        } else if (calls === 3) {
          calls++;
          // errors should keep trying
          return cb(null, { statusCode: 500 });
        }
        return cb(null, { statusCode: 200 }, { price: '15.46' });
      }
    };

    monitor(client, { action: 'sell', percent: 0.03, initialPrice: 15 }, (err, data) => {
      t.ifError(err);
      t.is(data.price, 15.46);
      t.end();
    });
  });

  it.cb('should cb when marketPrice <= (initialPrice - percent)', (t) => {
    let calls = 0;
    const client = {
      getProductTicker: (cb) => {
        if (calls === 0) {
          calls++;
          // set initalPrice to 15.3
          return cb(null, { statusCode: 200 }, { price: '15.3' });
        } else if (calls === 1) {
          calls++;
          return cb(null, { statusCode: 200 }, { price: '15.4' });
        } else if(calls === 2) {
          calls++;
          // force new initialPrice
          return cb(null, { statusCode: 200 }, { price: '15.46' });
        } else if (calls === 3) {
          calls++;
          return cb(null, { statusCode: 200 }, { price: '15.4' });
        }
        return cb(null, { statusCode: 200 }, { price: '14.80' });
      }
    };
    monitor(client, { action: 'buy', percent: 0.03 }, (err, data) => {
      t.ifError(err);
      t.is(data.price, 14.80);
      t.end();
    });
  });
});
