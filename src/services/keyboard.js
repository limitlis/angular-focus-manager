/* global angular, utils, moduleName */
angular.module(moduleName).service('focusKeyboard', function (focusManager) {

    var scope = this,
        tabKeysEnabled = false,
        arrowKeysEnabled = false;

    function enableTabKeys() {
        if (!tabKeysEnabled) {
            tabKeysEnabled = true;
        }
    }

    function disableTabKeys() {
        if (tabKeysEnabled) {
            tabKeysEnabled = false;
        }
    }

    function enableArrowKeys() {
        if (!arrowKeysEnabled) {
            arrowKeysEnabled = true;
        }
    }

    function disableArrowKeys() {
        if (arrowKeysEnabled) {
            arrowKeysEnabled = false;
        }
    }

    function toggleTabArrowKeys() {
        if (tabKeysEnabled) {
            disableTabKeys();
            enableArrowKeys();
        } else {
            enableTabKeys();
            disableArrowKeys();
        }
    }

    function triggerClick(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        var activeElement = evt.target;

        fireEvent(activeElement, "mousedown");
        fireEvent(activeElement, "mouseup");
        fireEvent(activeElement, "click");
    }

    function onFocusNext(evt) {

        scope.direction = 'next';

        if (focusManager.enabled) {
            focusManager.next();
        }

        if (!focusManager.enabled) {
            return;
        }

        evt.preventDefault();
        evt.stopPropagation();

        return false;
    }

    function onFocusPrev(evt) {

        scope.direction = 'prev';

        if (focusManager.enabled) {
            focusManager.prev();
        }

        if (!focusManager.enabled) {
            return;
        }

        evt.preventDefault();
        evt.stopPropagation();

        return false;
    }

    function fireEvent(node, eventName) {
        // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
        var doc, event;
        if (node.ownerDocument) {
            doc = node.ownerDocument;
        } else if (node.nodeType === 9) {
            // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
            doc = node;
        }
//        else {
//            throw new Error("Invalid node passed to fireEvent: " + node.id);
//        }

        if (node.dispatchEvent) {
            // Gecko-style approach (now the standard) takes more work
            var eventClass = "";

            // Different events have different event classes.
            // If this switch statement can't map an eventName to an eventClass,
            // the event firing is going to fail.
            switch (eventName) {
                case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
                case "mousedown":
                case "mouseup":
                    eventClass = "MouseEvents";
                    break;

//                case "focus":
//                case "change":
//                case "blur":
//                case "select":
//                    eventClass = "HTMLEvents";
//                    break;

//                default:
//                    throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
            }
            event = doc.createEvent(eventClass);

            var bubbles = eventName === "change" ? false : true;
            event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

            event.synthetic = true; // allow detection of synthetic events
            // The second parameter says go ahead with the default action
            node.dispatchEvent(event, true);
        } else if (node.fireEvent) {
            // IE-old school style
            event = doc.createEventObject();
            event.synthetic = true; // allow detection of synthetic events
            node.fireEvent("on" + eventName, event);
        }
    }

    function enable() {
        utils.addEvent(document, 'keydown', onKeyDown);
    }

    function disable() {
        utils.removeEvent(document, 'keydown', onKeyDown);
    }

    function onKeyDown(evt) {
        if (tabKeysEnabled) {
            if (evt.keyCode === 9) { // tab
                if (evt.shiftKey) {
                    onFocusPrev(evt);
                } else {
                    onFocusNext(evt);
                }
            }
        }

        if (arrowKeysEnabled) {
            if (!(evt.shiftKey || evt.altKey || evt.ctrlKey)) {
                if (evt.keyCode === 37) { // left arrow
                    onFocusPrev(evt);
                } else if (evt.keyCode === 38) { // up arrow
                    onFocusPrev(evt);
                } else if (evt.keyCode === 39) { //right arrow
                    onFocusNext(evt);
                } else if (evt.keyCode === 40) { // down arrow
                    onFocusNext(evt);
                }
            }
        }
        if (!(evt.shiftKey || evt.altKey || evt.ctrlKey)) {
            if (evt.keyCode === 13) {
                triggerClick(evt);
            }
        }
    }

    scope.direction = null;
    scope.enable = enable;
    scope.disable = disable;
    scope.enableTabKeys = enableTabKeys;
    scope.disableTabKeys = disableTabKeys;
    scope.enableArrowKeys = enableArrowKeys;
    scope.disableArrowKeys = disableArrowKeys;
    scope.toggleTabArrowKeys = toggleTabArrowKeys;
    scope.triggerClick = triggerClick;

}).run(function (focusKeyboard) {
    focusKeyboard.enable();
    focusKeyboard.enableTabKeys();
});

