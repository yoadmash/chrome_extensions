chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({options: {auto_scroll: true}});
})