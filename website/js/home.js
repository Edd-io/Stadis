document.addEventListener('DOMContentLoaded', () => {
	displayUserInfo();
	getHomeData();
});

function getData(url, body)
{
	const	options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	};

	return (new Promise((resolve) => 
	{
		fetch(url, options).then((response) => {
			if (response.status !== 200)
			{
				resolve(null);
				return;
			}
			response.json().then((data) => {
				resolve(data);
			});
		});
	}));
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

function haveNitro(premium_since)
{
	if (premium_since === null || premium_since === 0)
		return ("No nitro");
	else if (premium_since === 1)
		return ("Basic");
	else
		return ("Boost");
}

function displayUserInfo()
{
	const	username = document.getElementById('username-info');
	const	nickname = document.getElementById('nickname-info');
	const	status = document.getElementById('status-info');
	const	discriminator = document.getElementById('discriminator-info');
	const	id = document.getElementById('id-info');
	const	created = document.getElementById('created-info');
	const	nitro = document.getElementById('nitro-info');
	const	pfp = document.getElementById('pfp-img-box');

	getData('/api/get_self_info', {}).then((data) => {
		if (data === null)
			return;
		username.innerText = data.username;
		nickname.innerText = data.global_name;
		discriminator.innerText = data.discriminator;
		id.innerText = data.id;
		created.innerText = new Date(convertIDtoUnix(data.id)).toLocaleDateString();
		nitro.innerText = haveNitro(data.premium_type);
		pfp.src = `/${data.id}/${data.avatar}.png`;
	});
}

function getHomeData()
{
	getData('/api/home', {}).then((data) => {
		console.log(data);
	});
}