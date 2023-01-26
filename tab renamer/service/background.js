chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        settings: {
            incognito: true
        }
    });
})