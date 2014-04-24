angular.module('fm')
    .service('focusMouse', function (focusModel) {

        var scope = this;

        function mute() {
            scope.muted = false;
        }

        function unmute() {
            scope.muted = true;

            document.addEventListener('mouseup', function () {
                // if element is not a focus element, return focus
                focusModel.focus(focusModel.focus());
            });
        }

        this.mute = mute;
        this.unmute = unmute;

    })
    .run(function (focusMouse, focusModel) {
//        focusMouse.unmute();
    });

