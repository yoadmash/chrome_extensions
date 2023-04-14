chrome.runtime.onInstalled.addListener(async () => {
    chrome.storage.local.set({
        options: {
            auto_scroll: true,
            privacy: {
                include_incognito: false,
                only_incognito: true
            }
        },
        openedWindows: chrome.storage.local.set({openedWindows: await chrome.windows.getAll({populate: true, windowTypes: ['normal']})}),
    });
});

chrome.windows.onCreated.addListener(async () => {
    chrome.storage.local.set({openedWindows: await chrome.windows.getAll({populate: true, windowTypes: ['normal']})});
});

chrome.windows.onRemoved.addListener(async () => {
    chrome.storage.local.set({openedWindows: await chrome.windows.getAll({populate: true, windowTypes: ['normal']})});
});

chrome.tabs.onCreated.addListener(async () => {
    chrome.storage.local.set({openedWindows: await chrome.windows.getAll({populate: true, windowTypes: ['normal']})});
});

chrome.tabs.onRemoved.addListener(async () => {
    chrome.storage.local.set({openedWindows: await chrome.windows.getAll({populate: true, windowTypes: ['normal']})});
});

chrome.tabs.onActivated.addListener(async () => {
    chrome.storage.local.set({openedWindows: await chrome.windows.getAll({populate: true, windowTypes: ['normal']})});
});
