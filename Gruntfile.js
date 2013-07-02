module.exports = function(grunt){

  /* writes a js object as JSON to file
  using grunt.file.write */
  var writeJSON = function(obj, file_path){
    grunt.file.write(file_path, JSON.stringify(obj));
  };

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
      rm_xpi: {
        cmd: "rm newtab.xpi"
      }
    }
  });

  /* load npm tasks */
  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-exec');

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

  /* updates package.json files and git
  with new version number and runs export */
  grunt.registerTask('release', ['update_packages', 'export']);

};