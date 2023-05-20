chrome.runtime.onInstalled.addListener(async () => {
    const data = await chrome.storage.local.get();
    if(Object.entries(data).length === 0) {
        chrome.storage.local.set({
            options: {
                auto_scroll: true,
                privacy: {
                    include_incognito: false,
                    only_incognito: true
                }
            },
            openedWindows: chrome.storage.local.set({openedWindows: await chrome.windows.getAll({populate: true, windowTypes: ['normal']})}),
            savedWindows: [],
            deletedSavedWindows: [],
        });
    }
});

chrome.runtime.onStartup.addListener(async () => {
    const data = await chrome.storage.local.get();
    let deletedSavedWindows = [];
    deletedSavedWindows = data.deletedSavedWindows.filter(deletedWindowObj => parseInt(Date.now() / 1000 - (deletedWindowObj.id)) <= 604800);
    chrome.storage.local.set({deletedSavedWindows: deletedSavedWindows});
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
