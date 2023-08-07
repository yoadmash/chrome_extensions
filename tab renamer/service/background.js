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
            clipboard: null,
            recentlyDeletedDate: null,
            autoClearDeletedSavedWindowsList: null,
        });
    }
});

chrome.runtime.onStartup.addListener(async () => {
    const data = await chrome.storage.local.get();
    let deletedSavedWindows = [];
    deletedSavedWindows = data.deletedSavedWindows.filter(deletedWindowObj => Date.now() - deletedWindowObj.id <= Date.now() - data.autoClearDeletedSavedWindowsList);
    chrome.storage.local.set({
        deletedSavedWindows: deletedSavedWindows,
        autoClearDeletedSavedWindowsList: '',
    });
});

chrome.tabs.onActivated.addListener(async () => {
    await saveCurrentWindows('tabs.onActivated event');
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    await saveCurrentWindows('tabs.onUpdated event');
    // chrome.storage.local.get()
    // .then(storage => {
    //     if(storage.popup) {
    //         chrome.windows.get(storage.popup, {populate: true, windowTypes: ['popup']})
    //         .then(window => {
    //             if(tabId !== window.tabs[0].id) {
    //                 reloadPopupHtmlWindow();
    //             }
    //         });
    //     }
    // });
});

// chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
//     chrome.storage.local.get()
//     .then(storage => {
//         if(storage.popup !== removeInfo.windowId) {
//             reloadPopupHtmlWindow();
//         }
//     });
// });

chrome.storage.onChanged.addListener((changes) => {
    console.log(changes);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.from === 'savedWindowsView') {
        fetch(message.url)
            .then(response => response.text())
            .then(data => sendResponse(data.includes('Post Not Found')));
        return true;
    }
});

chrome.windows.onRemoved.addListener(async (windowId) => {
    chrome.storage.local.get().then(storage => {
        const popupId = storage.popup;
        if (popupId === windowId) {
            chrome.storage.local.set({ popup: null });
        }
    });
});

function reloadPopupHtmlWindow() {
    chrome.storage.local.get()
        .then(storage => {
            if (storage.popup) {
                chrome.windows.get(storage.popup, { populate: true, windowTypes: ['popup'] })
                    .then(window => {
                        chrome.tabs.reload(window.tabs[0].id);
                    });
            }
        });
}

async function saveCurrentWindows(updater) {
    const openedWindows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
    await chrome.storage.local.set({ openedWindows: openedWindows });
    console.log('openedWindows has been recently updated on: ' + new Date().toLocaleString('en-GB') + ' by: ' + updater);
}