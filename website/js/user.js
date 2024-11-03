const	timeToRefresh = 16;
let		g_data = null;
let		minTimestampStatus = null;
let		maxTimestampStatus = null;

document.addEventListener('DOMContentLoaded', () => {
	console.log("User page loaded");
	getDataGraphStatus();
	getDataAllPfp();
	getCustomActivity();
	getUserListenMusic();
});

function getDataGraphStatus()
{
	thisUrl = new URL(window.location.href);
	const url = '/api/get_user_presence';
	const data = {user_id: thisUrl.searchParams.get("id")};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};

	fetch(url, options).then((response) => {
		if (response.status === 200)
			return (response.json());
		else
			throw new Error('Error');
	}).then((data_fetch) => {
		g_data = data_fetch;
		minTimestampStatus = g_data.firstTimestamp;
		maxTimestampStatus = g_data.lastTimestamp;
		createGraphStatus();
	}).catch((error) => {
		console.error(error);
	});
}

let timeout = null;
let timeout2 = null;
let timeout3 = null;
let interval = null;

function zoomInGraphStatus()
{
	let i = 0;

	if (interval)
		clearInterval(interval);
	interval = setInterval(() => {
		if (g_data.lastTimestamp - g_data.firstTimestamp < 1000000)
		{
			clearInterval(interval);
			return;
		}
		g_data.firstTimestamp += (g_data.lastTimestamp - g_data.firstTimestamp) / 25;
		g_data.lastTimestamp -= (g_data.lastTimestamp - g_data.firstTimestamp) / 25;
		createGraphStatus();
		i++;
		if (i === 12)
			clearInterval(interval);
	}, timeToRefresh);

}

function zoomOutGraphStatus()
{
	let i = 0;

	if (interval)
		clearInterval(interval);
	interval = setInterval(() => {
		if (g_data.lastTimestamp - g_data.firstTimestamp < maxTimestampStatus - minTimestampStatus)
		{
			g_data.firstTimestamp -= (g_data.lastTimestamp - g_data.firstTimestamp) / 25;
			g_data.lastTimestamp += (g_data.lastTimestamp - g_data.firstTimestamp) / 25;
			createGraphStatus();
		}
		i++;
		if (i === 12)
			clearInterval(interval);
	}, timeToRefresh);
}

function  moveLeftGraphStatus()
{
	let	i = 0;

	if (interval)
		clearInterval(interval);
	interval = setInterval(() => {
		const time = g_data.lastTimestamp - g_data.firstTimestamp;
		g_data.firstTimestamp -= (time / 200);
		g_data.lastTimestamp -= (time / 200);
		createGraphStatus();
		i++;
		if (i === 25)
			clearInterval(interval);
	});
}

function moveRightGraphStatus()
{
	let	i = 0;

	if (interval)
		clearInterval(interval);
	interval = setInterval(() => {
		const time = g_data.lastTimestamp - g_data.firstTimestamp;
		g_data.firstTimestamp += (time / 200);
		g_data.lastTimestamp += (time / 200);
		createGraphStatus();
		i++;
		if (i === 25)
			clearInterval(interval);
	});
}

