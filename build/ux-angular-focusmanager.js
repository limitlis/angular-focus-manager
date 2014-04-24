/*
* uxFocusManager v.0.0.1
* (c) 2014, WebUX
* https://github.com/webux/ux-angular-focusmanager
* License: MIT.
*/
(function(){
var ux;

try {
    ux = angular.module("ux");
} catch (e) {
    ux = angular.module("ux", []);
}

var exports = {};

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
    DIRECTION_NEXT: "next",
    DIRECTION_PREV: "prev",
    DOM_CATCH_ALL_ID: "fm-catchall",
    GROUP_DISABLED: "disabled",
    GROUP_STRICT: "strict",
    GROUP_MANUAL: "manual",
    GROUP_READER: "reader",
    GROUP_MANAGE: "manage",
    GROUP_READ_CLASS: ".readable",
    GROUP_FOCUS_ELEMENTS: "A,SELECT,BUTTON,INPUT,TEXTAREA,*[tabindex],.focusable"
};

ux.directive("focusElement", function(focusModel, focusQuery) {
    function linker(scope, element, attr) {
        var el = element[0];
        if (focusQuery.isAutofocus(el)) {
            setTimeout(function() {
                focusModel.focus(el);
            });
        }
    }
    return {
        link: linker
    };
});

ux.directive("focusGroup", function(focusQuery) {
    var groupId = 1;
    var elementId = 1;
    function compile(el) {
        var els, i, len, elementName;
        var groupName = "group-" + groupId;
        focusQuery.setGroupId(el, groupName);
        els = focusQuery.getElementsWithoutParents(el);
        len = els.length;
        i = 0;
        while (i < len) {
            elementName = "element-" + elementId;
            focusQuery.setParentId(els[i], groupName);
            focusQuery.setElementId(els[i], elementName);
            elementId += 1;
            i += 1;
        }
        els = focusQuery.getGroupsWithoutContainers(el);
        len = els.length;
        i = 0;
        while (i < len) {
            focusQuery.setContainerId(els[i], groupName);
            i += 1;
        }
        groupId += 1;
    }
    function linker(scope, el, attr) {
        compile(el[0]);
    }
    return {
        link: linker
    };
});

String.prototype.supplant = function(o) {
    "use strict";
    return this.replace(/{([^{}]*)}/g, function(a, b) {
        var r = o[b];
        return typeof r === "string" || typeof r === "number" ? r : a;
    });
};

ux.service("focus", function(focusModel) {
    document.addEventListener("focusout", function(evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        focusModel.focus(focusModel.focus());
    }, false);
    document.addEventListener("focusin", function(evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
    }, false);
}).run(function(focus, focusModel) {});

ux.service("focusKeyboard", function($window) {
    var registeredKeys = {};
    document.addEventListener("keydown", function(evt) {
        var keys = "";
        if (evt.shiftKey) {
            keys += "shift+";
        }
        if (evt.keyCode === 9) {
            keys += "tab";
        }
        var opts = registeredKeys[keys];
        if (opts && opts.callback && !opts.muted) {
            evt.preventDefault();
            evt.stopPropagation();
            opts.callback();
        }
    });
    function register(shortcut, callback) {
        registeredKeys[shortcut.trim().toLowerCase()] = {
            muted: false,
            callback: callback
        };
    }
    function unregister(shortcut) {
        delete registeredKeys[shortcut.trim().toLowerCase()];
    }
    function mute(shortcut) {
        var key = registeredKeys[shortcut.trim().toLowerCase()];
        if (key) {
            key.muted = true;
        }
    }
    function unmute(shortcut) {
        var key = registeredKeys[shortcut.trim().toLowerCase()];
        if (key) {
            key.muted = false;
        }
    }
    this.register = register;
    this.unregister = unregister;
    this.mute = mute;
    this.unmute = unmute;
}).run(function(focusKeyboard, focusModel) {
    focusKeyboard.register("TAB", focusModel.next);
    focusKeyboard.register("SHIFT+TAB", focusModel.prev);
});

ux.service("focusManager", function(focusModel) {
    document.addEventListener("focusin", function(evt) {
        focusModel.focus(evt.target);
    });
}).run(function(focusManager) {});

ux.service("focusModel", function(focusQuery) {
    var scope = this;
    function focus(el) {
        if (typeof el === "undefined") {
            return scope.activeElement;
        }
        scope.activeElement = el;
        el.focus();
    }
    function canReceiveFocus(el) {
        return focusQuery.canReceiveFocus(el);
    }
    function next() {
        var groupId, elementId;
        if (scope.activeElement) {
            groupId = focusQuery.getParentId(scope.activeElement);
            elementId = focusQuery.getElementId(scope.activeElement);
            findNextElement(groupId, elementId);
        } else {
            findNextElement();
        }
    }
    function prev() {
        var groupId, elementId;
        if (scope.activeElement) {
            groupId = focusQuery.getParentId(scope.activeElement);
            elementId = focusQuery.getElementId(scope.activeElement);
            findPrevElement(groupId, elementId);
        } else {
            findPrevElement();
        }
    }
    function getElementIndex(list, item) {
        var i = 0, len = list.length;
        while (i < len) {
            if (list[i] === item) {
                return i;
            }
            i += 1;
        }
        return -1;
    }
    function getPrevElement(elements, elementId) {
        var element, index;
        if (elements && elements.length) {
            if (elementId) {
                element = focusQuery.getElement(elementId);
                index = getElementIndex(elements, element);
                if (index > 0) {
                    return elements[index - 1];
                }
            } else {
                return elements[elements.length - 1];
            }
        }
    }
    function getPrevGroup(groups, groupId) {
        var group, index;
        if (groups && groups.length) {
            if (groupId) {
                group = focusQuery.getGroup(groupId);
                index = getElementIndex(groups, group);
                if (index > 0) {
                    return groups[index - 1];
                }
            } else {
                return groups[0];
            }
        }
    }
    function getNextElement(elements, elementId) {
        var element, index;
        if (elements && elements.length) {
            if (elementId) {
                element = focusQuery.getElement(elementId);
                index = getElementIndex(elements, element);
                if (index !== -1 && index + 1 < elements.length) {
                    return elements[index + 1];
                }
            } else {
                return elements[0];
            }
        }
    }
    function getNextGroup(groups, groupId) {
        var group, index;
        if (groups) {
            group = focusQuery.getGroup(groupId);
            index = getElementIndex(groups, group);
            if (index !== -1 && index + 1 < groups.length) {
                return groups[index + 1];
            }
        }
    }
    function findNextGroup(containerId, groupId) {
        var groups, nextGroup, nextGroupId, parentContainer, parentContainerId;
        if (groupId) {
            groups = focusQuery.getChildGroups(containerId);
            nextGroup = getNextGroup(groups, groupId);
            if (nextGroup) {
                nextGroupId = focusQuery.getGroupId(nextGroup);
                findNextElement(nextGroupId);
            } else {
                parentContainer = focusQuery.getGroup(containerId);
                parentContainerId = focusQuery.getContainerId(parentContainer);
                if (parentContainerId) {
                    findNextGroup(parentContainerId, containerId);
                } else {
                    if (focusQuery.isLoop(parentContainer)) {
                        findNextElement(containerId);
                    }
                }
            }
        } else {
            groupId = focusQuery.getFirstGroupId();
            findNextElement(groupId);
        }
    }
    function findNextChildGroup(groupId) {
        var groups, group, nextGroupId, containerId;
        groups = focusQuery.getChildGroups(groupId);
        if (groups.length) {
            nextGroupId = focusQuery.getGroupId(groups[0]);
            findNextElement(nextGroupId);
        } else {
            group = focusQuery.getGroup(groupId);
            containerId = focusQuery.getContainerId(group);
            findNextGroup(containerId, groupId);
        }
    }
    function findNextElement(groupId, elementId) {
        var els, nextElement;
        if (groupId) {
            els = focusQuery.getGroupElements(groupId);
            nextElement = getNextElement(els, elementId);
            if (nextElement) {
                focus(nextElement);
            } else {
                findNextChildGroup(groupId);
            }
        } else {
            findNextGroup();
        }
    }
    function findPrevGroup(containerId, groupId) {
        var groups, prevGroup, prevGroupId, parentContainer, parentContainerId;
        if (containerId) {
            groups = focusQuery.getChildGroups(containerId);
            prevGroup = getPrevGroup(groups, groupId);
            if (prevGroup) {
                prevGroupId = focusQuery.getGroupId(prevGroup);
                findPrevChildGroup(prevGroupId);
            } else {
                parentContainer = focusQuery.getGroup(containerId);
                parentContainerId = focusQuery.getContainerId(parentContainer);
                if (parentContainerId) {
                    findPrevGroup(parentContainerId, containerId);
                } else {
                    findPrevElement(containerId);
                }
            }
        } else {
            groupId = focusQuery.getLastGroupId();
            findPrevChildGroup(groupId);
        }
    }
    function findPrevChildGroup(groupId) {
        var groups, childGroupId;
        if (groupId) {
            groups = focusQuery.getChildGroups(groupId);
            if (groups.length) {
                childGroupId = focusQuery.getGroupId(groups[groups.length - 1]);
                findPrevChildGroup(childGroupId);
            } else {
                findPrevElement(groupId);
            }
        } else {
            findPrevGroup();
        }
    }
    function findPrevElement(groupId, elementId) {
        var els, prevEl, group, containerId;
        if (groupId) {
            els = focusQuery.getGroupElements(groupId);
            prevEl = getPrevElement(els, elementId);
            if (prevEl) {
                focus(prevEl);
            } else {
                group = focusQuery.getGroup(groupId);
                containerId = focusQuery.getContainerId(group);
                if (containerId) {
                    findPrevGroup(containerId, groupId);
                } else {
                    if (focusQuery.isLoop(group)) {
                        findPrevChildGroup(groupId);
                    }
                }
            }
        } else {
            findPrevChildGroup();
        }
    }
    this.activeElement = null;
    this.focus = focus;
    this.prev = prev;
    this.next = next;
    this.canReceiveFocus = canReceiveFocus;
});

ux.service("focusMouse", function(focusModel) {
    var scope = this;
    function mute() {
        scope.muted = false;
        document.removeEventListener("mousedown", onMouseDown);
    }
    function unmute() {
        scope.muted = true;
        document.addEventListener("mousedown", onMouseDown);
    }
    function onMouseDown(evt) {
        if (focusModel.canReceiveFocus(evt.target)) {
            console.log("change focus");
            focusModel.focus(evt.target);
        }
    }
    function onMouseUp(evt) {
        focusModel.focus(focusModel.focus());
    }
    this.mute = mute;
    this.unmute = unmute;
}).run(function(focusMouse, focusModel) {
    focusMouse.unmute();
});

ux.service("focusQuery", function() {
    var query = $;
    var focusElementId = "focus-element-id";
    var focusGroupId = "focus-group-id";
    var focusParentId = "focus-parent-id";
    var focusContainerId = "focus-container-id";
    var focusGroup = "focus-group";
    var focusElement = "focus-element";
    var focusEnabled = "focus-enabled";
    var focusLoop = "focus-loop";
    var selectable = "A,SELECT,BUTTON,INPUT,TEXTAREA,*[tabindex]";
    function canReceiveFocus(el) {
        var isSelectable = new RegExp(el.nodeName.toUpperCase()).test(selectable);
        if (!isSelectable) {
            isSelectable = el.getAttribute("tabindex") !== null;
        }
        if (isSelectable) {
            isSelectable = query(el).isVisible();
        }
        return isSelectable;
    }
    function getFirstGroupId() {
        var q = "[{focusGroup}]:not([{focusContainerId}])".supplant({
            focusGroup: focusGroup,
            focusContainerId: focusContainerId
        });
        var groupEl = document.querySelector(q);
        return getGroupId(groupEl);
    }
    function getLastGroupId() {
        var q = "[{focusGroup}]:not([{focusContainerId}])".supplant({
            focusGroup: focusGroup,
            focusContainerId: focusContainerId
        });
        var groupEls = document.querySelectorAll(q);
        return getGroupId(groupEls[groupEls.length - 1]);
    }
    function getChildGroups(groupId) {
        return document.querySelectorAll('[{focusContainerId}="{groupId}"]'.supplant({
            focusContainerId: focusContainerId,
            groupId: groupId
        }));
    }
    function getElementsWithoutParents(el) {
        var query = "A:not({focusParentId})," + "SELECT:not({focusParentId})," + "BUTTON:not({focusParentId})," + "INPUT:not({focusParentId})," + "TEXTAREA:not({focusParentId})," + "*[tabindex]:not({focusParentId})";
        query = query.supplant({
            focusParentId: "[" + focusParentId + "]"
        });
        return el.querySelectorAll(query);
    }
    function getGroupsWithoutContainers(el) {
        var q = "[" + focusGroupId + "]:not([" + focusContainerId + "])";
        return el.querySelectorAll(q);
    }
    function getGroupElements(groupId) {
        var q = '[{focusParentId}="{groupId}"]:not([disabled]):not(.disabled)'.supplant({
            focusParentId: focusParentId,
            groupId: groupId
        });
        var els = document.querySelectorAll(q);
        var returnVal = [];
        var i = 0, len = els.length, $el;
        while (i < len) {
            $el = query(els[i]);
            if (!$el.isVisible(true)) {
                i += 1;
                continue;
            }
            returnVal.push(els[i]);
            i += 1;
        }
        return returnVal;
    }
    function isAutofocus(el) {
        return el.getAttribute(focusElement) === "autofocus";
    }
    function isEnabled(el) {
        return el.getAttribute(focusEnabled) !== "false";
    }
    function isLoop(el) {
        return el.getAttribute(focusLoop) === "true";
    }
    function getElement(elementId) {
        var q = '[{focusElementId}="{elementId}"]'.supplant({
            focusElementId: focusElementId,
            elementId: elementId
        });
        return document.querySelector(q);
    }
    function getGroup(groupId) {
        return document.querySelector("[" + focusGroupId + '="' + groupId + '"]');
    }
    function getElementId(el) {
        return el.getAttribute(focusElementId);
    }
    function setElementId(el, id) {
        el.setAttribute(focusElementId, id);
    }
    function getGroupId(el) {
        return el.getAttribute(focusGroupId);
    }
    function setGroupId(el, id) {
        el.setAttribute(focusGroupId, id);
    }
    function getParentId(el) {
        return el.getAttribute(focusParentId);
    }
    function setParentId(el, id) {
        el.setAttribute(focusParentId, id);
    }
    function getContainerId(el) {
        return el.getAttribute(focusContainerId);
    }
    function setContainerId(el, id) {
        el.setAttribute(focusContainerId, id);
    }
    function getContainerIdByGroupId(groupId) {
        var group = getGroup(groupId);
        return getContainerId(group);
    }
    function group(elementOrGroupId) {
        if (isNaN(elementOrGroupId)) {
            elementOrGroupId = this.parentId(elementOrGroupId);
        }
        return document.querySelector("[" + focusGroupId + '="' + elementOrGroupId + '"]');
    }
    function contains(container, el) {
        var parent = el.parentNode;
        while (parent.nodeType !== 9) {
            if (parent === container) {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }
    this.getElement = getElement;
    this.getElementId = getElementId;
    this.setElementId = setElementId;
    this.getGroupId = getGroupId;
    this.setGroupId = setGroupId;
    this.getParentId = getParentId;
    this.setParentId = setParentId;
    this.getContainerId = getContainerId;
    this.setContainerId = setContainerId;
    this.getContainerIdByGroupId = getContainerIdByGroupId;
    this.getGroup = getGroup;
    this.getFirstGroupId = getFirstGroupId;
    this.getLastGroupId = getLastGroupId;
    this.getElementsWithoutParents = getElementsWithoutParents;
    this.getGroupsWithoutContainers = getGroupsWithoutContainers;
    this.isAutofocus = isAutofocus;
    this.isLoop = isLoop;
    this.isEnabled = isEnabled;
    this.group = group;
    this.getGroupElements = getGroupElements;
    this.getChildGroups = getChildGroups;
    this.contains = contains;
    this.canReceiveFocus = canReceiveFocus;
});
}());
