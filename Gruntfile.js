module.exports = function (grunt) {
  grunt.initConfig({
    shipit: {
      options: {
        workspace: '/tmp/deploy/ya-sqs',
        deployTo: '/root/shipit-deploy',
        repositoryUrl: 'git@github.com:neoziro/ya-sqs.git',
        ignores: ['.*'],
        keepReleases: 2
      },
      staging: {
        servers: 'root@hipush.net'
      }
    }
  });

  grunt.loadNpmTasks('grunt-shipit');

  grunt.shipit.on('deploy', function () {
    grunt.task.run('pwd');
  });

  grunt.registerTask('pwd', function () {
    var done = this.async();
    grunt.shipit.remote('pwd', done);
  });
};
