angular.module('fm').service('focusModel', function (focusQuery) {

    var scope = this;

    /**
     * Set the focus to a particular element
     * @param el
     * @returns {*|activeElement}
     */
    function focus(el) {
        if (typeof el === 'undefined') {
            return scope.activeElement;
        }

        scope.activeElement = el;

        el.focus();
    }

    /**
     * Public interface for invoking the next focus element
     */
    function next() {
        if (scope.activeElement) {
            var groupId = focusQuery.getParentId(scope.activeElement);
            var elementId = focusQuery.getElementId(scope.activeElement);
            findNextElement(groupId, elementId);
        } else {
            findNextElement();
        }
    }

    /**
     * Public interface for invoking the previous focus element
     */
    function prev() {
        if (scope.activeElement) {
            var groupId = focusQuery.getParentId(scope.activeElement);
            var elementId = focusQuery.getElementId(scope.activeElement);
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
        if (elements && elements.length) {
            if (elementId) {
                var element = focusQuery.getElement(elementId);
                var index = getElementIndex(elements, element);
                if (index > 0) {
                    return elements[index - 1];
                }
            } else {
                return elements[elements.length - 1];
            }
        }
    }

    function getPrevGroup(groups, groupId) {
        if (groups) {
            var group = focusQuery.getGroup(groupId);
            var index = getElementIndex(groups, group);
            if (index > 0) {
                return groups[index - 1];
            }
        }
    }

    function getNextElement(elements, elementId) {
        if (elements && elements.length) {
            if (elementId) {
                var element = focusQuery.getElement(elementId);
                var index = getElementIndex(elements, element);
                if (index !== -1 && index + 1 < elements.length) {
                    return elements[index + 1];
                }
            } else {
                return elements[0];
            }
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
        if (groupId) {
            var groups = focusQuery.getChildGroups(containerId);
            var nextGroup = getNextGroup(groups, groupId);
            if (nextGroup) {
                var nextGroupId = focusQuery.getGroupId(nextGroup);
                findNextElement(nextGroupId);
            } else {
                // no next group go up, if there is not a container, we are at the top of the isolate group
                var parentContainer = focusQuery.getGroup(containerId);
                var parentContainerId = focusQuery.getContainerId(parentContainer);
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

    /**
     * Only searches for child groups
     * @param groupId
     */
    function findNextChildGroup(groupId) {
        var groups = focusQuery.getChildGroups(groupId);
        if (groups.length) {
            var nextGroupId = focusQuery.getGroupId(groups[0]);
            findNextElement(nextGroupId);
        } else {
            // there are no child groups, go back up parent chain
            var group = focusQuery.getGroup(groupId);
            var containerId = focusQuery.getContainerId(group);
            findNextGroup(containerId, groupId);
        }
    }

    function findNextElement(groupId, elementId) {
        if (groupId) {
            var els = focusQuery.getGroupElements(groupId);
            var nextElement = getNextElement(els, elementId);
            if (nextElement) {
                // focus on next element
                focus(nextElement);
            } else {
                // there are no focus elements, go to next child focus group
                findNextChildGroup(groupId);
            }
        } else {
            // no group defined, find a group
            findNextGroup();
        }
    }

    function findPrevGroup(containerId, groupId) {
        if (containerId) {
            if (groupId) {
                var groups = focusQuery.getChildGroups(containerId);
                var prevGroup = getPrevGroup(groups, groupId);
                console.log('WHAT IS THE PREV GROUP', prevGroup);
                if (prevGroup) {
                    var prevGroupId = focusQuery.getGroupId(prevGroup);
                    findPrevChildGroup(prevGroupId);
                } else {
                    var parentContainer = focusQuery.getGroup(containerId);
                    var parentContainerId = focusQuery.getContainerId(parentContainer);
                    console.log('PARENT CONTAINER ID', parentContainerId, containerId);
                    if (parentContainerId) {
                        findPrevGroup(parentContainerId, containerId);
                    } else {
                        var els = focusQuery.getGroupElements(containerId);
                        if (els.length) {
                            findPrevElement(containerId);
                        } else {
                            findPrevElement(containerId);
                        }
                    }
                }
            } else {
                // TODO: Make this optional
                throw new Error('groupId required');
            }
        } else {
            groupId = focusQuery.getLastGroupId();
            findPrevChildGroup(groupId);
        }
    }

    function findPrevChildGroup(groupId) {
        console.log('findPrevChildGroup("{groupId}")'.supplant({
            groupId: groupId || ''
        }));

        if (groupId) {
            var groups = focusQuery.getChildGroups(groupId);
            if (groups.length) {
                var childGroupId = focusQuery.getGroupId(groups[groups.length - 1]);
                console.log('we got a child group', childGroupId);
                findPrevChildGroup(childGroupId);
//            findNextElement(nextGroupId);
            } else {
                console.log('there are no groups');
                findPrevElement(groupId);
            }
        } else {
            findPrevGroup();
        }
    }

    function findPrevElement(groupId, elementId) {
        if (groupId) {
            var els = focusQuery.getGroupElements(groupId);
            var prevEl = getPrevElement(els, elementId);
            if (prevEl) {
                // set focus to next element
                focus(prevEl);
            } else {
                // if there is a parent group then go to it, otherwise check for a loop
                var group = focusQuery.getGroup(groupId);
                var containerId = focusQuery.getContainerId(group);
                if (containerId) {
                    findPrevGroup(containerId, groupId);
                } else {
                    // if there was no parent group, we are at the top of the isolate group
                    if (focusQuery.isLoop(group)) {
                        findPrevChildGroup(groupId);
                    } // else do nothing
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

})