/* global ux, utils */
angular.module('ux').service('focusQuery', function () {

    // http://quirksmode.org/dom/core/

    var focusElementId = 'focus-element-id';
    var focusGroupId = 'focus-group-id';
    var focusParentId = 'focus-parent-id';
    var focusContainerId = 'focus-container-id';

    var tabIndex = 'tabindex';
    var focusGroup = 'focus-group';
    var focusGroupIndex = 'focus-group-index';
    var focusGroupHead = 'focus-group-head';
    var focusGroupTail = 'focus-group-tail';
    var focusElement = 'focus-element';
    var focusEnabled = 'focus-enabled';
    var focusIndex = 'focus-index';
    var selectable = 'A,SELECT,BUTTON,INPUT,TEXTAREA,*[focus-index]';

    function canReceiveFocus(el) {
        if (!el) {
            return false;
        }

        var isSelectable = new RegExp(el.nodeName.toUpperCase()).test(selectable);

        if (!isSelectable) {
            isSelectable = el.getAttribute(focusIndex) !== null;
        }

        if (isSelectable) {
            isSelectable = el.getAttribute('disabled') === null;
        }

        if (isSelectable) {
            isSelectable = isVisible(el);
        }
        return isSelectable;
    }

    function getFirstGroupId() {
        var q = '[{focusGroup}]:not([{focusContainerId}])'.supplant({
            focusGroup: focusGroup,
            focusContainerId: focusContainerId
        });
        var groupEl = document.querySelector(q);
        return getGroupId(groupEl);
    }

    function getLastGroupId() {
        var q = '[{focusGroup}]:not([{focusContainerId}])'.supplant({
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
//        returnVal = sort(returnVal, sortByGroupIndex);
        return returnVal;
    }

    function getElementsWithoutParents(el) {

        if (!el) {
            return [];
        }

        var query = 'A:not({focusParentId}),' +
            'SELECT:not({focusParentId}),' +
            'BUTTON:not({focusParentId}),' +
            'INPUT:not({focusParentId}),' +
            'TEXTAREA:not({focusParentId}),' +
            '*[focus-index]:not({focusParentId})';

        query = query.supplant({focusParentId: '[' + focusParentId + ']'});

        return el.querySelectorAll(query);
    }

    function getGroupsWithoutContainers(el) {
        if (!el) {
            return [];
        }

        var q = '[' + focusGroupId + ']:not([' + focusContainerId + '])';
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
//        returnVal = sort(returnVal, sortByTabIndex);

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

        if (el.style.display === 'none') {
            return false;
        }

        if (el.style.visibility === 'hidden') {
            return false;
        }

        if (el.style.opacity === 0 || el.style.opacity === '0') {
            return false;
        }

        return true;
    }

    function isAutofocus(el) {
        if (el) {
            return el.getAttribute(focusElement) === 'autofocus';
        }
        return false;
    }

    function isEnabled(el) {
        if (el) {
            return el.getAttribute(focusEnabled) !== 'false';
        }
        return false;
    }

    function hasGroupHead(el) {
        if (el) {
            return el.hasAttribute(focusGroupHead);
        }
        return false;
    }

    function getGroupHead(el) {
        if (el) {
            return el.getAttribute(focusGroupHead);
        }
    }

    function hasGroupTail(el) {
        if (el) {
            return el.hasAttribute(focusGroupTail);
        }
        return false;
    }

    function getGroupTail(el) {
        if (el) {
            return el.getAttribute(focusGroupTail);
        }
    }

    function getElement(elementId) {
        var q = '[{focusElementId}="{elementId}"]'.supplant({
            focusElementId: focusElementId,
            elementId: elementId
        });
        return document.querySelector(q);
    }

    function getGroup(groupId) {
        if (groupId) {
            return document.querySelector('[' + focusGroupId + '="' + groupId + '"]');
        }
    }

    function isGroupStrict(groupId) {
        var group = getGroup(groupId);
        return group.getAttribute(focusGroup) === 'strict';
    }

    function getElementId(el) {
        if (el) {
            return el.getAttribute(focusElementId);
        }
    }

    function setElementId(el, id) {
        el.setAttribute(focusElementId, id);
    }

    function getGroupId(el) {
        if (el) {
            return el.getAttribute(focusGroupId);
        }
    }

    function setGroupId(el, id) {
        el.setAttribute(focusGroupId, id);
    }

    function getParentId(el) {
        if (el) {
            return el.getAttribute(focusParentId);
        }
    }

    function setParentId(el, id) {
        el.setAttribute(focusParentId, id);
    }

    function getContainerId(el) {
        if (el) {
            return el.getAttribute(focusContainerId);
        }
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
        if (parent) {
            while (parent.nodeType !== 9) {
                if (parent === container) {
                    return true;
                }
                parent = parent.parentNode;
            }
        }
        return false;
    }

    function sort(list, compareFn) {
        var i = 0,
            len = list.length - 1,
            holder;
        if (!compareFn) { // default compare function.
            compareFn = function (a, b) {
                return a > b ? 1 : (a < b ? -1 : 0);
            };
        }
        while (i < len) {
            if (compareFn(list[i], list[i + 1]) > 0) {
                holder = list[i + 1];
                list[i + 1] = list[i];
                list[i] = holder;
            }
            i = i + 1;
        }
        return list;
    }

    function sortByTabIndex(a, b) {
        var aTabIndex = a.getAttribute(focusIndex) || Number.POSITIVE_INFINITY;
        var bTabIndex = b.getAttribute(focusIndex) || Number.POSITIVE_INFINITY;

        if (aTabIndex < bTabIndex) {
            return -1;
        }
        if (aTabIndex > bTabIndex) {
            return 1;
        }
        return 0;
    }

    function sortByGroupIndex(a, b) {
        var aGroupIndex = a.getAttribute(focusGroupIndex) || Number.POSITIVE_INFINITY;
        var bGroupIndex = b.getAttribute(focusGroupIndex) || Number.POSITIVE_INFINITY;

        if (aGroupIndex < bGroupIndex) {
            return -1;
        }
        if (aGroupIndex > bGroupIndex) {
            return 1;
        }
        return 0;
    }

//    function sortByTabIndex(a, b) {
//        var compA = a.attributes[focusIndex] ? Number(a.attributes[focusIndex].value) : Number.POSITIVE_INFINITY,
//            compB = b.attributes[focusIndex] ? Number(b.attributes[focusIndex].value) : Number.POSITIVE_INFINITY;
//        return compA - compB;
//    }
//
//    function sortByGroupIndex(a, b) {
//        var compA = a.attributes[focusGroupIndex] ? Number(a.attributes[focusGroupIndex].value) : Number.POSITIVE_INFINITY,
//            compB = b.attributes[focusGroupIndex] ? Number(b.attributes[focusGroupIndex].value) : Number.POSITIVE_INFINITY;
//        return compA - compB;
//    }

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
    this.hasGroupHead = hasGroupHead;
    this.hasGroupTail = hasGroupTail;
    this.getGroupHead = getGroupHead;
    this.getGroupTail = getGroupTail;
    this.isEnabled = isEnabled;
    this.getGroupElements = getGroupElements;
    this.getChildGroups = getChildGroups;
    this.contains = contains;
    this.canReceiveFocus = canReceiveFocus;

})