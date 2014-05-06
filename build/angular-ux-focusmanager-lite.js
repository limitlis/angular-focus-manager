/*
* angular-ux-focusmanager v.0.1.0
* (c) 2014, WebUX
* https://github.com/webux/angular-ux-focusmanager
* License: MIT.
*/
(function(){
var ux;

try {
    ux = angular.module("ux");
} catch (e) {
    ux = angular.module("ux", []);
}

var utils = {};

utils.addEvent = function(object, type, callback) {
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
        return;
    }
    object.attachEvent("on" + type, callback);
};

utils.removeEvent = function(object, type, callback) {
    if (object.removeEventListener) {
        object.removeEventListener(type, callback, false);
        return;
    }
    object.detachEvent("on" + type, callback);
};

utils.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) {
            func.apply(context, args);
        }
    };
};

utils.throttle = function(func, threshhold, scope) {
    threshhold = threshhold || 250;
    var last, deferTimer;
    return function() {
        var context = scope || this;
        var now = +new Date(), args = arguments;
        if (last && now < last + threshhold) {
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function() {
                last = now;
                func.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            func.apply(context, args);
        }
    };
};

String.prototype.supplant = function(o) {
    "use strict";
    return this.replace(/{([^{}]*)}/g, function(a, b) {
        var r = o[b];
        return typeof r === "string" || typeof r === "number" ? r : a;
    });
};

ux.directive("focusElement", function(focusManager, focusQuery) {
    return {
        link: function(scope, element, attr) {
            var el = element[0];
            if (focusQuery.isAutofocus(el)) {
                setTimeout(function() {
                    focusManager.focus(el);
                });
            }
        }
    };
});

ux.directive("focusGroup", function(focusManager, focusQuery, focusDispatcher) {
    var groupId = 1, elementId = 1, dispatcher = focusDispatcher();
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
            focusQuery.setTabIndex(els[i], -1);
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
        return groupName;
    }
    function linker(scope, element, attr) {
        var el = element[0];
        var groupName = null;
        var bound = false;
        el.addEventListener("focus", function() {
            focusManager.enable();
        }, true);
        setTimeout(function() {
            if (!focusQuery.getContainerId(el)) {
                dispatcher.on("focusin", utils.debounce(function(evt) {
                    if (focusQuery.contains(el, evt.newTarget)) {
                        if (bound === false) {
                            bound = true;
                            scope.$broadcast("bindKeys", groupName);
                        }
                    } else {
                        if (bound === true) {
                            bound = false;
                            scope.$broadcast("unbindKeys");
                        }
                    }
                }, 100));
                focusManager.callback = function(el) {
                    focusQuery.setTabIndex(el, null);
                };
                focusManager.findPrevChildGroup(groupName);
                focusManager.findNextElement(groupName);
                focusManager.callback = null;
            }
        }, 10);
        groupName = compile(el);
    }
    return {
        scope: true,
        link: linker
    };
});

ux.factory("focusDispatcher", function() {
    var dispatchers = {};
    function EventDispatcher() {
        this.events = {};
    }
    EventDispatcher.prototype.events = {};
    EventDispatcher.prototype.on = function(key, func) {
        if (!this.events.hasOwnProperty(key)) {
            this.events[key] = [];
        }
        this.events[key].push(func);
    };
    EventDispatcher.prototype.off = function(key, func) {
        if (this.events.hasOwnProperty(key)) {
            for (var i in this.events[key]) {
                if (this.events[key][i] === func) {
                    this.events[key].splice(i, 1);
                }
            }
        }
    };
    EventDispatcher.prototype.trigger = function(key, dataObj) {
        if (this.events.hasOwnProperty(key)) {
            dataObj = dataObj || {};
            dataObj.currentTarget = this;
            for (var i in this.events[key]) {
                this.events[key][i](dataObj);
            }
        }
    };
    function dispatcher(name) {
        name = name || "fm";
        if (!dispatchers[name]) {
            dispatchers[name] = new EventDispatcher();
        }
        return dispatchers[name];
    }
    return dispatcher;
});

