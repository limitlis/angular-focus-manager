/* global ux, utils */
angular.module('ux').directive('focusGroup', function (focusManager, focusQuery, focusDispatcher) {

    var groupId = 1,
        elementId = 1,
        dispatcher = focusDispatcher(),
        delay = 100;

    function compile(groupName, el) {
        var els, i, len, elementName;

        els = focusQuery.getElementsWithoutParents(el);
        len = els.length;
        i = 0;
        while (i < len) {
            elementName = 'element-' + elementId;
            focusQuery.setParentId(els[i], groupName);
            focusQuery.setElementId(els[i], elementName);

            var tabIndex = focusQuery.getTabIndex(els[i]);
            if (tabIndex === undefined || tabIndex === null) {
                focusQuery.setTabIndex(els[i], -1); // elements in focus manager should not be tab enabled through browser
            }

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
    }

    function linker(scope, element, attr) {

        var el = element[0];
        var groupName = 'group-' + (groupId++);
        var bound = false;
        var cacheHtml = '';
        var cacheCount = 0;
        var newCacheHtml = '';
        var newCacheCount = 0;

        function init() {
            scope.$on('focus::' + groupName, function () {
                compile(groupName, el);
                createBrowserEntryPoints();
            });

            if (!focusQuery.getContainerId(el)) { // this is an isolate focus group

                cacheHtml = el.innerHTML;
                cacheCount = cacheHtml.match(/<\w+/g).length;

                scope.$watch(utils.debounce(function () {
                    newCacheHtml = el.innerHTML;
                    if (cacheHtml !== newCacheHtml) {
                        newCacheCount = newCacheHtml.match(/<\w+/g).length;
                        if (cacheCount !== newCacheCount) {
                            var els = el.querySelectorAll('[focus-group]');
                            var i = els.length, groupId;
                            while (i) {
                                i -= 1;
                                groupId = els[i].getAttribute('focus-group-id');
                                scope.$broadcast('focus::' + groupId);
                            }
                        }
                        cacheHtml = newCacheHtml;
                        cacheCount = newCacheCount;
                    }
                    compile(groupName, el);
                    createBrowserEntryPoints();
                }, delay));

                dispatcher.on('focusin', utils.debounce(function (evt) {
                    // if group contains target then bind keys
                    if (focusQuery.contains(el, evt.newTarget)) {
                        if (bound === false) {
                            bound = true;
                            scope.$broadcast('bindKeys', groupName);
                        }
                    } else {
                        if (bound === true) {
                            bound = false;
                            scope.$broadcast('unbindKeys');
                        }
                    }
                }, delay));
            }
        }

        function createBrowserEntryPoints() {
            focusManager.callback = function (el) {
                focusQuery.setTabIndex(el, 0);
            };
            focusManager.findPrevChildGroup(groupName);
            focusManager.findNextElement(groupName);

            focusManager.callback = null;
        }

        function onFocus() {
            focusManager.enable();
        }

        el.addEventListener('focus', onFocus, true);

        // using timeout to allow all groups to digest before performing container check
        setTimeout(init, delay);

        focusQuery.setGroupId(el, groupName);
        compile(groupName, el);
    }

    return {
//        scope: true,
        link: linker
    };

})