import { renderWindow, renderWindowTabs, reorderWindows, setTitle } from "./script.js";

export const assets = {
    checkTabs: {
        title_window: 'Check \\ Uncheck All Tabs',
        src: `${chrome.runtime.getURL(`icons/check_tabs.svg`)}`,
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
    },
    saveWindow: {
        title_window: 'Save Window',
        src: `${chrome.runtime.getURL(`icons/save_window.svg`)}`,
        windowEvent: async (window) => {
            window.id = parseInt(Date.now() / 1000);
            const storage = await chrome.storage.local.get();
            const savedWindows = storage.savedWindows;
            savedWindows.push(window);
            chrome.storage.local.set({ savedWindows: savedWindows });
        }
    },
    deleteSavedWindow: {
        title_window: 'Delete',
        src: `${chrome.runtime.getURL(`icons/delete_saved_window.svg`)}`,
        windowEvent: async (window) => {
            const storage = await chrome.storage.local.get();
            let savedWindows = storage.savedWindows;
            let deletedSavedWindows = storage.deletedSavedWindows;
            savedWindows = savedWindows.filter(win => win.id !== window.id);
            deletedSavedWindows.push(window);
            chrome.storage.local.set({ savedWindows: savedWindows, deletedSavedWindows: deletedSavedWindows });
        }
    },
    edit: {
        title_tab: 'Edit Title',
        src: `${chrome.runtime.getURL(`icons/edit.svg`)}`,
        tabEvent: async (tab, tabEl, tabTitle) => {
            const editMode = (tabEl.childNodes[1].nodeName.toLocaleLowerCase() === 'span');
            let newEl = tabEl.children[1];
            if (editMode) {
                let alreadyEditing = (document.querySelector('.list').querySelector("input[type='text']"));
                if (alreadyEditing) {
                    const alreadyEditingTab = await chrome.tabs.get(Number(alreadyEditing?.parentElement.id));
                    const element = document.getElementById(alreadyEditingTab.id);
                    const oldTitle = document.createElement('span');
                    oldTitle.innerHTML = alreadyEditingTab.title;
                    if (alreadyEditingTab.active) {
                        oldTitle.classList.add('activeTab');
                    }
                    element.replaceChild(oldTitle, element.children[1]);
                }
                newEl = document.createElement('input');
                newEl.type = 'text';
                newEl.placeholder = 'Current Title: ' + tabTitle.innerText;
                newEl.value = tabTitle.innerText;
                tabEl.replaceChild(newEl, tabEl.children[1]);
                newEl.focus();
                newEl.setSelectionRange(0, newEl.value.length);
                newEl.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            args: [newEl.value],
                            func: setTitle,
                        }, (result) => {
                            if (result) {
                                tabTitle.innerHTML = newEl.value;
                                tabTitle.title = newEl.value;
                            }
                            tabEl.replaceChild(tabTitle, newEl);
                        });
                    }
                })
            } else {
                tabEl.replaceChild(tabTitle, newEl);
            }
        }
    },
    reload: {
        title_window: 'Reload Window',
        title_tab: 'Reload Tab',
        src: `${chrome.runtime.getURL(`icons/reload.svg`)}`,
        windowEvent: (window) => {
            window.tabs.forEach(tab => {
                chrome.tabs.reload(tab.id);
            });
        },
        tabEvent: (tab) => {
            chrome.tabs.reload(tab.id);
        }
    },
    close: {
        title_window: 'Close Window',
        title_tab: 'Close Tab',
        src: `${chrome.runtime.getURL('icons/close.svg')}`,
        windowEvent: async (window, windowIndex, tabsElement) => {
            const selectedTabs = tabsElement.contains(tabsElement.querySelector('.checkTab'));
            if (!selectedTabs) {
                chrome.windows.remove(window.id);
                document.getElementById(window.id).remove();
                reorderWindows();
            } else {
                const arr = tabsElement.querySelectorAll('.checkTab');
                if (arr.length !== tabsElement.children.length) {
                    for (let j = 0; j < arr.length; j++) {
                        const tabToClose = await chrome.tabs.get(Number(arr[j].parentElement.id));
                        if (!tabToClose.url.match('https://gx-corner.opera.com/')) {
                            chrome.tabs.remove(tabToClose.id).then(() => {
                                document.getElementById(tabToClose.id).remove();
                                document.getElementById(window.id).querySelector('.title').innerText = `[Window ${windowIndex}${(window.incognito) ? ' - incognito' : ''} | ${window.state} | ${tabsElement.children.length} tabs]`;
                            });
                        }
                    }
                    if (tabsElement.children.length - arr.length === 1) {
                        document.getElementById(window.id).querySelector('.icons').remove();
                    }
                } else {
                    chrome.windows.remove(window.id);
                    document.getElementById(window.id).remove();
                    reorderWindows();
                }
            }
        },
        tabEvent: (tab, window, tabsEl) => {
            // const windowIndex = Array.from(document.querySelector('.list').children).indexOf(tabsEl.parentElement);
            if (tabsEl.children.length > 1) {
                // const currentWindowTitle = tabsEl.parentElement.querySelector('.windowTitle').querySelector('.title');
                // currentWindowTitle.innerHTML = `[Window ${windowIndex + 1}${(window.incognito) ? ' - incognito' : ''} | ${window.state}${(tabsEl.children.length - 1 !== 1) ? `${tabsEl.children.length - 1} tabs` : ''}]`;
                chrome.tabs.remove(tab.id);
                document.getElementById(tab.id).remove();
            } else {
                chrome.windows.remove(window.id);
                document.getElementById(window.id).remove();
            }
            reorderWindows();
        }
    },
}