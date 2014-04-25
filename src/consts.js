/* global angular, fm */

var exports = {};

var utils = {};
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

var consts = {
    TAB_INDEX: 99999,

    KEY_BACKSPACE: 8,
    KEY_TAB: 9,
    KEY_ENTER: 13,
    KEY_LEFT_ARROW: 37,
    KEY_UP_ARROW: 38,
    KEY_RIGHT_ARROW: 39,
    KEY_DOWN_ARROW: 40,
    KEY_COMMA: 188,
    KEY_PERIOD: 190,

    DIRECTION_NEXT: 'next',
    DIRECTION_PREV: 'prev',

    DOM_CATCH_ALL_ID: 'fm-catchall',

    GROUP_DISABLED: 'disabled',
    GROUP_STRICT: 'strict',
    GROUP_MANUAL: 'manual',
    GROUP_READER: 'reader',
    GROUP_MANAGE: 'manage',

    GROUP_READ_CLASS: '.readable',
    GROUP_FOCUS_ELEMENTS: 'A,SELECT,BUTTON,INPUT,TEXTAREA,*[tabindex],.focusable'
};
