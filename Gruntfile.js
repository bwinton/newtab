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
      run: {
        cmd: "cfx run --pkgdir=./addon"
      },
      xpi: {
        cmd: "cfx xpi --pkgdir=./addon"
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


    release: {
      options: {
        file: "./addon/package.json",
        push: false,
        pushTags: false,
        npm: false
      }
    }

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

  /* execs cfx run to load and runt he plugin */
  grunt.registerTask('run', ['exec:run']);

  /* execs cfx xpi to bundle up the plugin */
  grunt.registerTask('xpi', ['exec:xpi']);

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

  /*
  HELPERS
   */

   function get_version(){
    var pkg = grunt.file.readJSON('./addon/package.json');
    return pkg.version;
   }

  /* updates the version number */
  function update_version(num){
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
  };

};