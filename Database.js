const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
class Database
{
	constructor()
	{
		fs.mkdir('data/pfp', { recursive: true }, (err) => {
			if (err)
				console.error(err);
			else
			{
				this.db = new sqlite3.Database('./data/database.db', (err) => {
					if (err)
						console.error(err.message);
					else
					{
						this.createTable();
						console.log('Connected to the database');
					}
				});
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
				path TEXT,
				timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY(account) REFERENCES users(id_discord) ON DELETE CASCADE
			)
		`);
		this.db.run(`
			CREATE TABLE IF NOT EXISTS activity (
				id INTEGER PRIMARY KEY,
				account TEXT,
				activity TEXT,
				start DATETIME,
				end DATETIME,
				FOREIGN KEY(account) REFERENCES users(id_discord) ON DELETE CASCADE
			)
		`);
		this.db.run(`
			CREATE TABLE IF NOT EXISTS custom_status (
				id INTEGER PRIMARY KEY,
				account TEXT,
				text TEXT,
				emoji TEXT,
				timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY(account) REFERENCES users(id_discord) ON DELETE CASCADE
			)
		`);
	}


	insertUser(username, id)
	{
		let promise = null;

		promise = new Promise((resolve) => {
			this.db.get('SELECT id FROM users WHERE id_discord = ?', [id], (err, row) => {
				if (err)
				{
					console.error(err.message);
					resolve(false);
					return ;
				}
				if (row)
				{
					console.log('User already exists');
					resolve(false);
					return ;
				}
				else
				{
					this.db.run('INSERT INTO users (username, id_discord) VALUES (?, ?)', [username, id], (err) => {
						if (err)
						{
							console.error(err.message);
							resolve(false);
						}
						else
						{
							console.log('User added');
							resolve(true);
						}
					});
				}
			});
		});
		return (promise);
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
		async function downloadImage(url, filepath)
		{
			const fetch = (await import('node-fetch')).default;
			const response = await fetch(url);
			const fileStream = fs.createWriteStream(filepath);
		
			return (new Promise((resolve, reject) => {
				response.body.pipe(fileStream);
				response.body.on('error', reject);
				fileStream.on('finish', resolve);
			}));
		}

		const		path		= 'data/pfp/' + account + '/' + avatar + '.png';
		
		if (avatar === null)
			return ;
		fs.mkdir('data/pfp/' + account, { recursive: true }, (err) => {
			if (err)
				console.error(err);
			else
			{
				downloadImage('https://cdn.discordapp.com/avatars/' + account + '/' + avatar + '.png?size=1024', path).then(() => {
					this.db.run('INSERT INTO pfp (account, path) VALUES (?, ?)', [account, path], (err) => {
						if (err)
							console.error(err.message);
						else
							console.log('Pfp added');
					});
				}).catch((err) => {
					console.error(err);
				});
			}
		});
	}

	insertActivity(account, activity, start, end)
	{
		this.db.run('INSERT INTO activity (account, activity, start, end) VALUES (?, ?, ?, ?)', [account, activity, start, end], (err) => {
			if (err)
				console.error(err.message);
			else
				console.log('Activity added');
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

	getLastPfp(user_id)
	{
		let	promise = null;

		promise = new Promise((resolve) => {
			this.db.get('SELECT path FROM pfp WHERE account = ? ORDER BY timestamp DESC LIMIT 1', [user_id], (err, row) => {
				if (err)
				{
					console.error(err.message);
					resolve(null);
				}
				else
					resolve(row);
			});
		});
		return (promise);
	}

	getUserAllPfp(user_id)
	{
		let	promise = null;

		promise = new Promise((resolve) => {
			this.db.all('SELECT * FROM pfp WHERE account = ?', [user_id], (err, rows) => {
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

	getUserActivity(user_id)
	{
		let	promise = null;

		promise = new Promise((resolve) => {
			this.db.all('SELECT * FROM activity WHERE account = ?', [user_id], (err, rows) => {
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