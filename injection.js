var CHECKBOX_SCALE = 3/4;
var RIGHT_PADDING_PORTION = 1/4;
var OPACITY = 0.3;

var section = document.getElementsByClassName('course-item-list')[0];
var lectures = section.getElementsByTagName('li');

// Sparse array of selected resources for each lecture
var selected = [];

/** Return resource bar for given lectures list item.
 * @param {HTMLLIElement} li
 * @returns {HTMLDivElement}
 */
var resourcesBar = function(li) {
    return li.getElementsByClassName('course-lecture-item-resource')[0];
};

/** Create checkbox with the given ID
 * @param {Number} index
 * @returns {HTMLInputElement}
 */
var Checkbox = (function(li) {
    // Compute values
    var resbar = resourcesBar(li);
    var icon = resbar.getElementsByTagName('i')[0];
    var size = icon.offsetHeight * CHECKBOX_SCALE;
    var shiftRight = parseInt(window.getComputedStyle(li).paddingRight) * (1 - RIGHT_PADDING_PORTION);
    var shiftBottom = parseInt(window.getComputedStyle(resbar).paddingTop)
        + parseInt(window.getComputedStyle(icon).paddingTop);
    // Make prototype
    var checkboxTemplate = document.createElement('input');
    checkboxTemplate.type = 'checkbox';
    checkboxTemplate.style.cssFloat = 'right';
    checkboxTemplate.style.width = checkboxTemplate.style.height = size + 'px';
    checkboxTemplate.style.marginRight = -shiftRight + 'px'
    checkboxTemplate.style.marginTop = shiftBottom + 'px';
    checkboxTemplate.style.opacity = OPACITY;
    checkboxTemplate.className = 'curly-checkbox';
    // Return constructor
    return function(index) {
        var checkbox = checkboxTemplate.cloneNode();
        checkbox.dataset.index = index; // Set index attribute
        return checkbox;
    };
}(lectures[0]));

// Error handling
var error = function(e) {
    console.error(e.name + ': ' + e.message);
};

var InvalidMessageError = function(message) {
    var error = new Error('"' + message + '"');
    error.name = 'Invalid message';
    return error;
};

// Create and embed checkboxes
for (var index = 0; index < lectures.length; ++index) {
    var li = lectures[index];
    li.insertBefore(Checkbox(index), li.lastElementChild);
}

// Handle clicks on checkboxes
section.addEventListener('change', function(event) {
    if (event.target.classList.contains('curly-checkbox')) {
        var checkbox = event.target;
        if (checkbox.checked) {
            var links = [].slice.call(resourcesBar(checkbox.parentNode).children).map(function(a) {
                return a.href;
            });
        }
        else {
            var links = []; // Can still be passed to concat
        }
        selected[checkbox.dataset.index] = links;
    }
});

// Listen for messages
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.type) {
    case 'extract':
        // Extract resource links for marked lectures.
        var arrayOfArrays = Object.keys(selected).filter(isFinite).sort(function(a, b) {
            return a - b;
        }).map(function(key) {
            return selected[key];
        });
        array = [].concat.apply([], arrayOfArrays);
        sendResponse(array);
        break;
    default:
        error(InvalidMessageError(message));
    }
});
