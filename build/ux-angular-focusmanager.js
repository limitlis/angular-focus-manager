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

var utils = {};

utils.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
};

utils.throttle = function(func, threshhold, scope) {
    threshhold || (threshhold = 250);
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

ux.directive("focusElement", function(focusModel, focusQuery) {
    return {
        link: function(scope, element, attr) {
            var el = element[0];
            if (focusQuery.isAutofocus(el)) {
                setTimeout(function() {
                    focusModel.focus(el);
                });
            }
        }
    };
});

ux.directive("focusGroup", function(focusQuery, focusDispatcher) {
    var groupId = 1;
    var elementId = 1;
    var dispatcher = focusDispatcher();
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
        return groupName;
    }
    function linker(scope, element, attr) {
        var el = element[0];
        var groupName = null;
        var bound = false;
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
            }
        }, 10);
        groupName = compile(el);
    }
    return {
        scope: true,
        link: linker
    };
});

ux.directive("focusHighlight", function(focusModel, focusDispatcher) {
    var dispatcher = focusDispatcher();
    return {
        scope: true,
        replace: true,
        link: function(scope, element, attrs) {
            var el = element[0];
            dispatcher.on("focusin", utils.throttle(function(evt) {
                var rect = evt.newTarget.getBoundingClientRect();
                el.style.left = rect.left + "px";
                el.style.top = rect.top + "px";
                el.style.width = rect.width + "px";
                el.style.height = rect.height + "px";
            }, 100));
        },
        template: '<div class="focus-highlight"></div>'
    };
});

ux.directive("focusKeyboard", function(focusModel) {
    return {
        link: function(scope, element, attrs) {
            var bound = false;
            if (attrs.focusKeyboard) {
                scope.$on("bindKeys", function() {
                    if (!bound) {
                        bound = true;
                        Mousetrap.bind(attrs.focusKeyboard.split(","), function(evt) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            focusModel.focus(element[0]);
                            return false;
                        });
                    }
                });
                scope.$on("unbindKeys", function() {
                    if (bound) {
                        bound = false;
                        Mousetrap.unbind(attrs.focusKeyboard.split(","));
                    }
                });
            }
        }
    };
});

String.prototype.supplant = function(o) {
    "use strict";
    return this.replace(/{([^{}]*)}/g, function(a, b) {
        var r = o[b];
        return typeof r === "string" || typeof r === "number" ? r : a;
    });
};

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

ux.service("focusKeyboard", function(focusModel) {
    var tabKeysEnabled = false;
    var arrowKeysEnabled = false;
    function enableTabKeys() {
        if (!tabKeysEnabled) {
            tabKeysEnabled = true;
            Mousetrap.bind("tab", onFocusNext);
            Mousetrap.bind("shift+tab", onFocusPrev);
        }
    }
    function disableTabKeys() {
        if (tabKeysEnabled) {
            tabKeysEnabled = false;
            Mousetrap.unbind("tab", onFocusNext);
            Mousetrap.unbind("shift+tab", onFocusPrev);
        }
    }
    function enableArrowKeys() {
        if (!arrowKeysEnabled) {
            arrowKeysEnabled = true;
            Mousetrap.bind("up", onFocusPrev);
            Mousetrap.bind("left", onFocusPrev);
            Mousetrap.bind("down", onFocusNext);
            Mousetrap.bind("right", onFocusNext);
        }
    }
    function disableArrowKeys() {
        if (arrowKeysEnabled) {
            arrowKeysEnabled = false;
            Mousetrap.unbind("up", onFocusPrev);
            Mousetrap.unbind("left", onFocusPrev);
            Mousetrap.unbind("down", onFocusNext);
            Mousetrap.unbind("right", onFocusNext);
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
        evt.preventDefault();
        evt.stopPropagation();
        focusModel.next();
        return false;
    }
    function onFocusPrev(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        focusModel.prev();
        return false;
    }
    function fireEvent(node, eventName) {
        var doc;
        if (node.ownerDocument) {
            doc = node.ownerDocument;
        } else if (node.nodeType == 9) {
            doc = node;
        } else {
            throw new Error("Invalid node passed to fireEvent: " + node.id);
        }
        if (node.dispatchEvent) {
            var eventClass = "";
            switch (eventName) {
              case "click":
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
            event.initEvent(eventName, bubbles, true);
            event.synthetic = true;
            node.dispatchEvent(event, true);
        } else if (node.fireEvent) {
            var event = doc.createEventObject();
            event.synthetic = true;
            node.fireEvent("on" + eventName, event);
        }
    }
    this.enableTabKeys = enableTabKeys;
    this.disableTabKeys = disableTabKeys;
    this.enableArrowKeys = enableArrowKeys;
    this.disableArrowKeys = disableArrowKeys;
    this.toggleTabArrowKeys = toggleTabArrowKeys;
    this.triggerClick = triggerClick;
}).run(function(focusKeyboard) {
    focusKeyboard.enableTabKeys();
    Mousetrap.bind("enter", focusKeyboard.triggerClick);
});

ux.service("focusModel", function(focusQuery, focusDispatcher) {
    var scope = this;
    var dispatcher = focusDispatcher();
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
        scope.muted = false;
        document.addEventListener("mousedown", onMouseDown);
    }
    function onMouseDown(evt) {
        if (scope.muted) {
            return;
        }
        if (focusModel.canReceiveFocus(evt.target)) {
            focusModel.focus(evt.target);
        }
    }
    this.muted = false;
    this.mute = mute;
    this.unmute = unmute;
}).run(function(focusMouse) {
    focusMouse.unmute();
});

ux.service("focusQuery", function() {
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
            if (!isVisible(els[i])) {
                i += 1;
                continue;
            }
            returnVal.push(els[i]);
            i += 1;
        }
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
    this.getGroupElements = getGroupElements;
    this.getChildGroups = getChildGroups;
    this.contains = contains;
    this.canReceiveFocus = canReceiveFocus;
});

