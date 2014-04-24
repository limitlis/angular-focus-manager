angular.module('fm')
    .service('focusManager', function (focusModel) {

        document.addEventListener('focusin', function (evt) {
            focusModel.focus(evt.target);
        });

    })
    .run(function (focusManager) {
    });