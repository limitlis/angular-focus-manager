/**
 * The "focusElement" directive adds additional functionality onto a DOM element. Currently, the only thing it does is
 * initially added focus when it is added to the DOM.
 */
/* global angular, module, moduleName, utils */
module.directive('focusElement', function (focusManager, focusQuery) {
    return {
        scope: true,
        link: function (scope, element, attr) {
            var el = element[0], timer, off;
            if (focusQuery.isAutofocus(el)) {
                off = scope.$watch(function () {
                    off();
                    timer = setInterval(function () {
                        if(focusQuery.isVisible(el)) {
                            focusManager.focus(el);
                            el.focus();
                            if (document.activeElement === el) {
                                clearInterval(timer);
                                off();
                            }
                        }
                    }, 10);
                });
                scope.$on("$destroy", function () {
                    clearInterval(timer);
                });
            }
        }
    };
});

