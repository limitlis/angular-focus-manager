/* global angular, fm */
var utils = {};

/**
 * Simple cross-browser compliant addEvent listener
 * @param object
 * @param type
 * @param callback
 */
utils.addEvent = function (object, type, callback) {
    angular.element(object).on(type, callback);
};

/**
 * Simple cross-browser compliant removeEvent listener
 * @param object
 * @param type
 * @param callback
 */
utils.removeEvent = function (object, type, callback) {
    angular.element(object).off(type, callback);
};

/**
 * Creates and returns a new debounced version of the passed function which will postpone its execution until after
 * wait milliseconds have elapsed since the last time it was invoked.
 * @param func
 * @param wait
 * @param immediate
 * @returns {Function}
 */
utils.debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);
        if (immediate && !timeout) {
            func.apply(context, args);
        }
    };
};

/**
 * Creates and returns a new, throttled version of the passed function, that, when invoked repeatedly,
 * will only actually call the original function at most once per every wait milliseconds. Useful for
 * rate-limiting events that occur faster than you can keep up with.
 * @param func
 * @param threshhold
 * @param scope
 * @returns {Function}
 */
utils.throttle = function (func, threshhold, scope) {
    threshhold = threshhold || 250;
    var last,
        deferTimer;
    return function () {
        var context = scope || this;

        var now = +new Date(),
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

/**
 * Performs variable substitution on the string. It scans through the string looking for expressions enclosed in { }
 * braces. If an expression is found, use it as a key on the object, and if the key has a string value or number
 * value, it is substituted for the bracket expression and it repeats.
 * @param str
 * @param o
 * @returns {*}
 */
utils.supplant = function (str, o) {
    str = str + '';
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