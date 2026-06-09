const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');

const processFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if not exists
    if (!content.includes('sendPushToUser')) {
        content = content.replace(
            "import { supabase } from '../supabaseClient.js';",
            "import { supabase } from '../supabaseClient.js';\nimport { sendPushToUser } from '../firebaseAdmin.js';"
        );
    }

    // Replace the specific notification update patterns
    // e.g. await supabase.from('users').update({ notifications: [...notifs, newNotif] }).eq('id', userId);
    
    // The regex looks for the update pattern and captures the object variable (e.g. newNotif, riderNotif) and the user id variable
    const regex = /await supabase\.from\('users'\)\.update\(\{\s*notifications:\s*\[\.\.\.[^,]+,\s*([^\]]+)\]\s*\}\)\.eq\('id',\s*([^)]+)\);/g;
    
    content = content.replace(regex, (match, notifObj, userIdVar) => {
        return `${match}\n                        await sendPushToUser(${userIdVar}, ${notifObj}.title, ${notifObj}.desc, { type: ${notifObj}.type });`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${path.basename(filePath)}`);
};

fs.readdirSync(controllersDir).forEach(file => {
    if (file.endsWith('.js') && file !== 'adminNotificationController.js') {
        processFile(path.join(controllersDir, file));
    }
});
