const root = document.querySelector('#root');

async function loadAssets() {
    const windows = await chrome.windows.getAll({
        populate: true,
        windowTypes: ['normal']
    });

    search(windows);
    renderWindows(windows);
}

function renderWindows(windows) {
    const windowsListEl = document.createElement('div');
    windowsListEl.classList.add('list');

    windows.forEach(async (window, i) => {
        const windowEl = document.createElement('div');
        const windowTitle = document.createElement('span');

        if (i > 0) {
            windowEl.style.marginTop = '15px';
        }

        windowEl.setAttribute('id', `window${i}`);
        windowEl.classList.add('window');

        windowTitle.classList.add('title');
        windowTitle.innerText = `[Window ${i + 1} | ${window.state}${(window.incognito) ? ' | incognito' : ''}]`;
        if (window.focused) {
            windowTitle.classList.add('active');
        }
        windowTitle.addEventListener('click', () => {
            chrome.windows.update(window.id, {
                focused: true
            });
            close();
        });

        windowEl.append(windowTitle, renderWindowTabs(window));
        windowsListEl.append(windowEl);
    })

    root.append(windowsListEl);
}

function renderWindowTabs(window) {
    const currentTabsEl = document.createElement('div');

    window.tabs.forEach((el) => {
        const tab = document.createElement('div');
        const tabTitle = document.createElement('span')
        const editIcon = document.createElement('img');

        tab.classList = 'tab';

        tabTitle.innerText = el.title;
        if (el.active && window.focused) {
            tabTitle.classList.add('activeTab');
        }

        editIcon.classList.add('editIcon');
        editIcon.src = `${chrome.runtime.getURL('icons/edit.svg')}`;
        editIcon.alt = 'icon';

        if (!el.url.match('https://gx-corner.opera.com/') && !el.url.match('chrome://*/')) {
            tab.append(tabTitle, editIcon);
        } else {
            tab.append(tabTitle);
        }

        tabTitle.addEventListener('click', () => {
            if (!el.url.match('https://gx-corner.opera.com/')) {
                chrome.windows.update(window.id, {
                    focused: true
                }, () => {
                    chrome.tabs.update(el.id, { active: true });
                    location.reload();
                });
                close();
            }
        });

        editIcon.addEventListener('click', () => {
            const editMode = (tab.firstElementChild.nodeName.toLocaleLowerCase() === 'span');
            let newEl = tab.firstElementChild;
            if (editMode) {
                newEl = document.createElement('input');
                newEl.type = 'text';
                newEl.value = tabTitle.innerText;
                tab.replaceChild(newEl, tabTitle);
                newEl.focus();
                newEl.setSelectionRange(0, newEl.value.length);
                newEl.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
                        console.log('changed title');
                        chrome.scripting.executeScript({
                            target: { tabId: el.id },
                            args: [newEl.value],
                            func: setTitle,
                        });
                        tabTitle.innerHTML = newEl.value;
                        tab.replaceChild(tabTitle, newEl);
                    }
                })
            } else {
                tab.replaceChild(tabTitle, newEl);
            }
        });

        currentTabsEl.classList.add('currentTabs');
        currentTabsEl.append(tab);
    })

    return currentTabsEl;
}

function setTitle(newTitle) {
    document.title = newTitle;
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
            const search = {windowId: window.id, tabs: []};
            for(const window of filteredWindows) {
                for(const tab of window.tabs) {
                    if(tab.title.toLocaleLowerCase().includes(searchInput.value.toLocaleLowerCase()) && !tab.url.match('https://gx-corner.opera.com/')) {
                        search.tabs.push(tab);
                    }
                }
            }
            if(searchInput.value.length > 0) {
                renderSearch(search, searchInput.value);
            } else {
                document.querySelector('.list').remove();
                renderWindows(windows);
            }
        });
    });

    search.append(searchInput);
    root.append(search);
}

function renderSearch(search) {
    const list = document.querySelector('.list'); // main list div
    const searchEl = document.createElement('div'); // injected search element
    const searchTitle = document.createElement('span'); // title
    const tabs = document.createElement('div'); // tabs list inside of search list
    
    list.innerHTML = '';

    searchEl.classList.add('searchEl');
    tabs.classList.add('searchedTabs');
    
    searchTitle.innerText = `[Search]`;
    
    search.tabs.forEach(el => {
        const tab = document.createElement('div');
        const tabTitle = document.createElement('span')

        tab.classList = 'tab';
    
        tabTitle.innerText = el.title;
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

function options() {

}

function renderOptions() {
    const optionsEl = document.createElement('div');
    const checkboxes = [
        {label: 'auto-scroll', element: document.createElement('input'), type: 'checkbox'}
    ]
    for(const item of checkboxes) {
        const el = document.createElement('label');
        el.innerHTML = item.label;
        el.append(item.element);
    }
    root.append(optionsEl);
}

function scrollToActiveTab() {
    const activeWindow = document.querySelector('.active').parentElement;
    const activeTab = activeWindow.querySelector('.activeTab');
    activeTab.scrollIntoView({
        behavior: 'smooth',
        block: "center",
    });
}

window.onload = async () => {
    await loadAssets();
    scrollToActiveTab();
}