ux.service('focusMouse', function (focusModel, focusQuery) {

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
        if (scope.enabled) {
            return;
        }
        if (focusModel.canReceiveFocus(evt.target)) {
            focusModel.focus(evt.target);

            var parentId = focusQuery.getParentId(evt.target);
            if(parentId) {
                focusModel.enable();
            } else {
                focusModel.disable();
            }
        }
    }

    this.enabled = false;
    this.enable = enable;
    this.disable = disable;

}).run(function (focusMouse) {
    focusMouse.enable();
});

