// DOM Variables.
const body = document.querySelector('.form');
const options = document.querySelector('#options');
const contactsForm = document.querySelector('#contacts');
const input = document.querySelector('input');
const btn = document.querySelectorAll('button');

const toggles = document.querySelectorAll('.form-check-input');

// Accessing extension storage and declaring global arrays & variable.
let history = [];
let contacts = [];
let settings = {};
let latestVersion = false;

window.onload = async () => {

    //Setting the input element to focus by default.
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            openChat();
        }
    })
    input.addEventListener('input', (event) => { // live history search
        if (input.value.length > 0) {
            if (settings.b_history && history.length > 0) {
                let filtered = history.filter(el => el.includes(input.value));
                renderList('historyContent', filtered);
            }
            if (settings.c_contacts && contacts.length > 0) {
                let filtered = contacts.filter(el => (el.name.includes(input.value) || el.number.includes(input.value)));
                renderList('contactsContent', filtered);
            }
        } else {
            render();
        }
    })

    btn[0].addEventListener('click', openChat);
    btn[1].addEventListener('click', () => {
        const addInputs = Array.from(document.querySelectorAll('input')).filter(el => el.placeholder === 'Name' || el.placeholder === 'Number');
        const name = addInputs[0].value;
        const number = addInputs[1].value
        if (addInputs.filter(el => el.value.length > 0).length === 2) {
            if (isNaN(name) && !isNaN(Number(number)) && number.length === 10) {
                const contact = {
                    name: name,
                    number: number,
                }
                contacts = [contact, ...contacts];
                chrome.storage.local.set({ contacts: contacts });
                addInputs[0].value = '';
                addInputs[1].value = '';
                render();
            }
        }
    });
    btn[2].addEventListener('click', () => {
        for (const toggle of toggles) {
            toggle.checked = true;
        }
    })
    btn[3].addEventListener('click', () => {
        for (const toggle of toggles) {
            toggle.checked = false;
        }
    })
    btn[4].addEventListener('click', () => {
        saveOptions();
        options.classList = 'hidden';
        body.classList.remove('hidden');
        location.reload();
    });

    await render();
}

//Redirect to WhatsApp Web.
function openChat() {
    if (input.value.length === 10 && !isNaN(input.value)) {
        const formatted = input.value.slice(1, input.value.length);
        const url = `https://wa.me/972${formatted}`;
        chrome.tabs.create({
            url: url
        });
        if (history.find(el => el === input.value) === undefined && settings.b_history) { // disabled value duplicity
            history = [input.value, ...history];
        }
        chrome.storage.local.set({ whatsapp_extension: history });
    } else if (input.value === 'options' && latestVersion) {
        options.classList = 'options d-flex flex-column gap-2';
        body.classList.add('hidden');
        input.value = '';
    } else if (input.value === 'clear history' && settings.b_history) {
        chrome.storage.local.set({ whatsapp_extension: [] });
        render();
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
    input.focus();
    input.value = '';

    await loadDB();

    if (settings.b_history) {
        renderList('historyContent', history);
    }

    if (settings.c_contacts) {
        contactsForm.classList.remove('hidden');
        contacts.sort((a, b) => {
            a = a.name.toUpperCase();
            b = b.name.toUpperCase();
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        });
        renderList('contactsContent', contacts);
    } else {
        contactsForm.classList.add('hidden');
    }

    //Render options
    for (let i = 0; i < toggles.length; i++) {
        toggles[i].checked = Object.values(settings)[i];
    }
}

function renderList(list_id, list_arr) {
    let list = document.getElementById(list_id);
    const parent = list.parentElement;
    if (list_arr.length > 0) {
        parent.classList.remove('hidden');
        list.remove();
        list = document.createElement('div');
        list.setAttribute('id', list_id);
        if (list_arr.length >= 5) {
            list.classList.add('scrollable');
        }
        list_arr.map((item, i) => {
            list.appendChild(createItem(item, i, list_id));
        })
        parent.appendChild(list);
    } else if (list_arr.length === 0) {
        if (list_id === 'historyContent') {
            list.parentElement.classList.add('hidden');
        } else if (list_id === 'contactsContent') {
            list.classList.add('hidden')
        }
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
        if (result.latestVersion) {
            latestVersion = result.latestVersion;
        }
    });
}

function createItem(data, item_id, list_id) {
    const item = document.createElement('div');
    item.setAttribute('id', item_id);
    item.classList.add('item');

    if (list_id === 'contactsContent') {
        item.style.height = '50px';
    }

    const listItem = document.createElement('span');
    listItem.classList.add('listItem');

    if (list_id === 'historyContent') {
        listItem.innerText = data;
    }

    if (list_id === 'contactsContent') {
        listItem.classList += ' d-flex flex-column';
        const name = document.createElement('span');
        name.innerText = data.name;
        const number = document.createElement('span');
        number.innerText = data.number;
        listItem.append(name, number);
    }

    listItem.addEventListener('click', (event) => {
        const formatted = (list_id === 'historyContent') ? data.slice(1, data.length) : data.number.slice(1, data.number.length);
        const url = `https://api.whatsapp.com/send/?phone=972${formatted}&text&type=phone_number&app_absent=1`;
        chrome.tabs.create({
            url: url
        });
    })

    const deleteIcon = document.createElement('span');
    deleteIcon.classList.add('delete');
    deleteIcon.classList.add('hidden');
    deleteIcon.innerHTML = `<img style='width: 16px; height: 16px;' src=${chrome.runtime.getURL('icons/deleteIcon.svg')} alt='icon' />`;
    deleteIcon.addEventListener('click', (event) => {
        const arr = (list_id === 'historyContent') ? [...history] : [...contacts];
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
            const content = (list_id === 'historyContent') ? arr[i] : arr[i].name;
            if (content !== event.target.parentNode.parentNode.firstChild.firstChild.textContent) {
                newArr.push(arr[i]);
            }
        }
        chrome.storage.local.set((list_id === 'historyContent') ? { whatsapp_extension: newArr } : { contacts: newArr });
        render();
    });

    item.append(listItem, deleteIcon);

    item.addEventListener('mouseenter', () => {
        deleteIcon.classList.remove('hidden');
    });

    item.addEventListener('mouseleave', () => {
        deleteIcon.classList.add('hidden');
    });

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

async function setJavaScript() {
    let status = false;
    await chrome.storage.local.get().then((storage) => {
        status = storage.options.d_block_js;
    });
    chrome.contentSettings.javascript.set({
        primaryPattern: '*://api.whatsapp.com/*',
        setting: (storage) ? "block": "allow"
    });
}