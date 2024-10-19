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
				account INTEGER,
				device TEXT,
				status TEXT,
				timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY(account) REFERENCES users(id_discord) ON DELETE CASCADE
			)
		`);
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
}

module.exports.Database = Database;