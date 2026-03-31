const fs = require('fs');
const path = require('path');
const srcDir = path.join(process.cwd(), 'src');
function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // we will replace with (import.meta.env.VITE_API_URL || "http://localhost:3500") for safe local dev as well
            const replacement = '(import.meta.env.VITE_API_URL || "http://localhost:3500")';

            content = content.replace(/"http:\/\/localhost:3500\//g, replacement + ' + "/');
            content = content.replace(/'http:\/\/localhost:3500\//g, replacement + " + '/");
            content = content.replace(/`http:\/\/localhost:3500\//g, '`${' + replacement + '}/');
            
            content = content.replace(/"http:\/\/localhost:3500"/g, replacement);
            content = content.replace(/'http:\/\/localhost:3500'/g, replacement);
            content = content.replace(/`http:\/\/localhost:3500`/g, '`${' + replacement + '}`');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log('Modified:', fullPath);
            }
        }
    });
}
walk(srcDir);
