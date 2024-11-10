class Api
{
	static getUserPresense(req, res, database)
	{
		if (!req.body.user_id)
		{
			res.send({error: 'Missing user_id'});
			return;
		}
		
		const user_id = req.body.user_id;
		database.getUserPresence(user_id).then((presence) => {
			const	data = {desktop: [], mobile: [], web: []};

			if (!presence)
			{
				res.send({error: 'User not found'});
				return;
			}
			presence.forEach((row) => {
				if (row.device === 'desktop')
					data.desktop.push({status: row.status, timestamp: new Date(row.timestamp).getTime()});
				else if (row.device === 'mobile')
					data.mobile.push({status: row.status, timestamp: new Date(row.timestamp).getTime()});
				else if (row.device === 'web')
					data.web.push({status: row.status, timestamp: new Date(row.timestamp).getTime()});
			});
			data.desktop.sort((a, b) => a.timestamp - b.timestamp);
			data.mobile.sort((a, b) => a.timestamp - b.timestamp);
			data.web.sort((a, b) => a.timestamp - b.timestamp);
			let firstOnlineDesktop = data.desktop.findIndex((element) => element.status === 'online' || element.status === 'dnd' || element.status === 'idle');
			let firstOnlineMobile = data.mobile.findIndex((element) => element.status === 'online' || element.status === 'dnd' || element.status === 'idle');
			let firstOnlineWeb = data.web.findIndex((element) => element.status === 'online' || element.status === 'dnd' || element.status === 'idle');
			let arr = [];
			if (firstOnlineDesktop !== -1)
			{
				for (let i = firstOnlineDesktop; i < data.desktop.length; i++)
				{
					if (data.desktop[i].status === 'offline')
						continue;
					arr.push(data.desktop[i].timestamp);
					break;
				}
			}
			if (firstOnlineMobile !== -1)
			{
				for (let i = firstOnlineMobile; i < data.mobile.length; i++)
				{
					if (data.mobile[i].status === 'offline')
						continue;
					arr.push(data.mobile[i].timestamp);
					break;
				}
			}
			if (firstOnlineWeb !== -1)
			{
				for (let i = firstOnlineWeb; i < data.web.length; i++)
				{
					if (data.web[i].status === 'offline')
						continue;
					arr.push(data.web[i].timestamp);
					break;
				}
			}
			data.firstTimestamp = Math.min(...arr);
			data.lastTimestamp = Date.now();
			res.send(data);
		});
	}

	static getUserAllPfp(req, res, database)
	{
		if (!req.body.user_id)
		{
			res.send({error: 'Missing user_id'});
			return;
		}
		
		const user_id = req.body.user_id;
		database.getUserAllPfp(user_id).then((pfp) => {
			const	data = [];

			if (!pfp)
			{
				res.send({error: 'User not found'});
				return;
			}
			pfp.forEach((row) => {
				const path = row.path.substring(8);
				data.push({url: path, timestamp: new Date(row.timestamp).getTime()});
			});
			res.send(data);
		});
	}

	static getUserActivity(req, res, database)
	{
		if (!req.body.user_id)
		{
			res.send({error: 'Missing user_id'});
			return;
		}
		
		const user_id = req.body.user_id;
		database.getUserActivity(user_id).then((activity) => {
			const	data = {activity: []};
			if (!activity)
			{
				res.send({error: 'User not found'});
				return;
			}
			activity.forEach((row) => {
				data.activity.push({name: row.activity, start: row.start, end: row.end});
			});
			data.activity.sort((a, b) => a.start - b.start);
			if (data.activity.length === 0)
			{
				data.firstTimestamp = 0;
				data.lastTimestamp = Date.now();
			}
			else
			{
				data.firstTimestamp = data.activity[0].start;
				data.lastTimestamp = data.activity[data.activity.length - 1].end;
			}
			res.send(data);
		});
	}

	static getUserCustomActivity(req, res, database)
	{
		if (!req.body.user_id)
		{
			res.send({error: 'Missing user_id'});
			return;
		}
		
		const user_id = req.body.user_id;
		database.getUserCustomActivity(user_id).then((activity) => {
			const	data = [];
			if (!activity)
			{
				res.send({error: 'User not found'});
				return;
			}
			activity.forEach((row) => {
				data.push({text: row.text, start: row.start, end: row.end});
			});
			res.send(data);
		});
	}

	static getUserListenMusic(req, res, database)
	{
		if (!req.body.user_id)
		{
			res.send({error: 'Missing user_id'});
			return;
		}
		
		const user_id = req.body.user_id;
		database.getUserListenMusic(user_id).then((music) => {
			const	data = [];
			if (!music)
			{
				res.send({error: 'User not found'});
				return;
			}
			music.forEach((row) => {
				data.push({name: row.name, artist: row.artist, at: row.timestamp});
			});
			res.send(data);
		});
	}

	static searchUser(req, res, database, discord)
	{
		if (req.body.value === undefined)
		{
			res.send({error: 'Missing value'});
			return;
		}
		
		const value = req.body.value;
		const data = [];
		discord.bufferInfo.forEach((info) => {
			if (info.username.toLowerCase().indexOf(value.toLowerCase()) === -1 && info.id.indexOf(value) === -1)
				return;
			data.push({id: info.id, username: info.username, avatar: info.pfp});
		});
		data.sort((a, b) => a.username.localeCompare(b.username));
		res.send(data);
	}

	static getRawData(req, res, database)
	{
		const	types = ['activitys', 'customs_status', 'musics', 'pfps', 'presences', 'users'];
		if (!req.body.type || !req.body.range)
		{
			res.send({error: 'Missing type'});
			return;
		}
		
		const type = req.body.type;
		const range = req.body.range;

		if (types.indexOf(type) === -1)
		{
			res.send({error: 'Invalid type'});
			return;
		}
		if (range.length !== 2 || range[0] > range[1])
		{
			res.send({error: 'Invalid range'});
			return;
		}
		database.getRawData(type, range).then((data) => {
			if (!data)
			{
				res.send({error: 'An error occured while fetching the data'});
				return;
			}
			res.send(data);
		});
	}

	static getSelfInfo(req, res, discord)
	{
		res.send({
			username: discord.selfInfo.username,
			discriminator: discord.selfInfo.discriminator,
			id: discord.selfInfo.id,
			avatar: discord.selfInfo.avatar,
			bio: discord.selfInfo.bio,
			premium: discord.selfInfo.premium,
			premium_type: discord.selfInfo.premium_type,
			pronouns: discord.selfInfo.pronouns,
			global_name: discord.selfInfo.global_name,
		});
	}

	static getHome(req, res, database, discord)
	{
		const	data = {musics: [], status: []};

		database.getTableCount('users').then((count) => {
			data.users = count;
			data.timeStated = discord.timeStart;
			for (let i = 0; i < discord.lastFiveMusic.length; i++)
			{
				const	username	= discord.bufferInfo.find((info) => info.id === discord.lastFiveMusic[i].id).username;
				const	pfp			= discord.bufferInfo.find((info) => info.id === discord.lastFiveMusic[i].id).pfp;
	
				data.musics.push({name: discord.lastFiveMusic[i].name, artist: discord.lastFiveMusic[i].artist, username: username, pfp: pfp});
			}
			for (let i = 0; i < discord.lastFiveStatus.length; i++)
			{
				const	username	= discord.bufferInfo.find((info) => info.id === discord.lastFiveStatus[i].id).username;
				const	pfp			= discord.bufferInfo.find((info) => info.id === discord.lastFiveStatus[i].id).pfp;
	
				data.status.push({id :discord.lastFiveStatus[i].id, data: discord.lastFiveStatus[i].data, username: username, pfp: pfp});
			}
			data.musics.reverse();
			data.status.reverse();
			res.send(data);
		});
	};
}

exports.Api = Api;