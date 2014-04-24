angular.module('fm').service('focusQuery', function () {

    // http://quirksmode.org/dom/core/
    var query = $;

    var focusElementId = 'focus-element-id';
    var focusGroupId = 'focus-group-id';
    var focusParentId = 'focus-parent-id';
    var focusContainerId = 'focus-container-id';

    var focusGroup = 'focus-group';
    var focusElement = 'focus-element';
    var focusEnabled = 'focus-enabled';
//    var selectable = 'A,SELECT,BUTTON,INPUT,TEXTAREA,*[tabindex]';

    function isRoot(el) {
        return !this.parentId(groupId);
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

    function getGroupContainer(group) {
        var containerId = group.getAttribute('focus-container-id');
        var q = '[{focusGroupId}="{containerId}"]'.supplant({
            focusGroupId: focusGroupId,
            containerId: containerId
        });
        return document.querySelector(q);
    }

    function getChildGroups(groupId) {
        return document.querySelectorAll('[{focusContainerId}="{groupId}"]'.supplant({
            focusContainerId: focusContainerId,
            groupId: groupId
        }));
    }

    function getElementsWithoutParents(el) {
//        return el.querySelectorAll(':not([' + focusParentId + '])');

        var query = 'A:not({focusParentId}),' +
            'SELECT:not({focusParentId}),' +
            'BUTTON:not({focusParentId}),' +
            'INPUT:not({focusParentId}),' +
            'TEXTAREA:not({focusParentId}),' +
            '*[tabindex]:not({focusParentId})';

        query = query.supplant({focusParentId: '[' + focusParentId + ']'});

        return el.querySelectorAll(query);
    }

    function getGroupsWithoutContainers(el) {
        var q = '[' + focusGroupId + ']:not([' + focusContainerId + '])';
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

//                if ($el.hasClass('disabled')) {
//                    i += 1;
//                    continue;
//                }

//                if ($el.attr('disabled')) {
//                    i += 1;
//                    continue;
//                }

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
        return el.getAttribute(focusElement) === 'autofocus';
    }

    function isEnabled(el) {
        return el.getAttribute(focusEnabled) !== 'false';
    }

    function getElement(elementId) {
        var q = '[{focusElementId}="{elementId}"]'.supplant({
            focusElementId: focusElementId,
            elementId: elementId
        });
        return document.querySelector(q);
    }

    function getGroup(groupId) {
        return document.querySelector('[' + focusGroupId + '="' + groupId + '"]');
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

    function group(elementOrGroupId) {
        if (isNaN(elementOrGroupId)) {
            elementOrGroupId = this.parentId(elementOrGroupId);
        }
        return document.querySelector('[' + focusGroupId + '="' + elementOrGroupId + '"]');
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
    this.getGroup = getGroup;
    this.getFirstGroupId = getFirstGroupId;
    this.getLastGroupId = getLastGroupId;

    this.isRoot = isRoot;
    this.getElementsWithoutParents = getElementsWithoutParents;
    this.getGroupsWithoutContainers = getGroupsWithoutContainers;
    this.isAutofocus = isAutofocus;
    this.isEnabled = isEnabled;
    this.group = group;
    this.getGroupElements = getGroupElements;
    this.getGroupContainer = getGroupContainer;
    this.getChildGroups = getChildGroups;
    this.contains = contains;

})