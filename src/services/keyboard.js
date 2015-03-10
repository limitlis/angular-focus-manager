/* global angular, module, utils, moduleName */
module.service('focusKeyboard', function (focusManager) {

    var scope = this,
        tabKeysEnabled = false,
        arrowKeysEnabled = false,
        arrowKeysTraverseGroupsVertically = false;

    var _groupName;

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

    function enableVerticalGroupTraverse() {
        if (!arrowKeysTraverseGroupsVertically) {
            arrowKeysTraverseGroupsVertically = true;
        }
    }

    function disableVerticalGroupTraverse() {
        if (arrowKeysTraverseGroupsVertically) {
            arrowKeysTraverseGroupsVertically = false;
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
        var activeElement = evt.target;
        if(activeElement.type === 'text' || activeElement.type === 'textarea' || activeElement.getAttribute('contentEditable') === 'true') {
            return; // if a text input of any kind, do nothing
        }

        evt.preventDefault();
        evt.stopPropagation();

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
    function onFocusNextGroup(evt) {

        scope.direction = 'next';

        if (focusManager.enabled) {
            
            focusManager.nextGroup();
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

    function onFocusPrevGroup(evt) {

        scope.direction = 'prev';

        if (focusManager.enabled) {
            focusManager.prevGroup();
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
                    if (arrowKeysTraverseGroupsVertically){
                        onFocusPrevGroup(evt);
                    } else {
                        onFocusPrev(evt);
                    }
                } else if (evt.keyCode === 39) { //right arrow
                    onFocusNext(evt);
                } else if (evt.keyCode === 40) { // down arrow
                    if (arrowKeysTraverseGroupsVertically){
                        onFocusNextGroup(evt);
                    } else {
                        onFocusNext(evt);
                    }
                }
            }
        }
        if (!(evt.shiftKey || evt.altKey || evt.ctrlKey)) {
            if (evt.keyCode === 13) {
                triggerClick(evt);
            }
        }
    }

    function onNextKeyUp(evt) {
        unwatchNextTabKey();


        if (arrowKeysEnabled) {
            // if the focus manager has not been enabled (via mouse click)
            // enable the FM and then check for SHIFT KEY to determine DIRECTION
            if (!focusManager.enabled) {
                focusManager.enable();

                switch(evt.keyCode) {
                    case 37:
                        focusManager.findPrevChildGroup(_groupName);
                        break;
                    case 38:
                        focusManager.findPrevChildGroup(_groupName);
                        break;
                    case 39:
                        focusManager.findNextElement(_groupName);
                        break;
                    case 40:
                        focusManager.findNextElement(_groupName);
                        break;
                }
            }
        }
        if (tabKeysEnabled) {
            // if the focus manager has not been enabled (via mouse click)
            // enable the FM and then check for SHIFT KEY to determine DIRECTION
            if (!focusManager.enabled) {
                focusManager.enable();
                if (evt.shiftKey) {
                    focusManager.findPrevChildGroup(_groupName);
                } else {
                    focusManager.findNextElement(_groupName);
                }
            }
        }
    }

    function watchNextTabKey(groupName) {
        
        if (arrowKeysEnabled || tabKeysEnabled) {
            _groupName = groupName;
            // remove the key event regardless
            utils.addEvent(document, 'keyup', onNextKeyUp);
        }
    }

    function unwatchNextTabKey() {
        utils.removeEvent(document, 'keyup', onNextKeyUp);
    }

    scope.direction = null;
    scope.enable = enable;
    scope.disable = disable;
    scope.enableTabKeys = enableTabKeys;
    scope.disableTabKeys = disableTabKeys;
    scope.enableArrowKeys = enableArrowKeys;
    scope.disableArrowKeys = disableArrowKeys;
    scope.enableVerticalGroupTraversal = enableVerticalGroupTraverse;
    scope.disableVerticalGroupTraversal = disableVerticalGroupTraverse;
    scope.toggleTabArrowKeys = toggleTabArrowKeys;
    scope.triggerClick = triggerClick;
    scope.watchNextTabKey = watchNextTabKey;
    scope.unwatchNextTabKey = unwatchNextTabKey;

}).run(function (focusKeyboard) {
    focusKeyboard.enable();
    focusKeyboard.enableTabKeys();
});

