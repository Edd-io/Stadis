const Discord = require('./Discord');
const Database = require('./Database');
const express = require('express');
const apiImport = require('./api');

function configApi(app, database)
{
	const api = apiImport.Api;

	app.post('/api/get_user_presence', (req, res) => {api.getUserPresense(req, res, database)});
	app.post('/api/get_user_all_pfp', (req, res) => {api.getUserAllPfp(req, res, database)});
}

function webServer(database)
{
	const app = express();
	const port = 3000;

	app.use(express.json());
	app.use(express.static('data/pfp'));

	app.get('/', (req, res) => {
		res.sendFile(__dirname + '/website/index.html');
	});

	app.get('/profile', (req, res) => {
		res.sendFile(__dirname + '/website/profile.html');
	});

	app.get('/style.css', (req, res) => {
		res.sendFile(__dirname + '/website/style.css');
	});

	app.get('/script.js', (req, res) => {
		res.sendFile(__dirname + '/website/script.js');
	});

	configApi(app, database);

	app.listen(port, () => {
		console.log(`Example app listening at http://localhost:${port}`);
	});
}

function main()
{
	const	database	= new Database.Database();
	let		discord		= null;

	webServer(database);
	setTimeout(() => {
 		discord = new Discord.Discord(database);
	}, 1000);

}

main();
