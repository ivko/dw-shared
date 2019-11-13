(function () {
    var FieldMappingVM = new Class({
        Extends: DW.ViewModel,
        options: {
            field: {},
            availableFields: []
        },
        initialize: function (options) {
            this.parent();
            $.extend(this.options, options);

            var self = this;

            this.displayName = ko.observable(this.options.field.Name);

            this.availableFields = ko.observableArray(this.options.availableFields);

            this.availableFields.unshift({ Name: DW.FieldsMapping.localize('NotMapped_Text') });

            var validation;
            if (this.options.field.DWType == dev.docuware.com.settings.interop.DWFieldType.Text) {
                validation = {
                    validation: [{
                        validator: function (val) {
                            if (!val) {
                                return true;
                            }
                            var selectedTargetField = ko.utils.arrayFirst(self.availableFields(), function (availableField) {
                                if (availableField.DBName == val) {
                                    return availableField;
                                }
                            });

                            return (this.options.field.DWLength == selectedTargetField.DWLength);
                        }.bind(this),
                        message: DW.Utils.format(DW.FieldsMapping.localize('MappingFields_DiffLength_Text'), this.options.field.Name)
                    }]
                }
            }
            else if (this.options.field.DWType == dev.docuware.com.settings.interop.DWFieldType.Numeric ||
                this.options.field.DWType == dev.docuware.com.settings.interop.DWFieldType.Decimal) {
                validation = {
                    validation: [{
                        validator: function (val) {
                            if (!val) {
                                return true;
                            }
                            var selectedTargetField = ko.utils.arrayFirst(self.availableFields(), function (availableField) {
                                if (availableField.DBName == val) {
                                    return availableField;
                                }
                            });

                            return this.options.field.DigitsAfterDecimalPoint == selectedTargetField.DigitsAfterDecimalPoint;
                        }.bind(this),
                        message: DW.Utils.format(DW.FieldsMapping.localize('MappingFields_DiffPrecision_Text'), this.options.field.Name)
                    }]
                }
            }

            this.selectedTargetField = ko.observable().extend(validation);

            this.groupedWarnings = ko.validation.group([this.selectedTargetField]);

            this.warnings = this.addDisposable(ko.computed(function () {
                return Array.prototype.concat([], self.groupedWarnings());
            }, this));
        },
        getSelectedFieldMappingData: function () {
            var self = this;
            var selectedTargetField = ko.utils.arrayFirst(this.availableFields(), function (availableField) {
                if (self._isValidDWType(availableField.DWType) && availableField.DBName === self.selectedTargetField()) {
                    return availableField;
                }
            });

            //return {
            //    Source: this.options.field.DBName,
            //    Destination: selectedTargetField.DBName
            //};

            return {
                Source: this.options.field,
                Target: selectedTargetField
            };
        },
        subscribeForChanges: function (beforeTargetFieldChanged, targetFieldChanged) {
            var self = this;
            this.selectedTargetField.subscribe(function (newValue) {
                var warnings = self.warnings();
                if (warnings && warnings.length > 0) {
                    for (var i = 0; i < warnings.length; i++) {
                        toastr.warning('', warnings[i]);
                    }
                }

                if (targetFieldChanged)
                    targetFieldChanged(self, newValue, self.selectedTargetField());
            });

            this.selectedTargetField.subscribe(function (valueBeforeChange) {
                if (beforeTargetFieldChanged)
                    beforeTargetFieldChanged(self, valueBeforeChange);
            }, null, "beforeChange");
        },
        _isValidDWType: function(dwType) {
            return dwType !== null && dwType !== undefined && dwType > -1;
        }
    });

    var FieldsMapping = new Class({
        Source: null,
        Target: null
    });

    extend(ns('DW.FieldsMapping'), {
        FieldMappingVM: FieldMappingVM,
        FieldsMapping: FieldsMapping
    });
})();
