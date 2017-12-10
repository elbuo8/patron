require('dotenv').config();
const vorpal = require('vorpal')();

const patron = require('../');
const clientFactory = require('../lib/clientFactory');

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

vorpal.delimiter('GDAX $').show();
