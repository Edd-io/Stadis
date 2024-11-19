const { exit } = require('process');
let token = null;
let logpass = null;
try {
	token = require('./secret.json').token_nexa;
	logpass = require('./secret.json').logpass;
}
catch (e) {
	printHeader();
	console.log('Please create a secret.json file with the following content:\n{\n\t"token": <your_token>,\n\t"logpass": <password_to_login_on_website>\n}');
	exit();
}

const Discord = require('./Discord');
const Database = require('./Database');
const express = require('express');
const session = require('express-session');
const apiImport = require('./api');
const changeContentUser = require('./changeContent/user').changeContentUser;

function printHeader()
{
	console.log(" _____ _            _ _");
	console.log("/  ___| |          | (_)");
	console.log("\\ `--.| |_ __ _  __| |_ ___");
	console.log(" `--. \\ __/ _` |/ _` | / __|");
	console.log("/\\__/ / || (_| | (_| | \\__ \\");
	console.log("\\____/ \\__\\__,_|\\__,_|_|___/");
	console.log("         By Nnaik0 & Kum1ta");
	console.log("----------------------------\n");
}

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
	app.post('/api/home', (req, res) => {api.getHome(req, res, database, discord)});

	app.get('/api/reconnect', (res, req) => {discord.websocket.close(); req.send('Reconnecting...')});

	app.post('/api/login', (req, res) => {
		if (req.body.password === logpass)
		{
			req.session.user.connected = true;
			res.send({connected: true});
		}
		else
			res.send({connected: false});
	});
}

function webServer(database, discord)
{
	const fs = require('fs');
	const index_content = fs.readFileSync('website/index.html', 'utf8');
	const login_content = fs.readFileSync('website/html/login.html', 'utf8');
	const app = express();
	const port = 3000;

	app.use(express.json());
	app.use(express.static('data/pfp'));
	app.use(session({
		secret: require('crypto').randomBytes(32).toString('hex'),
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }
	}));

	// app.set('trust proxy', 1); // and change secure to true when in production

	app.get('/', (req, res) => {
		const	page = 'home';
		let		copy = index_content
		let		content = fs.readFileSync('website/html/home.html', 'utf8');

		if (!req.session.user)
		{
			req.session.user = {
				connected: false,
			};
		}
		if (req.session.user.connected === true)
		{
			copy = copy.replace("{{stylesheet}}", page);
			copy = copy.replace("{{script}}", page);
			copy = copy.replace("{{content}}", content);
			res.send(copy);
		}
		else
			res.send(login_content);
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
		let		content = fs.readFileSync('website/html/settings.html', 'utf8');
		const	page = 'settings';
		let		copy = index_content;

		copy = copy.replace("{{stylesheet}}", page);
		copy = copy.replace("{{script}}", page);
		copy = copy.replace("{{content}}", content);
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
		console.log(`[Website] Listening on port ${port}`);
	});
}

function main()
{
	printHeader();
	console.log('[Stadis] Starting...');

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
		if (discord)
		{
			discord.finish();
			discord = null;
			console.log('\r[Discord] Connection closed');
		}
		if (database)
		{
			database.close();
			database = null;
			console.log('\r[Database] Connection closed');
		}
		setTimeout(() => {
			console.log('\r[Stadis] Exiting...');
			process.exit();
		}, 1000);
	}

	process.on('SIGINT', quit);
	process.on('SIGTERM', quit);
	process.on('SIGQUIT', quit);
}

main();
