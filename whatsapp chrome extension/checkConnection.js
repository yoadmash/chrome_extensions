/* check qr code appearance by class _2UwZ_
    if it doesn't exists return error to input.
    else
        click on button get by class _3GlyB dwbWf
        check number to match +972 50-989-4366 by getting by class erpdyial i0jNr selectable-text copyable-text
        if no match return error
        else reopen the tab with the number provided by input.value
*/

setTimeout(() => {
    const body = document.body;
    const qrCode = document.getElementsByClassName("_2UwZ_")[0];
    if (!body.contains(qrCode)) {

        const buttons = document.getElementsByClassName('_1QVfy _3UaCz')[0].getElementsByTagName('span')[0];
        const inputButton = document.createElement('div');
        inputButton.innerHTML = '📱';
        inputButton.style.fontSize = '24px';
        inputButton.style.cursor = 'pointer';
        inputButton.title = 'New chat by phone number';

        inputButton.addEventListener("click", () => {
            let number = prompt("Required format: 0521234567");
            if (number != null && number.length === 10 && !isNaN(number)) {
                const formatted = number.slice(1, number.length);
                const url = `https://api.whatsapp.com/send/?phone=972${formatted}&text&type=phone_number&app_absent=1`;
                window.open(url, "_self");
            } else {
                alert('Error: wrong number format!');
            }
        })

        buttons.prepend(inputButton);

    } else {
        alert('Attention: In order for the WhatsApp extension to work, please connect and reload the page.');
    }
}, 5000);