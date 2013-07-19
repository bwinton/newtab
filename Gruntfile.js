var terminal = require('child_process').spawn('bash',[],{detached:false});

module.exports = function(grunt){

  var settings = grunt.file.readJSON('grunt-settings.json');
  
  /* adds a '/' to the end of base url and path if it doesn't
  already have one  */
  (function(){
    var base = settings.base_url;
    var path = settings.path;

    if (base !== undefined){
      if (base[base.length-1] !== '/') base+='/';
      settings.base_url = base;
    }

    if (path !== undefined){
      if (path[path.length-1] !== '/') path+='/';
      settings.path = path;
    }
  })();

  var ssh_settings = (function(){
    var obj = {
      path: settings.path,
      srcBasePath: "./website/",
      host: settings.host,
      createDirectories: true,
      directoryPermissions: '0754',
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

    exec: {
      git_tag: {
        cmd: function(vers){
          return "git tag v"+vers;
        }
      },
    },

    shell: {
      kill: {
        command: 'node node_modules/forever/bin/forever stopall',
        options: {
          stdout: true
        }
      }
    },
    sftp: {

      push: {
        files: [
          {src: ["./website/**"] }
        ],
        options: ssh_settings
      },
      upload_xpi: {
        files: [ {src: ["./newtab.xpi", "./newtab.update.rdf"] } ],
        options: ssh_settings
      }
    },

    sshexec: {
      clean: {
        command: 'rm -rf '+ ssh_settings.path + 'customizer '+
                  ssh_settings.path + 'main '+
                  ssh_settings.path + 'shared '+
                  ssh_settings.path + 'newtab.xpi '+
                  ssh_settings.path + 'newtab.update.rdf '+
                  ssh_settings.path + 'index.html ',
        options: ssh_settings
      }
    },

    bgShell:{
      cfx: {
        cmd: function(){
          str = "";
          for(var x=0; x<arguments.length; x++){
            str += " "+arguments[x];
          }
          /* have the command echo itself and add the correct pkgdir */
          return 'echo \'running: cfx "' + str + '"\' && node ./cfx_runner.js ' + str;
        },
        bg: true
      },
      rm_xpi: {
        cmd: "rm newtab.xpi newtab.update.rdf"
      },
      mk_xpi: {
        // cmd: "cfx xpi --pkgdir=./addon"
        cmd: function(){
          var cmd = "cfx xpi --pkgdir=./addon";
          var base = settings.base_url;
          if (base.indexOf('https') === 0){
            cmd += " --update-link=" + base + "newtab.xpi --update-url=" + base + "newtab.update.rdf"
          }
          return cmd;
        }
      },
      git_push: {
        cmd: "git push origin master --tags"
      },
      start_cfx: {
        cmd: function(){
          str = "node ./cfx_runner.js run";
          if(settings.binary)
            str += " --binary="+settings.binary;
          return str;
        },
        bg: true
      },
      start_server: {
        cmd: function(){
          return"node node_modules/forever/bin/forever -s start node_modules/.bin/http-server website -s -d false -p 3456 -c-1";
        },
        bg: true
      }
    },

    sed:{

      deploy: {
          path: ['./addon', './website'],
          pattern: 'http://localhost:3456',
          replacement: settings.base_url,
          recursive: true
      },
      reset: {
          path: ['./addon', './website'],
          pattern: settings.base_url,
          replacement: 'http://localhost:3456',
          recursive: true
      }

    }
  });

  /* load npm tasks */
  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-sed');


  /* cleans up the working directory */
  grunt.registerTask('clean', function(arg){
    if(!arg)
      grunt.task.run('bgShell:rm_xpi');
    else if(arg === 'remote')
      grunt.task.run('sshexec:clean');
    else{
      grunt.log.error('clean:'+arg+' is not recognized');
      return false;
    }
  });

  /* cleans the remote directory and pushes all html files */
  grunt.registerTask('deploy', ['sed:deploy', 'sftp:push', 'sed:reset']);

  /* runs deploy task and exports the xpi file and uploads it */
  grunt.registerTask('export', ['sshexec:clean', 'sed:deploy', 'bgShell:mk_xpi', 'sftp:upload_xpi', 'sftp:push', 'sed:reset']);

  grunt.registerTask('version', function(){
    grunt.log.writeln('version: '+get_version());
  });

  grunt.registerTask('run', function(){
    process.on('SIGINT', function(){
      grunt.tasks(['shell'], {}, function() {
      });
    });
    grunt.tasks(['bgShell:start_server', 'bgShell:start_cfx'], {}, function() {});
  });

  /* a multitask (kinda) for running the cfx tool */
  grunt.registerTask('cfx', function(){
    if(!arguments.length){
      grunt.log.error('must specify arguments like "grunt cfx:run" for example');
      return false;
    }
    var args = Array.prototype.slice.call(arguments);
    grunt.task.run('bgShell:cfx:'+args.join(':'));
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
    num = '0.0.0';
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