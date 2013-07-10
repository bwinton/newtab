    var terminal = require('child_process').spawn('bash',[],{detached:false});
    terminal.stdin.write('cfx run --pkgdir=./addon');
    terminal.stdin.end();