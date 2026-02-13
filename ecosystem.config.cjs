module.exports = {
  apps: [
    {
      name: 'financially-frontend',
      script: 'npm',
      args: 'run preview -- --host --port 4176',
      cwd: '.',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4176,
      },
      error_file: './logs/financially-err.log',
      out_file: './logs/financially-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
    },
  ],
};
