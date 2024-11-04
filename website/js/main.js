document.addEventListener('DOMContentLoaded', () => {
	configHomeButton();
});

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