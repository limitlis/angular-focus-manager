/* global ux, utils */
angular.module('ux').directive('focusElement', function (focusManager, focusQuery) {
    return {
        link: function (scope, element, attr) {
            var el = element[0];
            if (focusQuery.isAutofocus(el)){
                var off = scope.$watch(utils.debounce(function(){
                    off();
                    focusManager.focus(el);
                }, 100));
            }
        }
    };

})