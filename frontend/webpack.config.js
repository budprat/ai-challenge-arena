const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.tsx',
  mode: 'development',
  devtool: false, // Disabled source maps
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main_bundle.[contenthash].js', // Added [contenthash]
    publicPath: '',
    clean: true, // Clean the output directory before emit
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    devMiddleware: {
      publicPath: '',
    },
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    historyApiFallback: true,
    hot: false, // Disabled Hot Module Replacement
    client: {
      overlay: true,
      // webSocketURL configuration is not needed if HMR (hot:true) is off
      // but doesn't hurt to leave it if we re-enable hot later.
      webSocketURL: {
        hostname: '56724b3016940.notebooks.jarvislabs.net',
        pathname: '/ws',
        port: 443,
        protocol: 'wss'
      }
    },
  }
};
