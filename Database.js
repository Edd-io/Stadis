const sqlite3 = require('sqlite3').verbose();

class Database
{
	constructor()
	{
		this.db = new sqlite3.Database('./database.db', (err) => {
			if (err)
				console.error(err.message);
			else
			{
				this.createTable();
				console.log('Connected to the database');
			}
		});
	}

	close()
	{
		this.db.close((err) => {
			if (err)
				console.error(err.message);
			else
				console.log('Close the database connection');
		});
	}

	createTable()
	{
		this.db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, id_discord TEXT)');
		this.db.run(`
			CREATE TABLE IF NOT EXISTS presence (
				id INTEGER PRIMARY KEY,
				account TEXT,
				device TEXT,
				status TEXT,
				timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY(account) REFERENCES users(id_discord) ON DELETE CASCADE
			)
		`);
		this.db.run(`
			CREATE TABLE IF NOT EXISTS pfp (
				id INTEGER PRIMARY KEY,
				account TEXT,
				url TEXT,
				timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY(account) REFERENCES users(id_discord) ON DELETE CASCADE
			)
		`)
	}


	insertUser(username, id)
	{
		this.db.get('SELECT id FROM users WHERE id_discord = ?', [id], (err, row) => {
			if (err)
			{
				console.error(err.message);
				return;
			}
			if (row)
			{
				console.log('User already exists');
				return;
			}
			else
			{
				this.db.run('INSERT INTO users (username, id_discord) VALUES (?, ?)', [username, id], (err) => {
					if (err)
						console.error(err.message);
					else
						console.log('User added');
				});
			}
		});
	}

	insertPresence(account, device, status)
	{
		this.db.run('INSERT INTO presence (account, device, status) VALUES (?, ?, ?)', [account, device, status], (err) => {
			if (err)
				console.error(err.message);
			else
				console.log('Presence added');
		});
	}

	insertPfp(account, avatar)
	{
		const url = "https://cdn.discordapp.com/avatars/" + account + "/" + avatar + ".png?size=1024";

		this.db.run('INSERT INTO pfp (account, url) VALUES (?, ?)', [account, url], (err) => {
			if (err)
				console.error(err.message);
			else
				console.log('Pfp added');
		});
	}

	getUserPresence(user_id)
	{
		let	promise = null;
		
		promise = new Promise((resolve) => {
			this.db.all('SELECT * FROM presence WHERE account = ?', [user_id], (err, rows) => {
				if (err)
				{
					console.error(err.message);
					resolve(null);
				}
				else
					resolve(rows);
			});
		});
		return (promise);
	}
}

module.exports.Database = Database;