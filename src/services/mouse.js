ux.service('focusMouse', function (focusModel) {

    var scope = this;

    function mute() {
        scope.muted = false;
        document.removeEventListener('mousedown', onMouseDown);
    }

    function unmute() {
        scope.muted = false;
        utils.addEvent(document, 'mousedown', onMouseDown);
    }

    function onMouseDown(evt) {
        if (scope.muted) {
            return;
        }
        if (focusModel.canReceiveFocus(evt.target)) {
            focusModel.focus(evt.target);
        }
    }

    this.muted = false;
    this.mute = mute;
    this.unmute = unmute;

}).run(function (focusMouse) {
    focusMouse.unmute();
});

