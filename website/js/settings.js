document.addEventListener('DOMContentLoaded', () => {
	switchDarkMode();
	updateColors();
});

function switchDarkMode()
{
	const darkMode = document.getElementById('switch-dark-mode').getElementsByTagName('input')[0];

	if (localStorage.getItem('switch-dark-mode') === 'true')
		darkMode.checked = true;
	darkMode.addEventListener('click', () => {
		localStorage.setItem('switch-dark-mode', darkMode.checked);
		updateColors();
	});
}
