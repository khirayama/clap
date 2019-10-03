const path = require('path');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  const config = {
    entry: {
      bundle: './src/index.tsx',
    },
    output: {
      filename: isProd ? '[name].[hash].js' : '[name].js',
      path: path.resolve('dist'),
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    plugins: [],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
            },
          },
        },
      ],
    },
    optimization: {
      minimize: isProd,
    },
    devtool: isProd ? false : 'inline-source-map',
  };

  return config;
};
