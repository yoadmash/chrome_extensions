import { renderWindow, renderWindowTabs, reorderWindows, setTitle, render } from "./script.js";
import edit_tab_popup from './edit_tab_popup.js';

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
            const storage = await chrome.storage.local.get();
            const savedWindows = storage.savedWindows;
            window.id = (savedWindows[savedWindows.length - 1]) ? savedWindows[savedWindows.length - 1].id + 1 : 100;
            savedWindows.push(window);
            navigator.clipboard.writeText(JSON.stringify(savedWindows));
            chrome.storage.local.set({
                savedWindows: savedWindows,
                backup: {
                    data: savedWindows,
                    date: Date.now()
                }
            }).then(async () => await render());
        }
    },
    delete: {
        title_window: 'Delete',
        title_tab: 'Delete',
        src: `${chrome.runtime.getURL(`icons/delete.svg`)}`,
        windowEvent: async (window) => {
            const storage = await chrome.storage.local.get();
            let savedWindows = storage.savedWindows;
            let deletedSavedWindows = storage.deletedSavedWindows;
            savedWindows = savedWindows.filter(win => win.id !== window.id);
            window.id = Date.now();
            deletedSavedWindows.push(window);
            chrome.storage.local.set({ savedWindows: savedWindows, deletedSavedWindows: deletedSavedWindows, recentlyDeletedDate: window.id, autoClearDeletedSavedWindowsList: window.id + 604800000 }).then(async () => await render());
        },
        tabEvent: async (savedWindow, tabToDelete) => {
            const storage = await chrome.storage.local.get();
            const updatedSavedWindows = storage.savedWindows;
            const savedWindowToUpdateIndex = updatedSavedWindows.findIndex(win => win.id === savedWindow.id);
            const updatedTabs = savedWindow.tabs.filter(tab => tab.id !== tabToDelete.id);
            updatedSavedWindows[savedWindowToUpdateIndex].tabs = updatedTabs;
            document.getElementById(tabToDelete.id).remove();
            chrome.storage.local.set({ savedWindows: updatedSavedWindows }).then(async () => await render());
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
        },
        savedWindowTabEvent: (savedWindow, tab) => {
            const edit_tab = new DOMParser().parseFromString(edit_tab_popup, "text/html").body.firstChild;
            document.body.append(edit_tab);
            disableScorlling(true);

            const titleInput = document.getElementById('edit_tab_title');
            const urlInput = document.getElementById('edit_tab_url');
            const faviconInput = document.getElementById('edit_tab_favicon');

            const currentTitle = tab.title;
            const currentURL = tab.url;

            titleInput.value = currentTitle;
            titleInput.placeholder = 'Current Title: ' + currentTitle;

            urlInput.value = currentURL;
            urlInput.placeholder = 'Current URL: ' + currentURL;

            faviconInput.value = tab.favIconUrl;

            const saveBtn = document.getElementById('edit_tab_save');
            saveBtn.addEventListener('click', async () => {
                if (titleInput.value !== currentTitle || urlInput.value !== currentURL || faviconInput.value !== tab.favIconUrl) {
                    tab.title = titleInput.value;
                    tab.url = urlInput.value;
                    tab.favIconUrl = faviconInput.value;
                    document.getElementById(tab.id).children[0].src = faviconInput.value;
                    document.getElementById(tab.id).children[1].innerText = titleInput.value;
                    document.getElementById(tab.id).children[1].removeAttribute('style');

                    const savedTabToUpdateIndex = savedWindow.tabs.findIndex(savedTab => savedTab.id === tab.id);
                    savedWindow.tabs[savedTabToUpdateIndex] = tab;

                    const storage = await chrome.storage.local.get();
                    const updatedSavedWindows = storage.savedWindows;
                    const savedWindowToUpdateIndex = updatedSavedWindows.findIndex(win => win.id === savedWindow.id);

                    updatedSavedWindows[savedWindowToUpdateIndex] = savedWindow;

                    chrome.storage.local.set({ savedWindows: updatedSavedWindows, clipboard: null });
                }
                edit_tab.remove();
                disableScorlling(false);
            })

            const cancelBtn = document.getElementById('edit_tab_cancel');
            cancelBtn.addEventListener('click', () => {
                edit_tab.remove();
                disableScorlling(false);
            })

            const pasteBtn = document.getElementById('edit_tab_fill');
            pasteBtn.addEventListener('click', async () => {
                const storage = await chrome.storage.local.get();
                const clipboard = JSON.parse(storage.clipboard);
                titleInput.value = clipboard.title;
                urlInput.value = clipboard.url;
                faviconInput.value = clipboard.favicon;
                titleInput.setAttribute('disabled', true);
                urlInput.setAttribute('disabled', true);
            })
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
            if (tabsEl.children.length > 1) {
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

function disableScorlling(status) {
    if (status) {
        const xPos = window.scrollX;
        const yPos = window.scrollY;
        window.onscroll = () => window.scroll(xPos, yPos);
    } else {
        window.onscroll = () => { }
    }
}