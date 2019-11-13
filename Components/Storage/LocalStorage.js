(function () {
    var LocalStorage = new Class({
        Extends: DW.BaseStorage,
        options: {},
        _storage: null,
        initialize: function (/*options*/) {
            //$.extend(this.options, options || {});
            this.parent();
        },

        _initInternal: function () {
            var self = this;
            return DW.When(this._getStorage())
                .done(function (storage) {
                    self._storage = storage;
                    self._invalidate();
                });
        },

        _getStorage: function () {
            var nativeLocalStorage,
                data;
            if (DW.Utils.supportsLocalStorage()) {
                nativeLocalStorage = window.localStorage;
                data = window.localStorage;
            }
            else {
                nativeLocalStorage = {
                    setItem: function () { },
                    getItem: function () { },
                    removeItem: function () { }
                    //hasOwnProperty: function () { } native JSON function
                };
                data = {};
            }
            return {
                data: data,
                setItem: function (key, value) {
                    nativeLocalStorage.setItem(key, JSON.stringify(value));
                },
                getItem: function (key) {
                    var item = nativeLocalStorage.getItem(key);
                    return item ? JSON.parse(item) : { dwWebClientExpireDate: NaN, value: '' };
                },
                containsItem: function (key) {
                    return nativeLocalStorage.hasOwnProperty(key);
                },
                removeItem: function (key) {
                    nativeLocalStorage.removeItem(key);
                }
            };
        },

        _invalidate: function () {

            var currentDate = new Date(),
                keysToRemove = [],
                expireDate = null;

            for (var key in this._storage.data) {
                try {
                    expireDate = new Date(this._storage.getItem(key).dwWebClientExpireDate);
                    if (!isNaN(expireDate) && currentDate > expireDate) keysToRemove.push(key);
                }
                catch (e) { }
            }

            for (var i = 0; i < keysToRemove.length; i++) {
                this.remove(keysToRemove[i]);
            }
        },

        contains: function (key) {
            return this._storage.containsItem(key);
        },

        write: function (key, value, opts) {
            var d = new Date();
            d.setDate(d.getDate() + this._getExpireDays(opts));
            try {
                this._storage.setItem(key, {
                    value: value,
                    dwWebClientExpireDate: d.toISOString()
                }, opts);
            }
            catch (e) { }
        },

        read: function (key, defaultValue, skipExpirationUpdate) {
            var res = null;
            try {
                if (this._storage.containsItem(key)) {
                    res = this._storage.getItem(key).value;
                    if (!skipExpirationUpdate) this.write(key, res);
                }
            }
            catch (e) { }
            return DW.Utils.isRealObject(res) ? res : defaultValue;
        },

        remove: function (key) {
            try {
                this._storage.removeItem(key);
            }
            catch (e) { }
        }
    });
    var SessionLocalStorage = new Class({
        Extends: DW.BaseStorage,
        options: {},
        _storage: null,
        initialize: function (/*options*/) {
            //$.extend(this.options, options || {});
            this.parent();
        },

        _initInternal: function () {
            var self = this;
            return DW.When(this._getStorage())
                .done(function (storage) {
                    self._storage = storage;
                });
        },

        _getStorage: function () {
            var nativeLocalStorage,
                data;
            if (DW.Utils.supportsSessionLocalStorage()) {
                nativeLocalStorage = window.sessionStorage;
                data = window.sessionStorage;
            }
            else {
                nativeLocalStorage = {
                    setItem: function () { },
                    getItem: function () { },
                    removeItem: function () { }
                    //hasOwnProperty: function () { } native JSON function
                };
                data = {};
            }
            return {
                data: data,
                setItem: function (key, value) {
                    nativeLocalStorage.setItem(key, JSON.stringify(value));
                },
                getItem: function (key) {
                    var item = nativeLocalStorage.getItem(key);
                    return item ? JSON.parse(item) : '';
                },
                containsItem: function (key) {
                    return nativeLocalStorage.hasOwnProperty(key);
                },
                removeItem: function (key) {
                    nativeLocalStorage.removeItem(key);
                }
            };
        },

        contains: function (key) {
            return this._storage.containsItem(key);
        },

        write: function (key, value) {
           
            try {
                this._storage.setItem(key, value);
            }
            catch (e) { }
        },

        read: function (key, defaultValue) {
            var res = null;
            try {
                if (this._storage.containsItem(key)) {
                    res = this._storage.getItem(key);
                }
            }
            catch (e) { }
            return DW.Utils.isRealObject(res) ? res : defaultValue;
        }
       
    });
    extend(ns('DW'), {
        LocalStorage: LocalStorage,
        SessionLocalStorage: SessionLocalStorage
    });
})();