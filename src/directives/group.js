ux.directive('focusGroup', function (focusQuery) {

    var groupId = 1;
    var elementId = 1;
    var activeGroupName = null;
    var prevGroupName = null;

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

        setTimeout(function () {
            if (!focusQuery.getContainerId(el)) {

                scope.$on('focusIn', utils.debounce(function (evt) {
                    if (activeGroupName !== groupName) {
                        activeGroupName = groupName;
                        scope.$broadcast('bindKeys');
                    }
                }, 100));

                scope.$on('focusOut', utils.debounce(function (evt) {
                    if (activeGroupName !== groupName) {
                        scope.$broadcast('unbindKeys');
                    }
                }, 200));
            }
        }, 10);

        groupName = compile(el)
    }

    return {
        scope: true,
        link: linker
    };

})