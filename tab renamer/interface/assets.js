export const assets = {
    close: {
        title: 'Close',
        src: `${chrome.runtime.getURL('icons/close.svg')}`,
        windowEvent: (window) => {
            console.log(window);
        }
    },
    reload: {
        title: 'Reload',
        src: `${chrome.runtime.getURL(`icons/reload.svg`)}`,
        windowEvent: (window) => {
            window.tabs.forEach(tab => {
                chrome.tabs.reload(tab.id);
            });
        }
    },
    edit: {
        title: 'Edit',
        src: `${chrome.runtime.getURL(`icons/edit.svg`)}`,
        tabEvent: (window) => {
            console.log(window);
        }
    },
    checkTabs: {
        title: 'Check \\ Uncheck All Tabs',
        src: `${chrome.runtime.getURL(`icons/checkTabs.svg`)}`,
        windowEvent: (tabsElement) => {
            console.log(tabsElement);
        }
    }
}