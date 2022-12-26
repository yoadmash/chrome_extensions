let setting = undefined;
async function retrieveSettings() {
    await chrome.storage.local.get().then((res) => {
        setting = res.options.a_integration;
    });
}

retrieveSettings();
setTimeout(async () => {
    if (setting) {

        const body = document.body;
        const qrCode = document.getElementsByClassName("_2UwZ_")[0];
        if (!body.contains(qrCode)) {
            const buttons = document.getElementsByClassName('_1QVfy _3UaCz')[0].getElementsByTagName('span')[0];

            const inputButton = document.createElement('div');
            inputButton.innerHTML = `<img style='width: 20px; height: 20px;' src=${chrome.runtime.getURL('icons/injectedIcon.svg')} alt='icon' />`;
            inputButton.style.fontSize = '20px';
            inputButton.style.cursor = 'pointer';
            inputButton.title = 'New chat by phone number';

            inputButton.addEventListener("click", async () => {
                let number = prompt("Please type in the phone number, required format: 0521234567");
                if (number !== null && number.length === 10 && !isNaN(number)) {
                    const formatted = number.slice(1, number.length);
                    const url = `https://api.whatsapp.com/send/?phone=972${formatted}&text&type=phone_number&app_absent=1`;
                    await chrome.storage.local.get(['whatsapp_extension']).then((result) => {
                        if (result.whatsapp_extension) {
                            chrome.storage.local.set({ whatsapp_extension: [number, ...result.whatsapp_extension] });
                        }
                    })
                    window.open(url, "_self");
                }
            })

            buttons.prepend(inputButton);
        } else {
            alert('Attention: In order for this WhatsApp extension to work, please link your device and reload the page.');
        }
    }
}, 5500);