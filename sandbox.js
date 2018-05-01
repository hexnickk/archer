const casper = require('casper').create();
casper.options.viewportSize = { width: 1920, height: 1080 };

function report(url, cookies, message){
  return {
    url: url,
    cookies: cookies,
    message: message
  };
}

function main(args) {
  const target = args[0];
  const reports = [];

  casper.on('remote.alert', function(message) {
    reports.push(report(
      this.getCurrentUrl(),
      this.page.cookies,
      message
    ));
  });

  casper.on('run.complete', function() {
    this.echo(JSON.stringify(reports, null, 2));
  });

  casper.start(target);
  casper.run();
}

const args = casper.cli.args;
if (args.length === 0 || args.length > 1) {
  console.error('There must be exactly one url');
} else {
  main(args);
}