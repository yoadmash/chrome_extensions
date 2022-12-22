window.onload = () => {
    const input = document.querySelector('input');
    const btn = document.querySelector('button');
    let tab1 = {};

    function openChat() {
        if (input.value.length === 10 && !isNaN(input.value)) {
            const formated = input.value.slice(1, input.value.length);
            const url = `https://api.whatsapp.com/send/?phone=972${formated}&text&type=phone_number&app_absent=1`;
            chrome.tabs.create({
                url: url,
                active: false
            });
            setTimeout(async () => {
                await chrome.tabs.query({url: 'https://web.whatsapp.com/'}, (tabs) => {
                    // chrome.tabs.sendMessage(tabs[tabs.length-1].id, {msg: 'test'});
                    tab1 = tabs;
                    console.log(tab1);
                })
            }, 1000);
        }
        else {
            input.value = '';
            input.placeholder = 'Error: wrong number format!';
            setTimeout(() => {
                input.placeholder = 'Required format: 0521234567';
            }, 1000);
        }
    }

    btn.addEventListener('click', openChat);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            openChat();
        }
    })

    input.focus();
}