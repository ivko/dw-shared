(function () {    
    var FieldsMappingDialogVM = new Class({
        Extends: DW.BaseDialogVM,
        initialize: function (options) {
            this.parent(options);

            var tempMapping = [];

            $.each(options.mappedIndexFields,
                function (index, map) {
                    var tempFields = {
                        Source: options.sourceFileCabinetFields.filter(function(field) {
                            return field.DBName === map.Source.DBName;
                        })[0],
                        Target: options.targetFileCabinetFields.filter(function(field) {
                            return field.DBName === map.Target.DBName;
                        })[0]
                    };

                    if (tempFields.Source && tempFields.Target)
                        tempMapping.push(tempFields);
                });

            this.originalMappedIndexFields = tempMapping;

            this.sourceFileCabinetFields = options.sourceFileCabinetFields;
            this.targetFileCabinetFields = options.targetFileCabinetFields;

            this.sourceFileCabinetName = options.sourceFileCabinetName;
            this.targetFileCabinetName = options.targetFileCabinetName;

            this.fields = ko.observableArray();

            this.initFields();

            var sortedTempMapping = [];

            $.each(this.fields(),
                function(index, originalField) {
                    var tempField = tempMapping.filter(function (mappedField) {
                        return originalField.options.field.DBName === mappedField.Source.DBName;
                    });

                    if (tempField.length > 0) {
                        sortedTempMapping.push(tempField[0]);
                    }
                });

            this.originalMappedIndexFields = sortedTempMapping;
        },        
        hasChanges: function () {
            return !DW.Utils.isEqual(this.originalMappedIndexFields, this.buildProperties());
        },
        applyChanges: function () {
            return DW.Deferred(function (dfd) {
                dfd.resolve(this.buildProperties());
            }.bind(this));
        },
        buildProperties: function () {
            var resMappedFields = [];
            $.each(this.fields(), function (index, field) {
                var resMappedField = field.getSelectedFieldMappingData();
                // Mapped field
                if (resMappedField.Target) {
                    resMappedFields.push(resMappedField);
                }
            });

            return resMappedFields;
        },
        validate: function () {
            var mappedFields = this.buildProperties();

            if (mappedFields.length < 1) {
                toastr.error('', DW.FieldsMapping.localize('MappingFields_Required_Text'));
                return false;
            }

            // TODO: collect all warnings and show them to the user

            return true;
        },
        initFields: function() {            
            var alreadyUsedFields = [];
            ko.utils.arrayForEach(this.originalMappedIndexFields, function (originalMappedField) {
                alreadyUsedFields.push(originalMappedField.Target);
            });

            var self = this;

            $.each(this.sourceFileCabinetFields, function (index, currentSourceField) {                
                var originalMField = ko.utils.arrayFirst(self.originalMappedIndexFields, function (originalMappedField) {
                    if (originalMappedField.Source.DBName.toUpperCase() === currentSourceField.DBName.toUpperCase()) {
                        return originalMappedField;
                    }

                    return null;
                });
                                
                var filterredFields = $.grep(self.targetFileCabinetFields, function (fieldToFilter, i) {
                    
                    // TODO: posssible to check for eventual type inconsistansy and add error
                    if (originalMField && originalMField.Target.DBName === fieldToFilter.DBName)
                        return true;

                    var tempAlreadyUsedFields = alreadyUsedFields.filter(function (field) {
                        return field.DBName === fieldToFilter.DBName;
                    });

                    if (tempAlreadyUsedFields.length > 0)
                        return false;

                    return DW.Utils.areFieldsCompatible(fieldToFilter, currentSourceField);
                });
                                                
                var fieldMapping = new DW.FieldsMapping.FieldMappingVM({ field: currentSourceField, availableFields: filterredFields });
                if (originalMField) {
                    fieldMapping.selectedTargetField(originalMField.Target.DBName);
                }

                fieldMapping.subscribeForChanges(self.beforeFieldMappingChanged.bind(self),
                    self.fieldMappingChanged.bind(self));
                                
                self.fields.push(fieldMapping);
            });
        },
        fieldMappingChanged: function (fieldMapping, newlySelectedField) {
            if (!newlySelectedField) {
                return;
            }
            var self = this;
                        
            ko.utils.arrayForEach(self.fields(), function (field) {
                if (field !== fieldMapping) {
                    var fieldToRemove = ko.utils.arrayFirst(field.availableFields(), function (targetField) {
                        if (targetField.DBName === newlySelectedField) {
                            return targetField;
                        }

                        return null;
                    });
                    if (fieldToRemove) {
                        field.availableFields.remove(fieldToRemove);
                    }
                }
            });
        },
        beforeFieldMappingChanged: function(fieldMapping, oldValue)
        {
            if (!oldValue)
            {
                return;
            }

            var self = this;

            var unselectedField = ko.utils.arrayFirst(self.targetFileCabinetFields, function(targetFileCabinetField){
                if (targetFileCabinetField.DBName === oldValue){
                    return targetFileCabinetField;
                }

                return null;
            });

            ko.utils.arrayForEach(self.fields(), function (field) {
                if (field !== fieldMapping) {

                    if (unselectedField && DW.Utils.areFieldsCompatible(field.options.field, unselectedField))
                    {
                        field.availableFields.push(unselectedField);
                    }
                }
            });
        }
    });

    extend(ns('DW.FieldsMapping'), {
        FieldsMappingDialogVM: FieldsMappingDialogVM
    });
})();