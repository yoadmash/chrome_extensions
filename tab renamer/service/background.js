// function setTitle(editMode) {
//     if(editMode) {
//         const checkField = setInterval(() => {
//             let input = Array.from(document.querySelectorAll('input')).find(element => element.placeholder === 'שם העסק');
//             if (input && input.value.length > 0) {
//                 document.title = input.value;
//                 clearInterval(checkField);
//             }
//         }, 250);
//     } else {
//         defaultTitle();
//     }
// }

// function defaultTitle() {
//     document.title = 'Pay Plus Admin';
// }

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.url) {
//         if (tab.url.match('https://crm.corecrm.co/companies/*') && tab.title === 'Pay Plus Admin') {
//             const urlArr = Array.from(tab.url);
//             if(urlArr.slice(33,69).join('').length === 36) {
//                 const editView = tab.url.includes('edit');
//                 chrome.scripting.executeScript({
//                     target: { tabId: tab.id },
//                     args: [editView],
//                     func: setTitle,
//                 });
//             }
//         }
//     }
// });