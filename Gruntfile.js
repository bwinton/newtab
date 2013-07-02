module.exports = function(grunt){

  standard_sftp_options = {
    path: '/home/jmontgomery/public_html/newtab/',
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
        files: {
          "./": ["4/**", "customizer/**", "scripts/**", "styles/**"]
        },
        options: standard_sftp_options
      },

      other_files: {
        files: {
          "./": ["1/**", "2/**",
          "3/**", "images/**"]
        },
        options: standard_sftp_options
      },
    }
  });

  /* load sftp task */
  grunt.loadNpmTasks('grunt-ssh');

  /* pushes just 4 and customizer */
  grunt.registerTask('push', ['sftp:new_stuff']);

  /* pushes just 1, 2, 3, 4, and customizer */
  grunt.registerTask('deploy', ['sftp:new_stuff', 'sftp:other_files']);

};