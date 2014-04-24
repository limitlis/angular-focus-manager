/* global angular, fm */


window.fm = angular.module('fm', [])
    .value('fm.version', '0.1')

fm.consts = {
    TAB_INDEX: 99999,
    PARENT_ID: 'focus-parent-id',

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

    GROUP_GROUP_ID: 'focus-group-id',
    GROUP_PARENT_ID: 'focus-parent-id',

    GROUP_READ_CLASS: '.readable',
    GROUP_FOCUS_ELEMENTS: 'A,SELECT,BUTTON,INPUT,TEXTAREA,*[tabindex],.focusable'
};
