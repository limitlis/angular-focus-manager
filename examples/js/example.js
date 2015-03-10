/* global angular */
var app = angular.module('app', ['fm']);
app.run(function(focusKeyboard){
    focusKeyboard.enableArrowKeys();
    focusKeyboard.enableVerticalGroupTraversal();
})
app.directive('main', function ($log) {
    return {
        link: function (scope) {
            scope.log = $log.log;
        }
    };
});