ux.service("focusKeyboard", function(focusManager) {
    var tabKeysEnabled = false, arrowKeysEnabled = false;
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
        fireEvent(evt.target, "mousedown");
        fireEvent(evt.target, "mouseup");
        fireEvent(evt.target, "click");
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
        var doc, event;
        if (node.ownerDocument) {
            doc = node.ownerDocument;
        } else if (node.nodeType === 9) {
            doc = node;
        }
        if (node.dispatchEvent) {
            var eventClass = "";
            switch (eventName) {
              case "click":
              case "mousedown":
              case "mouseup":
                eventClass = "MouseEvents";
                break;
            }
            event = doc.createEvent(eventClass);
            var bubbles = eventName === "change" ? false : true;
            event.initEvent(eventName, bubbles, true);
            event.synthetic = true;
            node.dispatchEvent(event, true);
        } else if (node.fireEvent) {
            event = doc.createEventObject();
            event.synthetic = true;
            node.fireEvent("on" + eventName, event);
        }
    }
    function enable() {
        utils.addEvent(document, "keydown", onKeyDown);
    }
    function disable() {
        utils.removeEvent(document, "keydown", onKeyDown);
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
            if (!(evt.shiftKey || evt.altKey || evt.ctrlKey)) {
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
    }
    this.enable = enable;
    this.disable = disable;
    this.enableTabKeys = enableTabKeys;
    this.disableTabKeys = disableTabKeys;
    this.enableArrowKeys = enableArrowKeys;
    this.disableArrowKeys = disableArrowKeys;
    this.toggleTabArrowKeys = toggleTabArrowKeys;
    this.triggerClick = triggerClick;
}).run(function(focusKeyboard) {
    focusKeyboard.enable();
    focusKeyboard.enableTabKeys();
});

ux.service("focusManager", function(focusQuery, focusDispatcher) {
    var scope = this, dispatcher = focusDispatcher();
    function focus(el) {
        if (typeof el === "undefined") {
            return scope.activeElement;
        }
        if (scope.activeElement !== el) {
            var eventObj = {
                oldTarget: scope.activeElement,
                newTarget: el
            };
            dispatcher.trigger("focusout", eventObj);
            scope.activeElement = el;
            el.focus();
            dispatcher.trigger("focusin", eventObj);
        }
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
        var group, groups, nextGroup, nextGroupId, parentContainer, parentContainerId;
        if (containerId) {
            groups = focusQuery.getChildGroups(containerId);
            nextGroup = getNextGroup(groups, groupId);
            if (nextGroup) {
                nextGroupId = focusQuery.getGroupId(nextGroup);
                findNextElement(nextGroupId);
            } else {
                parentContainer = focusQuery.getGroup(containerId);
                parentContainerId = focusQuery.getContainerId(parentContainer);
                findNextGroup(parentContainerId, containerId);
            }
        } else {
            if (groupId) {
                group = focusQuery.getGroup(groupId);
                var tail = focusQuery.getGroupTail(group);
                if (tail === "stop") {
                    return;
                } else if (!tail) {
                    disable();
                    return;
                }
            } else {
                groupId = focusQuery.getFirstGroupId();
            }
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
                if (scope.callback) {
                    scope.callback(nextElement);
                } else {
                    focus(nextElement);
                }
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
                if (scope.callback) {
                    scope.callback(prevEl);
                } else {
                    focus(prevEl);
                }
            } else {
                group = focusQuery.getGroup(groupId);
                containerId = focusQuery.getContainerId(group);
                if (containerId) {
                    findPrevGroup(containerId, groupId);
                } else {
                    var tail = focusQuery.getGroupHead(group);
                    if (tail === "loop") {
                        findPrevChildGroup(groupId);
                    } else if (!tail) {
                        disable();
                    }
                }
            }
        } else {
            findPrevChildGroup();
        }
    }
    function enable() {
        if (!scope.enabled) {
            scope.enabled = true;
            scope.activeElement = document.activeElement;
            dispatcher.trigger("enabled");
        }
    }
    function disable() {
        if (scope.enabled) {
            scope.enabled = false;
            dispatcher.trigger("disabled");
        }
    }
    this.enabled = false;
    this.activeElement = null;
    this.focus = focus;
    this.prev = prev;
    this.next = next;
    this.findPrevChildGroup = findPrevChildGroup;
    this.findNextElement = findNextElement;
    this.canReceiveFocus = canReceiveFocus;
    this.enable = utils.debounce(enable);
    this.disable = utils.debounce(disable);
});

ux.service("focusMouse", function(focusManager, focusQuery) {
    var scope = this;
    function enable() {
        scope.enabled = false;
        utils.addEvent(document, "mousedown", onMouseDown);
    }
    function disable() {
        scope.enabled = false;
        utils.removeEvent(document, "mousedown", onMouseDown);
    }
    function onMouseDown(evt) {
        if (scope.enabled) {
            return;
        }
        if (focusManager.canReceiveFocus(evt.target)) {
            focusManager.focus(evt.target);
            var parentId = focusQuery.getParentId(evt.target);
            if (parentId) {
                focusManager.enable();
            } else {
                focusManager.disable();
            }
        }
    }
    this.enabled = false;
    this.enable = enable;
    this.disable = disable;
}).run(function(focusMouse) {
    focusMouse.enable();
});

