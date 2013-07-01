module.exports = function(grunt){

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    secret: grunt.file.readJSON('secret.json'),

    sftp: {
      test: {
        files: {
          "./": ["4/**", "customizer/**",
          "images/**", "scripts/**", "styles/**"]
        },
        options: {
          path: '<%= secret.path %>',
          host: '<%= secret.host %>',
          createDirectories: true,
          passphrase: '<%= secret.passphrase %>',
          privateKey: grunt.file.read("id_rsa"),
          username: '<%= secret.username %>',
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-ssh');

  grunt.registerTask('deploy', ['sftp']);

};