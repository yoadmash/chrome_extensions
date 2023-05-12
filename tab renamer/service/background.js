chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({options: {auto_scroll: true, privacy: {include_incognito: false, only_incognito: true}}});
})