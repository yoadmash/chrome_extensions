import { assets } from "./assets.js";

const root = document.querySelector('#root');
let allowedIncognito = false;
let storage = undefined;

async function loadAssets() {
    let windows = await chrome.windows.getAll({
        populate: true,
        windowTypes: ['normal']
    });

    storage = await chrome.storage.local.get();
    const currentWindow = await chrome.windows.getCurrent();
    if (!currentWindow.incognito) {
        if (!storage.options.incognito_windows) {
            windows = windows.filter(window => !window.incognito);
        }
    } else {
        windows = windows.filter(window => window.incognito);
    }

    search(windows);
    await options();
    renderWindows(windows);
}

function renderWindows(windows) {
    const windowsListEl = (root.querySelector('.list')) ? root.querySelector('.list') : document.createElement('div');
    windowsListEl.classList = 'list';

    windows.forEach((window, i) => {
        windowsListEl.append(renderWindow(window, (i + 1), renderWindowTabs(window)));
    })

    if (!root.querySelector('.list')) {
        root.append(windowsListEl);
    }

}

export function renderWindow(windowObj, windowIndex, tabsElement) {
    const windowElement = document.createElement('div');
    windowElement.setAttribute('id', windowObj.id);
    windowElement.classList.add('window');

    const windowTitleElement = document.createElement('div');
    const title = document.createElement('span');
    const icons = document.createElement('div');
    windowTitleElement.classList.add('windowTitle');
    title.classList.add('title');
    icons.classList.add('icons');

    windowTitleElement.append(title, tabsElement.children.length > 1 ? icons : '');

    windowElement.append(windowTitleElement, tabsElement);

    title.innerText = `[Window ${windowIndex}${(windowObj.incognito) ? ' - incognito' : ''} | ${windowObj.state} | ${windowObj.tabs.length} tabs]`;
    if (windowObj.focused) {
        title.classList.add('active');
    }
    title.addEventListener('click', () => {
        chrome.windows.update(windowObj.id, {
            focused: true
        });
        close();
    });

    for (const key in assets) {
        if (assets[key].windowEvent) {
            const icon = document.createElement('img');
            icon.classList.add('icon');
            icon.src = assets[key].src;
            icon.title = assets[key].title_window;
            icon.alt = 'window_action_icon';
            icon.addEventListener('click', () => {
                switch (key) {
                    case 'close':
                        assets[key].windowEvent(windowObj, windowIndex, tabsElement);
                        break;
                    case 'reload':
                        assets[key].windowEvent(windowObj);
                        break;
                    case 'checkTabs':
                        assets[key].windowEvent(windowObj, windowIndex, tabsElement);
                        break;
                }
            });
            if (windowObj.tabs.length > 1) {
                icons.append(icon);
            }
        }
    }

    return windowElement;
}

export function reorderWindows(windowIndex) {
    const arr = document.getElementsByClassName('title');
    for (let i = windowIndex; i < arr.length; i++) {
        arr[i].innerHTML = arr[i].innerHTML.replace(arr[i].innerHTML.charAt(8), (i + 1));
    }
}

// export function renderWindowTabs(window) {
//     const currentTabsEl = document.createElement('div');

//     window.tabs.forEach((el) => {
//         const tab = document.createElement('div');
//         const checkTab = document.createElement('input');
//         const favicon = document.createElement('img');
//         const tabTitle = document.createElement('span')
//         const icons = document.createElement('div');
//         const closeIcon = document.createElement('img');
//         const reloadIcon = document.createElement('img');
//         const editIcon = document.createElement('img');

//         tab.classList = 'tab';
//         tab.setAttribute('id', el.id);
//         tab.append(favicon, tabTitle, icons);

//         icons.classList = 'icons';

//         checkTab.classList = 'checkTab';
//         checkTab.type = 'checkbox';

//         favicon.classList = 'favicon';
//         favicon.alt = 'favicon';
//         if (el.status === 'complete') {
//             favicon.src = (el.favIconUrl?.length !== 0 && el.favIconUrl) ? el.favIconUrl : chrome.runtime.getURL('icons/generic_tab.svg');
//         } else {
//             favicon.src = chrome.runtime.getURL('icons/generic_tab.svg');
//         }

//         if (window.tabs.length > 1) {
//             tab.addEventListener('mouseenter', () => {
//                 if (!checkTab.checked) {
//                     favicon.replaceWith(checkTab);
//                 }
//             });
//         }