function createGraphStatus()
{
	const	canvas		= document.getElementById('presence-graph');
	const	ctx			= canvas.getContext('2d');
	const	bounds		= canvas.getBoundingClientRect();
	const	width		= bounds.width;
	const	height		= bounds.height;
	const	start		= new Date(g_data.firstTimestamp);
	const	end			= new Date(g_data.lastTimestamp);
	const	color		= {online: '#3BA55C', dnd: '#ED4245', idle: '#FAA61A', offline: '#747F8D'};
	const	arr			= [g_data.desktop, g_data.mobile, g_data.web];
	const	dataGraph	= {desktop: [], mobile: [], web: []};

	canvas.width = width;
	canvas.height = height;
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = 'black';
	ctx.fillRect(75, 0, 1, height - 40);
	ctx.fillRect(75, height - 40, width - 75, 1);
	ctx.font = '16px Arial';
	ctx.fillText('Desktop', 7, 40);
	ctx.fillText('Mobile', 12, 85);
	ctx.fillText('Web', 20, 135);

	for (let i = 0; i < 5; i++)
	{
		const date = new Date(start.getTime() + i * ((end - start) / 5));
		const text = date.toLocaleDateString();
		const textTime = date.toLocaleTimeString();
		const textWidth = ctx.measureText(text).width;
		const textTimeWidth = ctx.measureText(textTime).width;
		ctx.fillStyle = 'black';
		ctx.fillText(text, 75 + i * ((width - 75) / 5) - textWidth / 2, height - 20);
		ctx.fillText(textTime, 75 + i * ((width - 75) / 5) - textTimeWidth / 2, height - 5);
		ctx.fillStyle = 'grey';
		if (i > 0)
			ctx.fillRect(75 + i * ((width - 75) / 5), 0, 1, height - 40);
	}
	for (let j = 0; j < arr.length; j++)
	{
		for (let i = 0; i < arr[j].length; i++)
		{
			let		x = 75 + ((arr[j][i].timestamp - start) / (end - start)) * (width - 75);
			let		x2 = 0;
			if (i < arr[j].length - 1)
				x2 = 75 + ((arr[j][i + 1].timestamp - start) / (end - start)) * (width - 75);
			else
			{
				const now = new Date();
				x2 = 75 + ((now - start) / (end - start)) * (width - 75);
			}
			if ((x < 75 && x2 < 75) || (x > width && x2 > width))
				continue;
			if (x < 75)
				x = 75;
			if (x2 > width)
				x2 = width;
			ctx.fillStyle = color[arr[j][i].status];
			const y = [26, 71, 121][j];
			if (arr[j][i].status !== 'offline')
				ctx.fillRect(x, y, x2 - x, 20);
			if (j === 0)
				dataGraph.desktop.push({x: x, y: y, width: x2 - x, height: 20, status: arr[j][i].status, timestamp: arr[j][i].timestamp});
			else if (j === 1)
				dataGraph.mobile.push({x: x, y: y, width: x2 - x, height: 20, status: arr[j][i].status, timestamp: arr[j][i].timestamp});
			else if (j === 2)
				dataGraph.web.push({x: x, y: y, width: x2 - x, height: 20, status: arr[j][i].status, timestamp: arr[j][i].timestamp});
		}
	}

	function resizeGraphStatus()
	{
		if (timeout)
			clearTimeout(timeout);
		timeout = setTimeout(() => {
			createGraphStatus();
		}, timeToRefresh);
	}
	window.removeEventListener('resize', resizeGraphStatus);
	window.addEventListener('resize', resizeGraphStatus);

	function showInfo(e)
	{
		if (timeout3)
			clearTimeout(timeout3);
		timeout3 = setTimeout(() => {
			const	divInfo = document.getElementById('graph-status-info');
			const	mouseX = e.clientX - bounds.left;
			const	mouseY = e.clientY - bounds.top;
			let		end = null;
			let		found = false;

			if (mouseY > 26 && mouseY < 46)
			{
				for (let i = 0; i < dataGraph.desktop.length; i++)
				{
					if (dataGraph.desktop[i].status === 'offline')
						continue;
					if (mouseX > dataGraph.desktop[i].x && mouseX < dataGraph.desktop[i].x + dataGraph.desktop[i].width)
					{
						divInfo.style.top = '5px';
						divInfo.style.left = mouseX - 70 + 'px';
						divInfo.children[0].textContent = 'Desktop';
						divInfo.children[1].textContent = dataGraph.desktop[i].status;
						divInfo.children[2].style.fontSize = '12px';
						divInfo.children[2].textContent = new Date(dataGraph.desktop[i].timestamp).toLocaleString() + ' - ' + new Date(dataGraph.desktop[i + 1] ? dataGraph.desktop[i + 1].timestamp : new Date().getTime()).toLocaleString();
						createGraphStatus();
						ctx.fillStyle = 'black';
						found = true;
						break;
					};
				}
			}
			else if (mouseY > 71 && mouseY < 91)
			{
				for (let i = 0; i < dataGraph.mobile.length; i++)
				{
					if (dataGraph.mobile[i].status === 'offline')
						continue;
					if (mouseX > dataGraph.mobile[i].x && mouseX < dataGraph.mobile[i].x + dataGraph.mobile[i].width)
					{
						divInfo.style.top = '50px';
						divInfo.style.left = mouseX - 70 + 'px';
						divInfo.children[0].textContent = 'Mobile';
						divInfo.children[1].textContent = dataGraph.mobile[i].status;
						divInfo.children[2].style.fontSize = '12px';
						if (i < dataGraph.mobile.length - 1)
							end = new Date(dataGraph.mobile[i + 1].timestamp);
						else
							end = new Date();
						divInfo.children[2].textContent = new Date(dataGraph.mobile[i].timestamp).toLocaleString() + ' - ' + end.toLocaleString();
						createGraphStatus();
						ctx.fillStyle = 'black';
						found = true;
						break;
					}
				}
			}
			else if (mouseY > 121 && mouseY < 141)
			{
				for (let i = 0; i < dataGraph.web.length; i++)
				{
					if (dataGraph.web[i].status === 'offline')
						continue;
					if (mouseX > dataGraph.web[i].x && mouseX < dataGraph.web[i].x + dataGraph.web[i].width)
					{
						divInfo.style.top = '85px';
						divInfo.style.left = mouseX - 70 + 'px';
						divInfo.children[0].textContent = 'Web';
						divInfo.children[1].textContent = dataGraph.web[i].status;
						divInfo.children[2].style.fontSize = '12px';
						divInfo.children[2].textContent = new Date(dataGraph.web[i].timestamp).toLocaleString() + ' - ' + new Date(dataGraph.web[i + 1] ? dataGraph.web[i + 1].timestamp : new Date().getTime()).toLocaleString();
						createGraphStatus();
						ctx.fillStyle = 'black';
						found = true;
						break;
					}
				}
			}
			if (!found)
			{
				divInfo.style.display = 'none';
				createGraphStatus();
			}
			else
				divInfo.style.display = 'block';
		}, 1);
	}
	canvas.removeEventListener('mousemove', showInfo);
	canvas.addEventListener('mousemove', showInfo);


	function useWhell(e)
	{
		e.preventDefault();
		if (timeout2)
			clearTimeout(timeout2);
		timeout2 = setTimeout(() => {
			if (e.deltaY < 0)
			{
				const	mouseX = e.clientX - bounds.left;
				const	percentage = mouseX / width;
				const	time = end - start;
				const	newTime = time * 0.9;
				const	newStart = new Date(start.getTime() + time * percentage - newTime * percentage);
				const	newEnd = new Date(newStart.getTime() + newTime);
				if (newEnd.getTime() - newStart.getTime() < 1000000)
					return;
				g_data.firstTimestamp = newStart.getTime();
				g_data.lastTimestamp = newEnd.getTime();
			}
			else
			{
				const	mouseX = e.clientX - bounds.left;
				const	percentage = mouseX / width;
				const	time = end - start;
				const	newTime = time / 0.9;
				const	newStart = new Date(start.getTime() + time * percentage - newTime * percentage);
				const	newEnd = new Date(newStart.getTime() + newTime);
				if (newEnd.getTime() - newStart.getTime() > maxTimestampStatus - minTimestampStatus)
					return;
				g_data.firstTimestamp = newStart.getTime();
				g_data.lastTimestamp = newEnd.getTime();
			}
			createGraphStatus();
		}, timeToRefresh / 2);
	}
	canvas.removeEventListener('wheel', useWhell);
	canvas.addEventListener('wheel', useWhell);
}

