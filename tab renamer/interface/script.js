const windowsListEl = document.querySelector('.windowsList');
async function loadWindows() {
    const windows = await chrome.windows.getAll({
        populate: true,
        windowTypes: ['normal']
    })
    windows.forEach(async (window, i) => {
        const windowEl = document.createElement('div');
        const windowTitle = document.createElement('span');

        if (i > 0) {
            windowEl.style.marginTop = '15px';
        }

        windowEl.setAttribute('id', `window${i}`);
        windowEl.classList.add('windowEl');

        windowTitle.classList.add('windowTitle');
        windowTitle.innerText = `[Window ${i + 1} | ${window.state}${(window.incognito) ? ' | incognito' : ''}]`;
        if (window.focused) {
            windowTitle.classList.add('activeWindow');
        }
        windowTitle.addEventListener('click', () => {
            chrome.windows.update(window.id, {
                focused: true
            });
        })

        windowEl.append(windowTitle, loadCurrentTabs(window));
        windowsListEl.append(windowEl);
    })
}

function loadCurrentTabs(window) {
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
                chrome.windows.update(el.windowId, {
                    focused: true
                }, () => {
                    chrome.tabs.update(el.id, { active: true });
                });
            }
        })

        editIcon.addEventListener('click', () => {
            const editMode = (tab.firstElementChild.nodeName.toLocaleLowerCase() === 'span');
            let newEl = tab.firstElementChild;
            console.log(editMode);
            if (editMode) {
                newEl = document.createElement('input');
                newEl.type = 'text';
                newEl.value = tabTitle.innerText;
                tab.replaceChild(newEl, tabTitle);
                newEl.focus();
                newEl.setSelectionRange(0, newEl.value.length);
                newEl.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
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
        })
        currentTabsEl.classList.add('currentTabs');
        currentTabsEl.append(tab);
    })
    return currentTabsEl;
}

function setTitle(newTitle) {
    document.title = newTitle;
}

function scrollToActiveTab() {
    const activeWindow = document.querySelector('.activeWindow').parentElement;
    const activeTab = activeWindow.querySelector('.activeTab');
    activeTab.scrollIntoView({
        behavior: 'smooth',
        block: "center",
    })
}

window.onload = async () => {
    await loadWindows();
    scrollToActiveTab();
}