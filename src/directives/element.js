/* global ux, utils */
angular.module('ux').directive('focusElement', function (focusManager, focusQuery) {
    return {
        link: function (scope, element, attr) {
            var el = element[0];
            if (focusQuery.isAutofocus(el)) {
                var off = scope.$watch(function() {
                    off();
                    focusManager.focus(el);
                    var timer = setInterval(function(){
                        if(focusManager.focus() !== el || document.activeElement === el) {
                            clearInterval(timer);
                        } else {
                            el.focus();
                        }
                    }, 10);
                });
            }
        }
    };

})