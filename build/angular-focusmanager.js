/*
* angular-focus-manager 0.2.5
* Obogo (c) 2014
* https://github.com/webux/angular-focusmanager
* License: MIT.
*/
(function(exports, global) {
    global["fm"] = exports;
    var consts = {
        FOCUS_ELEMENT_ID: "fm-id",
        FOCUS_GROUP_ID: "fm-group",
        FOCUS_PARENT_ID: "fm-parent",
        FOCUS_PARENT_GROUP_ID: "fm-parent-group",
        TAB_INDEX: "tabindex",
        FOCUS_GROUP: "focus-group",
        FOCUS_GROUP_INDEX: "focus-group-index",
        FOCUS_GROUP_HEAD: "focus-group-head",
        FOCUS_GROUP_TAIL: "focus-group-tail",
        FOCUS_ELEMENT: "focus-element",
        FOCUS_ENABLED: "focus-enabled",
        FOCUS_INDEX: "focus-index",
        SELECTABLE: "A,SELECT,BUTTON,INPUT,TEXTAREA,*[focus-index]"
    };
    var module;
    (function() {
        try {
            module = angular.module("fm");
        } catch (e) {
            module = angular.module("fm", []);
        }
    })();
    module.directive("focusElement", [ "focusManager", "focusQuery", function(focusManager, focusQuery) {
        return {
            scope: true,
            link: function(scope, element, attr) {
                var el = element[0], timer, off;
                if (focusQuery.isAutofocus(el)) {
                    off = scope.$watch(function() {
                        off();
                        timer = setInterval(function() {
                            if (focusQuery.isVisible(el)) {
                                focusManager.focus(el);
                                el.focus();
                                if (document.activeElement === el) {
                                    clearInterval(timer);
                                    off();
                                }
                            }
                        }, 10);
                    });
                    scope.$on("$destroy", function() {
                        clearInterval(timer);
                    });
                }
            }
        };
    } ]);
    module.directive("focusGroup", [ "focusManager", "focusQuery", "focusDispatcher", "focusKeyboard", function(focusManager, focusQuery, focusDispatcher, focusKeyboard) {
        var groupId = 1, elementId = 1, dispatcher = focusDispatcher(), delay = 100;
        var body = document.body;
        function compile(groupName, el) {
            var els, i, len, elementName;
            els = focusQuery.getElementsWithoutParents(el);
            len = els.length;
            i = 0;
            while (i < len) {
                elementName = elementId;
                focusQuery.setParentId(els[i], groupName);
                focusQuery.setElementId(els[i], elementName);
                var tabIndex = focusQuery.getTabIndex(els[i]);
                if (tabIndex === undefined || tabIndex === null) {
                    focusQuery.setTabIndex(els[i], -1);
                }
                elementId += 1;
                i += 1;
            }
            els = focusQuery.getGroupsWithoutParentGroup(el);
            len = els.length;
            i = 0;
            while (i < len) {
                focusQuery.setParentGroupId(els[i], groupName);
                i += 1;
            }
        }
        function linker(scope, element, attr) {
            var el = element[0];
            var groupName = groupId++;
            var bound = false;
            var cacheHtml = "";
            var newCacheHtml = "";
            var tabIndex = el.getAttribute("tabindex") || 0;
            var outOfBody = false;
            function init() {
                scope.$on("focus::" + groupName, function() {
                    compile(groupName, el);
                });
                if (!focusQuery.getParentGroupId(el)) {
                    cacheHtml = el.innerHTML;
                    el.setAttribute("tabindex", tabIndex);
                    scope.$watch(utils.debounce(function() {
                        newCacheHtml = el.innerHTML;
                        if (cacheHtml !== newCacheHtml) {
                            var els = el.querySelectorAll("[" + consts.FOCUS_GROUP + "]");
                            var i = els.length, groupId;
                            while (i) {
                                i -= 1;
                                groupId = els[i].getAttribute(consts.FOCUS_GROUP_ID);
                                scope.$broadcast("focus::" + groupId);
                            }
                            cacheHtml = newCacheHtml;
                        }
                        compile(groupName, el);
                    }, delay));
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
                    }, delay));
                    dispatcher.on("enabled", function(evt) {
                        var direction = focusKeyboard.direction;
                        if (document.activeElement === el) {
                            if (direction === "prev") {
                                focusManager.findPrevChildGroup(groupName);
                            } else {
                                focusManager.findNextElement(groupName);
                            }
                        }
                        if (document.activeElement === el || focusQuery.contains(el, document.activeElement)) {
                            el.removeAttribute("tabindex");
                        } else {
                            el.setAttribute("tabindex", tabIndex);
                        }
                    });
                    dispatcher.on("disabled", function() {
                        setTimeout(function() {
                            if (document.activeElement === el || focusQuery.contains(el, document.activeElement)) {
                                el.removeAttribute("tabindex");
                            } else {
                                el.setAttribute("tabindex", tabIndex);
                            }
                        });
                    });
                }
            }
            function onFocus(evt) {
                if (outOfBody) {
                    focusKeyboard.watchNextTabKey(groupName);
                    outOfBody = false;
                } else {
                    focusManager.enable();
                }
            }
            function onDocumentBlur(evt) {
                setTimeout(function() {
                    if (document.activeElement === body) {
                        outOfBody = true;
                    }
                });
            }
            el.addEventListener("focus", onFocus, true);
            document.addEventListener("blur", onDocumentBlur, true);
            setTimeout(init, delay);
            focusQuery.setGroupId(el, groupName);
            compile(groupName, el);
        }
        return {
            link: linker
        };
    } ]);
    module.directive("focusHighlight", [ "focusManager", function(focusManager) {
        function getOffsetRect(elem) {
            var box = elem.getBoundingClientRect();
            var body = document.body;
            var docElem = document.documentElement;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var top = box.top + scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;
            return {
                top: Math.round(top),
                left: Math.round(left),
                width: box.width,
                height: box.height
            };
        }
        var updateDisplay = utils.debounce(function(el, activeElement) {
            var style = el.style;
            if (activeElement && focusManager.canReceiveFocus(activeElement)) {
                var rect = getOffsetRect(activeElement);
                style.display = null;
                style.left = rect.left + "px";
                style.top = rect.top + "px";
                style.width = rect.width + "px";
                style.height = rect.height + "px";
            } else {
                style.display = "none";
            }
        }, 10);
        return {
            scope: true,
            replace: true,
            link: function(scope, element, attrs) {
                var timer;
                var el = element[0];
                el.style.display = "none";
                document.addEventListener("focus", function(evt) {
                    clearTimeout(timer);
                    updateDisplay(el, evt.target);
                }, true);
                document.addEventListener("blur", function(evt) {
                    timer = setTimeout(function() {
                        updateDisplay(el);
                    });
                }, true);
            },
            template: '<div class="focus-highlight"></div>'
        };
    } ]);
    module.directive("focusShortcut", [ "focusManager", function(focusManager) {
        return {
            link: function(scope, element, attrs) {
                var bound = false;
                function onBindKeys() {
                    if (!bound) {
                        bound = true;
                        Mousetrap.bind(attrs.focusShortcut.split(","), function(evt) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            focusManager.focus(element[0]);
                            return false;
                        });
                    }
                }
                function onUnbindKeys() {
                    if (bound) {
                        bound = false;
                        Mousetrap.unbind(attrs.focusKeyboard.split(","));
                    }
                }
                if (attrs.focusShortcut) {
                    scope.$on("bindKeys", onBindKeys);
                    scope.$on("unbindKeys", onUnbindKeys);
                    scope.$on("$destroy", onUnbindKeys);
                }
            }
        };
    } ]);
    module.directive("focusStack", [ "focusManager", "focusQuery", function(focusManager, focusQuery) {
        var stack = [];
        return {
            link: function(scope, element, attrs) {
                stack.push(focusQuery.getElementId(focusManager.activeElement));
                scope.$on("$destroy", function() {
                    if (stack.length) {
                        var elementId = stack.pop();
                        var el = focusQuery.getElement(elementId);
                        if (el) {
                            focusManager.focus(el);
                        }
                    }
                });
            }
        };
    } ]);
    module.factory("focusDispatcher", function() {
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
                var evtItem = this.events[key];
                for (var i in evtItem) {
                    if (evtItem.hasOwnProperty(i)) {
                        evtItem[i](dataObj);
                    }
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
    module.service("focusKeyboard", [ "focusManager", function(focusManager) {
        var scope = this, tabKeysEnabled = false, arrowKeysEnabled = false;
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
            scope.direction = "next";
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
            scope.direction = "prev";
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
            if (!(evt.shiftKey || evt.altKey || evt.ctrlKey)) {
                if (evt.keyCode === 13) {
                    triggerClick(evt);
                }
            }
        }
        function onNextKeyUp(evt) {
            unwatchNextTabKey();
            if (tabKeysEnabled) {
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
            if (tabKeysEnabled) {
                _groupName = groupName;
                utils.addEvent(document, "keyup", onNextKeyUp);
            }
        }
        function unwatchNextTabKey() {
            utils.removeEvent(document, "keyup", onNextKeyUp);
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
        scope.watchNextTabKey = watchNextTabKey;
        scope.unwatchNextTabKey = unwatchNextTabKey;
    } ]).run([ "focusKeyboard", function(focusKeyboard) {
        focusKeyboard.enable();
        focusKeyboard.enableTabKeys();
    } ]);
    module.service("focusManager", [ "focusQuery", "focusDispatcher", function(focusQuery, focusDispatcher) {
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
                if (el) {
                    el.focus();
                }
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
        function findNextGroup(parentGroupId, groupId) {
            var group, groups, nextGroup, nextGroupId, parentGroup, grandparentGroupId, hasTail;
            group = focusQuery.getGroup(groupId);
            hasTail = focusQuery.hasGroupTail(group);
            if (hasTail || !parentGroupId) {
                findNextStep(groupId);
            } else {
                parentGroupId = focusQuery.getParentGroupId(group);
                groups = focusQuery.getChildGroups(parentGroupId);
                nextGroup = getNextGroup(groups, groupId);
                if (nextGroup) {
                    nextGroupId = focusQuery.getGroupId(nextGroup);
                    return findNextElement(nextGroupId);
                } else {
                    parentGroup = focusQuery.getGroup(parentGroupId);
                    grandparentGroupId = focusQuery.getParentGroupId(parentGroup);
                    return findNextGroup(grandparentGroupId, parentGroupId);
                }
            }
        }
        function findNextStep(groupId) {
            var group, tail;
            group = focusQuery.getGroup(groupId);
            tail = focusQuery.getGroupTail(group);
            if (groupId) {
                if (tail === "stop") {
                    return;
                }
                if (!tail) {
                    disable();
                    return;
                }
            } else {
                groupId = focusQuery.getFirstGroupId();
            }
            findNextElement(groupId);
        }
        function findNextChildGroup(groupId) {
            var groups, group, nextGroupId, parentGroupId;
            groups = focusQuery.getChildGroups(groupId);
            if (groups.length) {
                nextGroupId = focusQuery.getGroupId(groups[0]);
                findNextElement(nextGroupId);
            } else {
                group = focusQuery.getGroup(groupId);
                parentGroupId = focusQuery.getParentGroupId(group);
                findNextGroup(parentGroupId, groupId);
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
        function findPrevGroup(ParentGroupId, groupId) {
            var groups, prevGroup, prevGroupId, parentParentGroup, parentParentGroupId;
            if (ParentGroupId) {
                groups = focusQuery.getChildGroups(ParentGroupId);
                prevGroup = getPrevGroup(groups, groupId);
                if (prevGroup) {
                    prevGroupId = focusQuery.getGroupId(prevGroup);
                    findPrevChildGroup(prevGroupId);
                } else {
                    findPrevElement(ParentGroupId);
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
            var els, prevEl, group, hasHead;
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
                    findPrevStep(groupId);
                }
            } else {
                findPrevChildGroup();
            }
        }
        function findPrevStep(groupId) {
            var ParentGroupId, group, hasHead;
            group = focusQuery.getGroup(groupId);
            hasHead = focusQuery.hasGroupHead(group);
            ParentGroupId = focusQuery.getParentGroupId(group);
            if (hasHead || !ParentGroupId) {
                var head = focusQuery.getGroupHead(group);
                if (head === "loop") {
                    findPrevChildGroup(groupId);
                } else if (!head) {
                    disable();
                }
            } else {
                findPrevGroup(ParentGroupId, groupId);
            }
        }
        function on() {
            scope.active = true;
        }
        function off() {
            scope.active = false;
        }
        function enable() {
            if (!scope.enabled && scope.active) {
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
        scope.active = true;
        scope.enabled = false;
        scope.activeElement = null;
        scope.focus = focus;
        scope.prev = prev;
        scope.next = next;
        scope.on = on;
        scope.off = off;
        scope.findPrevChildGroup = findPrevChildGroup;
        scope.findNextElement = findNextElement;
        scope.canReceiveFocus = canReceiveFocus;
        scope.enable = enable;
        scope.disable = disable;
    } ]);
    module.service("focusMouse", [ "focusManager", "focusQuery", function(focusManager, focusQuery) {
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
            var el = evt.target;
            while (el.nodeName.toUpperCase() === "SPAN") {
                el = el.parentNode;
            }
            if (focusManager.canReceiveFocus(el)) {
                focusManager.focus(el);
                var parentId = focusQuery.getParentId(el);
                if (parentId) {
                    focusManager.enable();
                } else {
                    focusManager.disable();
                }
            }
        }
        scope.enabled = false;
        scope.enable = enable;
        scope.disable = disable;
    } ]).run([ "focusMouse", function(focusMouse) {
        focusMouse.enable();
    } ]);
    module.service("focusQuery", function() {
        var scope = this;
        function canReceiveFocus(el) {
            if (!el) {
                return false;
            }
            var isSelectable = new RegExp(el.nodeName.toUpperCase()).test(consts.SELECTABLE);
            if (!isSelectable) {
                isSelectable = el.hasAttribute(consts.FOCUS_INDEX);
            }
            if (!isSelectable) {
                isSelectable = el.hasAttribute(consts.TAB_INDEX) && el.getAttribute(consts.TAB_INDEX) > -1;
            }
            if (isSelectable) {
                isSelectable = !el.hasAttribute("disabled");
            }
            if (isSelectable) {
                isSelectable = isVisible(el);
            }
            if (isSelectable) {
                isSelectable = !el.hasAttribute(consts.FOCUS_GROUP);
            }
            return isSelectable;
        }
        function getFirstGroupId() {
            var q = utils.supplant("[{focusGroup}]:not([{focusParentGroupId}])", {
                focusGroup: consts.FOCUS_GROUP,
                focusParentGroupId: consts.FOCUS_PARENT_GROUP_ID
            });
            var groupEl = document.querySelector(q);
            return getGroupId(groupEl);
        }
        function getLastGroupId() {
            var q = utils.supplant("[{focusGroup}]:not([{focusParentGroupId}])", {
                focusGroup: consts.FOCUS_GROUP,
                focusParentGroupId: consts.FOCUS_PARENT_GROUP_ID
            });
            var groupEls = document.querySelectorAll(q);
            return getGroupId(groupEls[groupEls.length - 1]);
        }
        function getChildGroups(groupId) {
            var q = utils.supplant('[{focusParentGroupId}="{groupId}"]', {
                focusParentGroupId: consts.FOCUS_PARENT_GROUP_ID,
                groupId: groupId
            });
            var els = document.querySelectorAll(q);
            var returnVal = [];
            var i = 0, len = els.length;
            while (i < len) {
                returnVal.push(els[i]);
                i += 1;
            }
            returnVal = sort(returnVal, sortByGroupIndex);
            return returnVal;
        }
        function getElementsWithoutParents(el) {
            if (el) {
                var query = "A:not({focusParentId})," + "SELECT:not({focusParentId})," + "BUTTON:not({focusParentId})," + "INPUT:not({focusParentId})," + "TEXTAREA:not({focusParentId})," + "*[focus-index]:not({focusParentId})";
                query = utils.supplant(query, {
                    focusParentId: "[" + consts.FOCUS_PARENT_ID + "]"
                });
                return el.querySelectorAll(query);
            }
            return [];
        }
        function getGroupsWithoutParentGroup(el) {
            if (!el) {
                return [];
            }
            var q = "[" + consts.FOCUS_GROUP_ID + "]:not([" + consts.FOCUS_PARENT_GROUP_ID + "])";
            return el.querySelectorAll(q);
        }
        function getGroupElements(groupId) {
            var q, isStrict, els, returnVal, i, len;
            isStrict = isGroupStrict(groupId);
            if (isStrict) {
                q = utils.supplant('[{focusParentId}="{groupId}"][focus-index]:not([disabled]):not(.disabled)', {
                    focusParentId: consts.FOCUS_PARENT_ID,
                    groupId: groupId
                });
            } else {
                q = utils.supplant('[{focusParentId}="{groupId}"]:not([disabled]):not(.disabled)', {
                    focusParentId: consts.FOCUS_PARENT_ID,
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
            returnVal = sort(returnVal, sortByTabIndex);
            return returnVal;
        }
        function isVisible(el) {
            if (!el) {
                return false;
            }
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
            if (el) {
                return el.getAttribute(consts.FOCUS_ELEMENT) === "autofocus";
            }
            return false;
        }
        function isEnabled(el) {
            if (el) {
                return el.getAttribute(consts.FOCUS_ENABLED) !== "false";
            }
            return false;
        }
        function hasGroupHead(el) {
            if (el) {
                return !!el.getAttribute(consts.FOCUS_GROUP_HEAD);
            }
            return false;
        }
        function getGroupHead(el) {
            if (el) {
                return el.getAttribute(consts.FOCUS_GROUP_HEAD);
            }
        }
        function hasGroupTail(el) {
            if (el) {
                return !!el.getAttribute(consts.FOCUS_GROUP_TAIL);
            }
            return false;
        }
        function getGroupTail(el) {
            if (el) {
                return el.getAttribute(consts.FOCUS_GROUP_TAIL);
            }
        }
        function getElement(elementId) {
            if (elementId) {
                var q = utils.supplant('[{focusElementId}="{elementId}"]', {
                    focusElementId: consts.FOCUS_ELEMENT_ID,
                    elementId: elementId
                });
                return document.querySelector(q);
            }
        }
        function getGroup(groupId) {
            if (groupId) {
                return document.querySelector("[" + consts.FOCUS_GROUP_ID + '="' + groupId + '"]');
            }
        }
        function isGroupStrict(groupId) {
            var group = getGroup(groupId);
            if (group) {
                return group.getAttribute(consts.FOCUS_GROUP) === "strict";
            }
            return false;
        }
        function getElementId(el) {
            if (el) {
                return el.getAttribute(consts.FOCUS_ELEMENT_ID);
            }
        }
        function setElementId(el, id) {
            el.setAttribute(consts.FOCUS_ELEMENT_ID, id);
        }
        function getGroupId(el) {
            if (el) {
                return el.getAttribute(consts.FOCUS_GROUP_ID);
            }
        }
        function setGroupId(el, id) {
            el.setAttribute(consts.FOCUS_GROUP_ID, id);
        }
        function getParentId(el) {
            if (el) {
                return el.getAttribute(consts.FOCUS_PARENT_ID);
            }
        }
        function setParentId(el, id) {
            el.setAttribute(consts.FOCUS_PARENT_ID, id);
        }
        function getParentGroupId(el) {
            if (el) {
                return el.getAttribute(consts.FOCUS_PARENT_GROUP_ID);
            }
        }
        function setParentGroupId(el, id) {
            el.setAttribute(consts.FOCUS_PARENT_GROUP_ID, id);
        }
        function getTabIndex(el) {
            if (el) {
                return el.getAttribute(consts.TAB_INDEX);
            }
        }
        function setTabIndex(el, index) {
            if (el) {
                if (index === null) {
                    el.removeAttribute(consts.TAB_INDEX);
                } else {
                    el.setAttribute(consts.TAB_INDEX, index);
                }
            }
        }
        function contains(containerEl, targetEl) {
            if (targetEl) {
                var parent = targetEl.parentNode;
                if (parent) {
                    while (parent) {
                        if (parent.nodeType === 9) {
                            break;
                        }
                        if (parent === containerEl) {
                            return true;
                        }
                        parent = parent.parentNode;
                    }
                }
            }
            return false;
        }
        function sort(list, compareFn) {
            var c, len, v, rlen, holder;
            if (!compareFn) {
                compareFn = function(a, b) {
                    return a > b ? 1 : a < b ? -1 : 0;
                };
            }
            len = list.length;
            rlen = len - 1;
            for (c = 0; c < len; c += 1) {
                for (v = 0; v < rlen; v += 1) {
                    if (compareFn(list[v], list[v + 1]) > 0) {
                        holder = list[v + 1];
                        list[v + 1] = list[v];
                        list[v] = holder;
                    }
                }
            }
            return list;
        }
        function sortByTabIndex(a, b) {
            var aTabIndex = a.getAttribute(consts.FOCUS_INDEX) || Number.POSITIVE_INFINITY;
            var bTabIndex = b.getAttribute(consts.FOCUS_INDEX) || Number.POSITIVE_INFINITY;
            if (aTabIndex < bTabIndex) {
                return -1;
            }
            if (aTabIndex > bTabIndex) {
                return 1;
            }
            return 0;
        }
        function sortByGroupIndex(a, b) {
            var aGroupIndex = a.getAttribute(consts.FOCUS_GROUP_INDEX) || Number.POSITIVE_INFINITY;
            var bGroupIndex = b.getAttribute(consts.FOCUS_GROUP_INDEX) || Number.POSITIVE_INFINITY;
            if (aGroupIndex < bGroupIndex) {
                return -1;
            }
            if (aGroupIndex > bGroupIndex) {
                return 1;
            }
            return 0;
        }
        scope.getElement = getElement;
        scope.getElementId = getElementId;
        scope.setElementId = setElementId;
        scope.getGroupId = getGroupId;
        scope.setGroupId = setGroupId;
        scope.getParentId = getParentId;
        scope.setParentId = setParentId;
        scope.getParentGroupId = getParentGroupId;
        scope.setParentGroupId = setParentGroupId;
        scope.getGroup = getGroup;
        scope.getFirstGroupId = getFirstGroupId;
        scope.getLastGroupId = getLastGroupId;
        scope.getTabIndex = getTabIndex;
        scope.setTabIndex = setTabIndex;
        scope.getElementsWithoutParents = getElementsWithoutParents;
        scope.getGroupsWithoutParentGroup = getGroupsWithoutParentGroup;
        scope.isAutofocus = isAutofocus;
        scope.isVisible = isVisible;
        scope.hasGroupHead = hasGroupHead;
        scope.hasGroupTail = hasGroupTail;
        scope.getGroupHead = getGroupHead;
        scope.getGroupTail = getGroupTail;
        scope.isEnabled = isEnabled;
        scope.getGroupElements = getGroupElements;
        scope.getChildGroups = getChildGroups;
        scope.contains = contains;
        scope.canReceiveFocus = canReceiveFocus;
    });
    var utils = {};
    utils.addEvent = function(object, type, callback) {
        angular.element(object).on(type, callback);
    };
    utils.removeEvent = function(object, type, callback) {
        angular.element(object).off(type, callback);
    };
    utils.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
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
    utils.supplant = function(str, o) {
        str = str + "";
        if (!str.replace) {
            return o;
        }
        return str.replace(/{([^{}]*)}/g, function(a, b) {
            var r = o[b];
            return typeof r === "string" || typeof r === "number" ? r : a;
        });
    };
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
    exports["consts"] = consts;
    exports["module"] = module;
    exports["utils"] = utils;
})({}, function() {
    return this;
}());