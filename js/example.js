/* global angular */
var app = angular.module('app', ['fm']);
app.directive('main', function ($log) {
    return {
        link: function (scope) {
            scope.log = $log.log;
        }
    };
});