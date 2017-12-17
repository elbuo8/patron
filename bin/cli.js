require('dotenv').config();
const vorpal = require('vorpal')();

const patron = require('../');
const clientFactory = require('../lib/clientFactory');
const accountOverview = require('../lib/accountOverview');

vorpal
  .command('trade', 'trades in a continous loop in GDAX')
  .option('-f --fund <fund>')
  .option('-m --market <market>')
  .option('-b --buyspread <buyspread>')
  .option('-s --sellspread <sellspread>')
  .option('-i --invest <investPerccent>')
  .action((args) => {
    const simulate = process.env.SIMULATE;
    const client = clientFactory(args.options.market, simulate);
    return patron(client, args.options.fund, args.options.investPercent, args.options.buyspread, args.options.sellspread);
  })
  .cancel(() => {
    // Prevent patron from running in the background
    vorpal.log('Terminating loop execution...');
    process.exit(0);
  });

vorpal
  .command('orders', 'lists all orders for market')
  .option('-m --market <market>')
  .action((args) => {
    const simulate = process.env.SIMULATE;
    const client = clientFactory(args.options.market, simulate);
    accountOverview.getOrders(client, (err, data) => {
      if (err) {
        this.log(err);
        return;
      }

      this.log(data);
    });
  });

vorpal
  .command('accounts', 'lists all marketi accounts')
  .action(() => {
    const simulate = process.env.SIMULATE;
    const client = clientFactory(null, simulate);
    accountOverview.getOrders(client, (err, data) => {
      if (err) {
        this.log(err);
        return;
      }

      this.log(data);
    });
  });


vorpal.delimiter('GDAX $').show();
