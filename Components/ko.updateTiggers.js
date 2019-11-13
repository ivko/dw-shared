(function (factory) {
    if (typeof define === "function" && define.amd) { // AMD.
        define(["jquery", "knockout", "mootools-core", "./utils"], factory);
    } else { // Global
        factory(jQuery, ko);
    }
}(function ($, ko) {
    ko.updateTriggers = function (components, callback) {
        var triggers = [];
        Object.keys(components).forEach(function (key) {
            var vm = components[key],
                component = ko.updateTriggers.components[key];
            if (component) {
                Array.prototype.push.apply(triggers, component.call(null, vm, callback));
            }
        });
        return {
            dispose: function () {
                DW.Utils.dispose(triggers);
            }
        };
    };

    ko.updateTriggers.components = {
        observable: function (observable, callback) {
            var computed = ko.computed(function () {
                observable();
            }).extend({ notify: 'always' });

            var throttle = computed.extend({ throttle: 2 }); // ? 

            var subscribtion = computed.subscribe(callback);

            return [computed, subscribtion, throttle];
        },
        observables: function (observables, callback) {

            var computed = ko.computed(function () {
                observables.forEach(function (observable) {
                    observable && observable();
                });
            }).extend({ notify: 'always' });

            var throttle = computed.extend({ throttle: 2 }); // ? 

            var subscribtion = computed.subscribe(callback);

            return [computed, subscribtion, throttle];
        },
        autocompleteMenu: function (vm, callback) {
            var computed = ko.computed(function () {
                vm.getListLength();
                return vm.visible();
            }).extend({ notify: 'always' });

            var throttle = computed.extend({ throttle: 2 });

            var subscribtion = computed.subscribe(function (val) {
                return val ? callback() : null;
            });

            return [computed, subscribtion, throttle];
        }
    };

}));