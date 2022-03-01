module.exports = {
  apps: [
    {
      name: 'cacaotalk',
      script: './dist/server.js',
      watch: true,
      ignore_watch: ['node_modules', 'uploads', 'logs'],
      watch_options: {
        followSymlinks: false,
      },
    },
  ],
};
