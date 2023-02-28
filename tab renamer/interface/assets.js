import { renderWindow, renderWindowTabs, reorderWindows } from "./script.js";

export const assets = {
    close: {
        title: 'Close',
        src: `${chrome.runtime.getURL('icons/close.svg')}`,
        windowEvent: async (window, windowIndex, tabsElement) => {
            const selectedTabs = tabsElement.contains(tabsElement.querySelector('.checkTab'));
            if (!selectedTabs) {
                chrome.windows.remove(window.id);
                document.getElementById(window.id).remove();
                reorderWindows(windowIndex - 1);
            } else {
                const arr = tabsElement.querySelectorAll('.checkTab');
                for (let j = arr.length - 1; j >= 0; j--) {
                    const tabToClose = await chrome.tabs.get(Number(arr[j].parentElement.id));
                    if (!tabToClose.url.match('https://gx-corner.opera.com/')) {
                        chrome.tabs.remove(tabToClose.id);
                        document.getElementById(tabToClose.id).remove();
                        document.getElementById(window.id).querySelector('.title').innerText = `[Window ${windowIndex}${(window.incognito) ? ' - incognito' : ''} | ${window.state} | ${tabsElement.children.length} tabs]`;
                    }
                }
                if (tabsElement.children.length === 0) {
                    document.getElementById(window.id).remove();
                }
            }
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
        title: 'Edit Title',
        src: `${chrome.runtime.getURL(`icons/edit.svg`)}`,
        tabEvent: (window) => {
            console.log(window);
        }
    },
    checkTabs: {
        title: 'Check \\ Uncheck All Tabs',
        src: `${chrome.runtime.getURL(`icons/checkTabs.svg`)}`,
        windowEvent: (window, windowIndex, tabsElement) => {
            if (tabsElement.contains(tabsElement.querySelector('.favicon'))) {
                for (const tab of tabsElement.children) {
                    const favicon = tab.querySelector('.favicon');
                    const checkTab = document.createElement('input');
                    checkTab.classList = 'checkTab';
                    checkTab.type = 'checkbox';
                    checkTab.checked = true;
                    favicon?.replaceWith(checkTab);
                    checkTab.addEventListener('input', (event) => {
                        if (!event.target.checked) {
                            checkTab.replaceWith(favicon);
                        }
                    });
                }
            } else {
                document.getElementById(window.id).replaceWith(renderWindow(window, windowIndex, renderWindowTabs(window)));
            }
        }
    }
}