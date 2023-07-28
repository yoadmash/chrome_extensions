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
            backup: { data: [], date: null },
            recentlyDeletedDate: null,
            autoClearDeletedSavedWindowsList: null,
        });
    }
});

chrome.runtime.onStartup.addListener(async () => {
    const data = await chrome.storage.local.get();
    let deletedSavedWindows = [];
    deletedSavedWindows = data.deletedSavedWindows.filter(deletedWindowObj => Date.now() - deletedWindowObj.id <= Date.now() - data.autoClearDeletedSavedWindowsList);
    chrome.storage.local.set({ deletedSavedWindows: deletedSavedWindows, autoClearDeletedSavedWindowsList: '' });
});

chrome.tabs.onActivated.addListener(async () => {
    await saveCurrentWindows('tabs.onActivated event');
});

chrome.tabs.onUpdated.addListener(async () => {
    await saveCurrentWindows('tabs.onUpdated event');
});

async function saveCurrentWindows(updater) {
    const openedWindows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
    await chrome.storage.local.set({ openedWindows: openedWindows });
    console.log('openedWindows has been recently updated on: ' + new Date().toLocaleString('en-GB') + ' by: ' + updater);
}

chrome.storage.onChanged.addListener((changes) => {
    console.log(changes);
})