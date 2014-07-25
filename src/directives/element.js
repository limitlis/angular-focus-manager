/* global ux, utils */
angular.module('ux').directive('focusElement', function (focusManager, focusQuery) {
    return {
        link: function (scope, element, attr) {
            var el = element[0],
                timer;

            if (focusQuery.isAutofocus(el)) {
                var off = scope.$watch(function () {
                    off();
                    focusManager.focus(el);
                    timer = setInterval(function () {
                        el.focus();
                        if (document.activeElement === el) {
                            clearInterval(timer);
                        }
                    }, 10);
                });
            }

            scope.$destroy(function () {
               clearInterval(timer);
            });
        }
    };

})