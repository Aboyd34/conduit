// PM2 config — keeps both servers running 24/7 with auto-restart
module.exports = {
  apps: [
    {
      name: 'conduit-server',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 20,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: 'logs/server-error.log',
      out_file: 'logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
