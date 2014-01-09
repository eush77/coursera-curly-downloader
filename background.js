var matcher = new RegExp('^https?://class\\.coursera\\.org/.*/lecture?(\\?.+)?$');
var extensionName = 'Coursera: Curly Downloader';

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
var curlOptions = function(cookie) {
    return ['remote-name-all',
            'remote-header-name',
            'location',
            'cookie: ' + cookie.name + '=' + cookie.value];
};

/** Obtain authentication cookie
 * Try several times with different cookie names.
 * @param {String} pageUrl
 * @param {Function} callback
 */
var getAuthCookie = new function(authCookies) {
    return function(pageUrl, callback) {
        new function requestNextCookie() {
            if (authCookies.length) {
                chrome.cookies.get({
                    url: pageUrl,
                    name: authCookies[0]
                }, function(cookie) {
                    if (cookie == null) {
                        authCookies.shift();
                        requestNextCookie();
                    }
                    else {
                        callback(cookie);
                    }
                });
            }
            else {
                var message = 'Could not access authentication cookies!';
                alert(message + '\n' + extensionName + ' breaks.');
                throw new Error(message + ' Damn.');
            }
        };
    };
}(['session', 'CAUTH']);

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
            chrome.runtime.sendMessage(null, {type: 'popup-close'});
            window.alert('No items selected!');
            return;
        }
        getAuthCookie(sender.tab.url, function(cookie) {
            output({
                options: curlOptions(cookie),
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
