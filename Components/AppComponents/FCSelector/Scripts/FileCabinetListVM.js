(function () {
    var FileCabinetListVM = new Class({
        Extends: DW.ViewModel,
        options: {
        },

        initialize: function (options) {
            this.ready = ko.observable(false);

            this.parent();

            $.extend(this.options, options);

            if (this.options.connectionSettings) {
                this.organizationName = ko.observable(this.options.connectionSettings.organizationName);
                this.platformUrl = ko.observable(this.options.connectionSettings.platformUrl);
                this.username = ko.observable(this.options.connectionSettings.username);
                this.password = ko.observable(this.options.connectionSettings.password);
            }

            this.fileCabinets = ko.observableArray();
        },

        _initInternal: function () {
        }
    });

    extend(ns('DW.FCSelector'), {
        FileCabinetListVM: FileCabinetListVM
    });
})();
