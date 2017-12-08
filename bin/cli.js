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
  .action(function(args) {
    const simulate = process.env.SIMULATE;
    const client = clientFactory(args.options.market, simulate);
    patron(client, args.options.fund, args.options.buyspread, args.options.sellspread);
  });

vorpal.delimiter('GDAX $').show();
