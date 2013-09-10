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

    // Announce popup size for the top window if any
    if (window != window.top) {
        !function(WIDTH_FACTOR, HEIGHT_FACTOR) {
            var announcedWidth = Math.max.apply(null, [].map.call(document.getElementsByTagName('li'), function(li) {
                li.style.display = 'inline-block';
                var width = li.offsetWidth;
                li.style.display = '';
                return width;
            })) * WIDTH_FACTOR;
            var announcedHeight = document.documentElement.offsetHeight * HEIGHT_FACTOR;
            window.top.postMessage({type: 'popup-size-announcement',
                                    width: announcedWidth,
                                    height: announcedHeight}, '*');
        }(1.2, 1);
    }

    // Post message either extension-wide or personally to the top page
    //   (which incorporates this popup as its frame)
    var post = window == window.top
        ? function(action) {
            chrome.tabs.query({
                active: true,
                currentWindow: true,
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type: action});
            });
        }
    : function(action) {
        window.top.postMessage({type: action}, '*');
    };

    menu.onclick = function(event) {
        if (event.target.tagName == 'LI') {
            post(event.target.dataset.action);
        }
    };

});
