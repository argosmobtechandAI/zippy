const fs = require('fs');

const path = '/Users/vansh/ReactProject/zippy/zippiAdmin/src/pages/userManagement.jsx';
let content = fs.readFileSync(path, 'utf8');

// The marker for the start is `<div className="space-y-6">`
const startIdx = content.indexOf('<div className="space-y-6">') + '<div className="space-y-6">'.length;
const endIdx = content.indexOf('{/* ── Membership Card ───────────────────────────── */}');

const innerContent = content.substring(startIdx, endIdx);

// We know the structure:
// Level block: `{localUser.type === 'rider' && !isEditingLevel` up to `{localUser.type === 'rider' && !isEditingWallet`
// Wallet block: `{localUser.type === 'rider' && !isEditingWallet` up to `{localUser.type === 'rider' && !isEditingSession`
// Session block: `{localUser.type === 'rider' && !isEditingSession` up to end

const levelStart = innerContent.indexOf("{localUser.type === 'rider' && !isEditingLevel");
const walletStart = innerContent.indexOf("{localUser.type === 'rider' && !isEditingWallet");
const sessionStart = innerContent.indexOf("{localUser.type === 'rider' && !isEditingSession");

const levelBlock = innerContent.substring(levelStart, walletStart);
const walletBlock = innerContent.substring(walletStart, sessionStart);
const sessionBlock = innerContent.substring(sessionStart);

const newInnerContent = '\n                    ' + sessionBlock.trim() + '\n\n                    ' + walletBlock.trim() + '\n\n                    ' + levelBlock.trim() + '\n\n                    ';

content = content.substring(0, startIdx) + newInnerContent + content.substring(endIdx);
fs.writeFileSync(path, content);
console.log('Reordered blocks successfully');
