/* global angular, module, utils, moduleName, Mousetrap */
module.directive('focusShortcut', function (focusManager) {
    return {
        link: function (scope, element, attrs) {

            var bound = false;

            function onBindKeys() {
                if (!bound) {
                    bound = true;
                    if(attrs.hasOwnProperty('focusShortcut')) {
                        Mousetrap.bind(attrs.focusShortcut.split(','), function (evt) {
                            evt.preventDefault();
                            evt.stopPropagation();

                            focusManager.focus(element[0]);

                            return false;
                        });
                    }
                }
            }

            function onUnbindKeys() {
                if (bound) {
                    bound = false;
                    if(attrs.hasOwnProperty('focusShortcut')) {
                        Mousetrap.unbind(attrs.focusShortcut.split(','));
                    }
                }
            }

            if (attrs.focusShortcut) {
                scope.$on('bindKeys', onBindKeys);
                scope.$on('unbindKeys', onUnbindKeys);
                scope.$on('$destroy', onUnbindKeys);
            }
        }
    };
});