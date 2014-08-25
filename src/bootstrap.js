/*
 * Copyright 2014, Obogo
 * http://obogo.io
 * License: MIT
 */
/*global angular, moduleName */
var module;
(function () {
    try {
        module = angular.module('@@moduleName');
    } catch (e) {
        module = angular.module('@@moduleName', []);
    }
})();
