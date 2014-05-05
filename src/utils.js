/* global angular, fm */

var exports = {};

var utils = {};

utils.addEvent = function(object, type, callback) {
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
        return;
    }

    object.attachEvent('on' + type, callback);
}

utils.removeEvent = function(object, type, callback) {
    if (object.removeEventListener) {
        object.removeEventListener(type, callback, false);
        return;
    }

    object.detachEvent('on' + type, callback);
}

utils.debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
};

utils.throttle = function (func, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                func.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            func.apply(context, args);
        }
    };
};