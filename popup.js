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

    // Post message either extension-wide or personally to the top page
    //   (which incorporates this popup as its frame)
    var post = window == top
        ? function(action) {
            chrome.tabs.query({
                active: true,
                currentWindow: true,
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type: action});
            });
        }
    : function(action) {
        top.postMessage({type: action}, '*');
    };

    menu.onclick = function(event) {
        if (event.target.tagName == 'LI') {
            post(event.target.dataset.action);
        }
    };

});
