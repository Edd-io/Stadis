window.addEventListener('DOMContentLoaded', () => {
	createGraph();
});

function createGraph()
{
	fetch("/api/get_user_presence", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({user_id: "438043489905672203"}),
	}).then((res) => res.json()).then((data) => {
		console.log(data);
		let options = {
			series: [],
			chart: {
				height: 350,
				type: 'rangeBar'
			},
			plotOptions: {
				bar: {
					horizontal: true,
					barHeight: '50%',
					rangeBarGroupRows: true,
				}
			},
			fill: {
				type: 'solid'
			},
			xaxis: {
				type: 'datetime',
				labels: {
					datetimeFormatter: {
						year: 'yyyy',
						month: 'MMM yyyy',
						day: 'dd MMM',
						hour: 'dd/MM/yyyy HH:mm:ss'
					},
					format: 'dd/MM/yyyy HH:mm:ss'
				}
			},
			tooltip: {
				x: {
					format: 'dd/MM/yyyy HH:mm:ss'
				}
			},
			legend: {
				show: false,
			}
		};
	
		for (let i = 0; i < data.desktop.length; i++)
		{
			let	color;

			if (data.desktop[i].status === 'online(Desktop)')
				color = '#3BA55C';
			else if (data.desktop[i].status === 'idle(Desktop)')
				color = '#FAA61A';
			else if (data.desktop[i].status === 'dnd(Desktop)')
				color = '#ED4245'
			else
				color = '#747F8D';
			options.series.push(
				{
					name: data.desktop[i].status,
					data: [
						{
							x: 'Desktop',
							y: [
								new Date(data.desktop[i].timestamp).getTime(),
								i == data.desktop.length - 1 ? Date.now() : new Date(data.desktop[i + 1].timestamp).getTime(),
							],
						}
					],
					color: color,
				}
			)
		}
		for (let i = 0; i < data.mobile.length; i++)
		{
			let	color;

			if (data.mobile[i].status === 'online(Mobile)')
				color = '#3BA55C';
			else if (data.mobile[i].status === 'idle(Mobile)')
				color = '#FAA61A';
			else if (data.mobile[i].status === 'dnd(Mobile)')
				color = '#ED4245'
			else
				color = '#747F8D';
			options.series.push(
				{
					name: data.mobile[i].status,
					data: [
						{
							x: 'Mobile',
							y: [
								new Date(data.mobile[i].timestamp).getTime(),
								i == data.mobile.length - 1 ? Date.now() : new Date(data.mobile[i + 1].timestamp).getTime(),
							]
						}
					],
					color: color,
				}
			)
		}
		for (let i = 0; i < data.web.length; i++)
		{
			let	color;

			if (data.web[i].status === 'online(Web)')
				color = '#3BA55C';
			else if (data.web[i].status === 'idle(Web)')
				color = '#FAA61A';
			else if (data.web[i].status === 'dnd(Web)')
				color = '#ED4245'
			else
				color = '#747F8D';
			options.series.push(
				{
					name: data.web[i].status,
					data: [
						{
							x: 'Web',
							y: [
								new Date(data.web[i].timestamp).getTime(),
								i == data.web.length - 1 ? Date.now() : new Date(data.web[i + 1].timestamp).getTime(),
							]
						}
					],
					color: color,
				}
			)
		}
		var chart = new ApexCharts(document.querySelector("#graph-log-time"), options);
		chart.render();
		
	}).catch((err) => {
		console.error(err);
	});
}
