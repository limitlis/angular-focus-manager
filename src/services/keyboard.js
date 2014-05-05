ux.service('focusKeyboard', function (focusManager) {

    var tabKeysEnabled = false;
    var arrowKeysEnabled = false;

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
            Mousetrap.bind('up', onFocusPrev);
            Mousetrap.bind('left', onFocusPrev);
            Mousetrap.bind('down', onFocusNext);
            Mousetrap.bind('right', onFocusNext);
        }
    }

    function disableArrowKeys() {
        if (arrowKeysEnabled) {
            arrowKeysEnabled = false;
            Mousetrap.unbind('up', onFocusPrev);
            Mousetrap.unbind('left', onFocusPrev);
            Mousetrap.unbind('down', onFocusNext);
            Mousetrap.unbind('right', onFocusNext);
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

        fireEvent(evt.target, 'mousedown');
        fireEvent(evt.target, 'mouseup');
        fireEvent(evt.target, 'click');
    }

    function onFocusNext(evt) {

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
        var doc;
        if (node.ownerDocument) {
            doc = node.ownerDocument;
        } else if (node.nodeType == 9) {
            // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
            doc = node;
        } else {
            throw new Error("Invalid node passed to fireEvent: " + node.id);
        }

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

                case "focus":
                case "change":
                case "blur":
                case "select":
                    eventClass = "HTMLEvents";
                    break;

                default:
                    throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                    break;
            }
            var event = doc.createEvent(eventClass);

            var bubbles = eventName == "change" ? false : true;
            event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

            event.synthetic = true; // allow detection of synthetic events
            // The second parameter says go ahead with the default action
            node.dispatchEvent(event, true);
        } else if (node.fireEvent) {
            // IE-old school style
            var event = doc.createEventObject();
            event.synthetic = true; // allow detection of synthetic events
            node.fireEvent("on" + eventName, event);
        }
    };

    function enable() {
        utils.addEvent(document, 'keydown', onKeyDown);
    }

    function disable() {
        utils.removeEvent(document, 'keydown', onKeyDown);
    }

    function onKeyDown(evt) {
        if (tabKeysEnabled) {
            if (evt.keyCode === 9) {
                if (evt.shiftKey) {
                    onFocusPrev(evt);
                } else {
                    onFocusNext(evt);
                }
            }
        }

        if (arrowKeysEnabled) {
            if (evt.keyCode === 37) {
                onFocusPrev(evt);
            } else if (evt.keyCode === 38) {
                onFocusPrev(evt);
            } else if (evt.keyCode === 39) {
                onFocusNext(evt);
            } else if (evt.keyCode === 40) {
                onFocusNext(evt);
            }
        }
    }

    this.enable = enable;
    this.disable = disable;
    this.enableTabKeys = enableTabKeys;
    this.disableTabKeys = disableTabKeys;
    this.enableArrowKeys = enableArrowKeys;
    this.disableArrowKeys = disableArrowKeys;
    this.toggleTabArrowKeys = toggleTabArrowKeys;
    this.triggerClick = triggerClick;
})
    .run(function (focusKeyboard, focusDispatcher, focusManager) {
        focusKeyboard.enable();
        focusKeyboard.enableTabKeys();
    });

