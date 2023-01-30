// function setTitle() {
//     const checkField = setInterval(() => {
//         let input = Array.from(document.querySelectorAll('input')).find(element => element.placeholder === 'שם העסק');
//         if (input) {
//             document.title = input.value;
//             clearInterval(checkField);
//         }
//     }, 250);
// }

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status) {
//         if (tab.url.match('#### CHANGE ME ####') && tab.status.toLocaleLowerCase() === 'complete') {
//             chrome.scripting.executeScript({
//                 target: { tabId: tab.id },
//                 func: setTitle,
//             });
//         }
//     }
// });