//         tab.addEventListener('mouseleave', () => {
//             if (!checkTab.checked) {
//                 checkTab.replaceWith(favicon);
//             }
//         });

//         tabTitle.innerText = el.title;
//         tabTitle.title = el.title;
//         if (el.active && window.focused) {
//             tabTitle.classList.add('activeTab');
//         }

//         editIcon.classList.add('icon');
//         editIcon.src = `${chrome.runtime.getURL('icons/edit.svg')}`;
//         editIcon.title = 'Edit title';
//         editIcon.alt = 'edit';

//         reloadIcon.classList.add('icon');
//         reloadIcon.src = `${chrome.runtime.getURL('icons/reload.svg')}`;
//         reloadIcon.title = 'Reload Tab';
//         reloadIcon.alt = 'reload';
//         reloadIcon.addEventListener('click', () => {
//             chrome.tabs.reload(el.id);
//         });

//         closeIcon.classList.add('icon');
//         closeIcon.src = `${chrome.runtime.getURL('icons/close.svg')}`;
//         closeIcon.title = 'Close Tab';
//         closeIcon.alt = 'close';
//         closeIcon.addEventListener('click', () => {
// const windowIndex = Array.from(document.querySelector('.list').children).indexOf(currentTabsEl.parentElement);
// const currentWindowTitle = currentTabsEl.parentElement.querySelector('.windowTitle').querySelector('.title');
// currentWindowTitle.innerHTML = `[Window ${windowIndex + 1}${(window.incognito) ? ' - incognito' : ''} | ${window.state} | ${currentTabsEl.children.length - 1} tabs]`;
// if (currentTabsEl.children.length > 1) {
//     chrome.tabs.remove(el.id);
//     document.getElementById(el.id).remove();
// } else {
//     chrome.windows.remove(el.windowId);
//     document.getElementById(el.windowId).remove();
//     reorderWindows(windowIndex);
// }
//         });

//         if (!el.url.match('https://gx-corner.opera.com/') && !el.url.match('chrome://*/')) {
//             icons.append(editIcon, reloadIcon, closeIcon);
//         } else if (el.url.match('chrome://*/')) {
//             icons.append(reloadIcon, closeIcon)
//         } else if (el.url.match('https://gx-corner.opera.com/')) {
//             icons.append(reloadIcon);
//         }

//         tabTitle.addEventListener('click', () => {
//             if (!el.url.match('https://gx-corner.opera.com/')) {
//                 chrome.tabs.update(el.id, {active: true}, (tab) => {
//                     chrome.windows.update(tab.windowId, {focused: true});
//                 });
//             }
//         });

//         editIcon.addEventListener('click', async () => {
//             const editMode = (tab.childNodes[1].nodeName.toLocaleLowerCase() === 'span');
//             let newEl = tab.children[1];
//             if (editMode) {
//                 let alreadyEditing = (document.querySelector('.list').querySelector("input[type='text']"));
//                 if (alreadyEditing) {
//                     const alreadyEditingTab = await chrome.tabs.get(Number(alreadyEditing?.parentElement.id));
//                     const element = document.getElementById(alreadyEditingTab.id);
//                     const oldTitle = document.createElement('span');
//                     oldTitle.innerHTML = alreadyEditingTab.title;
//                     if (alreadyEditingTab.active) {
//                         oldTitle.classList.add('activeTab');
//                     }
//                     element.replaceChild(oldTitle, element.children[1]);
//                 }
//                 newEl = document.createElement('input');
//                 newEl.type = 'text';
//                 newEl.placeholder = 'Current Title: ' + tabTitle.innerText;
//                 newEl.value = tabTitle.innerText;
//                 tab.replaceChild(newEl, tab.children[1]);
//                 newEl.focus();
//                 newEl.setSelectionRange(0, newEl.value.length);
//                 newEl.addEventListener('keypress', (event) => {
//                     if (event.key === 'Enter') {
//                         chrome.scripting.executeScript({
//                             target: { tabId: el.id },
//                             args: [newEl.value],
//                             func: setTitle,
//                         });
//                         tabTitle.innerHTML = newEl.value;
//                         tabTitle.title = newEl.value;
//                         tab.replaceChild(tabTitle, newEl);
//                     }
//                 })
//             } else {
//                 tab.replaceChild(tabTitle, newEl);
//             }
//         });

