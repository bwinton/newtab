    var terminal = require('child_process').spawn('bash',[],{detached:false});

module.exports = function(grunt){

  var settings = grunt.file.readJSON('grunt-settings.json');

  var ssh_settings = (function(){
    var obj = {
      path: settings.path,
      srcBasePath: "./website/",
      host: settings.host,
      createDirectories: true,
      username: settings.username
    };
    /* handle privateKey ssh or password based ssh */
    if(settings.privateKey){
      obj.privateKey = grunt.file.read(settings.privateKey);
      obj.passphrase = settings.passphrase;
    }
    else{
      obj.password = settings.password;
    }
    return obj;
  })();


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // secret: grunt.file.readJSON('../secrets/secret.json'),

    sftp: {

      push: {
        files: [
          {src: ["./website/**"] }
        ],
        options: ssh_settings
      },
      upload_xpi: {
        files: [ {src: ["./newtab.xpi"] } ],
        options: ssh_settings
      }
    },

    sshexec: {
      clean: {
        command: 'rm -rf '+ ssh_settings.path + '/**',
        options: ssh_settings
      }
    },

    exec:{
      cfx: {
        cmd: function(){
          str = "";
          for(var x=0; x<arguments.length; x++){
            str += " "+arguments[x];
          }
          /* have the command echo itself and add the correct pkgdir */
          return 'echo \'running: cfx "' + str + '"\' && cfx --pkgdir=./addon ' + str;
        }
      },
      test_cfx: {
        cmd: "cfx --version",
        stdout: false
      },
      rm_xpi: {
        cmd: "rm newtab.xpi"
      },
      git_push: {
        cmd: "git push origin master --tags"
      },
      git_tag: {
        cmd: function(vers){
          return "git tag v"+vers;
        }
      },
      start_cfx: {
        cmd: function(vers){
          // return "node ./website/cfx_runner.js";
          return"node node_modules/forever/bin/forever -s start ./website/cfx_runner.js";
        },
        callback: function(vers){
          return "echo yo";
        }
      },
      start_server: {
        cmd: function(vers){
          return"node node_modules/forever/bin/forever -s start node_modules/.bin/http-server website -s -d false -p 3456 -c -1";
        }
      },
      sigint_listener: {
        cmd: function(vers){
          return "node ./website/sigint_listener.js";
        }
      },
      stop_all:{
        cmd: function(vers){
          return"node node_modules/forever/bin/forever stopall";
        }
      },
      echo: {
        cmd: function(m){
          return 'echo '+m+"!";
        }
      }
    }

  });

  /* load npm tasks */
  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-exec');

  /* cleans up the working directory */
  grunt.registerTask('clean', ['exec:rm_xpi']);

  /* cleans the remote directory and pushes all html files */
  grunt.registerTask('deploy', ['sshexec', 'sftp:push']);

  /* runs deploy task and exports the xpi file and uploads it */
  grunt.registerTask('export', ['xpi', 'deploy', 'sftp:upload_xpi']);

  grunt.registerTask('version', function(){
    grunt.log.writeln('version: '+get_version());
  });
  grunt.registerTask('start', ['exec:start_server', 'exec:start_cfx']);
  grunt.registerTask('stop', ['exec:stop_all']);

  /* updates package.json files and git
  with new version number and runs export */
  grunt.registerTask('release', function(version){
    if(version === undefined){
      grunt.log.error('no version specified');
      return false;
    }
    else{
      /* update package.json version */
      if(!update_version(version)) return false;
      /* tag git, push to central repo, export */
      grunt.task.run(['export']); //exec:git_push 'exec:git_tag:'+version
    }
  });

  /* a multitask (kinda) for running the cfx tool */
  grunt.registerTask('cfx', function(){
    if(!arguments.length){
      grunt.log.error('must specify arguments like "grunt cfx:run" for example');
      return false;
    }
    var args = Array.prototype.slice.call(arguments);
    grunt.task.run('exec:cfx:'+args.join(':'));
  });


  grunt.registerTask('release', function(type){

    /* get the current version (always stored as a string) */
    var version = parseFloat(get_version());

    /* handle case when type is a valid number */
    if(/^\d+(\.\d{1,2})?$/.test(type)){
      new_version = parseFloat(type);

      if(new_version <= version){
        grunt.log.error('you must provide a version number that is greater than the current version');
        return false;
      }
      else version = new_version;
    }

    /* handle major release */
    else if(/^major$/i.test(type)){
      version = Math.floor(version + 1);
    }

    /* handle minor release */
    else if(/^minor$/i.test(type)){
      version = version + 0.01;
    }

    /* handle invalid type string */
    /* having not type specified is valid though */
    else if(type){
      grunt.log.error('you must either specify a major or minor release or a valid version number');
      return false;
    }

    if(type){
      /* update the package.json version numbers */
      update_version(version);

      /* tag version in git */
      grunt.task.run('exec:git_tag:'+version);
    }

    /* push update to central repo */
    // grunt.task.run('exec:git_push:');

    /* export the files to the remote server */
    grunt.task.run('export');
  });

  /*
  HELPERS
   */

   function get_version(){
    var pkg = grunt.file.readJSON('./addon/package.json');
    return pkg.version;
   }

  /* updates the version number */
  function update_version(num){
    num = parseFloat(num);
    return writeJSON('./addon/package.json')('version',num) &&
           writeJSON('./package.json')('version',num);
  }

  /* changes the given key's value in the given json file */
  function writeJSON(file_path){
    return function(key, value){
      try{
        var obj = grunt.file.readJSON(file_path);
        obj[key] = value;
        grunt.file.write(file_path, JSON.stringify(obj, null, 4));
      }
      catch(e){
        grunt.log.writeln(e);
        return false;
      }
      return true;
    };
  }

};