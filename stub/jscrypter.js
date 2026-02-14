const JsConfuser = require("js-confuser");
const fs = require('fs');
const colors = require('colors');
const path = require('path');
const { exec } = require('child_process');

const inputFile = path.join(__dirname, 'node_modules', 'input.js');

if (!fs.existsSync(inputFile)) {
    console.error('❌ input.js file not found in node_modules/');
    process.exit(1);
}

try {
    const file = fs.readFileSync(inputFile, "utf-8");

    JsConfuser.obfuscate(file, {
        "calculator": true,
        "compact": true,
        "controlFlowFlattening": 1.0,
        "deadCode": 0.9,
        "dispatcher": 1.0,
        "duplicateLiteralsRemoval": 1.0,
        "globalConcealing": true,
        "hexadecimalNumbers": true,
        "identifierGenerator": "mangled",
        "minify": true,
        "movedDeclarations": true,
        "objectExtraction": true,
        "opaquePredicates": 1.0,
        "preset": "high",
        "renameGlobals": true,
        "renameVariables": true,
        "shuffle": "hash",
        "stringConcealing": true,
        "stringSplitting": 1.0,
        "target": "node"
    }).then((obfuscatedCode) => {
        console.log('✅ Code obfuscated with JsConfuser');

        const targetFolder = path.join(__dirname, '..', 'build');
        const fileName = 'index.js';

        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }

        const targetFile = path.join(targetFolder, fileName);

        if (typeof obfuscatedCode !== 'string') {
            console.error('❌ Error: The obfuscated code is not a string');
            console.log('Type received:', typeof obfuscatedCode);
            process.exit(1);
        }

        fs.writeFileSync(targetFile, obfuscatedCode, { encoding: 'utf-8' });
        console.log('✅ Final file written to build/index.js');

    }).catch((error) => {
        console.error('❌ Error during JsConfuser obfuscation:', error);
        process.exit(1);
    });

} catch (error) {
    console.error('❌ Error reading input.js file:', error);
    process.exit(1);
}
