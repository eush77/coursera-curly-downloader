var matcher = new RegExp('^https?://class.coursera.org/.*/lecture/index/?$');
var courseraMain = function(url) {
    return url.split('://')[0] + '://coursera.org';
};

var authCookie = 'CAUTH';
var curlConfigPrefix = function(authCookie, authValue) {
    return ['remote-name-all',
            'remote-header-name',
            'location',
            'cookie = ' + authCookie + '=' + authValue].join('<br/>') + '<br/><br/>';
};

chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.cookies.get({
        url: courseraMain(tab.url),
        name: authCookie
    }, function(cookie) {
        var script = function(configPrefix) {
            // Target webpage context!
            var links = [].slice.call(document.getElementsByClassName('unviewed')).map(function(li) {
                return [].slice.call(li.children[1].children).map(function(a) {
                    return a.href;
                });
            }).reduce(function(a, b) {
                return a.concat(b);
            }, []);
            if (links.length) {
                links = 'url = ' + links.join('<br/>url = ');
                window.open('javascript: document.write("' + configPrefix + links + '")');
            }
            else {
                alert('All the lectures marked as watched!');
            }
        };
        chrome.tabs.executeScript(null, {
            code: '!' + script + '("' + curlConfigPrefix(authCookie, cookie.value) + '")'
        });
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (matcher.test(tab.url)) {
        chrome.pageAction.show(tabId);
    }
});
