const path = require('path');

const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");


const package = require('./package.json');
const pluginJson = require('./templates/plugin.json');

const interpreterPort = process.env.npm_config_interpreter_port;
const listenerPort = process.env.npm_config_listener_port;
const conferencingNodeUrl = process.env.npm_config_conferencing_node_url;

let port = listenerPort;
let isInterpreter = process.env.NODE_ENV === 'interpreter';
if (isInterpreter) {
  port = interpreterPort;
}

pluginJson.version = package.version;
pluginJson.configuration.isInterpreter = isInterpreter;

module.exports = {
  devServer: {
    port: port,
    compress: false, // needed for SSE support
    server: {
      type: 'https'
    },
    open: true,
    devMiddleware: {
      publicPath: '/webapp2/custom_configuration/plugins/interpretation'
    },
    proxy: [
      {
        context: ['**', '!/webapp2/custom_configuration/**'],
        target: conferencingNodeUrl, // Conferencing Node URL
        secure: false
      }
    ],
    static: {
      directory: path.join(__dirname, "dev-assets"),
      publicPath: '/webapp2/custom_configuration'
    }
  },
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/plugins/interpretation'),
    publicPath: ''
  },
  plugins: [
    new GenerateJsonPlugin('plugin.json', pluginJson, null, 2),
    new CopyPlugin({
      patterns: [
        { from: "src/assets/images", to: "assets/images" },
      ],
    }),
  ],
  // Disable the performance message for now
  performance: {
    hints: false
  }
};