const WebSocket = require('ws');
const { token } = require('./secret.json');
const gatewayUrl = 'wss://gateway.discord.gg/?v=10&encoding=json';

class Discord
{
	websocket = null;
	bufferInfo = [];
	bufferPresence = {};
	db = null;

	constructor(database)
	{
		this.db = database;
		this.connect();
	}

	connect()
	{
		this.websocket = new WebSocket(gatewayUrl);

		this.websocket.on('open', () => {
			console.log('Connected');
			const identifyPayload = {
				op: 2,
				intents: 131071,
				d: {
					token: token,
					properties: {
						$os: 'linux',
						$browser: 'firefox',
						$device: 'desktop',
						$system_locale: 'fr-FR',
						$browser_version: '118.0',
						$os_version: 'Ubuntu 22.04',
						$referrer: '',
						$referring_domain: '',
						$release_channel: 'stable',
					},
					presence: {
						status: 'afk',
					}
				}
			};
			this.websocket.send(JSON.stringify(identifyPayload));
		});
		
		this.websocket.on('message', (data) => {
			const message = JSON.parse(data);
		
			if (message.op === 10)
			{
				const interval = message.d.heartbeat_interval;
				setInterval(() => {
					this.websocket.send(JSON.stringify({ op: 1, d: null }));
				}, interval);
			}
			else
				this.action(message);
		});

		this.websocket.on('close', () => {
			this.websocket = null;
			bufferInfo = [];
			bufferPresence = {};
			console.log('Disconnected\nReconnecting...');
			this.connect();
		});
	}

	action(message)
	{
		if (message.t === 'READY')
			this.#readyEvent(message);
		else if (message.t === 'PRESENCE_UPDATE')
			this.#presenceUpdate(message);
	}

	#readyEvent(message)
	{
		for (let i = 0; i < message.d.relationships.length; i++)
		{
			this.bufferInfo.push({username: message.d.relationships[i].user.username, id: message.d.relationships[i].user.id, pfp: message.d.relationships[i].user.avatar});
			this.db.insertUser(message.d.relationships[i].user.username, message.d.relationships[i].user.id).then((bool) => {
				if (!bool)
				{
					this.db.getLastPfp(message.d.relationships[i].user.id).then((userPfp) => {
						if (userPfp === undefined || userPfp.length === 0)
							this.db.insertPfp(message.d.relationships[i].user.id, message.d.relationships[i].user.avatar);
						else
						{
							if (userPfp.url !== "https://cdn.discordapp.com/avatars/" + message.d.relationships[i].user.id + "/" + message.d.relationships[i].user.avatar + ".png?size=1024")
								this.db.insertPfp(message.d.relationships[i].user.id, message.d.relationships[i].user.avatar);
						}
					});
					return ;
				}
				if (message.d.relationships[i].user.avatar !== undefined)
					this.db.insertPfp(message.d.relationships[i].user.id, message.d.relationships[i].user.avatar);
			});
		}
	}

	#presenceUpdate(message)
	{
		let	index = 0;

		const pfpChange = () =>
		{
			if (message.d.user.avatar !== undefined)
			{
				if (this.bufferInfo[index].pfp === message.d.user.avatar)
					return ;
				this.bufferInfo[index].pfp = message.d.user.avatar;
				this.db.insertPfp(message.d.user.id, message.d.user.avatar);
			}
		}

		const statusChange = () =>
		{
			for (let i = 0; i < this.bufferInfo.length; i++)
			{
				if (this.bufferInfo[i].id === message.d.user.id)
				{
					index = i;
					break;
				}
			}
			if (this.bufferPresence[message.d.user.id])
			{
				const	oldStatus				= this.bufferPresence[message.d.user.id];
				let		web, mobile, desktop;
	
				web = message.d.client_status.web ? message.d.client_status.web : "offline";
				mobile = message.d.client_status.mobile ? message.d.client_status.mobile : "offline";
				desktop = message.d.client_status.desktop ? message.d.client_status.desktop : "offline";
				if (web !== oldStatus.web)
					this.db.insertPresence(this.bufferInfo[index].id, "web", web);
				if (mobile !== oldStatus.mobile)
					this.db.insertPresence(this.bufferInfo[index].id, "mobile", mobile);
				if (desktop !== oldStatus.desktop)
					this.db.insertPresence(this.bufferInfo[index].id, "desktop", desktop);
				this.bufferPresence[message.d.user.id].web = web;
				this.bufferPresence[message.d.user.id].mobile = mobile;
				this.bufferPresence[message.d.user.id].desktop = desktop;
			}
			else
			{
				this.bufferPresence[message.d.user.id] = {web: message.d.client_status.web ? message.d.client_status.web : "offline", mobile: message.d.client_status.mobile ? message.d.client_status.mobile : "offline", desktop: message.d.client_status.desktop ? message.d.client_status.desktop : "offline"};
				this.db.insertPresence(this.bufferInfo[index].id, "web", message.d.client_status.web ? message.d.client_status.web : "offline");
				this.db.insertPresence(this.bufferInfo[index].id, "mobile", message.d.client_status.mobile ? message.d.client_status.mobile : "offline");
				this.db.insertPresence(this.bufferInfo[index].id, "desktop", message.d.client_status.desktop ? message.d.client_status.desktop : "offline");
			}
		}

		statusChange();
		pfpChange();
	}
}

module.exports = { Discord };