ux.directive('focusElement', function (focusModel, focusQuery) {

    function linker(scope, element, attr) {
        var el = element[0];
        if (focusQuery.isAutofocus(el)) {
            setTimeout(function(){
                focusModel.focus(el);
            });
        }
    }

    return {
        link: linker
    };

})