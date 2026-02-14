const { shell } = require('electron');
const sidebar = document.querySelector('.sidebar');
const togglebtn = document.querySelector('.toggle-btn');
togglebtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});
const githubLink = 'https://github.com/Waltmit69/avm-tools';
document.getElementById('github-link').addEventListener('click', () => {
    shell.openExternal(githubLink);
});
const telegramLink = 'https://t.me/avmtools';
document.getElementById('telegram-link').addEventListener('click', () => {
    shell.openExternal(telegramLink);
});
document.addEventListener('DOMContentLoaded', () => {
    const url = 'https://raw.githubusercontent.com/Waltmit69/avm-tools/refs/heads/main/gui/about';
    const aboutTextElement = document.getElementById('about-text');
    const cacheBustingUrl = `${url}?t=${new Date().getTime()}`;
    fetch(cacheBustingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            aboutTextElement.innerHTML = data;
        })
        .catch(error => {
            console.error('Error fetching the about text:', error);
            aboutTextElement.innerHTML = '<p>Failed to load content. Please try again later.</p>';
        });
});
