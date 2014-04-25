ux.directive('focusKeyboard', function (focusModel) {
    return {
        link: function (scope, element, attrs) {

            var bound = false;

            if (attrs.focusKeyboard) {

                scope.$on('bindKeys', function () {
                    if (!bound) {
                        bound = true;
                        Mousetrap.bind(attrs.focusKeyboard.split(','), function (evt) {
                            evt.preventDefault();
                            evt.stopPropagation();

                            focusModel.focus(element[0]);

                            return false;
                        });
                    }
                })

                scope.$on('unbindKeys', function () {
                    if (bound) {
                        bound = false;
                        Mousetrap.unbind(attrs.focusKeyboard.split(','));
                    }
                })

            }
        }
    };
})