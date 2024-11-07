document.addEventListener('DOMContentLoaded', () => {
	getData('/api/get_self_info', {}).then((data) => {
		changePfp('/' + data.id + '/' + data.avatar + '.png');
	});
	configHomeButton();
	updateColors();
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

function changePfp(url)
{
	const	img = document.getElementById('button-home-pfp-img');

	img.src = url;
}

function configHomeButton()
{
	const button = document.getElementById('home-button');
	const input = document.getElementById('search-button');
	const settings = document.getElementById('settings-button');
	const raw = document.getElementById('raw-button');
	const path = window.location.pathname;

	button.addEventListener('click', () => {
		window.location.href = '/';
	});
	input.addEventListener('click', () => {
		window.location.href = '/search';
	});
	settings.addEventListener('click', () => {
		window.location.href = '/settings';
	});
	raw.addEventListener('click', () => {
		window.location.href = '/raw';
	});
	if (path === '/')
		button.style.backgroundColor = '#222222';
	else if (path === '/search')
		input.style.filter = 'invert(100%)';
	else if (path === '/settings')
		settings.style.filter = 'invert(100%)';
	else if (path === '/raw')
		raw.style.filter = 'invert(100%)';
}

function updateColors()
{
	const root = document.documentElement;
	if (localStorage.getItem('switch-dark-mode') === 'true')
	{
		root.style.setProperty('--bg-default-color', '#1a1a1a');
		root.style.setProperty('--default-color', '#2e2e2e');
		document.body.style.color = '#FFF';
	}
	else
	{
		root.style.setProperty('--bg-default-color', '#ECECEC');
		root.style.setProperty('--default-color', '#D9D9D9');
		document.body.style.color = '#000';
	}
}