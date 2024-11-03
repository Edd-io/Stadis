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
			const	data = [];
			if (!activity)
			{
				res.send({error: 'User not found'});
				return;
			}
			activity.forEach((row) => {
				data.push({name: row.activity, start: row.start, end: row.end});
			});
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
}

exports.Api = Api;