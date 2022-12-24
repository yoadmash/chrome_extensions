window.onload = async () => {
    
    // DOM Variables.
    const list = document.querySelector('.history');
    const input = document.querySelector('input');
    const btn = document.querySelector('button');
    
    // Accessing extension storage and declaring global arr variable.
    let arr = [];
    await chrome.storage.local.get(['whatsapp_extension']).then((result) => {
        if (result.whatsapp_extension) {
            arr = [...result.whatsapp_extension];
        }
    });

    //Setting the input element to focus by default.
    input.focus();

    //Adding click event to input and btn elements.
    btn.addEventListener('click', openChat);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            openChat();
        }
    })

    //Redirect to WhatsApp Web.
    function openChat() {
        if (input.value.length === 10 && !isNaN(input.value)) {
            const formatted = input.value.slice(1, input.value.length);
            const url = `https://api.whatsapp.com/send/?phone=972${formatted}&text&type=phone_number&app_absent=1`;
            chrome.tabs.create({
                url: url
            });
            arr = [input.value, ...arr];
            chrome.storage.local.set({whatsapp_extension: arr});
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
    if (arr.length > 0) {
        list.classList.remove('hidden');
        if(arr.length >= 5) {
            list.classList.add('scrollable');
        }
        arr.map((item, i) => {
            list.appendChild(createItem(item, i));
        })
    } else {
        list.classList.add('hidden');
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
        deleteIcon.innerHTML = `<img style='width: 16px; height: 18px; margin-bottom: 4px; margin-right: 4px;' src=${chrome.runtime.getURL('imgs/deleteIcon.svg')} alt='icon' />`;
        deleteIcon.addEventListener('click', (event) => {
            let newArr = [];
            for(let i = 0; i < arr.length; i++) {
                if(i != event.target.parentNode.id) {
                    newArr.push(arr[i]);
                }
            }
            chrome.storage.local.set({whatsapp_extension: newArr});
            location.reload();
        })

        item.appendChild(number);
        item.appendChild(deleteIcon);

        return item;
    }
}