module.exports = {
  apps: [{
    name: 'ejidike-foundation',
    script: '/ejdk/ejidike-foundation/node_modules/.bin/next',
    args: 'start -p 3001',
    cwd: '/ejdk/ejidike-foundation',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
