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
        if (!storage.options.privacy.include_incognito) {
            windows = windows.filter(window => !window.incognito);
        }
    } else {
        if (storage.options.privacy.only_incognito) {
            windows = windows.filter(window => window.incognito);
        }
    }

    await search();
    await options();
    renderWindows(windows);
}

async function renderWindows(windows) {
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

async function updateActiveWindowAndTab() {
    let allWindows = await chrome.windows.getAll({
        populate: true,
        windowTypes: ['normal']
    });
    const currentWindow = await chrome.windows.getCurrent();
    const activeWindow = allWindows.find(window => window.id === currentWindow.id);
    const activeTab = activeWindow.tabs.find(tab => tab.active);
    document.getElementById(activeWindow.id).classList.add('active');
    document.getElementById(activeTab.id).classList.add('active');
}

async function search() {
    let windows = await chrome.windows.getAll({
        populate: true,
        windowTypes: ['normal']
    });

    const search = document.createElement('div');
    const searchInput = document.createElement('input');

    search.classList.add('search');

    searchInput.classList.add('searchInput');
    searchInput.type = 'text';
    searchInput.placeholder = 'search tabs';
    searchInput.addEventListener('input', async () => {
        let filteredWindows = windows.filter(window => window.tabs.find(tab => tab.title.toLocaleLowerCase().includes(searchInput.value.toLocaleLowerCase())));
        chrome.windows.getCurrent({
            populate: true,
            windowTypes: ['normal']
        }).then(async window => {
            const search = { windowId: window.id, tabs: [] };
            if (!window.incognito && !storage.options.privacy.include_incognito) {
                filteredWindows = filteredWindows.filter(window => !window.incognito);
            } else if (window.incognito && storage.options.privacy.only_incognito) {
                filteredWindows = filteredWindows.filter(window => window.incognito);
            }
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
                if (!window.incognito && !storage.options.privacy.include_incognito) {
                    renderWindows(windows.filter(window => !window.incognito));
                } else if (window.incognito && storage.options.privacy.only_incognito) {
                    renderWindows(windows.filter(window => window.incognito));
                } else {
                    renderWindows(windows);
                }
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
    let allWindows = await chrome.windows.getAll({
        populate: true,
        windowTypes: ['normal']
    });

    const optionsEl = document.createElement('div');
    optionsEl.classList.add('options');

    const optionsMap = [
        { id: 'auto_scroll', label: 'Auto-Scroll to Active Tab', element_type: ['input', 'checkbox'] },
        { id: 'include_incognito', label: 'Show incognito windows', element_type: ['input', 'checkbox'] },
        { id: 'only_incognito', label: 'Show only incognito windows', element_type: ['input', 'checkbox'] }
    ]

    const currentWindow = await chrome.windows.getCurrent();
    for (const option of optionsMap) {
        const label = document.createElement('label');
        label.setAttribute('id', option.id);

        const element = document.createElement(option.element_type[0]);
        element.type = option.element_type[1];
        element.checked = (option.id === 'include_incognito' || option.id === 'only_incognito') ? options.privacy[option.id] : options[option.id];

        if (option.id === 'include_incognito' && !allowedIncognito) {
            option.label += ' (missing incognito permission)';
            element.disabled = true;
        }

        element.addEventListener('click', async (event) => {
            if (option.id === 'include_incognito' || option.id === 'only_incognito') {
                options.privacy[option.id] = event.target.checked;
            } else {
                options[option.id] = event.target.checked;
            }
            chrome.storage.local.set({ options: options });

            if (option.id === 'auto_scroll') {
                if (options[option.id]) {
                    scrollToActiveTab(true);
                }
            } else if (option.id === 'include_incognito') {
                document.querySelector('.list').remove();
                if (options.privacy[option.id]) {
                    renderWindows(allWindows);
                } else {
                    renderWindows(allWindows.filter(window => !window.incognito));
                }
            } else if (option.id === 'only_incognito') {
                document.querySelector('.list').remove();
                if (!options.privacy[option.id]) {
                    renderWindows(allWindows);
                } else {
                    renderWindows(allWindows.filter(window => window.incognito));
                }
            }
        });

        label.append(element, option.label);
        switch (label.id) {
            case 'include_incognito':
                if (!currentWindow.incognito) {
                    optionsEl.append(label);
                }
                break;
            case 'only_incognito':
                if (currentWindow.incognito && allowedIncognito) {
                    optionsEl.append(label);
                }
                break;
            default:
                optionsEl.append(label);
                break;
        }
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