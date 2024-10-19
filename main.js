const Discord = require('./Discord');
const Database = require('./Database');
const express = require('express');

function webServer()
{
	const app = express();
	const port = 3000;

	app.get('/', (req, res) => {
		res.send('Hello World!');
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
	setTimeout(() => {
		discord = new Discord.Discord(database);
	}, 2000);

}

main();