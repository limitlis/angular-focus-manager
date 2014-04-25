ux.service('focus', function (focusModel) {

    // TODO: DO NOT LISTEN TO THESE EVENTS, INSTEAD LISTEN TO EVENTS FROM MODEL
    document.addEventListener('focusout', function (evt) {
        angular.element(document).scope().$broadcast('focusOut');
    }, false);

    document.addEventListener('focusin', function (evt) {
        angular.element(evt.target).scope().$emit('focusIn');
    }, false);
}).run(function (focus) {
});

