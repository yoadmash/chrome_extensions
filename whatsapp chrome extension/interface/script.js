// DOM Variables.
const body = document.querySelector('.form');
let list = document.querySelector('.history');
const input = document.querySelector('input');
const btn = document.querySelector('button');

// Accessing extension storage and declaring global arr variable.
let arr = [];

window.onload = async () => {

    //Setting the input element to focus by default.
    input.focus();

    //Adding click event to input and btn elements.
    btn.addEventListener('click', openChat);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            openChat();
        }
    })

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
        arr = [input.value, ...arr];
        chrome.storage.local.set({ whatsapp_extension: arr });
    }
    else {
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
    if (arr.length > 0) {
        if (list) {
            list.remove();
            list = document.createElement('div');
            list.classList.add('history');
            list.classList.add('m-2');
            if (arr.length >= 5) {
                list.classList.add('scrollable');
            }
            arr.map((item, i) => {
                list.appendChild(createItem(item, i));
            })
            body.appendChild(list);
        }
    } else if (arr.length === 0) {
        list.remove();
    }
}

async function loadDB() {
    await chrome.storage.local.get(['whatsapp_extension']).then((result) => {
        if (result.whatsapp_extension) {
            arr = [...result.whatsapp_extension];
        }
    });
}

function createItem(data, id) {
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
    deleteIcon.addEventListener('click', (event) => {
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (i !== Number(event.target.parentNode.parentNode.id)) {
                newArr.push(arr[i]);
            }
        }
        chrome.storage.local.set({ whatsapp_extension: newArr });
        render();
    })

    item.appendChild(number);
    item.appendChild(deleteIcon);

    item.addEventListener('mouseenter', () => {
        deleteIcon.classList.remove('hidden');
    })

    item.addEventListener('mouseleave', () => {
        deleteIcon.classList.add('hidden');
    })

    if(arr.length <= 5) {
        item.classList.add('center');
    }

    return item;
}
