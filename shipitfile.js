module.exports = function (shipit) {
  shipit.initConfig({
    default: {},
    staging: {
      servers: 'myserver.com'
    }
  });

  shipit.task('test', function () {
    return shipit.local('echo "hello"')
    .then(function (res) {
      if (res.stdout !== 'hello\n')
        throw new Error('test not passing');
    });
  });

  shipit.task('default', ['test'], function () {
    console.log("Using default task that depends on 'test'");
  });
};
