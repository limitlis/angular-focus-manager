angular.module('fm').service('focusModel', function (focusQuery) {

    var scope = this;

    var console = {
        log: function () {
        }
    };

    /**
     * Set the focus to a particular element
     * @param el
     * @returns {*|focusElement}
     */
    function focus(el) {
        if (typeof el === 'undefined') {
            return scope.focusElement;
        }

        scope.focusElement = el;

        el.focus();
    }

    /**
     * Public interface for invoking the next selectable element
     */
    function next() {
        if (scope.focusElement) {
            var groupId = focusQuery.getParentId(scope.focusElement);
            var elementId = focusQuery.getElementId(scope.focusElement);
            console.log('next', groupId, elementId);
            findNextElement(groupId, elementId);
        } else {
            findNextElement();
        }
    }

    function prev() {

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

    function getNextElement(elements, elementId) {
        var element = focusQuery.getElement(elementId);
        var index = getElementIndex(elements, element);
        if (index !== -1 && index + 1 < elements.length) {
            return elements[index + 1];
        }
    }

    function getNextGroup(groups, groupId) {
        if (groups) {
            var group = focusQuery.getGroup(groupId);
            var index = getElementIndex(groups, group);
            if (index !== -1 && index + 1 < groups.length) {
                return groups[index + 1];
            }
        }
    }

    function findNextGroup(containerId, groupId) {
        console.log('findNextGroup("{containerId}", "{groupId}")'.supplant({
            containerId: containerId || '',
            groupId: groupId || ''
        }));

        if (groupId) {
            console.log('#### WE ARE HERE ####', containerId, groupId);
            var groups = focusQuery.getChildGroups(containerId);
            var nextGroup = getNextGroup(groups, groupId);
            console.log('WHAT IS THE NEXT GORUP', nextGroup);
            if (nextGroup) {
                var nextGroupId = focusQuery.getGroupId(nextGroup);
                console.log('### call findNExtElement', nextGroupId);
                // TODO: call findNextElement(groupId);
                findNextElement(nextGroupId);
            } else {
                console.log('NO NEXT GROUP GO UP');
                var parentContainer = focusQuery.getGroup(containerId);
                var parentContainerId = focusQuery.getContainerId(parentContainer);
                console.log('PARENT CONTAINER ID', parentContainerId, containerId);
                if (parentContainerId) {
                    findNextGroup(parentContainerId, containerId);
                } else {
                    console.log('##### SHOULD WE LOOP ######');
                    findNextElement(containerId);
                }
            }
        } else {
            var groupEl = document.querySelector('[focus-group]');
            var groupId = focusQuery.getGroupId(groupEl);
            findNextElement(groupId);
        }
    }

    /**
     * Only searches for child groups
     * @param groupId
     */
    function findNextChildGroup(groupId) {
        console.log('findNextChildGroup("{groupId}")'.supplant({
            groupId: groupId || ''
        }));

        var groups = focusQuery.getChildGroups(groupId);
        if (groups.length) {
            var nextGroupId = focusQuery.getGroupId(groups[0]);
            console.log('we got a child group', nextGroupId);
            findNextElement(nextGroupId);
        } else {
            console.log('there are no groups');
            var group = focusQuery.getGroup(groupId);
            var containerId = focusQuery.getContainerId(group);
            console.log('group is', group);
            console.log('container id', focusQuery.getContainerId(group));
            findNextGroup(containerId, groupId);
        }
    }

    function findNextElement(groupId, elementId) {
        console.log('findNextElement("{groupId}", "{elementId}")'.supplant({
            groupId: groupId || '',
            elementId: elementId || ''
        }));
        if (groupId) {
            console.log('there is a group id', groupId);
            var els = focusQuery.getGroupElements(groupId);
            if (els.length) {
                console.log('there are children');
                if (elementId) {
                    var nextElement = getNextElement(els, elementId);
                    if (nextElement) {
                        console.log('we have the next element');
                        focus(nextElement);
                    } else {
                        console.log('there is no next element');
                        findNextChildGroup(groupId);
                    }
                } else {
                    console.log('setting focus on first element');
                    focus(els[0]);
                }
            } else {
                console.log('no children');
                findNextChildGroup(groupId);
            }
        } else {
            findNextGroup();
        }
    }

    function findPrevGroup() {
    }

    function findPrevChildGroup() {
    }

    function findPrevElement() {
    }

    this.focusElement = null;
    this.focus = focus;
    this.prev = prev;
    this.next = next;

})