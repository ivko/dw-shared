(function () {
    var BaseStorage = new Class({
        Extends: DW.Disposable,
        options: {
            defaultExpirationTime: 30
        },
        initialize: function (options) {
            $.extend(this.options, options);

            var self = this;
            this.init = DW.Utils.lazyDeferred(function (dfd) {
                return DW.When(self._initInternal())
                    .done(dfd.resolve)
                    .fail(dfd.reject);
            });
            this.init();//TODO call from outside if necessary
        },

        _initInternal: function () { },

        _getExpireDays: function (opts) {
            return ((opts ? opts.expireDays : null) || this.options.defaultExpirationTime);
        },
        contains: function (key) {
            return false;
        },
        write: function (key, value, expires) {
        },

        read: function (key, defaultValue) {
            return defaultValue;
        },

        remove: function (key) {
        }
    });

    extend(ns('DW'), {
        BaseStorage: BaseStorage
    });
})();