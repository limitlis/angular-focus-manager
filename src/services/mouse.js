/* global ux, utils */
ux.service('focusMouse', function (focusManager, focusQuery) {

    var scope = this;

    function enable() {
        scope.enabled = false;
        utils.addEvent(document, 'mousedown', onMouseDown);
    }

    function disable() {
        scope.enabled = false;
        utils.removeEvent(document, 'mousedown', onMouseDown);
    }

    function onMouseDown(evt) {
        if (focusManager.enabled) {
            return;
        }
        if (focusManager.canReceiveFocus(evt.target)) {
            focusManager.focus(evt.target);

            var parentId = focusQuery.getParentId(evt.target);
            if (parentId) {
                focusManager.enable();
            } else {
                focusManager.disable();
            }
        }
    }

    this.enabled = false;
    this.enable = enable;
    this.disable = disable;

}).run(function (focusMouse) {
    focusMouse.enable();
});

