/* global ux, utils */
function supplant (str, o) {
    'use strict';
    if (!str.replace) {
        return o;
    }
    return str.replace(
        /{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};