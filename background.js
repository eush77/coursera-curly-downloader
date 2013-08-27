var matcher = new RegExp('^https?://class\.coursera\.org/.*/lecture/index/?$');
var authCookie = 'session';

// Message format used throughout the extension:
//   {type: '<type>',  -- string name
//    data: '<data>'}  -- any (JSONifiable) payload
//

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

// Page-action button behavior
chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.cookies.get({
        url: tab.url,
        name: authCookie
    }, function(cookie) {
        var options = curlOptions(cookie.value);
        // Obtain chosen resources from the target webpage
        chrome.tabs.sendMessage(tab.id, {type: 'extract'}, function(links) {
            if (links.length) {
                output({options: options, links: links});
            }
            else {
                // Won't work if synchronously: http://stackoverflow.com/q/18454818/2424184
                setTimeout(function() {
                    window.alert('No items selected!');
                }, 0);
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
