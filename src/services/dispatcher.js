/* global angular, utils, moduleName */
angular.module(moduleName).factory('focusDispatcher', function () {

    var dispatchers = {};

    function EventDispatcher() {
        this.events = {};
    }

    EventDispatcher.prototype.events = {};
    EventDispatcher.prototype.on = function (key, func) {
        if (!this.events.hasOwnProperty(key)) {
            this.events[key] = [];
        }
        this.events[key].push(func);
    };
    EventDispatcher.prototype.off = function (key, func) {
        if (this.events.hasOwnProperty(key)) {
            for (var i in this.events[key]) {
                if (this.events[key][i] === func) {
                    this.events[key].splice(i, 1);
                }
            }
        }
    };
    EventDispatcher.prototype.trigger = function (key, dataObj) {
        if (this.events.hasOwnProperty(key)) {
            dataObj = dataObj || {};
            dataObj.currentTarget = this;
            var evtItem = this.events[key];
            for (var i in evtItem) {
                if (evtItem.hasOwnProperty(i)) {
                    evtItem[i](dataObj);
                }
            }
        }
    };

    function dispatcher(name) {
        name = name || 'fm';
        if (!dispatchers[name]) {
            dispatchers[name] = new EventDispatcher();
        }
        return dispatchers[name];
    }

    return dispatcher;
});