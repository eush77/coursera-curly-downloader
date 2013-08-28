window.addEventListener('DOMContentLoaded', function() {

    var menu = document.getElementsByTagName('ul')[0];

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