ux.service("focusQuery", function() {
    var focusElementId = "focus-element-id";
    var focusGroupId = "focus-group-id";
    var focusParentId = "focus-parent-id";
    var focusContainerId = "focus-container-id";
    var tabIndex = "tabindex";
    var focusGroup = "focus-group";
    var focusGroupHead = "focus-group-head";
    var focusGroupTail = "focus-group-tail";
    var focusElement = "focus-element";
    var focusEnabled = "focus-enabled";
    var focusIndex = "focus-index";
    var selectable = "A,SELECT,BUTTON,INPUT,TEXTAREA,*[focus-index]";
    function canReceiveFocus(el) {
        var isSelectable = new RegExp(el.nodeName.toUpperCase()).test(selectable);
        if (!isSelectable) {
            isSelectable = el.getAttribute(focusIndex) !== null;
        }
        if (isSelectable) {
            isSelectable = el.getAttribute("disabled") === null;
        }
        if (isSelectable) {
            isSelectable = isVisible(el);
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
        var els = document.querySelectorAll('[{focusContainerId}="{groupId}"]'.supplant({
            focusContainerId: focusContainerId,
            groupId: groupId
        }));
        var returnVal = [];
        var i = 0, len = els.length;
        while (i < len) {
            returnVal.push(els[i]);
            i += 1;
        }
        returnVal.sort(sortByGroupIndex);
        return returnVal;
    }
    function getElementsWithoutParents(el) {
        var query = "A:not({focusParentId})," + "SELECT:not({focusParentId})," + "BUTTON:not({focusParentId})," + "INPUT:not({focusParentId})," + "TEXTAREA:not({focusParentId})," + "*[focus-index]:not({focusParentId})";
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
        var q, isStrict, els, returnVal, i, len;
        isStrict = isGroupStrict(groupId);
        if (isStrict) {
            q = '[{focusParentId}="{groupId}"][focus-index]:not([disabled]):not(.disabled)'.supplant({
                focusParentId: focusParentId,
                groupId: groupId
            });
        } else {
            q = '[{focusParentId}="{groupId}"]:not([disabled]):not(.disabled)'.supplant({
                focusParentId: focusParentId,
                groupId: groupId
            });
        }
        els = document.querySelectorAll(q);
        returnVal = [];
        i = 0;
        len = els.length;
        while (i < len) {
            if (!isVisible(els[i])) {
                i += 1;
                continue;
            }
            returnVal.push(els[i]);
            i += 1;
        }
        returnVal.sort(sortByTabIndex);
        return returnVal;
    }
    function isVisible(el) {
        if (el.parentNode.nodeType === 9) {
            return true;
        }
        if (el.offsetWidth === 0 || el.offsetHeight === 0) {
            return false;
        }
        if (el.style.display === "none") {
            return false;
        }
        if (el.style.visibility === "hidden") {
            return false;
        }
        if (el.style.opacity === 0 || el.style.opacity === "0") {
            return false;
        }
        return true;
    }
    function isAutofocus(el) {
        return el.getAttribute(focusElement) === "autofocus";
    }
    function isEnabled(el) {
        return el.getAttribute(focusEnabled) !== "false";
    }
    function getGroupHead(el) {
        return el.getAttribute(focusGroupHead);
    }
    function getGroupTail(el) {
        return el.getAttribute(focusGroupTail);
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
    function isGroupStrict(groupId) {
        var group = getGroup(groupId);
        return group.getAttribute(focusGroup) === "strict";
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
    function setTabIndex(el, index) {
        if (!el) {
            return;
        }
        if (index === null) {
            el.removeAttribute(tabIndex);
        } else {
            el.setAttribute(tabIndex, index);
        }
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
    function sortByTabIndex(a, b) {
        var aTabIndex = a.getAttribute("focus-index") || Number.POSITIVE_INFINITY;
        var bTabIndex = b.getAttribute("focus-index") || Number.POSITIVE_INFINITY;
        if (aTabIndex < bTabIndex) {
            return -1;
        }
        if (aTabIndex > bTabIndex) {
            return 1;
        }
        return 0;
    }
    function sortByGroupIndex(a, b) {
        var aGroupIndex = a.getAttribute("focus-group-index") || Number.POSITIVE_INFINITY;
        var bGroupIndex = b.getAttribute("focus-group-index") || Number.POSITIVE_INFINITY;
        if (aGroupIndex < bGroupIndex) {
            return -1;
        }
        if (aGroupIndex > bGroupIndex) {
            return 1;
        }
        return 0;
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
    this.getGroup = getGroup;
    this.getFirstGroupId = getFirstGroupId;
    this.getLastGroupId = getLastGroupId;
    this.setTabIndex = setTabIndex;
    this.getElementsWithoutParents = getElementsWithoutParents;
    this.getGroupsWithoutContainers = getGroupsWithoutContainers;
    this.isAutofocus = isAutofocus;
    this.getGroupHead = getGroupHead;
    this.getGroupTail = getGroupTail;
    this.isEnabled = isEnabled;
    this.getGroupElements = getGroupElements;
    this.getChildGroups = getChildGroups;
    this.contains = contains;
    this.canReceiveFocus = canReceiveFocus;
});
}());
