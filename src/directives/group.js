ux.directive('focusGroup', function (focusModel, focusQuery, focusDispatcher) {

    var groupId = 1;
    var elementId = 1;
    var dispatcher = focusDispatcher();

    function compile(el) {
        var els, i, len, elementName;

        var groupName = 'group-' + groupId;

        focusQuery.setGroupId(el, groupName);

        els = focusQuery.getElementsWithoutParents(el);
        len = els.length;

        i = 0;
        while (i < len) {
            elementName = 'element-' + elementId;
            focusQuery.setParentId(els[i], groupName);
            focusQuery.setElementId(els[i], elementName);
            focusQuery.setTabIndex(els[i], -1); // elements in focus manager should not be tab enabled through browser
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

        // using timeout to allow all groups to digest before performing container check
        setTimeout(function () {
            if (!focusQuery.getContainerId(el)) {
                dispatcher.on('focusin', utils.debounce(function (evt) {
                    // if group contains target then bind keys
                    if (focusQuery.contains(el, evt.newTarget)) {
                        if (bound === false) {
                            bound = true;
                            scope.$broadcast('bindKeys', groupName);
//                            console.log('bind', groupName);
                        }
                    } else {
                        if (bound === true) {
                            bound = false;
                            scope.$broadcast('unbindKeys');
//                            console.log('unbind', groupName);
                        }
                    }
                }, 100));
            }
        }, 10);

        groupName = compile(el)
    }

    return {
        scope: true,
        link: linker
    };

})