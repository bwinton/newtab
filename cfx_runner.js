/**
 * This is a short script that will run cfx in a new process
 * and forward output from that process to stdout
 */

var terminal = require('child_process').spawn('bash',[],{detached:false});

terminal.stdout.on('data', function (data) {
    console.log(""+data);
});

terminal.stderr.on('data', function (data) {
    console.error(""+data);
});

var str = "cfx --pkgdir=./addon";

process.argv.forEach(function(val, i, array){
    if(i<=1) return;
    i-=2;
    console.log('arg'+i+': '+val);
    str += ' '+val;
});

console.log("running: "+str);
terminal.stdin.write(str);
terminal.stdin.end();