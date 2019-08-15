const CopyPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require( 'nodemon-webpack-plugin' )
const path = require('path');
var WebpackBuildNotifierPlugin = require('webpack-build-notifier');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
	mode,
	resolve: {
		extensions: [ '.ts', '.js' ]
	},
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	entry: {
		server: './src/server/index.ts',
		client: './src/client/index.ts',
	},
	target: 'node',
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	plugins: [
		new NodemonPlugin(),
		new WebpackBuildNotifierPlugin({
			title: "Desafio Enem - Server"
		})
	]
};