function getCustomActivity()
{
	const url = '/api/get_user_custom_activity';
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({user_id: thisUrl.searchParams.get("id")})
	};

	fetch(url, options).then((response) => {
		if (response.status === 200)
			return (response.json());
		else
			throw new Error('Error');
	}).then((data) => {
		showCustomActivity(data);
	}).catch((error) => {
		console.error(error);
	});
}

function showCustomActivity(data)
{
	const	scrollDiv = document.getElementById('custom-activity-scroll');

	for (let i = 0; i < data.length; i++)
	{
		const	div = document.createElement('div');

		div.setAttribute('class', 'line');
		div.innerHTML = `
			<p>${data[i].text}</p>
			<p class="date">From <span>${new Date(data[i].start).toLocaleString()}</span></p>
			<p class="date">To <span>${new Date(data[i].end).toLocaleString()}</span></p>
		`;
		scrollDiv.appendChild(div);
	}
}



function getDataAllPfp()
{
	const url = '/api/get_user_all_pfp';
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({user_id: thisUrl.searchParams.get("id")})
	};

	fetch(url, options).then((response) => {
		if (response.status === 200)
			return (response.json());
		else
			throw new Error('Error');
	}).then((data) => {
		showAllPfp(data);
	}).catch((error) => {
		console.error(error);
	});
}

function showAllPfp(data)
{
	const	mozaic = document.getElementById('mozaic-pfp');

	for (let i = data.length - 1; i > 0; i--)
	{
		const	div		= document.createElement('div');
		const	img		= document.createElement('img');
		const	text	= document.createElement('p');

		img.src = data[i].url;
		img.alt = 'pfp';
		img.className = 'pfp';
		text.innerHTML = new Date(data[i].timestamp).toLocaleString().replace(',', ' ') + '<button class="button-pfp" onclick="window.open(\'' + data[i].url + '\', \'_blank\')">Open</button>';
		text.setAttribute('class', 'text-image-pfp');
		img.style.width = '100%';
		div.style.position = 'relative';
		div.style.width = '100%';
		div.style.height = '100%';
		div.appendChild(text);
		div.appendChild(img);
		mozaic.appendChild(div);
		div.addEventListener('mouseover', () => {
			text.style.display = 'flex';
		});
		div.addEventListener('mouseout', () => {
			text.style.display = 'none';
		});
	}
}

function getUserListenMusic()
{
	const url = '/api/get_user_listen_music';
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({user_id: thisUrl.searchParams.get("id")})
	};

	fetch(url, options).then((response) => {
		if (response.status === 200)
			return (response.json());
		else
			throw new Error('Error');
	}).then((data) => {
		showListenMusic(data);
	}).catch((error) => {
		console.error(error);
	});
}

function showListenMusic(data)
{
	const	scrollDiv = document.getElementById('listen-music-scroll');

	for (let i = 0; i < data.length; i++)
	{
		const	div = document.createElement('div');

		div.setAttribute('class', 'line');
		div.innerHTML = `
			<p>${data[i].name} by ${data[i].artist}</p>
			<p class="date">At <span>${new Date(data[i].at).toLocaleString()}</span></p>
		`;
		scrollDiv.appendChild(div);
	}
}