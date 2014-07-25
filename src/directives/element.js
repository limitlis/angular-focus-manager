/* global angular, ux, utils */
angular.module('ux').directive('focusElement', function (focusManager, focusQuery) {
    return {
        scope: true,
        link: function(scope, element, attr) {
            var el = element[0], timer;
            if (focusQuery.isAutofocus(el)) {
                var off = scope.$watch(function() {
                    off();
                    timer = setInterval(function() {
                        focusManager.focus(el);
                        el.focus();
                        if (document.activeElement === el) {
                            clearInterval(timer);
                        }
                    }, 10);
                });
                scope.$on("$destroy", function() {
                    clearInterval(timer);
                });
            }
        }
    };
});

