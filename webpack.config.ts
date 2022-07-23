//@ts-check

import {
  NodeModulesAccessor,
  NodeModulesKeys,
} from './src/NodeModulesAccessor';

import * as path from 'path';
import CopyPlugin = require('copy-webpack-plugin');
//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    // modules added here also need to be added in the .vscodeignore file
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  devtool: 'nosources-source-map',
  plugins: [copyNodeModulesFiles()],
  infrastructureLogging: {
    level: 'log', // enables logging required for problem matchers
  },
};

function copyNodeModulesFiles() {
  console.log('=====================env=====================');
  console.log(process.env.NODE_ENV);
  const files = Object.keys(NodeModulesKeys)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => Number(key));
  const copies = files.map((file) => {
    const value = NodeModulesAccessor.getPathToNodeModulesFile(file);
    let sourcePath = path.join(...value.sourcePath, value.fileName);
    let destinationPath = path.join(...value.destinationPath, value.fileName);
    if (process.env.NODE_ENV === 'prod') {
      value.destinationPath.unshift();
      destinationPath = path.join(...value.destinationPath, value.fileName);
    }
    return {
      from: sourcePath,
      to: destinationPath,
    };
  });
  return new CopyPlugin({
    patterns: copies,
  });
}

module.exports = [extensionConfig];
