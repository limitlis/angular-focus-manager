/* global angular, module, utils, moduleName, consts */
module.service('focusQuery', function () {

    var scope = this;

    // http://quirksmode.org/dom/core/
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
            isSelectable = !el.hasAttribute('disabled');
        }

        if (isSelectable) {
            isSelectable = isVisible(el);
        }

        if(isSelectable) {
            isSelectable = !el.hasAttribute(consts.FOCUS_GROUP);
        }
        return isSelectable;
    }

    function getFirstGroupId() {
        var q = utils.supplant('[{focusGroup}]:not([{focusParentGroupId}])', {
            focusGroup: consts.FOCUS_GROUP,
            focusParentGroupId: consts.FOCUS_PARENT_GROUP_ID
        });
        var groupEl = document.querySelector(q);
        return getGroupId(groupEl);
    }

    function getLastGroupId() {
        var q = utils.supplant('[{focusGroup}]:not([{focusParentGroupId}])', {
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
            query = utils.supplant(query, {focusParentId: '[' + consts.FOCUS_PARENT_ID + ']'});
            return el.querySelectorAll(query);
        }
        return [];
    }

    function getGroupsWithoutParentGroup(el) {
        if (!el) {
            return [];
        }

        var q = '[' + consts.FOCUS_GROUP_ID + ']:not([' + consts.FOCUS_PARENT_GROUP_ID + '])';
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
            return el.getAttribute(consts.FOCUS_ELEMENT) === 'autofocus';
        }
        return false;
    }

    function isEnabled(el) {
        if (el) {
            return el.getAttribute(consts.FOCUS_ENABLED) !== 'false';
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
            return document.querySelector('[' + consts.FOCUS_GROUP_ID + '="' + groupId + '"]');
        }
    }

    function isGroupStrict(groupId) {
        var group = getGroup(groupId);
        if (group) {
            return group.getAttribute(consts.FOCUS_GROUP) === 'strict';
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

    /**
     * Gets the parent id
     * @param el
     * @returns {string}
     */
    function getParentId(el) {
        if (el) {
            return el.getAttribute(consts.FOCUS_PARENT_ID);
        }
    }

    /**
     * Sets the parent id onto an element
     * @param el
     * @param id
     */
    function setParentId(el, id) {
        el.setAttribute(consts.FOCUS_PARENT_ID, id);
    }

    /**
     * Gets the target focus group's focus group so there is a hierarchy
     * @param el
     * @returns {string}
     */
    function getParentGroupId(el) {
        if (el) {
            return el.getAttribute(consts.FOCUS_PARENT_GROUP_ID);
        }
    }

    /**
     *
     * @param el
     * @param id
     */
    function setParentGroupId(el, id) {
        el.setAttribute(consts.FOCUS_PARENT_GROUP_ID, id);
    }

    /**
     * Gets the tabindex of a DOM element
     * @param el
     * @returns {string}
     */
    function getTabIndex(el) {
        if (el) {
            return el.getAttribute(consts.TAB_INDEX);
        }
    }

    /**
     * Sets the tabindex of a DOM element
     * @param el
     * @param index
     */
    function setTabIndex(el, index) {
        if (el) {
            if (index === null) {
                el.removeAttribute(consts.TAB_INDEX);
            } else {
                el.setAttribute(consts.TAB_INDEX, index);
            }
        }
    }

    /**
     * Checks of the container element contains the target element
     * @param containerEl
     * @param targetEl
     * @returns {boolean}
     */
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

    /**
     * Bubble sort determines the proper order of selectable elements.
     * @param list
     * @param compareFn
     * @returns {*}
     */
    function sort(list, compareFn) {
        var c, len, v, rlen, holder;
        if (!compareFn) { // default compare function.
            compareFn = function (a, b) {
                return a > b ? 1 : (a < b ? -1 : 0);
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