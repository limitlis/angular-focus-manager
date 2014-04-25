/**
 * Used to trap the key when it reaches the top or bottom of the page, or it
 * selects an HTML component (i.e. select) that causes the focus to get lost
 * or disjointed
 */
ux.service('focusTrap', function (focusModel) {
    var activeElement;

    var body = document.body || document.getElementsByTagName('body')[0];

    var startAnchorTag = document.createElement('a');
    startAnchorTag.setAttribute('href', '');
    body.insertBefore(startAnchorTag, body.firstChild);

    var endAnchorTag = document.createElement('a');
    endAnchorTag.setAttribute('href', '');
    body.appendChild(endAnchorTag);

    document.addEventListener('keydown', function (evt) {
        if (evt.keyCode === 9) {
            if (focusModel.activeElement === activeElement) {
                if (evt.shiftKey) {
                    focusModel.prev();
                } else {
                    focusModel.next();
                }
            }
        }
        activeElement = focusModel.activeElement;
    });


}).run(function (focusTrap) {
});