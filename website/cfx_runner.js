    var terminal = require('child_process').spawn('bash',[],{detached:false});

    terminal.stdout.on('data', function (data) {
        console.log(""+data);
    });

    terminal.stderr.on('data', function (data) {
        console.error(""+data);
    });

    terminal.stdin.write('cfx run --pkgdir=./addon');
    terminal.stdin.end();