//         currentTabsEl.classList.add('currentTabs');
//         currentTabsEl.append(tab);
//     })

//     return currentTabsEl;
// }

export function renderWindowTabs(window) {
    const tabsEl = document.createElement('div');
    tabsEl.classList.add('currentTabs');

    window.tabs.forEach((el) => {
        const tab = document.createElement('div');
        const checkTab = document.createElement('input');
        const favicon = document.createElement('img');
        const tabTitle = document.createElement('span')
        const icons = document.createElement('div');

        tab.classList.add('tab');
        tab.setAttribute('id', el.id);
        tab.append(favicon, tabTitle, icons);
        if (window.tabs.length > 1) {
            tab.addEventListener('mouseenter', () => {
                if (!checkTab.checked) {
                    favicon.replaceWith(checkTab);
                }
            });
        }

        tab.addEventListener('mouseleave', () => {
            if (!checkTab.checked) {
                checkTab.replaceWith(favicon);
            }
        });

        favicon.classList.add('favicon');
        favicon.alt = 'favicon';
        if (el.status === 'complete') {
            favicon.src = (el.favIconUrl?.length !== 0 && el.favIconUrl) ? el.favIconUrl : chrome.runtime.getURL('icons/generic_tab.svg');
        } else {
            favicon.src = chrome.runtime.getURL('icons/generic_tab.svg');
        }

        checkTab.classList.add('checkTab');
        checkTab.type = 'checkbox';

        tabTitle.innerText = el.title;
        tabTitle.title = el.title;
        if (el.active && window.focused) {
            tabTitle.classList.add('activeTab');
        }
        tabTitle.addEventListener('click', () => {
            if (!el.url.match('https://gx-corner.opera.com/')) {
                chrome.tabs.update(el.id, { active: true }, (tab) => {
                    chrome.windows.update(tab.windowId, { focused: true });
                });
                close();
            }
        });

        icons.classList.add('icons');

        for (const key in assets) {
            if (assets[key].tabEvent) {
                const icon = document.createElement('img');
                icon.classList.add('icon');
                icon.src = assets[key].src;
                icon.title = assets[key].title_tab;
                icon.alt = 'tab_action_icon';
                icon.addEventListener('click', () => {
                    switch (key) {
                        case 'close':
                            assets[key].tabEvent(el, window, tabsEl);
                            break;
                        case 'reload':
                            assets[key].tabEvent(el);
                            break;
                        case 'edit':
                            assets[key].tabEvent(el, tab, tabTitle);
                            break;
                    }
                });
                if (!el.url.match('https://gx-corner.opera.com/') && !el.url.match('chrome://*/')) {
                    icons.append(icon);
                } else if (el.url.match('chrome://*/') && key !== 'edit') {
                    icons.append(icon)
                } else if (el.url.match('https://gx-corner.opera.com/') && key === 'reload') {
                    icons.append(icon);
                }
            }
        }

        tabsEl.append(tab);
    });

    return tabsEl;

}

export function setTitle(newTitle) {
    document.title = newTitle;
}

