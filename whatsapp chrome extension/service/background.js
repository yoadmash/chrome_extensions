import testData from './testData.js';

chrome.runtime.onInstalled.addListener(() => {
    const dev = false;
    chrome.storage.local.set({
        whatsapp_extension: (!dev) ? [] : testData.history,
        contacts: (!dev) ? [] : testData.contacts,
        options: {a_integration: true, b_history: true, c_contacts: true, d_blockJS: true},
    });
    setJavaScript();
})

chrome.runtime.onStartup.addListener(() => {
    setJavaScript();
})

async function setJavaScript() {
    let status = false;
    await chrome.storage.local.get().then((storage) => {
        status = storage.options.d_blockJS;
    });
    chrome.contentSettings.javascript.set({
        primaryPattern: '*://api.whatsapp.com/*',
        setting: (status) ? "block": "allow"
    }, () => {
        if(status) {
            console.warn("api.whatsapp.com: JavaScript is blocked in order to prevent WhatsApp from launching the desktop application as well (via chrome extension)");
        }
    });
}