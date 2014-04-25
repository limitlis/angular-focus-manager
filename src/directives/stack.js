ux.directive('focusStack', function (focusModel, focusQuery) {
    var stack = [];
    return {
        link: function (scope, element, attrs) {
            stack.push(focusQuery.getElementId(focusModel.activeElement));

            scope.$on('$destroy', function () {
                if (stack.length) {
                    var elementId = stack.pop();
                    var el = focusQuery.getElement(elementId);
                    if (el) {
                        focusModel.focus(el);
                    }
                }
            });
        }
    }
});