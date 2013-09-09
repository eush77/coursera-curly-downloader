window.addEventListener('DOMContentLoaded', function() {

    var menu = document.getElementsByTagName('ul')[0];

    chrome.runtime.onMessage.addListener(function(message) {
        if (message.type == 'popup-close') {
            window.close();
        }
    });

    // Disable incidental text selection
    menu.onmousedown = function() {
        return false;
    };

    menu.onclick = function(event) {
        if (event.target.tagName == 'LI') {
            var action = event.target.dataset.action;
            chrome.tabs.query({
                active: true,
                currentWindow: true,
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type: action});
            });
        }
    };

});
