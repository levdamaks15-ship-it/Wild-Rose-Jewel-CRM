const fs = require('fs');
const files = ['index.html', 'catalog.html', 'lookbook.html'];

for (const f of files) {
    if (!fs.existsSync(f)) continue;
    let content = fs.readFileSync(f, 'utf8');
    
    // For index.html: optimize below-the-fold sections
    if (f === 'index.html') {
        content = content.replace(/<section id="catalog"[\s\S]*?<\/section>/, match => {
            return match.replace(/<img(?!.*?loading)(.*?)>/g, '<img loading="lazy"$1>');
        });
        content = content.replace(/<section id="about"[\s\S]*?<\/section>/, match => {
            return match.replace(/<img(?!.*?loading)(.*?)>/g, '<img loading="lazy"$1>');
        });
    }

    // Move scripts to head with defer (excluding inline scripts if any, but specifically these)
    const scriptRegex = /<!-- Скрипты -->[\s\S]*?(<script src="translations\.js"><\/script>\s*<script src="utils\.js"><\/script>\s*<script src="components\.js"><\/script>\s*<script src="products-data\.js\?v=.*?"><\/script>\s*<script src="script\.js\?v=.*?"><\/script>)/i;
    
    const match = content.match(scriptRegex);
    if (match) {
        const scriptsBlock = match[1];
        // add defer to each script tag
        const deferScripts = scriptsBlock.replace(/<script /g, '<script defer ');
        
        // Remove from original place
        content = content.replace(match[0], '<!-- Скрипты (перенесены в head) -->');
        
        // Insert into head
        content = content.replace('</head>', '\n    <!-- Скрипты -->\n    ' + deferScripts + '\n</head>');
    }
    
    fs.writeFileSync(f, content);
    console.log('Optimized ' + f);
}
