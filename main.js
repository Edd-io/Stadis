const Discord = require('./Discord');
const Database = require('./Database');
const express = require('express');


function webServer()
{
	const app = express();
	const port = 3000;

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

	app.listen(port, () => {
		console.log(`Example app listening at http://localhost:${port}`);
	});
}

function main()
{
	const	database	= new Database.Database();
	let		discord		= null;

	webServer();
	// setTimeout(() => {
	// 	discord = new Discord.Discord(database);
	// }, 2000);

}

main();