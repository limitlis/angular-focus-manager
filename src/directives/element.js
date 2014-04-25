ux.directive('focusElement', function (focusModel, focusQuery) {

    return {
        link: function (scope, element, attr) {
            var el = element[0];
            if (focusQuery.isAutofocus(el)) {
                setTimeout(function () {
                    focusModel.focus(el);
                });
            }
        }
    };

})