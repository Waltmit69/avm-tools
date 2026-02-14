const fs = require('fs');
const path = require('path');

const checkboxFilePath = path.join(__dirname, '..', 'gui', 'src', 'checkbox.json');
const stubFilePath = path.join(__dirname, 'stub.js');

const readJsonFile = (filePath, callback) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            callback(err, null);
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            callback(null, jsonData);
        } catch (parseError) {
            callback(parseError, null);
        }
    });
};

readJsonFile(checkboxFilePath, (err, jsonData) => {
    if (err) {
        console.error('Error reading or parsing checkbox.json file:', err);
        return;
    }

    fs.readFile(stubFilePath, 'utf8', (err, stubData) => {
        if (err) {
            console.error('Error reading stub.js file:', err);
            return;
        }

        console.log('Updating CONFIG object in stub.js...');

        const configPattern = /const CONFIG = \{([\s\S]*?)\};/;
        const match = stubData.match(configPattern);

        if (match) {
            let configBlock = match[1];

            Object.keys(jsonData).forEach(key => {
                const val = jsonData[key];
                const keyPattern = new RegExp(`(${key}:\\s*)(true|false)`, 'i');

                if (keyPattern.test(configBlock)) {
                    console.log(`Setting ${key} to ${val}`);
                    configBlock = configBlock.replace(keyPattern, `$1${val}`);
                }
            });

            const newStubData = stubData.replace(configPattern, `const CONFIG = {${configBlock}};`);

            fs.writeFile(stubFilePath, newStubData, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to stub.js:', err);
                    return;
                }
                console.log('stub.js CONFIG has been updated successfully.');
            });
        }
    });
});