function updateActiveWindowAndTab(windowId, tabId) {
    document.getElementById(windowId).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function search(windows) {
    const search = document.createElement('div');
    const searchInput = document.createElement('input');

    search.classList.add('search');

    searchInput.classList.add('searchInput');
    searchInput.type = 'text';
    searchInput.placeholder = 'search tabs';
    searchInput.addEventListener('input', async () => {
        const filteredWindows = windows.filter(window => window.tabs.find(tab => tab.title.toLocaleLowerCase().includes(searchInput.value.toLocaleLowerCase())));
        chrome.windows.getCurrent({
            populate: true,
            windowTypes: ['normal']
        }).then(window => {
            const search = { windowId: window.id, tabs: [] };
            for (const window of filteredWindows) {
                for (const tab of window.tabs) {
                    if (tab.title.toLocaleLowerCase().includes(searchInput.value.toLocaleLowerCase()) && !tab.url.match('https://gx-corner.opera.com/')) {
                        search.tabs.push(tab);
                    }
                }
            }
            if (searchInput.value.length > 0) {
                renderSearch(search, searchInput.value);
            } else {
                document.querySelector('.list').remove();
                renderWindows(windows);
            }
        });
    });

    search.append(searchInput);
    root.append(search);
    searchInput.focus();
}

function renderSearch(search) {
    const list = document.querySelector('.list');
    const searchEl = document.createElement('div');
    const searchTitle = document.createElement('span');
    const tabs = document.createElement('div');

    list.innerHTML = '';

    searchEl.classList.add('searchEl');
    tabs.classList.add('searchedTabs');

    searchTitle.innerText = `[Search (${search.tabs.length})]`;

    search.tabs.forEach(el => {
        const tab = document.createElement('div');
        const tabTitle = document.createElement('span')

        tab.classList = 'tab';

        tabTitle.innerText = el.title;
        tabTitle.title = el.title;
        if (el.active && el.windowId === search.windowId) {
            tabTitle.classList.add('activeTab');
        }

        tab.append(tabTitle);

        tabTitle.addEventListener('click', () => {
            if (!el.url.match('https://gx-corner.opera.com/')) {
                chrome.windows.update(el.windowId, {
                    focused: true
                }, () => {
                    chrome.tabs.update(el.id, { active: true });
                    location.reload();
                });
            }
        });

        tabs.append(tab);
    })

    searchEl.append(searchTitle, tabs);
    list.append(searchEl);
}

async function options() {
    allowedIncognito = await chrome.extension.isAllowedIncognitoAccess();
    await renderOptions(storage.options);
}

async function renderOptions(options) {
    const optionsEl = document.createElement('div');
    optionsEl.classList.add('options');
    const optionsMap = [
        { id: 'auto_scroll', label: 'Auto-Scroll to Active Tab', element_type: ['input', 'checkbox'] },
        { id: 'incognito_windows', label: 'Show incognito windows', element_type: ['input', 'checkbox'] }
    ]
    const currentWindow = await chrome.windows.getCurrent();
    for (const option of optionsMap) {
        if (option.id === 'incognito_windows' && !allowedIncognito) {
            continue;
        }
        const label = document.createElement('label');
        label.setAttribute('id', option.id);

        const element = document.createElement(option.element_type[0]);
        element.type = option.element_type[1];
        element.checked = options[option.id];

        if (option.id === 'incognito_windows' && currentWindow.incognito) {
            option.label = 'Show only incognito windows'
            element.checked = true;
        }

        element.addEventListener('click', async (event) => {
            options[option.id] = event.target.checked;
            chrome.storage.local.set({ options: options });
            if (option.id === 'auto_scroll') {
                if (options[option.id]) {
                    scrollToActiveTab(true);
                }
            } else if (option.id === 'incognito_windows') {
                if(!currentWindow.incognito) {
                    if (!options[option.id]) {
                        const arr = document.getElementsByClassName('window');
                        for (let i = arr.length - 1; i >= 0; i--) {
                            const window = await chrome.windows.get(Number(arr[i].id));
                            if (window.incognito) {
                                arr[i].remove();
                            }
                        }
                        reorderWindows(0);
                    } else {
                        let allWindows = await chrome.windows.getAll({
                            populate: true,
                            windowTypes: ['normal']
                        });
                        const activeWindow = allWindows.find(window => window.id === currentWindow.id);
                        const activeTab = activeWindow.tabs.find(tab => tab.active);
                        const list = document.querySelector('.list');
                        list.innerHTML = '';
                        renderWindows(allWindows);
                        updateActiveWindowAndTab(activeWindow.id, activeTab.id);
                    }
                } else {
                    let allWindows = await chrome.windows.getAll({
                        populate: true,
                        windowTypes: ['normal']
                    });
                    const activeWindow = allWindows.find(window => window.id === currentWindow.id);
                    const activeTab = activeWindow.tabs.find(tab => tab.active);
                    const list = document.querySelector('.list');
                    list.innerHTML = '';
                    if(element.checked) {
                        allWindows = allWindows.filter(window => window.incognito);
                    }
                    renderWindows(allWindows);
                    updateActiveWindowAndTab(activeWindow.id, activeTab.id);
                } 
            }
        });

        label.append(element, option.label);
        optionsEl.append(label);
    }
    root.append(optionsEl);
}

async function scrollToActiveTab(auto_scroll) {
    if (auto_scroll) {
        const activeTab = document.querySelector('.activeTab');
        activeTab?.scrollIntoView({
            behavior: 'smooth',
            block: "center",
        });
    }
}

window.onload = async () => {
    await loadAssets();
    scrollToActiveTab(storage.options.auto_scroll);
}