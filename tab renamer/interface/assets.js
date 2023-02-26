export const assets = {
    close: document.createElement('img'),
    reload: document.createElement('img'),
    edit: document.createElement('img'),
    checkTabs: document.createElement('img')
}

for(const key in assets) {
    console.log(key);
    assets[key].src = `${chrome.runtime.getURL(`icons/${key}.svg`)}`;
    assets[key].classList.add('icon');
    assets[key].alt = 'action_icon';
}