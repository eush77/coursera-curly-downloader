var matcher = new RegExp('^https?://class\.coursera\.org/.*/lecture/index/?$');
var AUTH_COOKIE = 'session';

/** Curl config prefix
 * @param {String} authValue Authorization cookie value.
 * @returns {String}
 */
var curlConfigPrefix = function(authValue) {
    return ['remote-name-all',
            'remote-header-name',
            'location',
            'cookie: ' + AUTH_COOKIE + '=' + authValue].join('<br/>') + '<br/><br/>';
};

// Set page-action button up
chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.cookies.get({
        url: tab.url,
        name: AUTH_COOKIE
    }, function(cookie) {
        var configPrefix = curlConfigPrefix(cookie.value);
        chrome.tabs.sendMessage(tab.id, 'extract', function(links) {
            if (links.length) {
                links = 'url: ' + links.join('<br/>url: ');
                // Links are urldecoded when followed
                window.open(('data:text/html, ' + configPrefix + links).replace(/%/g, '%25'));
            }
            else {
                alert('No items selected!');
            }
        });
    });
});

// Show page-action button
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (matcher.test(tab.url)) {
        chrome.pageAction.show(tabId);
    }
});
