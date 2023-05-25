chrome.runtime.onInstalled.addListener(async () => {
    const data = await chrome.storage.local.get();
    if (Object.entries(data).length === 0) {
        chrome.storage.local.set({
            options: {
                auto_scroll: true,
                privacy: {
                    include_incognito: false,
                    only_incognito: true
                }
            },
            openedWindows: chrome.storage.local.set({ openedWindows: await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] }) }),
            savedWindows: [],
            deletedSavedWindows: [],
            recentlyDeletedDate: '',
            autoClearDeletedSavedWindowsList: '',
        });
    }
});

chrome.runtime.onStartup.addListener(async () => {
    const data = await chrome.storage.local.get();
    let deletedSavedWindows = [];
    deletedSavedWindows = data.deletedSavedWindows.filter(deletedWindowObj => Date.now() - deletedWindowObj.id <= Date.now() - data.autoClearDeletedSavedWindowsList);
    chrome.storage.local.set({ deletedSavedWindows: deletedSavedWindows, autoClearDeletedSavedWindowsList: '' });
});

chrome.windows.onRemoved.addListener((windowId) => {
    chrome.storage.local.get().then(async (data) => {
        const openedWindows = data.openedWindows;
        const deletedSavedWindows = data.deletedSavedWindows;
        const closedIncognitoWindow = openedWindows.find(window => window.id === windowId && window.incognito);
        if (closedIncognitoWindow) {
            closedIncognitoWindow.id = Date.now();
            deletedSavedWindows.push(closedIncognitoWindow);
            chrome.storage.local.set({ deletedSavedWindows: deletedSavedWindows, autoClearDeletedSavedWindowsList: closedIncognitoWindow.id + 604800000 });
        }
        await saveCurrentWindows();
    });
});

chrome.tabs.onActivated.addListener(async () => {
    await saveCurrentWindows();
});

chrome.tabs.onUpdated.addListener(async () => {
    await saveCurrentWindows();
});

async function saveCurrentWindows() {
    const openedWindows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
    await chrome.storage.local.set({ openedWindows:  openedWindows});
    console.log('openedWindows recently updated: ' + new Date().toLocaleString('en-GB'));
    console.log(openedWindows);
}