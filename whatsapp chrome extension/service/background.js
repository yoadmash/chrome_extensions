chrome.contentSettings.javascript.set({
    primaryPattern: '*://api.whatsapp.com/*',
    setting: "block"
}, console.warn("api.whatsapp.com: JavaScript is blocked in order to prevent WhatsApp from launching the desktop application as well (via chrome extension)"));

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        latestVersion: false,
        // whatsapp_extension: [],
        // contacts: [],
        // options: {a_integration: true, b_history: true, c_contacts: false}
        whatsapp_extension: ['1', '12', '123', '1234', '12345', '123456'],
        contacts: [
            { name: 'זיו אסקרוב', number: '0523550293' },
            { name: 'ליאם לוזון', number: '0547317885' },
            { name: 'אופיר רומנו', number: '0526607405' },
            { name: 'יועד משיח', number: '0524616809' },
            { name: 'רגינה מינקוב', number: '0542112871' },
            { name: 'שי פוזניאנסקי', number: '0542299643' }
        ],
        options: { a_integration: true, b_history: true, c_contacts: true }
    });
})