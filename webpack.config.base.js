const path = require('path');

module.exports = {
  resolve: {
    symlinks: false,

    modules: [
      path.resolve('node_modules'),
      path.resolve(__dirname, '.'),
      path.resolve(__dirname, 'src')
    ],
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, 'src')
    }
  }
};
