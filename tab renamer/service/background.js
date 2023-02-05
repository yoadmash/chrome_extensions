function setTitle() {
    if (document.URL.match('https://crm.corecrm.co/companies/*')) {
        const urlArr = Array.from(document.URL);
        if (urlArr.slice(33, 69).join('').length === 36) {
            const editView = document.URL.includes('edit');
            if (editView) {
                const checkField = setInterval(() => {
                    let input = Array.from(document.querySelectorAll('input')).find(element => element.placeholder === 'שם העסק');
                    if (input && input.value.length > 0) {
                        document.title = input.value;
                        clearInterval(checkField);
                    }
                }, 250);
            }
        } else {
            document.title = 'Pay Plus Admin';
        }
    } else {
        document.title = 'Pay Plus Admin';
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: setTitle,
        });
    }
});