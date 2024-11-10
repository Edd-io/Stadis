function statusLeftProfile(status)
{
	if (status === undefined)
		return ("Offline");
	if (status.web === "online" || status.mobile === "online" || status.desktop === "online")
		return ("Online");
	if (status.web === "dnd" || status.mobile === "dnd" || status.desktop === "dnd")
		return ("Do not disturb");
	if (status.web === "idle" || status.mobile === "idle" || status.desktop === "idle")
		return ("Idle");
	return ("Offline");
}

function haveNitro(premium_since)
{
	if (premium_since === null || premium_since === 0)
		return ("No nitro");
	else if (premium_since === 1)
		return ("Basic");
	else
		return ("Boost");
}

function changeContentUser(page, id, db, discord)
{
	if (discord.bufferInfo.findIndex((element) => element.id === id) === -1)
	{
		console.log("User not found");
		return (null);
	}

	function convertIDtoUnix(id)
	{
		let bin = (+id).toString(2);
		let unixbin = '';
		let unix = '';
		let m = 64 - bin.length;
		unixbin = bin.substring(0, 42-m);
		unix = parseInt(unixbin, 2) + 1420070400000;
		return (unix);
	}
	const	userInfo = discord.bufferInfo[discord.bufferInfo.findIndex((element) => element.id === id)];

	return (new Promise((resolve) => {
		db.requester(id).then((data) => {
			const user = data.user;
			page = page.replace("{{left-pfp}}", '/' + id + '/' + userInfo.pfp + '.png');
			page = page.replace("{{username-info}}", user.username);
			page = page.replace("{{nickname-info}}", user.global_name);
			page = page.replace("{{status-info}}", statusLeftProfile(discord.bufferPresence[id]));
			page = page.replace("{{created-info}}", new Date(convertIDtoUnix(user.id)).toLocaleDateString());
			page = page.replace("{{discriminator-info}}", data.user_profile.pronouns);
			page = page.replace("{{id-info}}", user.id);
			page = page.replace("{{nitro-info}}", haveNitro(data.premium_since));
			resolve(page);
		})
	}));
}

exports.changeContentUser = changeContentUser;