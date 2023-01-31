function setTitle() {
    const checkField = setInterval(() => {
        let input = Array.from(document.querySelectorAll('input')).find(element => element.placeholder === 'שם העסק');
        if (input && input.value.length > 0) {
            document.title = input.value;
            clearInterval(checkField);
        }
    }, 250);
}

function defaultTitle() {
    document.title = 'Pay Plus Admin';
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        if (tab.url.match('https://crm.corecrm.co/companies/*') && tab.title === 'Pay Plus Admin') {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: setTitle,
            });
            console.log('test');
        }
    }
});