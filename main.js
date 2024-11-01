const Discord = require('./Discord');
const Database = require('./Database');
const express = require('express');
const apiImport = require('./api');

/*
	Todo (Eddy) :
		- catch CTRL+C for close the database and the websocket
		- new table for server (this program) activity
*/

function configApi(app, database)
{
	const api = apiImport.Api;

	app.post('/api/get_user_presence', (req, res) => {api.getUserPresense(req, res, database)});
	app.post('/api/get_user_all_pfp', (req, res) => {api.getUserAllPfp(req, res, database)});
	app.post('/api/get_user_activity', (req, res) => {api.getUserActivity(req, res, database)});
	app.post('/api/get_user_custom_activity', (req, res) => {api.getUserCustomActivity(req, res, database)});
}

function webServer(database)
{
	const fs = require('fs');
	const index_content = fs.readFileSync('website/index.html', 'utf8');
	const app = express();
	const port = 3000;

	app.use(express.json());
	app.use(express.static('data/pfp'));

	app.get('/', (req, res) => {
		const	page = 'home';
		let		copy = index_content;

		copy = copy.replace("{{stylesheet}}", page);
		copy = copy.replace("{{script}}", page);
		res.send(copy);
	});

	app.get('/search', (req, res) => {
		const	page = 'search';
		let		copy = index_content;

		copy = copy.replace("{{stylesheet}}", page);
		copy = copy.replace("{{script}}", page);
		res.send(copy);
	});

	app.get('/raw', (req, res) => {
		const	page = 'raw';
		let		copy = index_content;

		copy = copy.replace("{{stylesheet}}", page);
		copy = copy.replace("{{script}}", page);
		res.send(copy);
	});

	app.get('/settings', (req, res) => {
		const	page = 'settings';
		let		copy = index_content;

		copy = copy.replace("{{stylesheet}}", page);
		copy = copy.replace("{{script}}", page);
		res.send(copy);
	});

	app.get('/css/:css.css', (req, res) => {
		const css = fs.readFileSync(`website/css/${req.params.css}.css`, 'utf8');
		res.send(css);
	});

	app.get('/js/:js.js', (req, res) => {
		const js = fs.readFileSync(`website/js/${req.params.js}.js`, 'utf8');
		res.send(js);
	});

	app.get('/ico/:ico', (req, res) => {
		const icon = fs.readFileSync(`website/ico/${req.params.ico}`, 'binary');
		res.type('image/svg+xml');
		res.send(icon);
	});

	// configApi(app, database);

	app.listen(port, () => {
		console.log(`Example app listening at http://localhost:${port}`);
	});
}

function main()
{
	const	database	= new Database.Database();
	let		discord		= null;

	webServer(database);
	// setTimeout(() => {
 	// 	discord = new Discord.Discord(database);
	// }, 1000);

}

main();
