window.addEventListener('DOMContentLoaded', function() {

    var formatData = function(data) {
        return data.options.join('\n')+ '\n\nurl: ' + data.links.join('\nurl: ') + '\n';
    };

    chrome.runtime.onMessage.addListener(function(message) {
        var textarea = document.getElementsByTagName('textarea')[0];
        switch (message.type) {
        case 'output':
            textarea.value = formatData(message.data);
            break;
        }
    });

    chrome.runtime.sendMessage(null, {type: 'output-ready'});

});
