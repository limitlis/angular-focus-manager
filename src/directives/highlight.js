ux.directive('focusHighlight', function (focusManager, focusDispatcher) {

    var dispatcher = focusDispatcher();

    return {
        scope: true,
        replace: true,
        link: function (scope, element, attrs) {
            var el = element[0];
            document.addEventListener('focus', utils.throttle(function (evt) {
                if (focusManager.canReceiveFocus(evt.target)) {
                    var rect = evt.target.getBoundingClientRect();
                    el.style.left = rect.left + 'px';
                    el.style.top = rect.top + 'px';
                    el.style.width = rect.width + 'px';
                    el.style.height = rect.height + 'px'
                }
            }, true), 100);
        },
        template: '<div class="focus-highlight"></div>'
    }
})