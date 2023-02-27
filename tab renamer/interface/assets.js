import { renderWindow } from "./script.js";

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
        windowEvent: (window, windowIndex, tabsElement) => {
            if(tabsElement.contains(tabsElement.querySelector('.favicon'))) {
                for(const tab of tabsElement.children) {
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
                console.log(renderWindow(window, windowIndex - 1, tabsElement));
            }
        }
    }
}