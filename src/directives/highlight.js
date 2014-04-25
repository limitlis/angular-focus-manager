ux.directive('focusHighlight', function (focusModel) {

    return {
        scope: true,
        replace: true,
        link: function (scope, element, attrs) {
            var el = element[0];
            document.addEventListener('focusin', utils.throttle(function (evt) {
                var rect = focusModel.activeElement.getBoundingClientRect();
                el.style.left = rect.left + 'px';
                el.style.top = rect.top + 'px';
                el.style.width = rect.width + 'px';
                el.style.height = rect.height + 'px'
            }, 100));
        },
        template: '<div class="focus-highlight"></div>'
    }
})