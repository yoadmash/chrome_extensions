const body = document.body;
const list = document.querySelector('.history');
const input = document.querySelector('input');
const btn = document.querySelector('button');

input.focus();

btn.addEventListener('click', openChat);
input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        openChat();
    }
})

function openChat() {
    if (input.value.length === 10 && !isNaN(input.value)) {
        const formatted = input.value.slice(1, input.value.length);
        const url = `https://api.whatsapp.com/send/?phone=972${formatted}&text&type=phone_number&app_absent=1`;
        chrome.tabs.create({
            url: url
        });
    }
    else {
        input.value = '';
        input.placeholder = 'Error: wrong number format!';
        setTimeout(() => {
            input.placeholder = 'Required format: 0521234567';
        }, 1000);
    }
}

window.onload = async () => {
    let arr = [];
    await chrome.storage.local.get(['whatsapp_extension']).then((result) => {
        if (result.whatsapp_extension) {
            arr = [...result.whatsapp_extension];
        }
    });

    if(arr.length > 0) {
        list.classList.remove('hidden');
    } else {
        list.classList.add('hidden');
    }
}