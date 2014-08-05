/*
 * Copyright 2014, Obogo
 * http://obogo.io
 * License: MIT
 */
/*global angular, moduleName */
try {
    angular.module(moduleName);
} catch (e) {
    angular.module(moduleName, []);
}
