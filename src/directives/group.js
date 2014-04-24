angular.module('fm').directive('focusGroup', function (focusQuery) {

    var groupId = 1;
    var elementId = 1;

    function compile(el) {
        var els, i, len, elementName;

        var groupName = 'group-' + groupId;

        focusQuery.setGroupId(el, groupName);

//        els = el.querySelectorAll(':not([parent-id])');
        els = focusQuery.getElementsWithoutParents(el);
        len = els.length;

        i = 0;
        while (i < len) {
            elementName  = 'element-' + elementId;
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
    }

    function linker(scope, el, attr) {
        compile(el[0]);
    }

    return { link: linker };

})