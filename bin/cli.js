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
    patron(clientFactory(args.options.market));
  });

vorpal.delimiter('GDAX $').show();
