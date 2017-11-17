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
  .option('-simulate --simulate <simulate>')
  .action(function(args) {
    const client = clientFactory(args.options.market, args.options.simulate);
    patron(client, args.options.fund, args.options.buyspread, args.options.sellspread);
  });

vorpal.delimiter('GDAX $').show();
