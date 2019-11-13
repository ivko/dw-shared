(function (ko) {
    ko.extenders.persist = function (target, options) {
        // Load existing value from localStorage if set
        target(options.storage.read(options.key, target()));
        var oldValue = target();
        // Subscribe to new values and add them to localStorage   
        var subscription = target.subscribe(function (newValue) {
            if (DW.Utils.isEqual(oldValue, newValue)) return;

            options.storage.write(options.key, newValue);
            oldValue = newValue;
        });

        target.dispose = function () {
            subscription.dispose();
        };

        target.removeFromStorage = function () {
            oldValue = null;
            options.storage.remove(options.key);
        };

        return target;
    };
})(ko);