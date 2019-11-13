(function () {    
    var ConnectionDialogVM = new Class({
        Extends: DW.BaseDialogVM,
        initialize: function (options) {
            this.parent(options);

            var self = this;

            this.originalSettings = this.options.connectionSettings;
                   
            if (this.options.connectionSettings) {
                this.platformUrl = ko.observable(this.options.connectionSettings.platformUrl).extend({
                    required: { params: true, message: DW.ConnectionDialog.localize('ConnectionDialog_MissingUrl_Text') },
                    minLength: { params: 1, message: DW.ConnectionDialog.localize('ConnectionDialog_MissingUrl_Text') },
                    maxLength: { params: 1000, message: DW.ConnectionDialog.localize('ConnectionDialog_LongUrl_Text', 1000) },
                    pattern: {
                        message: DW.ConnectionDialog.localize('ConnectionDialog_RegExpUrl_Text'),
                        params: /^(http(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$)/i
                    }
                }).isModified(false);

                //var predefinedUrl = ko.utils.arrayFirst(this.predefinedUrls(), function (item) {
                //    if (self.options.connectionSettings.platformUrl && item.Url.toLowerCase() === self.options.connectionSettings.platformUrl.toLowerCase()) {
                //        return item;
                //    }

                //    return undefined;
                //});
                //if (predefinedUrl) {
                //    this.usePredefinedUrls(true);
                //    this.selectedPredefinedUrl(this.options.connectionSettings.platformUrl);
                //}
                                
                this.organizationName = ko.observable(this.options.connectionSettings.organizationName).extend({
                    required: { params: true, message: DW.ConnectionDialog.localize('ConnectionDialog_MissingOrganizationName_Text') },
                    minLength: { params: 1, message: DW.ConnectionDialog.localize('ConnectionDialog_MissingOrganizationName_Text') },
                    maxLength: { params: 255, message: DW.ConnectionDialog.localize('ConnectionDialog_LongOrganizationName_Text', 255) }
                }).isModified(false);
                this.username = ko.observable(this.options.connectionSettings.username).extend({
                    required: { params: true, message: DW.ConnectionDialog.localize('ConnectionDialog_MissingUsername_Text') },
                    minLength: { params: 1, message: DW.ConnectionDialog.localize('ConnectionDialog_MissingUsername_Text') },
                    maxLength: { params: 255, message: DW.ConnectionDialog.localize('ConnectionDialog_LongUsername_Text', 255) }
                }).isModified(false);
                this.password = ko.observable(this.options.connectionSettings.password).extend({
                    required: { params: true, message: DW.ConnectionDialog.localize('ConnectionDialog_MissingPassword_Text') },
                    minLength: { params: 1, message: DW.ConnectionDialog.localize('ConnectionDialog_MissingPassword_Text') },
                    maxLength: { params: 50, message: DW.ConnectionDialog.localize('ConnectionDialog_LongPassword_Text', 50) }
                }).isModified(false);

                this.groupErrors = ko.validation.group([this.platformUrl, this.organizationName, this.username, this.password]);
                this.errors = this.addDisposable(ko.computed(function () {
                    return Array.prototype.concat([], self.groupErrors());
                }, this));
            }
        },        
        hasChanges: function () {
            return !DW.Utils.isEqual(this.originalSettings, this.buildProperties());
        },
        applyChanges: function () {
            this.fixPlatformUrl();
            return DW.Deferred(function (dfd) {                
                dfd.resolve(this.buildProperties());
            }.bind(this));
        },
        buildProperties: function () {
            return {
                platformUrl: this.platformUrl(),
                organizationName: this.organizationName(),
                username: this.username(),
                password: this.password()
            };
        },
        validate: function () {
            var errors = this.errors();
            if (errors.length) {
                this.platformUrl.isModified(true);
                this.organizationName.isModified(true);
                this.username.isModified(true);
                this.password.isModified(true);
                toastr.error('', errors[0]);
                return false;
            }
            return true;
        },
        concatUrl: function(firstString, secondString) {            
            if (firstString && !firstString.endsWith('/'))
            {
                firstString += '/';
            }
            firstString += secondString;
            return firstString;
        },
        fixPlatformUrl: function() {
            var url = this.platformUrl().toLowerCase();
            if (url) {
                if (!(url.endsWith('platform') || url.endsWith('platform/'))) {
                    if (!url.endsWith('/')) {
                        url += '/platform';
                    } else {
                        url += 'platform';
                    }
                }

                this.platformUrl(url);
            }
        }
    });

    extend(ns('DW.ConnectionDialog'), {
        ConnectionDialogVM: ConnectionDialogVM
    });
})();