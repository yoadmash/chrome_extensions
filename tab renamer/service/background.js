let recentIncognitoWindowId = '';

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
            backup: [],
            recentlyDeletedDate: null,
            recentlyClosedIncognito: null,
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

chrome.windows.onRemoved.addListener(async (windowId) => {
    chrome.storage.local.get().then(async (data) => {
        const openedWindows = data.openedWindows;
        const recentlyClosedIncognito = openedWindows.find(window => window.id === windowId && window.incognito);
        if (recentlyClosedIncognito) {
            await chrome.storage.local.set({ recentlyClosedIncognito: recentlyClosedIncognito });
        }
    });
    await saveCurrentWindows('windows.onRemoved event');
});

chrome.windows.onCreated.addListener(async (window) => {
    await chrome.storage.local.get().then(async (data) => {
        if (data.openedWindows.length !== 0) {
            if (window.incognito && data.recentlyClosedIncognito) {
                await chrome.notifications.getAll(async (notifs) => {
                    if (notifs.recentlyClosedIncognito) {
                        await chrome.notifications.clear('recentlyClosedIncognito');
                    }
                    const notificationOptions = {
                        type: 'basic',
                        iconUrl: '../icons/tab_renamer128.png',
                        requireInteraction: true,
                        silent: true,
                        eventTime: Date.now(),
                        title: 'Tabs Manager',
                        message: 'Would you like to restore the tabs of the latest closed incognito window?',
                        contextMessage: 'Click the notification to restore the tabs or \'Close\' to delete.',
                        priority: 2
                    }
                    await chrome.notifications.create('recentlyClosedIncognito', notificationOptions);
                    recentIncognitoWindowId = window.id;
                });
            }
        }
    });
});

chrome.tabs.onActivated.addListener(async () => {
    await saveCurrentWindows('tabs.onActivated event');
});

chrome.tabs.onUpdated.addListener(async () => {
    await saveCurrentWindows('tabs.onUpdated event');
});

chrome.notifications.onClicked.addListener(async () => {
    const data = await chrome.storage.local.get();
    chrome.windows.get(recentIncognitoWindowId).then(() => {
        data.recentlyClosedIncognito.tabs.forEach(tab => {
            if (!tab.url.match('https://gx-corner.opera.com/')) {
                chrome.tabs.create({ url: tab.url, windowId: recentIncognitoWindowId })
            }
        });
    }).catch(() => {
        const urls = [];
        data.recentlyClosedIncognito.tabs.forEach(tab => {
            if (!tab.url.match('https://gx-corner.opera.com/')) {
                urls.push(tab.url);
            }
        });
        chrome.windows.create({
            focused: true,
            incognito: data.recentlyClosedIncognito.incognito,
            url: urls
        })
    });
    chrome.storage.local.set({ recentlyClosedIncognito: null });
});

chrome.notifications.onClosed.addListener(() => {
    chrome.storage.local.set({ recentlyClosedIncognito: null })
});

async function saveCurrentWindows(updater) {
    const openedWindows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
    await chrome.storage.local.set({ openedWindows: openedWindows });
    console.log('openedWindows has been recently updated on: ' + new Date().toLocaleString('en-GB') + ' by: ' + updater);
}

chrome.storage.onChanged.addListener((changes) => {
    console.log(changes);
})