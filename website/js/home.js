let lastData = null;

document.addEventListener("DOMContentLoaded", () => {
	displayUserInfo();
	getHomeData();
});

function getData(url, body)
{
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	};

	return (new Promise((resolve) => {
		fetch(url, options).then((response) => {
			if (response.status !== 200) {
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
	let unixbin = "";
	let unix = "";
	let m = 64 - bin.length;
	unixbin = bin.substring(0, 42 - m);
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
	const username = document.getElementById("username-info");
	const nickname = document.getElementById("nickname-info");
	const status = document.getElementById("status-info");
	const discriminator = document.getElementById("discriminator-info");
	const id = document.getElementById("id-info");
	const created = document.getElementById("created-info");
	const nitro = document.getElementById("nitro-info");
	const pfp = document.getElementById("pfp-img-box");

	getData("/api/get_self_info", {}).then((data) => {
		if (data === null)
			return;
		username.innerText = data.username;
		nickname.innerText = data.global_name;
		discriminator.innerText = data.discriminator;
		id.innerText = data.id;
		created.innerText = new Date(
			convertIDtoUnix(data.id),
		).toLocaleDateString();
		nitro.innerText = haveNitro(data.premium_type);
		pfp.src = `/${data.id}/${data.avatar}.png`;
	});
}

function getHomeData()
{
	const divMusic = document.getElementById("music-listen-div");
	const divStatus = document.getElementById("status-div");
	const divFriends = document.getElementById("nbFriendsDiv");
	const divTime = document.getElementById("activityTimeDiv");

	getData("/api/home", {}).then((data) => {
		data.musics.forEach((music) => {
			const lineMusicDiv = document.createElement("div");
			let pfp = music.pfp ? "/" + music.id + "/" + music.pfp : "https://archive.org/download/discordprofilepictures/discordblue";

			pfp += ".png";
			lineMusicDiv.className = "music-line";
			lineMusicDiv.innerHTML = `
				<div class="music-line-info-music">
					<p>${music.name}</p>
					<p>${music.artist}</p>
				</div>
				<div class="music-line-info-user">
					<p>${music.username}</p>
					<img src="${pfp}"/>
				</div>
			`;
			divMusic.appendChild(lineMusicDiv);
		});

		data.status.forEach((status) => {
			const lineStatusDiv = document.createElement("div");
			let pfp = status.pfp ? "/" + status.id + "/" + status.pfp : "https://archive.org/download/discordprofilepictures/discordblue";

			pfp += ".png";
			lineStatusDiv.className = "status-line";
			lineStatusDiv.innerHTML = `
				<div class="status-line-info">
					<p>Desktop : ${status.data.desktop}</p>
					<p>Mobile : ${status.data.mobile}</p>
					<p>Web : ${status.data.web}</p>
				</div>
				<div class="status-line-info-user">
					<p>${status.username}</p>
					<img src="${pfp}"/>
				</div>
			`;
			divStatus.appendChild(lineStatusDiv);
		});

		const pNode = document.createElement("p");

		pNode.innerText = data.users;
		divFriends.appendChild(pNode);

		function showTime(ms)
		{
			const totalSeconds = Math.floor(ms / 1000);
			const days = Math.floor(totalSeconds / (24 * 60 * 60));
			const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
			const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
			const seconds = totalSeconds % 60;

		    return (`${days} d, ${hours} h, ${minutes} min, ${seconds} s`);
		}

		const pNode2 = document.createElement("p");

		pNode2.innerText = showTime(Date.now() - new Date(data.timeStated));
		setInterval(() => {
			pNode2.innerText = showTime(Date.now() - new Date(data.timeStated));
		}, 1000);
		divTime.appendChild(pNode2);
	});
}
