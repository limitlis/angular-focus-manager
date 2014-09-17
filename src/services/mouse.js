/* global angular, module, utils, moduleName */
module.service('focusMouse', function (focusManager, focusQuery) {

    var scope = this;

    /**
     * Enable mouse functionality for focus manager
     */
    function enable() {
        scope.enabled = false;
        utils.addEvent(document, 'mousedown', onMouseDown);
    }

    /**
     * Disable mouse functionality for focus manager
     */
    function disable() {
        scope.enabled = false;
        utils.removeEvent(document, 'mousedown', onMouseDown);
    }

    /**
     * Listen to mousedown event. If there is FocusManager ID, enable FM otherwise disable FM.
     * @param evt
     */
    function onMouseDown(evt) {
        var el = evt.target;
        while(el.nodeName.toUpperCase() === 'SPAN') {
            el = el.parentNode;
        }

        if (focusManager.canReceiveFocus(el)) {
            focusManager.focus(el);

            var parentId = focusQuery.getParentId(el);
            if (parentId) {
                focusManager.enable();
            } else {
                focusManager.disable();
            }
        }
    }

    scope.enabled = false;
    scope.enable = enable;
    scope.disable = disable;

}).run(function (focusMouse) {
    // enable FM by default
    focusMouse.enable();
});

