chrome.contentSettings.javascript.set({
    primaryPattern: '*://api.whatsapp.com/*',
    setting: "block"
}, console.warn("api.whatsapp.com: JavaScript is blocked in order to prevent WhatsApp from launching the desktop application as well (via chrome extension)"));

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({whatsapp_extension: []});
})