/* global angular, module, utils, moduleName */
module.service('focusManager', function (focusQuery, focusDispatcher) {

    var scope = this,
        dispatcher = focusDispatcher();

    /**
     * Set the focus to a particular element
     * @param el
     * @returns {*|activeElement}
     */
    function focus(el) {
        if (typeof el === 'undefined') {
            return scope.activeElement;
        }

        if (scope.activeElement !== el) {
            var eventObj = {
                'oldTarget': scope.activeElement,
                'newTarget': el
            };

            dispatcher.trigger('focusout', eventObj);

            scope.activeElement = el;
            el.focus();

            dispatcher.trigger('focusin', eventObj);
        }
    }

    function canReceiveFocus(el) {
        return focusQuery.canReceiveFocus(el);
    }

    /**
     * Public interface for invoking the next focus element
     */
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

    /**
     * Public interface for invoking the previous focus element
     */
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

    /**
     * Internal implementation of indexOf for arrays
     * @param list
     * @param item
     * @returns {number}
     */
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

    /**
     * Searches list of elements and finds the next best element
     * @param elements
     * @param elementId
     * @returns {*}
     */
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

    /**
     * Searches list of groups and finds the next best groups
     * @param groups
     * @param groupId
     * @returns {*}
     */
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

    /**
     * Searches list of elements and finds the next best element
     * @param elements
     * @param elementId
     * @returns {*}
     */
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

    /**
     * Searches list of elements and finds the next best group
     * @param groups
     * @param groupId
     * @returns {*}
     */
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

    /**
     * Finds the next available group. Once a group is found it search for an element to set focus to.
     * If no group is found, it will go up the parent groups to find another group. If no groupId is
     * passed in it will find the first isolate group encountered.
     *
     * @param parentGroupId
     * @param groupId
     */
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
                // no next group go up, if there is not a parentGroup, we are at the top of the isolate group
                parentGroup = focusQuery.getGroup(parentGroupId);
                grandparentGroupId = focusQuery.getParentGroupId(parentGroup);
                return findNextGroup(grandparentGroupId, parentGroupId);
            }
        }
    }

    /**
     * Check if the element should be stopped, looped or released
     * @param groupId
     */
    function findNextStep(groupId) {
        var group, tail;
        group = focusQuery.getGroup(groupId);
        tail = focusQuery.getGroupTail(group);
        if (groupId) {
            if (tail === 'stop') {
                return; // do nothing
            }
            if (!tail) {
                disable();
                return;
            }
        } else {
            groupId = focusQuery.getFirstGroupId();
        }
        // loop
        findNextElement(groupId);
    }

    /**
     * Searches for a child group within another group. Once a group has been
     * found, search for an element in group. If no group found, go up parent
     * groups to find another group.
     *
     * @param groupId
     */
    function findNextChildGroup(groupId) {
        var groups, group, nextGroupId, parentGroupId;

        groups = focusQuery.getChildGroups(groupId);
        if (groups.length) {
            nextGroupId = focusQuery.getGroupId(groups[0]);
            findNextElement(nextGroupId);
        } else {
            // there are no child groups, go back up parent chain
            group = focusQuery.getGroup(groupId);
            parentGroupId = focusQuery.getParentGroupId(group);
            findNextGroup(parentGroupId, groupId);
        }
    }

    /**
     * Searches for an element within a group. If an element is found, place focus on element. If no element found,
     * start traversing through child groups. If a groupId is not passed in, the first available isolate group will
     * be used.
     * @param groupId
     * @param elementId
     */
    function findNextElement(groupId, elementId) {
        var els, nextElement;

        if (groupId) {
            els = focusQuery.getGroupElements(groupId);
            nextElement = getNextElement(els, elementId);
            if (nextElement) {
                // focus on next element
                if (scope.callback) {
                    scope.callback(nextElement);
                } else {
                    focus(nextElement);
                }
            } else {
                // there are no focus elements, go to next child focus group
                findNextChildGroup(groupId);
            }
        } else {
            // no group defined, find a group
            findNextGroup();
        }
    }

    /**
     * Finds the next available group. Once a group is found it will search for the child group. If no child group
     * is found, it will then search for elements within the group. If no elements are found, it will go back up
     * parent groups to find next available group.
     *
     * @param ParentGroupId
     * @param groupId
     */
    function findPrevGroup(ParentGroupId, groupId) {
        var groups, prevGroup, prevGroupId, parentParentGroup, parentParentGroupId;

        if (ParentGroupId) {
            groups = focusQuery.getChildGroups(ParentGroupId);
            prevGroup = getPrevGroup(groups, groupId);
            if (prevGroup) {
                // found group, now find child group
                prevGroupId = focusQuery.getGroupId(prevGroup);
                findPrevChildGroup(prevGroupId);
            } else {
                // otherwise find an element in this ParentGroup
                findPrevElement(ParentGroupId);
            }
        } else {
            // find the top most isolated group and start traversing through its child groups
            groupId = focusQuery.getLastGroupId();
            findPrevChildGroup(groupId);
        }
    }

    /**
     * Finds the child group within another group. Once group is found, it will search for elements within a group.
     * @param groupId
     */
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

    /**
     * Finds an next available element within a group. If an element is found, focus will be set.
     * @param groupId
     * @param elementId
     */
    function findPrevElement(groupId, elementId) {
        var els, prevEl, group, hasHead;
        if (groupId) {
            els = focusQuery.getGroupElements(groupId);
            prevEl = getPrevElement(els, elementId);
            if (prevEl) {
                // set focus to next element
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

    /**
     * Finds the previous step within the group using a head.
     * @param groupId
     */
    function findPrevStep(groupId) {
        var ParentGroupId, group, hasHead;
        group = focusQuery.getGroup(groupId);
        hasHead = focusQuery.hasGroupHead(group);
        ParentGroupId = focusQuery.getParentGroupId(group);
        // if there is a parent group then go to it, otherwise check for a loop
        if (hasHead || !ParentGroupId) {
            // if there was no parent group, we are at the top of the isolate group
            var head = focusQuery.getGroupHead(group);
            if (head === 'loop') {
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
            dispatcher.trigger('enabled');
        }
    }

    function disable() {
        if (scope.enabled) {
            scope.enabled = false;
            dispatcher.trigger('disabled');
        }
    }

    // :: Public API :: //
    scope.active = true;
    scope.enabled = false;
    scope.activeElement = null;

    scope.focus = focus;
    scope.prev = prev;
    scope.next = next;
    scope.on = on;
    scope.off = off;

    // :: Protected API :: //
    scope.findPrevChildGroup = findPrevChildGroup;
    scope.findNextElement = findNextElement;
    scope.canReceiveFocus = canReceiveFocus;
    scope.enable = enable;
    scope.disable = disable;

});