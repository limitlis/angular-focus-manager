ux.directive('focusHighlight', function (focusModel, focusDispatcher) {

    var dispatcher = focusDispatcher();

    return {
        scope: true,
        replace: true,
        link: function (scope, element, attrs) {
            var el = element[0];
            dispatcher.on('focusin', utils.throttle(function(evt){
                var rect = evt.newTarget.getBoundingClientRect();
                el.style.left = rect.left + 'px';
                el.style.top = rect.top + 'px';
                el.style.width = rect.width + 'px';
                el.style.height = rect.height + 'px'
            }, 100));
        },
        template: '<div class="focus-highlight"></div>'
    }
})