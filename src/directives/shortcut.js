/* global ux, utils, Mousetrap */
ux.directive('focusShortcut', function (focusManager) {
    return {
        link: function (scope, element, attrs) {

            var bound = false;

            function onBindKeys() {
                if (!bound) {
                    bound = true;
                    Mousetrap.bind(attrs.focusKeyboard.split(','), function (evt) {
                        evt.preventDefault();
                        evt.stopPropagation();

                        focusManager.focus(element[0]);

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