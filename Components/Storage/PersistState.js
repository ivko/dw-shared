(function () {
    var PersistState = new Class({
        options: {
            persistKey: null,
            storage: null
        },
        initialize: function (options) {
            $.extend(this.options, options);
        },
        persistItem: function (subkey, value) {
            if (!this.options.persistKey) return ko.observable(value);
            return ko.observable(value).extend({
                persist: {
                    key: this.options.persistKey + subkey,
                    storage: this.options.storage
                }
            });
        },
        updateItem: function (subkey, newValue, opts) {
            if (!this.options.persistKey) return;
            this.options.storage.write(this.options.persistKey + subkey, newValue, opts);
        },
        loadItem: function (subkey, defaultValue, skipExpirationUpdate) {
            if (!this.options.persistKey) return defaultValue;
            return this.options.storage.read(this.options.persistKey + subkey, defaultValue, skipExpirationUpdate);
        }
    });

    //var _mainKey;
    //var _storage;
    //var PersistFactory = {
    //    init: function (mainKey, storage) {
    //        _mainKey = mainKey;
    //        _storage = storage;
    //    },
    //    getPersistKey: function (persistKey) {
    //        return _mainKey + (persistKey || '');
    //    },
    //    getPersistState: function (persistKey) {
    //        var key = PersistFactory.getPersistKey(persistKey);
    //        return new PersistState({
    //            persistKey: key,
    //            storage: _storage
    //        });
    //    }
    //};
    //DW.PersistFactory = PersistFactory;

    //We can change the above factory to smth like this one below
    var PersistFactoryPrototype = {
        get: function (mainKey, storage, sessionStore) {
            return {
                getPersistState: function (persistKey) {
                    var key = mainKey + (persistKey || '');
                    return new PersistState({
                        persistKey: key,
                        storage: storage
                    });
                },
                getSessionPersistState: function (persistKey) {
                    var key = mainKey + (persistKey || '');
                    return new PersistState({
                        persistKey: key,
                        storage: sessionStore
                    });
                }
            };
        }
    };

    extend(ns('DW'), {
        PersistState: PersistState,
        PersistFactoryPrototype: PersistFactoryPrototype
    });
})();