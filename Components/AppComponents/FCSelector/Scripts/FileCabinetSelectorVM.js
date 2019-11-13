(function () {
    var _settings = dev.docuware.com.settings;

    var FileCabinetSelectorVM = new Class({
        Extends: DW.ViewModel,
        options: {
        },
        initialize: function (options) {
            this.parent();

            $.extend(this.options, options);

            this.ready = ko.observable(true);
            this.connDialogCommponentApi = new DW.ConnectionDialog.ComponentApi();

                                    
            var self = this;

            this.invalid = false;
            this.remoteFileCabinetsList = ko.observable();
                        
            this.remoteFileCabinetsListVisible = ko.computed(function () { return self.remoteFileCabinetsList() });

            this.finished = $.Deferred();

            this.selectedFileCabinet = ko.observable();
            this.dwActivityLeftOffset = ko.observable(options.dwActivityLeftOffset);

            this.initialLoading = false;

            //Store settings if connection fails
            this.connectionSettingsCache = {
                isEmpty: true,
                platformUrl: "",
                organizationName: "",
                username: ""
            };
           
            this.selectedFileCabinetName = ko.computed(function () { return self.selectedFileCabinet() ? self.selectedFileCabinet().Name : null });

            this.selectedFileCabinetDisplayName = ko.computed(function () {
                if (self.selectedFileCabinet()) {
                    return self.selectedFileCabinet().Name + ' ' + (self.selectedFileCabinet().IsRemote ? ' (' + DW.FCSelector.localize('Other_Organization_Placeholder_Text') + ')' : '');
                }
            });                
                                                                      
            this.localFileCabinetsList = ko.observable(
                new DW.FCSelector.FileCabinetListVM({
                    connectionSettings: {         
                        organizationName: options.organizationName,
                        username: options.userName
                    }
                })
            );

            //this.commands = new DW.FCSelector.CommandsBundle();

            this.otherOrganization = ko.observable(this.options.otherOrganization);
                                                            
            this._init = DW.Utils.lazyDeferred(function (dfd) {
                self.ready(false);
                return DW.When(self._initInternal())
                    .done(function (result) {
                        dfd.resolve(result);
                    })
                    .fail(function (error) {
                        DW.Utils.handleError(error);
                        dfd.reject();
                    })
                    .always(function () {
                        self.ready(true);
                    });
            });

            this._init().then(function () {
                self.finished.resolve();
            });
        },
        _initInternal: function () {
            var fileCabinetInfo = this.options.fileCabinetInfo;
            var self = this;
                        
            var oldFileCabinet = self.selectedFileCabinet();
            self.selectedFileCabinet.subscribe(function (newVal) {
                oldFileCabinet = self.selectedFileCabinet();
            }, this, "beforeChange");

            /*self.selectedFileCabinet.subscribe(function (newVal) {
                self.selectedFileCabinetChanged(self.initialLoading, oldFileCabinet, newVal);
                self.initialLoading = false;
            });*/

            return this._fillLocalFileCabinets(fileCabinetInfo,
                this.options.fileCabinets,
                this.options.showVersionControlFileCabinet).then(function() {
                if (fileCabinetInfo &&
                    fileCabinetInfo.Connection &&
                    fileCabinetInfo.Connection.PlatformUrl &&
                    fileCabinetInfo.OrganizationName &&
                    (fileCabinetInfo.Connection.Username || 
                    self.options.settingsGuid)) {
                    return self._fillRemoteFileCabinets(
                        fileCabinetInfo.Connection.PlatformUrl,
                        fileCabinetInfo.OrganizationName,
                        fileCabinetInfo.Connection.Username,
                        fileCabinetInfo.Connection.Password,
                        fileCabinetInfo,
                        self.options.settingsGuid,
                        self.options.isTarget,
                        self.options.showOtherOrganizationVersionControlFileCabinet);
                    }

                    return null;
                });
        },        
        _fillLocalFileCabinets: function (selectedFileCabinetInfo, fileCabinets, versionControl)
        {      
            var dfd = DW.Deferred();
            var utils = new DW.FCSelector.Utils();
            var self = this;
            self.initialLoading = false;

            var fileCabinetsArray = fileCabinets;

            if (!versionControl) {
                fileCabinetsArray = fileCabinets
                    .filter(function (fileCabinet) {
                        return fileCabinet.Options.VersionManagement === _settings.filecabinet.VersionManagement.None;
                    });
            }

            fileCabinetsArray = fileCabinetsArray
                .map(function (fileCabinet) {
                    var fileCabinetVM = {
                        Name: fileCabinet.Header.Name,
                        Guid: fileCabinet.Header.Guid,
                        Color: utils.convertFCColorToString(fileCabinet.Header.ColorAsString),
                        VersionManagement: fileCabinet.Options.VersionManagement !== _settings.filecabinet.VersionManagement.None,
                        MasterFCGuid: fileCabinet.MasterFCGuid,
                        ConnectionSettings: null,
                        Fields: fileCabinet.Fields
                            .filter(function (field) { return field.UserDefined })
                            //.map(function (field) {
                            //    return {
                            //        Name: field.Name,
                            //        DBName: field.DBName,
                            //        DWType: field.DWType,
                            //        Length: field.DWLength,
                            //        Precision: field.DigitsAfterDecimalPoint
                            //    }
                            //})
                    };

                    if (selectedFileCabinetInfo && !selectedFileCabinetInfo.IsRemote && fileCabinet.Header.Guid === selectedFileCabinetInfo.FileCabinetGuid) {
                        fileCabinetVM.IsRemote = false;
                        self.initialLoading = true;
                        self.selectedFileCabinet(fileCabinetVM);
                    }

                    return fileCabinetVM;
                });

            fileCabinetsArray = fileCabinetsArray.sort(function (a, b) {
                var nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase();
                if (nameA < nameB)
                    return -1;
                if (nameA > nameB)
                    return 1;
                return 0;
            });

            dfd.resolve(fileCabinetsArray);

            self.localFileCabinetsList().fileCabinets(fileCabinetsArray);

            return dfd.promise();
        },
        _fillRemoteFileCabinets: function (platformUrl, organizationName, username, password, selectedFileCabinetInfo, settingsGuid, isTarget, versionControl)
        {
            var self = this;
            self.initialLoading = false;

            return self.options.getRemoteFileCabinets(platformUrl, organizationName, username, password, settingsGuid, isTarget)
            .then(function (fileCabinets) {
                // There is an error
                if (fileCabinets.ErrorMessage)
                {
                    if (self.selectedFileCabinet() && self.selectedFileCabinet().IsRemote)
                    {                        
                        self.selectedFileCabinet(null);
                    }

                    toastr.error('',
                        DW.FCSelector.localize('Error_Getting_FileCabinets') + " " + fileCabinets.ErrorMessage);
                    return;
                }
                var fileCabinetsArray;

                if (!versionControl) {
                    fileCabinetsArray = fileCabinets.filter(function (fileCabinet) {
                        return !fileCabinet.Header.VersionManagement;
                    });
                } else {
                    fileCabinetsArray = fileCabinets;
                }

                fileCabinetsArray = fileCabinetsArray.map(function (fileCabinet) {
                    var fileCabinetVM = {
                        Name: fileCabinet.Header.Name,
                        Guid: fileCabinet.Header.Guid,
                        Color: fileCabinet.Header.Color,
                        VersionManagement: fileCabinet.Header.VersionManagement,
                        MasterFCGuid: fileCabinet.MasterFCGuid,
                        ConnectionSettings: {
                            organizationName: organizationName,
                            platformUrl: platformUrl,
                            username: username,
                            password: password
                        },
                        Fields: fileCabinet.Fields
                            .filter(function (field) { return field.UserDefined })
                        //    .map(function (field) {                            
                        //        return {
                        //            Name: field.DisplayName,
                        //            DBName: field.DBFieldName,
                        //            DWType: field.DWFieldType,
                        //            Length: field.Length,
                        //            Precision: field.Precision
                        //        };
                        //})
                    }

                    if (selectedFileCabinetInfo && selectedFileCabinetInfo.IsRemote && fileCabinet.Header.Guid === selectedFileCabinetInfo.FileCabinetGuid) {
                        fileCabinetVM.IsRemote = true;
                        self.initialLoading = true;
                        self.selectedFileCabinet(fileCabinetVM);
                    }
                    return fileCabinetVM;
                });
                
                if (!self.remoteFileCabinetsList()) {
                    self.remoteFileCabinetsList(new DW.FCSelector.FileCabinetListVM({
                        connectionSettings: {
                            organizationName: organizationName,
                            platformUrl: platformUrl,
                            username: username,
                            password: password
                        }
                    }));
                }
                else {
                    if (self.remoteFileCabinetsList().organizationName){
                        self.remoteFileCabinetsList().organizationName(organizationName);
                    }
                    if (self.remoteFileCabinetsList().platformUrl){
                        self.remoteFileCabinetsList().platformUrl(platformUrl);
                    }
                    if (self.remoteFileCabinetsList().username){
                        self.remoteFileCabinetsList().username(username);
                    }

                    if (self.remoteFileCabinetsList().password){
                        self.remoteFileCabinetsList().password(password);
                    }
                }

                fileCabinetsArray = fileCabinetsArray.sort(function (a, b) {
                    var nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase();
                    if (nameA < nameB)
                        return -1;
                    if (nameA > nameB)
                        return 1;
                    return 0;
                });

                self.remoteFileCabinetsList().fileCabinets(fileCabinetsArray);
                self._clearConnectionSettingsCache();
            }, DW.Utils.handleError);
        },
        _addConnectionToRemoteOrganization: function (settingsGuid, isTarget) {
            var self = this;
            var initialConnectionSettings;
            if (this.remoteFileCabinetsList()) {
                initialConnectionSettings = {
                    organizationName: self.remoteFileCabinetsList().organizationName(),
                    platformUrl: self.remoteFileCabinetsList().platformUrl(),
                    username: self.remoteFileCabinetsList().username(),
                    password: undefined
                }
            }
            else {
                initialConnectionSettings = {
                    organizationName: undefined,
                    platformUrl: undefined,
                    username: undefined,
                    password: undefined
                }
            }

            var vm = this.connDialogCommponentApi.createConnectionDialogVM({
                connectionSettings: initialConnectionSettings
            });

            vm.finished.done(function (connectionSettings) {
                var fileCabinetInfo = this.options.fileCabinetInfo;
                self.ready(false);
                self._fillRemoteFileCabinets(
                        connectionSettings.platformUrl,
                        connectionSettings.organizationName,
                        connectionSettings.username,
                        connectionSettings.password,
                    fileCabinetInfo, settingsGuid, isTarget, self.options.showOtherOrganizationVersionControlFileCabinet)
                    .then(function () {

                    }, DW.Utils.handleError)
                    .always(function () {
                        self.ready(true);
                    });
            }.bind(this));
        },
        addConnectionToRemoteOrganization: function () {
            var self = this;
            var initialConnectionSettings;
            if (this.remoteFileCabinetsList()) {
                initialConnectionSettings = {
                    organizationName: self.remoteFileCabinetsList().organizationName(),
                    platformUrl: self.remoteFileCabinetsList().platformUrl(),
                    username: self.remoteFileCabinetsList().username(),
                    password: undefined
                }
            }
            else if (self.options.fileCabinetInfo && self.options.fileCabinetInfo.Connection) {
                initialConnectionSettings = {
                    organizationName: self.options.fileCabinetInfo.OrganizationName,
                    platformUrl: self.options.fileCabinetInfo.Connection.PlatformUrl,
                    username: self.options.fileCabinetInfo.Connection.Username,
                    password: undefined
                }
            }
            else if (!self.connectionSettingsCache.isEmpty) {
                initialConnectionSettings = {
                    organizationName: self.connectionSettingsCache.organizationName,
                    platformUrl: self.connectionSettingsCache.platformUrl,
                    username: self.connectionSettingsCache.username,
                    password: undefined
                }
            }
            else {
                initialConnectionSettings = {
                    organizationName: undefined,
                    platformUrl: undefined,
                    username: undefined,
                    password: undefined
                }
            }

            var vm = this.connDialogCommponentApi.createConnectionDialogVM({
                connectionSettings: initialConnectionSettings,
                predefinedCloudSystems: this.options.predefinedCloudSystems
            });

            var dialog = this.connDialogCommponentApi.createConnectionDialog({ getVM: function () { return vm; } });

            vm.finished.done(function (connectionSettings) {
                self._fillConnectionSettingsCache(dialog._model.data());
                self.ready(false);
                self._fillRemoteFileCabinets(
                    connectionSettings.platformUrl,
                    connectionSettings.organizationName,
                    connectionSettings.username,
                    connectionSettings.password,
                    this.options.fileCabinetInfo, null, null, self.options.showOtherOrganizationVersionControlFileCabinet)
                    .then(function () {

                    }, DW.Utils.handleError)
                    .always(function () {
                        self.ready(true);
                    });
            }.bind(this));

            setTimeout(function () {
                dialog.open();
            }, 0);
        },
        _clearConnectionSettingsCache: function () {
            this.connectionSettingsCache.organizationName = "";
            this.connectionSettingsCache.platformUrl = "";
            this.connectionSettingsCache.username = "";
            this.connectionSettingsCache.isEmpty = true;
        },
        _fillConnectionSettingsCache: function (connectionSettingsVM) {
            this.connectionSettingsCache.organizationName = connectionSettingsVM.organizationName();
            this.connectionSettingsCache.platformUrl = connectionSettingsVM.platformUrl();
            this.connectionSettingsCache.username = connectionSettingsVM.username();
            this.connectionSettingsCache.isEmpty = false;
        },
        changeLocalFileCabinets: function (fileCabinets) {
            var self = this;
            DW.When(this._fillLocalFileCabinets(null, fileCabinets, this.options.showVersionControlFileCabinet))
                .then(function () {
                    var selectedFc = self.selectedFileCabinet();
                    if (selectedFc) {
                        var selectedFcGuid = selectedFc.Guid;
                        if (!fileCabinets.find(function (fileCabinet) {
                            return fileCabinet.Header.Guid === selectedFcGuid;
                        })) {
                            self.selectedFileCabinet(null);
                        }
                    }
                });
        }
    });

    extend(ns('DW.FCSelector'), {
        FileCabinetSelectorVM: FileCabinetSelectorVM
    });
})();
