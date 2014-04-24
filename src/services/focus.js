angular.module('fm')
    .service('focus', function (focusModel) {
        document.addEventListener('focusout', function (evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();

            focusModel.focus(focusModel.focus());

        }, false);

        document.addEventListener('focusin', function (evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();

        }, false);
    })
    .run(function (focus, focusModel) {

    });

