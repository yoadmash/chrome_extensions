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

chrome.windows.onRemoved.addListener((windowId) => {
    chrome.storage.local.get().then(async (data) => {
        const openedWindows = data.openedWindows;
        const deletedSavedWindows = data.deletedSavedWindows;
        const closedIncognitoWindow = openedWindows.find(window => window.id === windowId && window.incognito);
        if(closedIncognitoWindow) {
            deletedSavedWindows.push(closedIncognitoWindow);
        }
        chrome.storage.local.set({openedWindows: await chrome.windows.getAll({populate: true, windowTypes: ['normal']}), deletedSavedWindows: deletedSavedWindows});
    });
});

chrome.tabs.onCreated.addListener(async (tab) => {
    await saveCurrentWindows(tab);
});

chrome.tabs.onActivated.addListener(async () => {
    await saveCurrentWindows();
});

async function saveCurrentWindows(tab = undefined) {
    if(tab !== undefined) {
        while(tab.status !== 'complete') {
            tab = await chrome.tabs.get(tab.id);
        }
    }
    await chrome.storage.local.set({openedWindows: await chrome.windows.getAll({populate: true, windowTypes: ['normal']})});
}