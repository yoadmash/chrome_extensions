let settings = undefined;
async function retrieveSettings() {
    await chrome.storage.local.get().then((res) => {
        settings = res.options;
    });
}

retrieveSettings();
setTimeout(async () => {
    if (settings.a_integration) {

        const body = document.body;
        const qrCode = document.getElementsByTagName("canvas")[0];
        if (!body.contains(qrCode)) {
            const buttons = document.getElementsByTagName('span')[7];

            const inputButton = document.createElement('div');
            inputButton.innerHTML = `<img style='width: 20px; height: 20px;' src=${chrome.runtime.getURL('icons/injectedIcon.svg')} alt='icon' />`;
            inputButton.style.fontSize = '20px';
            inputButton.style.cursor = 'pointer';
            inputButton.title = 'New chat by phone number';

            inputButton.addEventListener("click", async () => {
                let number = prompt("Enter a phone number\nRequired format: 0521234567");
                if (number !== null && number.length === 10 && !isNaN(number)) {
                    const formatted = number.slice(1, number.length);
                    const url = `https://wa.me/972${formatted}`;
                    await chrome.storage.local.get(['whatsapp_extension']).then((result) => {
                        if (result.whatsapp_extension && result.whatsapp_extension.find(el => el === number) === undefined && settings.b_history) {
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
}, 10000);