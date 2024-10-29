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
					data.desktop.push({status: row.status + " (Desktop)", timestamp: new Date(row.timestamp).getTime()});
				else if (row.device === 'mobile')
					data.mobile.push({status: row.status + " (Mobile)", timestamp: new Date(row.timestamp).getTime()});
				else if (row.device === 'web')
					data.web.push({status: row.status + " (Web)", timestamp: new Date(row.timestamp).getTime()});
			});
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
				data.push({url: row.url, timestamp: new Date(row.timestamp).getTime()});
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
				data.push({name: row.activity, start: row.start, end: row.end});
			});
			res.send(data);
		});
	}
}

exports.Api = Api;