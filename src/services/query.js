/* global ux, utils */
angular.module('ux').service('focusQuery', function () {

    // http://quirksmode.org/dom/core/
    function canReceiveFocus(el) {
        if (!el) {
            return false;
        }

        var isSelectable = new RegExp(el.nodeName.toUpperCase()).test(selectable);

        if (!isSelectable) {
            isSelectable = el.hasAttribute(focusIndex);
        }

        if (!isSelectable) {
            isSelectable = el.hasAttribute(tabIndex) && el.getAttribute(tabIndex) > -1;
        }

        if (isSelectable) {
            isSelectable = !el.hasAttribute('disabled');
        }

        if (isSelectable) {
            isSelectable = isVisible(el);
        }
        return isSelectable;
    }

    function getFirstGroupId() {
        var q = supplant('[{focusGroup}]:not([{focusParentGroupId}])', {
            focusGroup: focusGroup,
            focusParentGroupId: focusParentGroupId
        });
        var groupEl = document.querySelector(q);
        return getGroupId(groupEl);
    }

    function getLastGroupId() {
        var q = supplant('[{focusGroup}]:not([{focusParentGroupId}])', {
            focusGroup: focusGroup,
            focusParentGroupId: focusParentGroupId
        });
        var groupEls = document.querySelectorAll(q);
        return getGroupId(groupEls[groupEls.length - 1]);
    }

    function getChildGroups(groupId) {
        var q = supplant('[{focusParentGroupId}="{groupId}"]', {
            focusParentGroupId: focusParentGroupId,
            groupId: groupId
        });

        var els = document.querySelectorAll(q);

        var returnVal = [];
        var i = 0, len = els.length;
        while (i < len) {
            returnVal.push(els[i]);
            i += 1;
        }
//        returnVal.sort(sortByGroupIndex);
        returnVal = sort(returnVal, sortByGroupIndex);
        return returnVal;
    }

    function getElementsWithoutParents(el) {
        if (el) {
            var query = 'A:not({focusParentId}),' +
                'SELECT:not({focusParentId}),' +
                'BUTTON:not({focusParentId}),' +
                'INPUT:not({focusParentId}),' +
                'TEXTAREA:not({focusParentId}),' +
                '*[focus-index]:not({focusParentId})';
            query = supplant(query, {focusParentId: '[' + focusParentId + ']'});
            return el.querySelectorAll(query);
        }
        return [];
    }

    function getGroupsWithoutParentGroup(el) {
        if (!el) {
            return [];
        }

        var q = '[' + focusGroupId + ']:not([' + focusParentGroupId + '])';
        return el.querySelectorAll(q);
    }

    function getGroupElements(groupId) {
        var q, isStrict, els, returnVal, i, len;

        isStrict = isGroupStrict(groupId);
        if (isStrict) {
            q = supplant('[{focusParentId}="{groupId}"][focus-index]:not([disabled]):not(.disabled)', {
                focusParentId: focusParentId,
                groupId: groupId
            });
        } else {
            q = supplant('[{focusParentId}="{groupId}"]:not([disabled]):not(.disabled)', {
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

//        returnVal.sort(sortByTabIndex);
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
        if (elementId) {
            var q = supplant('[{focusElementId}="{elementId}"]', {
                focusElementId: focusElementId,
                elementId: elementId
            });
            return document.querySelector(q);
        }
    }

    function getGroup(groupId) {
        if (groupId) {
            return document.querySelector('[' + focusGroupId + '="' + groupId + '"]');
        }
    }

    function isGroupStrict(groupId) {
        var group = getGroup(groupId);
        if (group) {
            return group.getAttribute(focusGroup) === 'strict';
        }
        return false;
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

    function getParentGroupId(el) {
        if (el) {
            return el.getAttribute(focusParentGroupId);
        }
    }

    function setParentGroupId(el, id) {
        el.setAttribute(focusParentGroupId, id);
    }

    function getTabIndex(el) {
        if (el) {
            return el.getAttribute(tabIndex);
        }
    }

    function setTabIndex(el, index) {
        if (el) {
            if (index === null) {
                el.removeAttribute(tabIndex);
            } else {
                el.setAttribute(tabIndex, index);
            }
        }
    }

    function contains(ParentGroup, el) {
        if (el) {
            var parent = el.parentNode;
            if (parent) {
                while (parent) {
                    if(parent.nodeType === 9) {
                        break;
                    }
                    if (parent === ParentGroup) {
                        return true;
                    }
                    parent = parent.parentNode;
                }
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
    this.getParentGroupId = getParentGroupId;
    this.setParentGroupId = setParentGroupId;
    this.getGroup = getGroup;
    this.getFirstGroupId = getFirstGroupId;
    this.getLastGroupId = getLastGroupId;
    this.getTabIndex = getTabIndex;
    this.setTabIndex = setTabIndex;

    this.getElementsWithoutParents = getElementsWithoutParents;
    this.getGroupsWithoutParentGroup = getGroupsWithoutParentGroup;
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