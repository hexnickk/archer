const casper = require('casper').create();
casper.options.viewportSize = { width: 1920, height: 1080 };

function Report(url, cookies, message){
    this.url = url;
    this.cookies = cookies;
    this.message = message;
}


const args = casper.cli.args;
if (args.length === 0 || args.length > 1) {
    console.error("There must be exactly one url");
}

const target = args[0];
const reports = [];
casper.on('remote.alert', function(message) {
    reports.push(new Report(
        this.getCurrentUrl(),
        this.page.cookies,
        message
    ));
});
casper.on('run.complete', function() {
    this.echo(JSON.stringify(reports));
})
casper.start(target);
casper.run();