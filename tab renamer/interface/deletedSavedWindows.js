const list = document.querySelector('.list');

let storage = undefined;

window.onload = async () => {
    storage = await chrome.storage.local.get();
    storage.deletedSavedWindows.forEach((obj) => list.append(renderDeletedWindow(obj, renderDeletedWindowTabs(obj))));
}

function renderDeletedWindow(deletedWindowObj, tabsElement) {
    const windowElement = document.createElement('div');
    windowElement.setAttribute('id', deletedWindowObj.id);
    windowElement.classList.add('window');

    const windowTitleElement = document.createElement('div');
    const title = document.createElement('span');
    windowTitleElement.classList.add('windowTitle');
    title.classList.add('title');

    windowTitleElement.append(title);

    windowElement.append(windowTitleElement, tabsElement);

    title.innerText = `[tabs: ${deletedWindowObj.tabs.length} | incognito: ${deletedWindowObj.incognito}]`;

    title.addEventListener('click', () => {
        const urls = [];
        deletedWindowObj.tabs.forEach(tab => {
            if (!tab.url.match('https://gx-corner.opera.com/')) {
                urls.push(tab.url);
            }
        });
        chrome.windows.create({
            focused: true,
            incognito: deletedWindowObj.incognito,
            state: deletedWindowObj.state,
            url: urls
        }).then(() => {
            close();
        });
    });

    return windowElement;
}

function renderDeletedWindowTabs(deletedWindowObj) {
    const tabsEl = document.createElement('div');
    tabsEl.classList.add('currentTabs');

    deletedWindowObj.tabs.forEach((el) => {
        const tab = document.createElement('div');
        const favicon = document.createElement('img');
        const tabTitle = document.createElement('span')

        tab.classList.add('tab');
        tab.setAttribute('id', el.id);
        tab.append(favicon, tabTitle);

        favicon.classList.add('favicon');
        favicon.src = (el.favIconUrl?.length !== 0 && el.favIconUrl) ? el.favIconUrl : chrome.runtime.getURL('icons/generic_tab.svg');

        tabTitle.innerText = el.title;
        tabTitle.title = el.title; 

        tabsEl.append(tab);
    });

    return tabsEl;
}