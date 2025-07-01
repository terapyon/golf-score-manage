const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/constants': path.resolve(__dirname, './src/constants'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              noUnusedLocals: false,
              noUnusedParameters: false,
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'VITE_FIREBASE_USE_EMULATOR': JSON.stringify('true'),
        'VITE_FIREBASE_PROJECT_ID': JSON.stringify('demo-project'),
        'VITE_ENVIRONMENT': JSON.stringify('local'),
        'VITE_FIREBASE_API_KEY': JSON.stringify('demo-api-key'),
        'VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify('demo-project.firebaseapp.com'),
        'VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify('demo-project.appspot.com'),
        'VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify('123456789'),
        'VITE_FIREBASE_APP_ID': JSON.stringify('1:123456789:web:demo'),
        'VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify('G-DEMO'),
      },
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    host: '0.0.0.0',
    historyApiFallback: true,
    hot: !process.env.CI, // Disable hot reload in CI
    compress: true,
    client: {
      logging: process.env.CI ? 'error' : 'info', // Reduce logging in CI
    },
  },
};