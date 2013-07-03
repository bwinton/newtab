module.exports = function(grunt){

  standard_sftp_options = {
    path: '/home/jmontgomery/public_html/newtab/',
    srcBasePath: "./website/",
    host: '<%= secret.host %>',
    createDirectories: true,
    passphrase: '<%= secret.passphrase %>',
    privateKey: grunt.file.read("../secrets/id_rsa"),
    username: '<%= secret.username %>'
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    secret: grunt.file.readJSON('../secrets/secret.json'),


    sftp: {

      new_stuff: {
        files: [
          {src: ["./website/4/**", "./website/customizer/**", "./website/scripts/**", "./website/styles/**"] }
        ],
        options: standard_sftp_options
      },

      other_files: {
        files: [
          {src: ["./website/1/**", "./website/2/**", "./website/3/**", "./website/images/**"] }
        ],
        options: standard_sftp_options
      },
      upload_xpi: {
        files: [ {src: ["./newtab.xpi"] } ],
        options: {
          path: '/home/jmontgomery/public_html/newtab/',
          host: '<%= secret.host %>',
          createDirectories: true,
          passphrase: '<%= secret.passphrase %>',
          privateKey: grunt.file.read("../secrets/id_rsa"),
          username: '<%= secret.username %>'
        }
      }
    },


    exec:{
      cfx: {
        cmd: function(){
          str = "cfx";
          for(var x=0; x<arguments.length; x++){
            str += " "+arguments[x];
          }
          /* have the command echo itself and add the correct pkgdir */
          return 'echo \'running: "' + str + '"\' && ' + str + ' --pkgdir=./addon';
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
      echo: {
        cmd: function(m){
          return 'echo '+m+"!";
        }
      }
    },

  });

  /* load npm tasks */
  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-exec');
  // grunt.loadNpmTasks('grunt-release');

  /* cleans up the working directory */
  grunt.registerTask('clean', ['exec:rm_xpi']);

  /* pushes just 4 and customizer */
  grunt.registerTask('push', ['sftp:new_stuff']);

  /* pushes just 1, 2, 3, 4, and customizer */
  grunt.registerTask('deploy', ['sftp:new_stuff', 'sftp:other_files']);

  /* runs deploy task and exports the xpi file and uploads it */
  grunt.registerTask('export', ['xpi', 'deploy', 'sftp:upload_xpi']);

  grunt.registerTask('version', function(){
    grunt.log.writeln('version: '+get_version());
  });

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


  grunt.registerTask('release', function(type, version){

    if(type === 'custom'){
      var valid_version = true;
      /* check that the version exists */
      if(arguments === undefined) valid_version = false;

      /* if string, validate the string */
      if(typeof(version) === 'string'){
        /* check that format is of xx.yy or xx where
        x and y are any numbers*/
        if(!(/^(\d+)(\.\d+)?$/).test(version)) valid_version = false;
      }

      /* if number, validate the number */
      else if(typeof(version) === 'number'){
        if(version<=0) valid_version = false;
      }

      /* version is not a number or string, it's not valid */
      else valid_version = false;

      if(!valid_version){
        grunt.log.error('you must provide a valid version number');
        return false;
      }
    }

    /* get and/or parse version */
    if(version === undefined) version = get_version();
    version = parseFloat(version);

    /* increment the mantissa */
    if(type === 'minor'){
      version += 0.1;
    }
    /* increment the characteristic */
    if(type === 'major'){
      version += 1;
    }

    /* update the package.json version numbers */
    update_version(version);

    /* tag version in git */
    grunt.task.run('exec:git_tag:'+version);

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