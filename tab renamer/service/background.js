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
            popup: null,
            recentlyDeletedDate: null,
            autoClearDeletedSavedWindowsList: null,
        });
    } else {
        chrome.storage.local.set({ popup: null })
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
    checkPopupWindow();
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

chrome.commands.onCommand.addListener((command, tab) => {
    if (command) {
        switch (command) {
            case "duplicate_tab":
                chrome.tabs.create({
                    active: true,
                    url: tab.url,
                    windowId: tab.windowId,
                    index: tab.index + 1
                });
                break;
            case "bypass_cache_reload":
                chrome.tabs.reload(tab.id, { bypassCache: true });
                break;
            case "open_show_saved_windows_expanded":
                chrome.windows.get(tab.windowId).then(window => {
                    chrome.windows.create({
                        focused: true,
                        state: 'normal',
                        type: 'popup',
                        top: window.height / 2 - 800 / 2,
                        left: window.width / 2 - 500 / 2,
                        height: 800,
                        width: 650,
                        url: `/interface/popup.html?view=saved_windows`
                    }).then(popup => {
                        chrome.storage.local.set({ popup: popup.id });
                    });
                });
                break;
        }
    }
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

function checkPopupWindow() {
    chrome.storage.local.get().then(storage => {
        chrome.windows.getAll({ populate: true, windowTypes: ['popup'] }).then(windows => {
            const popupWindow = windows.findIndex(window => window.id === storage.popup);
            if (popupWindow === -1) {
                chrome.storage.local.set({ popup: null });
            }
        })
    });
}

async function saveCurrentWindows(updater) {
    const openedWindows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });
    await chrome.storage.local.set({ openedWindows: openedWindows });
    console.log('openedWindows has been recently updated on: ' + new Date().toLocaleString('en-GB') + ' by: ' + updater);
}