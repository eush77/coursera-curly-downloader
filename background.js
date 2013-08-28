var matcher = new RegExp('^https?://class\.coursera\.org/.*/lecture/index/?$');
var authCookie = 'session';

// Message format used throughout the extension:
//   {type: '<type>',  -- string name
//    data: '<data>'}  -- any (JSONifiable) payload
//

// Check if an url is rejected (forum entry, etc)
var blacklistCheck = new function(blacklist) {
    return function(url) {
        return blacklist.every(function(re) {
            return !re.test(url);
        });
    };
}([/forum_id=\d+$/]);

/** Generate Curl config options
 * @param {String} authValue Authorization cookie value.
 * @returns {Array}
 */
var curlOptions = function(authValue) {
    return ['remote-name-all',
            'remote-header-name',
            'location',
            'cookie: ' + authCookie + '=' + authValue];
};

/** Open output page and send given data
 * @param {any} data
 */
var output = function(data) {
    // One-time listener
    var outputReadyListener = function self(message) {
        if (message.type == 'output-ready') {
            chrome.runtime.onMessage.removeListener(self);
            chrome.runtime.sendMessage(null, {type: 'output', data: data});
        }
    };
    chrome.runtime.onMessage.addListener(outputReadyListener);
    window.open('output.html');
};

// Catch links
chrome.runtime.onMessage.addListener(function(message, sender) {
    if (message.type == 'extracted') {
        var links = message.data;
        if (!links.length) {
            window.alert('No items selected!');
            return;
        }
        chrome.cookies.get({
            url: sender.tab.url,
            name: authCookie
        }, function(cookie) {
            output({
                options: curlOptions(cookie.value),
                links: links.filter(function(link) {
                    return blacklistCheck(link.href);
                }).map(function(link) {
                    return {title: link.title, value: 'url: ' + link.href};
                }),
            });
        });
    }
});

// Show page-action button
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (matcher.test(tab.url)) {
        chrome.pageAction.show(tabId);
    }
});
