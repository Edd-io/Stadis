document.addEventListener('DOMContentLoaded', () => {
	const input = document.getElementById('search-input');

	getData('/api/search_user', {value: ""}).then((data) => {
		if (data === null)
		{
			console.log('Error');
			return;
		}
		showListUser(data);
	});
	input.addEventListener('input', () => {
		const value = input.value;
		getData('/api/search_user', {value: value}).then((data) => {
			if (data === null)
			{
				console.log('Error');
				return;
			}
			const	list = document.getElementById('list-results');
			list.innerHTML = '';
			showListUser(data);
		});
	});
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

function showListUser(data)
{
	const	list = document.getElementById('list-results');

	data.forEach(element => {
		const	div = document.createElement('div');
		div.setAttribute('class', 'result');
		div.setAttribute('onclick', `window.location.href = '/user?id=${element.id}'`);
		div.innerHTML = `
			<img class="pfp-img" src="${element.avatar ? '/' + element.id + '/' + element.avatar + '.png': "https://archive.org/download/discordprofilepictures/discordblue.png"}">
			<p class="result-username">${element.username}</p>
			<p class="result-id">${element.id}</p>
		`;
		list.appendChild(div);
	});
}
