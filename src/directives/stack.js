ux.directive('focusStack', function (focusManager, focusQuery) {
    var stack = [];
    return {
        link: function (scope, element, attrs) {
            stack.push(focusQuery.getElementId(focusManager.activeElement));

            scope.$on('$destroy', function () {
                if (stack.length) {
                    var elementId = stack.pop();
                    var el = focusQuery.getElement(elementId);
                    if (el) {
                        focusManager.focus(el);
                    }
                }
            });
        }
    }
});