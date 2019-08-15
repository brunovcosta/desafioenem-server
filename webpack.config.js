const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require( 'nodemon-webpack-plugin' )
const path = require('path');
var WebpackBuildNotifierPlugin = require('webpack-build-notifier');

const mode = process.env.NODE_ENV || 'development';

const common = {
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
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
};

const client = {
	...common,
	target: 'web',
	entry: './src/client/index.ts',
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/client/index.html'
		}),
		new CopyPlugin([
			{ from: './src/client/assets', to: '.' }
		]),
		new WebpackBuildNotifierPlugin({
			title: "Desafio Enem - client"
		})
	]
};

const server = {
	...common,
	entry: './src/server/index.ts',
	target: 'node',
	plugins: [
		new NodemonPlugin(),
		new WebpackBuildNotifierPlugin({
			title: "Desafio Enem - Server"
		})
	]
};

module.exports = [client, server]