ux.service("focusTrap", function(focusModel) {
    var activeElement;
    var body = document.body || document.getElementsByTagName("body")[0];
    var startAnchorTag = document.createElement("a");
    startAnchorTag.setAttribute("href", "");
    body.insertBefore(startAnchorTag, body.firstChild);
    var endAnchorTag = document.createElement("a");
    endAnchorTag.setAttribute("href", "");
    body.appendChild(endAnchorTag);
    document.addEventListener("keydown", function(evt) {
        if (evt.keyCode === 9) {
            if (focusModel.activeElement === activeElement) {
                if (evt.shiftKey) {
                    focusModel.prev();
                } else {
                    focusModel.next();
                }
            }
        }
        activeElement = focusModel.activeElement;
    });
}).run(function(focusTrap) {});

(function(J, r, f) {
    function s(a, b, d) {
        a.addEventListener ? a.addEventListener(b, d, !1) : a.attachEvent("on" + b, d);
    }
    function A(a) {
        if ("keypress" == a.type) {
            var b = String.fromCharCode(a.which);
            a.shiftKey || (b = b.toLowerCase());
            return b;
        }
        return h[a.which] ? h[a.which] : B[a.which] ? B[a.which] : String.fromCharCode(a.which).toLowerCase();
    }
    function t(a) {
        a = a || {};
        var b = !1, d;
        for (d in n) a[d] ? b = !0 : n[d] = 0;
        b || (u = !1);
    }
    function C(a, b, d, c, e, v) {
        var g, k, f = [], h = d.type;
        if (!l[a]) return [];
        "keyup" == h && w(a) && (b = [ a ]);
        for (g = 0; g < l[a].length; ++g) if (k = l[a][g], !(!c && k.seq && n[k.seq] != k.level || h != k.action || ("keypress" != h || d.metaKey || d.ctrlKey) && b.sort().join(",") !== k.modifiers.sort().join(","))) {
            var m = c && k.seq == c && k.level == v;
            (!c && k.combo == e || m) && l[a].splice(g, 1);
            f.push(k);
        }
        return f;
    }
    function K(a) {
        var b = [];
        a.shiftKey && b.push("shift");
        a.altKey && b.push("alt");
        a.ctrlKey && b.push("ctrl");
        a.metaKey && b.push("meta");
        return b;
    }
    function x(a, b, d, c) {
        m.stopCallback(b, b.target || b.srcElement, d, c) || !1 !== a(b, d) || (b.preventDefault ? b.preventDefault() : b.returnValue = !1, 
        b.stopPropagation ? b.stopPropagation() : b.cancelBubble = !0);
    }
    function y(a) {
        "number" !== typeof a.which && (a.which = a.keyCode);
        var b = A(a);
        b && ("keyup" == a.type && z === b ? z = !1 : m.handleKey(b, K(a), a));
    }
    function w(a) {
        return "shift" == a || "ctrl" == a || "alt" == a || "meta" == a;
    }
    function L(a, b, d, c) {
        function e(b) {
            return function() {
                u = b;
                ++n[a];
                clearTimeout(D);
                D = setTimeout(t, 1e3);
            };
        }
        function v(b) {
            x(d, b, a);
            "keyup" !== c && (z = A(b));
            setTimeout(t, 10);
        }
        for (var g = n[a] = 0; g < b.length; ++g) {
            var f = g + 1 === b.length ? v : e(c || E(b[g + 1]).action);
            F(b[g], f, c, a, g);
        }
    }
    function E(a, b) {
        var d, c, e, f = [];
        d = "+" === a ? [ "+" ] : a.split("+");
        for (e = 0; e < d.length; ++e) c = d[e], G[c] && (c = G[c]), b && "keypress" != b && H[c] && (c = H[c], 
        f.push("shift")), w(c) && f.push(c);
        d = c;
        e = b;
        if (!e) {
            if (!p) {
                p = {};
                for (var g in h) 95 < g && 112 > g || h.hasOwnProperty(g) && (p[h[g]] = g);
            }
            e = p[d] ? "keydown" : "keypress";
        }
        "keypress" == e && f.length && (e = "keydown");
        return {
            key: c,
            modifiers: f,
            action: e
        };
    }
    function F(a, b, d, c, e) {
        q[a + ":" + d] = b;
        a = a.replace(/\s+/g, " ");
        var f = a.split(" ");
        1 < f.length ? L(a, f, b, d) : (d = E(a, d), l[d.key] = l[d.key] || [], C(d.key, d.modifiers, {
            type: d.action
        }, c, a, e), l[d.key][c ? "unshift" : "push"]({
            callback: b,
            modifiers: d.modifiers,
            action: d.action,
            seq: c,
            level: e,
            combo: a
        }));
    }
    var h = {
        8: "backspace",
        9: "tab",
        13: "enter",
        16: "shift",
        17: "ctrl",
        18: "alt",
        20: "capslock",
        27: "esc",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "ins",
        46: "del",
        91: "meta",
        93: "meta",
        224: "meta"
    }, B = {
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/",
        186: ";",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
    }, H = {
        "~": "`",
        "!": "1",
        "@": "2",
        "#": "3",
        $: "4",
        "%": "5",
        "^": "6",
        "&": "7",
        "*": "8",
        "(": "9",
        ")": "0",
        _: "-",
        "+": "=",
        ":": ";",
        '"': "'",
        "<": ",",
        ">": ".",
        "?": "/",
        "|": "\\"
    }, G = {
        option: "alt",
        command: "meta",
        "return": "enter",
        escape: "esc",
        mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta" : "ctrl"
    }, p, l = {}, q = {}, n = {}, D, z = !1, I = !1, u = !1;
    for (f = 1; 20 > f; ++f) h[111 + f] = "f" + f;
    for (f = 0; 9 >= f; ++f) h[f + 96] = f;
    s(r, "keypress", y);
    s(r, "keydown", y);
    s(r, "keyup", y);
    var m = {
        bind: function(a, b, d) {
            a = a instanceof Array ? a : [ a ];
            for (var c = 0; c < a.length; ++c) F(a[c], b, d);
            return this;
        },
        unbind: function(a, b) {
            return m.bind(a, function() {}, b);
        },
        trigger: function(a, b) {
            if (q[a + ":" + b]) q[a + ":" + b]({}, a);
            return this;
        },
        reset: function() {
            l = {};
            q = {};
            return this;
        },
        stopCallback: function(a, b) {
            return -1 < (" " + b.className + " ").indexOf(" mousetrap ") ? !1 : "INPUT" == b.tagName || "SELECT" == b.tagName || "TEXTAREA" == b.tagName || b.isContentEditable;
        },
        handleKey: function(a, b, d) {
            var c = C(a, b, d), e;
            b = {};
            var f = 0, g = !1;
            for (e = 0; e < c.length; ++e) c[e].seq && (f = Math.max(f, c[e].level));
            for (e = 0; e < c.length; ++e) c[e].seq ? c[e].level == f && (g = !0, b[c[e].seq] = 1, 
            x(c[e].callback, d, c[e].combo, c[e].seq)) : g || x(c[e].callback, d, c[e].combo);
            c = "keypress" == d.type && I;
            d.type != u || w(a) || c || t(b);
            I = g && "keydown" == d.type;
        }
    };
    J.Mousetrap = m;
    "function" === typeof define && define.amd && define(m);
})(window, document);
}());
