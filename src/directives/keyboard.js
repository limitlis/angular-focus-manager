ux.directive('focusKeyboard', function (focusModel) {
    return {
        link: function (scope, element, attrs) {

            var bound = false;

            function onBindKeys() {
                if (!bound) {
                    bound = true;
                    Mousetrap.bind(attrs.focusKeyboard.split(','), function (evt) {
                        evt.preventDefault();
                        evt.stopPropagation();

                        focusModel.focus(element[0]);

                        return false;
                    });
                }
            }

            function onUnbindKeys() {
                if (bound) {
                    bound = false;
                    Mousetrap.unbind(attrs.focusKeyboard.split(','));
                }
            }

            if (attrs.focusKeyboard) {
                scope.$on('bindKeys', onBindKeys);
                scope.$on('unbindKeys', onUnbindKeys);
            }
        }
    };
})