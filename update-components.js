const fs = require('fs');
let code = fs.readFileSync('components.js', 'utf8');

// Convert properties to getters
code = code.replace(/sidebar:\s*`/, "get sidebar() { return `");
code = code.replace(/footer:\s*`/, "get footer() { return `");
code = code.replace(/header:\s*`/, "get header() { return `");
code = code.replace(/common:\s*`/, "get common() { return `");

// Close getters
code = code.replace(/`,\s*footer/g, "`; },\n\n    footer");
code = code.replace(/`,\s*common/g, "`; },\n\n    common");
code = code.replace(/`\s*};\s*$/g, "`; }\n};");
code = code.replace(/`,\s*sidebar/g, "`; },\n\n    sidebar");

// Replace hardcoded whatsapp links
code = code.replace(/https:\/\/wa\.me\/77000000000/g, "https://wa.me/${typeof WRJ_CONFIG !== 'undefined' ? WRJ_CONFIG.whatsappNumber : '77000000000'}");
// Replace hardcoded instagram links
code = code.replace(/https:\/\/www\.instagram\.com\/wild_rose_jewel/g, "https://www.instagram.com/${typeof WRJ_CONFIG !== 'undefined' ? WRJ_CONFIG.instagram : 'wild_rose_jewel'}");

fs.writeFileSync('components.js', code);
console.log("components.js updated.");
