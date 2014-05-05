ux.directive('focusElement', function (focusManager, focusQuery) {

    return {
        link: function (scope, element, attr) {
            var el = element[0];
            if (focusQuery.isAutofocus(el)) {
                setTimeout(function () {
                    focusManager.focus(el);
                });
            }
        }
    };

})