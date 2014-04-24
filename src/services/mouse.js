ux.service('focusMouse', function (focusModel) {

    var scope = this;

    function mute() {
        scope.muted = false;
        document.removeEventListener('mousedown', onMouseDown);
//        document.removeEventListener('mouseup', onMouseUp);
    }

    function unmute() {
        scope.muted = true;
        document.addEventListener('mousedown', onMouseDown);
//        document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseDown(evt) {
        if (focusModel.canReceiveFocus(evt.target)) {
            console.log('change focus');
            focusModel.focus(evt.target);
        }
    }

    function onMouseUp(evt) {
        focusModel.focus(focusModel.focus());
    }

    this.mute = mute;
    this.unmute = unmute;

})
    .run(function (focusMouse, focusModel) {
        focusMouse.unmute();
    });

