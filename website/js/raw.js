let range = [0, 100];
let actualPageNb = 1;
let	isLastPage = false;

document.addEventListener('DOMContentLoaded', () => {
	const	select = document.getElementById('data-selector');
	const	nbElements = document.getElementById('nb-elements-entries');
	const	lastUpdate = document.getElementById('last-update-entries');
	const	actualPage = document.getElementById('nb-actual-page');

	function changeData()
	{
		const	value = select.value;
		const	body = {type: value, range: [0, 100], value: ''};

		range = [0, 100];
		getData('/api/raw', body).then((data) => {
			if (data === null)
			{
				alert('An error occured while fetching the data.');
				return;
			}
			if (data.data.length !== 100)
				isLastPage = true;
			else
				isLastPage = false;
			nbElements.innerHTML = data.nb;
			lastUpdate.innerHTML = new Date(Date.now()).toLocaleString();
			actualPage.innerHTML = '1';
			actualPageNb = 1;
			showData(data.data, value);
		});
	}
	select.addEventListener('change', changeData);
	changeData();
});

function previousPage()
{
	if (actualPageNb === 1)
	{
		alert('You are already on the first page.');
		return;
	}
	actualPageNb--;
	isLastPage = false;
	const	actualPage = document.getElementById('nb-actual-page');
	const	value = document.getElementById('data-selector').value;

	range[0] = (actualPageNb - 1) * 100; 
	range[1] = actualPageNb * 100;
	actualPage.innerHTML = actualPageNb;
	getData('/api/raw', { type: value, range: range }).then((data) => {
		if (data === null)
		{
			alert('An error occured while fetching the data.');
			return;
		}
		showData(data.data, value);
	});
}

function nextPage()
{
	const	actualPage = document.getElementById('nb-actual-page');
	const	value = document.getElementById('data-selector').value;

	if (isLastPage)
	{
		alert('You are already on the last page.');
		return;
	}
	actualPageNb++;
	range[0] = (actualPageNb - 1) * 100; 
	range[1] = actualPageNb * 100;
	actualPage.innerHTML = actualPageNb;
	getData('/api/raw', {type: value, range: range}).then((data) => {
		if (data === null)
		{
			alert('An error occured while fetching the data.');
			return;
		}
		if (data.data.length !== 100)
			isLastPage = true;
		else
			isLastPage = false;
		showData(data.data, value);
	});
}

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

function showData(data, type)
{
	const	dataContainer = document.getElementById('data-container');
	const	topContainer = document.getElementById('top-column-container');

	topContainer.innerHTML = '';
	topContainer.removeAttribute('class');
	dataContainer.innerHTML = '';
	if (type === 'activitys' || type === 'customs_status')
	{
		topContainer.classList.add('gridFour');
		topContainer.innerHTML = `
			<p>Account ID</p>
			<p>${type == 'activitys' ? "Activity" : "Status"}</p>
			<p>Start</p>
			<p>End</p>
		`;
	}
	else if (type === 'customs_status')
	{
		topContainer.classList.add('gridFour');
		topContainer.innerHTML = `
			<p>Account ID</p>
			<p>Status</p>
			<p>Start</p>
			<p>End</p>
		`;
	}
	else if (type === 'musics')
	{
		topContainer.classList.add('gridFour');
		topContainer.innerHTML = `
			<p>Account ID</p>
			<p>Title</p>
			<p>Artist</p>
			<p>Time</p>
		`;
	}
	else if (type === 'pfps')
	{
		topContainer.classList.add('gridThree');
		topContainer.innerHTML = `
			<p>Account ID</p>
			<p>Path</p>
			<p>Time</p>
		`;
	}
	else if (type === 'presences')
	{
		topContainer.classList.add('gridFour');
		topContainer.innerHTML = `
			<p>Account ID</p>
			<p>Device</p>
			<p>Status</p>
			<p>Time</p>
		`;
	}
	else if (type === 'users')
	{
		topContainer.classList.add('gridTwo');
		topContainer.innerHTML = `
			<p>Account ID</p>
			<p>Username</p>
		`;
	}
	data.forEach((row) => {
		const	div = document.createElement('div');

		div.className = 'data-entry';
		if (type === 'activitys' || type === 'customs_status')
		{
			div.classList.add('gridFour');
			div.innerHTML = `
				<p>${row.account}</p>
				<p>${row.activity === undefined ? row.text : row.activity}</p>
				<p>${new Date(row.start).toLocaleString()}</p>
				<p>${new Date(row.end).toLocaleString()}</p>
			`;
		}
		else if (type === 'musics')
		{
			div.classList.add('gridFour');
			div.innerHTML = `
				<p>${row.account}</p>
				<p>${row.name}</p>
				<p>${row.artist}</p>
				<p>${new Date(row.timestamp).toLocaleString()}</p>
			`;
		}
		else if (type === 'pfps')
		{
			div.classList.add('gridThree');
			div.innerHTML = `
				<p>${row.account}</p>
				<p>${row.path}</p>
				<p>${new Date(row.timestamp).toLocaleString()}</p>
			`;
		}
		else if (type === 'presences')
		{
			div.classList.add('gridFour');
			div.innerHTML = `
				<p>${row.account}</p>
				<p>${row.device}</p>
				<p>${row.status}</p>
				<p>${new Date(row.timestamp).toLocaleString()}</p>
			`;
		}
		else if (type === 'users')
		{
			div.classList.add('gridTwo');
			div.innerHTML = `
				<p>${row.id_discord}</p>
				<p>${row.username}</p>
			`;
		}
		dataContainer.appendChild(div);
	});
}