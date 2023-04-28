import { assets } from "./assets.js";

const root = document.querySelector('#root');
let windows_arr = [];
let storage = undefined;
let allowedIncognito = false;
let show_saved_windows = false;

async function render() {
    await updateOpenedWindows();

    const currentWindow = await chrome.windows.getCurrent();
    let windowsToRender = [];
    storage = await chrome.storage.local.get();
    windows_arr = storage.openedWindows;

    root.innerHTML = '';

    if (show_saved_windows) {
        await options();
        windowsToRender = storage.savedWindows;
    } else {
        await search();
        await options();
        if (!currentWindow.incognito) {
            if (allowedIncognito) {
                windowsToRender = (!storage.options.privacy.include_incognito) ? windows_arr.filter(window => !window.incognito) : windows_arr;
            } else {
                windowsToRender = windows_arr;
            }
        } else {
            windowsToRender = (storage.options.privacy.only_incognito) ? windows_arr.filter(window => window.incognito) : windows_arr;
        }
    }
    renderWindows(windowsToRender);
    scrollToActiveTab(storage.options.auto_scroll);
}

async function updateOpenedWindows() {
    chrome.storage.local.set({ openedWindows: await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] }) });
}

function renderWindows(windows) {
    const windowsListEl = document.createElement('div');
    windowsListEl.classList = 'list';

    windows.forEach((window, i) => {
        windowsListEl.append(renderWindow(window, (i + 1), renderWindowTabs(window)));
    })

    root.append(windowsListEl);
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

    windowTitleElement.append(title);

    windowElement.append(windowTitleElement, tabsElement);

    if (!show_saved_windows) {
        title.innerText = `[Window ${windowIndex}${(windowObj.incognito) ? ' - incognito' : ''} | ${windowObj.state} | ${windowObj.tabs.length} tabs]`;
        chrome.windows.getCurrent().then((currentWindow) => {
            if (currentWindow.id === windowObj.id) {
                title.classList.add('active');
            }
        }).catch((err) => console.log(err));
    } else {
        title.innerText = `[tabs: ${windowObj.tabs.length} | incognito: ${windowObj.incognito}]`;
    }

    title.addEventListener('click', () => {
        if (!show_saved_windows) {
            chrome.windows.update(windowObj.id, {
                focused: true
            });
            close();
        } else {
            const urls = [];
            windowObj.tabs.forEach(tab => {
                if (!tab.url.match('https://gx-corner.opera.com/')) {
                    urls.push(tab.url);
                }
            });
            chrome.windows.create({
                focused: true,
                incognito: windowObj.incognito,
                state: windowObj.state,
                url: urls
            }).then(() => {
                close();
            });
        }
    });

    if(show_saved_windows) {
        windowTitleElement.addEventListener('mouseenter', () => {
            windowTitleElement.append(icons);
        });
    
        windowTitleElement.addEventListener('mouseleave', () => {
            icons.remove();
        });
    } else {
        windowTitleElement.append(icons);
    }

    for (const key in assets) {
        if (assets[key].windowEvent) {
            const icon = document.createElement('img');
            icon.classList.add('icon');
            icon.src = assets[key].src;
            icon.title = assets[key].title_window;
            icon.alt = 'window_action_icon';
            if (!show_saved_windows) {
                if (windowObj.tabs.length < 2 && key !== 'saveWindow') {
                    continue;
                } else if (key === 'deleteSavedWindow') {
                    continue;
                }
            } else {
                if (key !== 'deleteSavedWindow') {
                    continue;
                }
            }
            icons.append(icon);
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
                    case 'saveWindow':
                        assets[key].windowEvent(windowObj);
                        render();
                        break;
                    case 'deleteSavedWindow':
                        assets[key].windowEvent(windowObj);
                        render();
                        break;
                }
            });
        }
    }

    return windowElement;
}

export function reorderWindows() {
    const titles = document.querySelectorAll('.title');
    titles.forEach((title, i) => {
        const windowId = title.parentElement.parentElement.id;
        const tabs = title.parentElement.parentElement.querySelector('.currentTabs').children;
        chrome.windows.get(Number(windowId), { populate: true }, (window) => {
            title.innerText = `[Window ${i + 1}${(window.incognito) ? ' - incognito' : ''} | ${window.state} | ${tabs.length} tabs]`;
        });
    });
}

