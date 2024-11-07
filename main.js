const token = require('./secret.json').token;
const Discord = require('./Discord');
const Database = require('./Database');
const express = require('express');
const apiImport = require('./api');
const changeContentUser = require('./changeContent/user').changeContentUser;

/*
	Todo (Eddy) :
		- catch CTRL+C for close the database and the websocket
		- new table for server (this program) activity
*/

function configApi(app, database, discord)
{
	const api = apiImport.Api;

	app.post('/api/get_user_presence', (req, res) => {api.getUserPresense(req, res, database)});
	app.post('/api/get_user_all_pfp', (req, res) => {api.getUserAllPfp(req, res, database)});
	app.post('/api/get_user_activity', (req, res) => {api.getUserActivity(req, res, database)});
	app.post('/api/get_user_custom_activity', (req, res) => {api.getUserCustomActivity(req, res, database)});
	app.post('/api/get_user_listen_music', (req, res) => {api.getUserListenMusic(req, res, database)});
	
	app.post('/api/search_user', (req, res) => {api.searchUser(req, res, database, discord)});
	app.post('/api/raw', (req, res) => {api.getRawData(req, res, database)});
	
	app.post('/api/get_self_info', (req, res) => {api.getSelfInfo(req, res, discord)});

	app.get('/api/reconnect', (res, req) => {discord.websocket.close(); req.send('Reconnecting...')});
}

function webServer(database, discord)
{
	const fs = require('fs');
	const index_content = fs.readFileSync('website/index.html', 'utf8');
	const app = express();
	const port = 3000;

	app.use(express.json());
	app.use(express.static('data/pfp'));

	app.get('/', (req, res) => {
		let		content = fs.readFileSync('website/html/home.html', 'utf8');
		const	page = 'home';
		let		copy = index_content;

		copy = copy.replace("{{stylesheet}}", page);
		copy = copy.replace("{{script}}", page);
		copy = copy.replace("{{content}}", content);
		res.send(copy);
	});
	
	app.get('/user', (req, res) => {
		if (!req.query.id)
		{
			res.redirect('/');
			return;
		}

		let		content = fs.readFileSync('website/html/user.html', 'utf8');
		const	page = 'user';
		let		copy = index_content;

		copy = copy.replace("{{stylesheet}}", page);
		copy = copy.replace("{{script}}", page);
		copy = copy.replace("{{content}}", content);
		changeContentUser(copy, req.query.id, database, discord).then((html) => {
			if (html === null)
			{
				res.redirect('/');
				return;
			}
			res.send(html);
		});
	});

	app.get('/search', (req, res) => {
		let		content = fs.readFileSync('website/html/search.html', 'utf8');
		const	page = 'search';
		let		copy = index_content;

		copy = copy.replace("{{stylesheet}}", page);
		copy = copy.replace("{{script}}", page);
		copy = copy.replace("{{content}}", content);
		res.send(copy);
	});

	app.get('/raw', (req, res) => {
		let		content = fs.readFileSync('website/html/raw.html', 'utf8');
		const	page = 'raw';
		let		copy = index_content;

		copy = copy.replace("{{stylesheet}}", page);
		copy = copy.replace("{{script}}", page);
		copy = copy.replace("{{content}}", content);
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

	configApi(app, database, discord);

	app.listen(port, () => {
		console.log(`Example app listening at http://localhost:${port}`);
	});
}

function main()
{
	let		database	= new Database.Database(token);
	let		discord		= null;
	let		canStart	= true;

	setTimeout(() => {
		if (canStart === false)
			return;
		discord = new Discord.Discord(database, token);
		webServer(database, discord);

	}, 1000);

	const quit = () => {
		canStart = false;
		console.warn('\rClosing connections...');
		if (discord)
		{
			discord.finish();
			discord = null;
			console.log('\rDiscord connection closed');
		}
		if (database)
		{
			database.close();
			database = null;
			console.log('\rDatabase connection closed');
		}
		setTimeout(() => {
			console.log('\rConnections closed and data saved, exiting...');
			process.exit();
		}, 1000);
	}

	process.on('SIGINT', quit);
	process.on('SIGTERM', quit);
	process.on('SIGQUIT', quit);
}

main();
