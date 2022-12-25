// DOM Variables.
const body = document.querySelector('.form');
const options = document.querySelector('#options');
let list = document.querySelector('.history');
let list2 = document.querySelector('.contacts');
const input = document.querySelector('input');
const btn = document.querySelectorAll('button');

const toggles = document.querySelectorAll('.form-check-input');

// Accessing extension storage and declaring global arr variable.
let history = [];
let contacts = [];
let settings = {};

window.onload = async () => {

    //Setting the input element to focus by default.
    input.focus();
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            openChat();
        }
    })

    btn[0].addEventListener('click', openChat);
    btn[1].addEventListener('click', () => {
        for (const toggle of toggles) {
            toggle.checked = true;
        }
    })
    btn[2].addEventListener('click', () => {
        for (const toggle of toggles) {
            toggle.checked = false;
        }
    })
    btn[3].addEventListener('click', () => {
        options.classList = 'hidden';
        body.classList.remove('hidden');
        saveOptions();
        location.reload();
    });

    await render();
}

//Redirect to WhatsApp Web.
function openChat() {
    if (input.value.length === 10 && !isNaN(input.value)) {
        const formatted = input.value.slice(1, input.value.length);
        const url = `https://api.whatsapp.com/send/?phone=972${formatted}&text&type=phone_number&app_absent=1`;
        chrome.tabs.create({
            url: url
        });
        history = [input.value, ...history];
        chrome.storage.local.set({ whatsapp_extension: history });
    } else if (input.value === 'options') {
        options.classList = 'options d-flex flex-column gap-2';
        body.classList.add('hidden');
        input.value = '';
    } else {
        input.value = '';
        input.placeholder = 'Error: wrong number format!';
        setTimeout(() => {
            input.placeholder = 'Required format: 0521234567';
        }, 1000);
    }
}

//Rendering the list according the arr variable.
async function render() {
    await loadDB();

    if (settings.c_contacts) {
        renderContactsList();
    }
    if (settings.b_history) {
        renderHistoryList();
    }

    //Render options
    for (let i = 0; i < toggles.length; i++) {
        toggles[i].checked = Object.values(settings)[i];
    }
}

function renderHistoryList() {
    if (history.length > 0) {
        if (list) {
            list.remove();
            list = document.createElement('div');
            list.classList.add('history');
            list.classList.add('m-2');
            if (history.length >= 5) {
                list.classList.add('scrollable');
            }
            history.map((item, i) => {
                list.appendChild(createItem(item, i, 'history'));
            })
            body.appendChild(list);
        }
    } else if (history.length === 0) {
        list.remove();
    }
}

function renderContactsList() {
    if (contacts.length > 0) {
        if (list2) {
            list2.remove();
            list2 = document.createElement('div');
            list2.classList.add('contacts');
            list2.classList.add('m-2');
            if (contacts.length >= 5) {
                list2.classList.add('scrollable');
            }
            contacts.map((item, i) => {
                list2.appendChild(createItem(item, i, 'contacts'));
            })
            body.appendChild(list2);
        }
    } else if (contacts.length === 0) {
        list2.remove();
    }
}

async function loadDB() {
    await chrome.storage.local.get().then((result) => {
        if (result.whatsapp_extension) {
            history = [...result.whatsapp_extension];
        }
        if (result.options) {
            settings = { ...result.options };
        }
        if (result.contacts) {
            contacts = [...result.contacts];
        }
    });
}

function createItem(data, id, type) {
    const item = document.createElement('div');
    item.setAttribute('id', id);
    item.classList.add('item');

    const number = document.createElement('span');
    number.classList.add('number');
    number.innerText = data;
    number.addEventListener('click', (event) => {
        const formatted = event.target.innerText.slice(1, event.target.innerText.length);
        const url = `https://api.whatsapp.com/send/?phone=972${formatted}&text&type=phone_number&app_absent=1`;
        chrome.tabs.create({
            url: url
        });
    })

    const deleteIcon = document.createElement('span');
    deleteIcon.classList.add('delete');
    deleteIcon.classList.add('hidden');
    deleteIcon.innerHTML = `<img style='width: 16px; height: 16px;' src=${chrome.runtime.getURL('icons/deleteIcon.svg')} alt='icon' />`;
    if(type === 'history') {
        deleteIcon.addEventListener('click', (event) => {
            let newArr = [];
            for (let i = 0; i < history.length; i++) {
                if (i !== Number(event.target.parentNode.parentNode.id)) {
                    newArr.push(history[i]);
                }
            }
            chrome.storage.local.set({ whatsapp_extension: newArr });
            render();
        })
    } else if(type === 'contacts') {
        deleteIcon.addEventListener('click', (event) => {
            let newArr = [];
            for (let i = 0; i < contacts.length; i++) {
                if (i !== Number(event.target.parentNode.parentNode.id)) {
                    newArr.push(contacts[i]);
                }
            }
            chrome.storage.local.set({ contacts: newArr });
            render();
        })
    }

    item.appendChild(number);
    item.appendChild(deleteIcon);

    item.addEventListener('mouseenter', () => {
        deleteIcon.classList.remove('hidden');
    })

    item.addEventListener('mouseleave', () => {
        deleteIcon.classList.add('hidden');
    })

    if (history.length <= 5) {
        item.classList.add('center');
    }

    return item;
}

function saveOptions() {
    const settingsArr = Object.entries(settings);
    for (let i = 0; i < settingsArr.length; i++) {
        settingsArr[i][1] = toggles[i].checked;
    }
    settings = Object.fromEntries(settingsArr);
    chrome.storage.local.set({ options: settings });
    render();
}