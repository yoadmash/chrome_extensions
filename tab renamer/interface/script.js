const currentTabsEl = document.querySelector('.currentTabs');

async function loadCurrentTabs() {
    let tabs = await chrome.tabs.query({
        currentWindow: true
    });
    tabs.forEach(el => {
        const tab = document.createElement('div');
        const tabTitle = document.createElement('span')
        const editIcon = document.createElement('img');

        tab.classList = 'tab';
        tabTitle.innerText = el.title;
        editIcon.classList.add('editIcon');
        editIcon.src = `${chrome.runtime.getURL('icons/edit.svg')}`;
        editIcon.alt = 'icon';

        if (!el.url.match('https://gx-corner.opera.com/') && !el.url.match('chrome://*/')) {
            tab.append(tabTitle, editIcon);
        } else {
            tab.append(tabTitle);
        }

        if (el.active) {
            tabTitle.classList.add('activeTab');
        }

        tabTitle.addEventListener('click', () => {
            if (!el.url.match('https://gx-corner.opera.com/')) {
                chrome.tabs.update(el.id, { active: true });
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
                newEl.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter') {
                        chrome.scripting.executeScript({
                            target: { tabId: el.id },
                            args: [newEl.value],
                            func: setTitle,
                        })
                        tabTitle.innerHTML = newEl.value;
                        tab.replaceChild(tabTitle, newEl);
                    }
                })
            } else {
                tab.replaceChild(tabTitle, newEl);
            }
        })
        currentTabsEl.appendChild(tab);
    })
}

function setTitle(newTitle) {
    document.title = newTitle;
}

function scrollToActiveTab() {
    const activeTab = document.querySelector('.activeTab');
    console.log(activeTab);
    activeTab.scrollIntoView({
        behavior: 'smooth',
        block: "center",
    })
}

window.onload = async () => {
    await loadCurrentTabs();
    scrollToActiveTab();
}