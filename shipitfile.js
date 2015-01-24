module.exports = function (shipit) {
  shipit.initConfig({
    default: {
      workspace: '/tmp/deploy/ya-sqs',
      deployTo: '/root/shipit-deploy',
      repositoryUrl: 'git@github.com:neoziro/ya-sqs.git',
      ignores: ['.*'],
      keepReleases: 2
    },
    staging: {
      servers: 'root@hipush.net'
    }
  });

  shipit.on('deploy', function () {
    shipit.start('pwd');
  });

  shipit.blTask('pwd', function () {
    return shipit.remote('pwd');
  });

  shipit.task('x', ['pwd']);
};
