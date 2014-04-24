angular.module('fm').service('focusModel', function (focusQuery) {

    var scope = this;

//    var console = {
//        log: function () {
//        }
//    };

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
        if (scope.focusElement) {
            var groupId = focusQuery.getParentId(scope.focusElement);
            var elementId = focusQuery.getElementId(scope.focusElement);
            console.log('next', groupId, elementId);
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
        var element = focusQuery.getElement(elementId);
        var index = getElementIndex(elements, element);
        console.log('index is', index);
        if (index > 0) {
            return elements[index - 1];
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
            groupId = focusQuery.getFirstGroupId();
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

    function findPrevGroup(containerId, groupId) {
        console.log('findPrevGroup("{containerId}", "{groupId}")'.supplant({
            containerId: containerId || '',
            groupId: groupId || ''
        }));

        if (containerId) {
            if(groupId) {
                var groups = focusQuery.getChildGroups(containerId);
                var prevGroup = getPrevGroup(groups, groupId);
                console.log('WHAT IS THE PREV GROUP', prevGroup);
                if(prevGroup) {
                    var prevGroupId = focusQuery.getGroupId(prevGroup);
                    findPrevChildGroup(prevGroupId);
                } else {
                    var parentContainer = focusQuery.getGroup(containerId);
                    var parentContainerId = focusQuery.getContainerId(parentContainer);
                    console.log('PARENT CONTAINER ID', parentContainerId, containerId);
                    if (parentContainerId) {
                        findPrevGroup(parentContainerId, containerId);
                    } else {
                        findPrevElement(containerId);
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
        console.log('findNextElement("{groupId}", "{elementId}")'.supplant({
            groupId: groupId || '',
            elementId: elementId || ''
        }));

        if (groupId) {
            if (elementId) {
                var els = focusQuery.getGroupElements(groupId);
                console.log('FIND NEXT SIBLING ELMENT');
                var prevEl = getPrevElement(els, elementId);
                console.log('whois', prevEl);
                if(prevEl) {
                    focus(prevEl);
                } else {
                    console.log('NO PREV ELS');
                    var group = focusQuery.getGroup(groupId);
                    var containerId = focusQuery.getContainerId(group);
                    if(containerId) {
                        findPrevGroup(containerId, groupId);
                    } else {
                        console.log('#### SHOULD WE LOOP');
                        findPrevChildGroup(groupId);
                    }
                }
            } else {
                console.log('FIND LAST ELEMENT');
                var els = focusQuery.getGroupElements(groupId);
                if (els.length) {
                    console.log('FOUND ELEMENTS');
                    focus(els[els.length - 1]);
                } else {
                    console.log('NO ELEMENTS FOUND');
                    findPrevChildGroup(groupId);
                }
            }
        } else {
            findPrevChildGroup();
        }
    }

    this.focusElement = null;
    this.focus = focus;
    this.prev = prev;
    this.next = next;

})