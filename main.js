const Discord = require('./Discord');
const Database = require('./Database');
const express = require('express');
const apiImport = require('./api');

function configApi(app, database)
{
	const api = apiImport.Api;

	console.log(api);
	app.post('/api/get_user_presence', (req, res) => {api.getUserPresense(req, res, database)});
}

function webServer(database)
{
	const app = express();
	const port = 3000;

	app.use(express.json());

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
	}, 2000);

}

main();
