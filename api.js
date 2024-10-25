class Api
{
	static getUserPresense(req, res, database)
	{
		if (!req.body.user_id)
		{
			res.send({error: 'Missing user_id'});
			return;
		}
		
		console.log('Request user presence for user_id: ' + req.body.user_id);
		const user_id = req.body.user_id;
		console.log(user_id, "and", typeof user_id);
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
}

exports.Api = Api;