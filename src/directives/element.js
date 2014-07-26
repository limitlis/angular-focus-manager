/* global angular, go, utils */
angular.module('go').directive('focusElement', function (focusManager, focusQuery) {
    return {
        scope: true,
        link: function (scope, element, attr) {
            var el = element[0], timer, off;
            if (focusQuery.isAutofocus(el)) {
                off = scope.$watch(function () {
                    off();
                    timer = setInterval(function () {
                        focusManager.focus(el);
                        el.focus();
                        if (document.activeElement === el) {
                            clearInterval(timer);
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