export function renderWindowTabs(windowObj) {
    const tabsEl = document.createElement('div');
    tabsEl.classList.add('currentTabs');

    windowObj.tabs.forEach((el) => {
        const tab = document.createElement('div');
        const checkTab = document.createElement('input');
        const favicon = document.createElement('img');
        const tabTitle = document.createElement('span')
        const icons = document.createElement('div');

        tab.classList.add('tab');
        tab.setAttribute('id', el.id);
        tab.append(favicon, tabTitle, icons);

        if (!show_saved_windows) {
            if (windowObj.tabs.length > 1) {
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
        }

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
        if (!show_saved_windows) {
            chrome.windows.getCurrent().then((currentWindow) => {
                if (el.active && currentWindow.id === windowObj.id) {
                    tabTitle.classList.add('activeTab');
                }
            }).catch((err) => console.log(err));
        }
        tabTitle.addEventListener('click', () => {
            if (!show_saved_windows) {
                if(!el.url.match('https://gx-corner.opera.com/')) {
                    chrome.tabs.update(el.id, { active: true }, (tab) => {
                        chrome.windows.update(tab.windowId, { focused: true });
                    });
                    close();
                }
            } else {
                chrome.windows.create({
                    focused: true,
                    incognito: windowObj.incognito,
                    state: windowObj.state,
                    url: el.url
                }).then(() => {
                    close();
                });
            }
        });

        icons.classList.add('icons');

        if (!show_saved_windows) {
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
                                assets[key].tabEvent(el, windowObj, tabsEl);
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
        }

        tabsEl.append(tab);
    });

    return tabsEl;

}

export function setTitle(newTitle) {
    document.title = newTitle;
}

async function search() {
    const search = document.createElement('div');
    const searchInput = document.createElement('input');

    search.classList.add('search');

    searchInput.classList.add('searchInput');
    searchInput.type = 'text';
    searchInput.placeholder = 'search tabs';
    searchInput.addEventListener('input', async () => {
        storage = await chrome.storage.local.get();
        console.log(storage.openedWindows);
        let filteredWindows = storage.openedWindows.filter(window => window.tabs.find(tab => tab.title.toLocaleLowerCase().includes(searchInput.value.toLocaleLowerCase())));
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
                await render();
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
        { id: 'saved_windows', label: `Show saved windows (${storage.savedWindows.length})`, element_type: ['input', 'checkbox'] },
        { id: 'include_incognito', label: 'Show incognito windows', element_type: ['input', 'checkbox'] },
        { id: 'only_incognito', label: 'Show only incognito windows', element_type: ['input', 'checkbox'] }
    ]

    const currentWindow = await chrome.windows.getCurrent();
    for (const option of optionsMap) {
        const label = document.createElement('label');
        label.setAttribute('id', option.id);

        const element = document.createElement(option.element_type[0]);
        element.type = option.element_type[1];
        element.checked = (option.id === 'include_incognito' || option.id === 'only_incognito') ? options.privacy[option.id] : (option.id === 'saved_windows') ? show_saved_windows : options[option.id];

        if (option.id === 'include_incognito' && !allowedIncognito) {
            label.title = 'missing incognito permission';
            element.disabled = true;
        }

        element.addEventListener('click', async (event) => {
            if (option.id !== 'saved_windows') {
                if (option.id === 'include_incognito' || option.id === 'only_incognito') {
                    if (allowedIncognito) {
                        options.privacy[option.id] = event.target.checked;
                    }
                } else {
                    options[option.id] = event.target.checked;
                }
                chrome.storage.local.set({ options: options });
            }

            if (option.id === 'auto_scroll') {
                if (options[option.id]) {
                    scrollToActiveTab(true);
                }
            } else if (option.id === 'saved_windows') {
                show_saved_windows = element.checked;
                await render();
            } else if ((option.id === 'include_incognito' || option.id === 'only_incognito')) {
                if (allowedIncognito) {
                    await render();
                } else {
                    root.innerHTML = '<h1 style="text-align: center; font-size: 100px;">🖕</h1>';
                }
            }
        });

        label.append(element, option.label);
        switch (label.id) {
            case 'include_incognito':
                if (!currentWindow.incognito && !show_saved_windows) {
                    optionsEl.append(label);
                }
                break;
            case 'only_incognito':
                if (currentWindow.incognito && allowedIncognito && !show_saved_windows) {
                    optionsEl.append(label);
                }
                break;
            case 'auto_scroll':
                if (!show_saved_windows) {
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

function scrollToActiveTab(auto_scroll) {
    if (auto_scroll) {
        chrome.windows.getCurrent({ populate: true }).then((currentWindow) => {
            const activeTab = currentWindow.tabs.find(tab => tab.active);
            document.getElementById(activeTab.id)?.scrollIntoView({
                behavior: 'smooth',
                block: "center",
            });
        });
    }
}

window.onload = async () => {
    await render();
}