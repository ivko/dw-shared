/// <reference path="ValueInput/InputTemplate.ts"/>

namespace DW.IndexAssignment.Controllers {
    import InputTemplate = ValueInput.InputTemplate;
    import ValidationModelFactory = Models.ValidationModelFactory;
    import IValidationModel = Interfaces.IValidationModel;
    import DwFieldType = Models.DwFieldType;
    import KeywordValueSource = Models.ValueSources.KeywordValueSource;
    import IValidationEntry = Interfaces.IValidationEntry;
    import IValidationImporter = Interfaces.IValidationImporter;
    import IValidationExporter = Interfaces.IValidationExporter;
    import ISettingsService = Interfaces.ISettingsService;

    export class ViewController {
        public validationModel: IValidationModel;
        public items: KnockoutObservableArray<IndexAssignmentTableItem> = ko.observableArray([]);
        public validationEntries: KnockoutObservableArray<IValidationEntry> = ko.observableArray([]);
        public valueChangesArray: KnockoutObservableArray<string> = ko.observableArray([]);

        private _validationModelFactory: ValidationModelFactory;
        private _connectionManager: any;

        constructor(conMgr: any, public importer: IValidationImporter, public exporter: IValidationExporter, private settingsService?: ISettingsService) {
            this._connectionManager = conMgr;

            this.initIndexingComponent();
        }

        public export(): IValidationEntry[] {
            if (this.validationModel) {
                return this.validationModel.exportEntries();
            } else {
                return [];
            }
        }

        public toggleIndexField(tableItem: IndexAssignmentTableItem) {
            if (tableItem.isValueSourceSelected()) {
                this.validationModel.deactivateIndexField(tableItem.indexField);
                this.validationModel.activateIndexField(tableItem.indexField);

                if (tableItem.indexField.dwField.fieldType === DwFieldType.Keyword) {
                    let keywordValueSource = tableItem.indexField.availableValueSources.find(x => x.name === 'KeywordValueSource') as KeywordValueSource;
                    tableItem.indexField.activateValueSource(keywordValueSource);

                    let selectedValueSource = tableItem.selectedValueSource();

                    let valueSourceFactory: string = selectedValueSource.name;

                    let actualValueSource = keywordValueSource.availableKeywordValueSources.find(x => x.name === valueSourceFactory);

                    //remove old value of keyword field if changing value source
                    this.removeOneKeywordValue(tableItem);

                    let valueSource = keywordValueSource.activateValueSource(actualValueSource, tableItem.indexField.dwField);

                    tableItem.indexingTemplate(InputTemplate.createInputTemplate(valueSource, tableItem.indexField.dwField, this.valueChangesArray));
                } else {
                    tableItem.indexField.activateValueSource(tableItem.selectedValueSource());
                    tableItem.indexingTemplate(InputTemplate.createInputTemplate(tableItem.selectedValueSource(), tableItem.indexField.dwField, this.valueChangesArray));
                }
            } else {
                if (tableItem.indexField.dwField.fieldType === DwFieldType.Keyword) {
                    this.removeKeyword(tableItem);
                } else {
                    tableItem.indexField.valueSource.valueField.removeValue();
                    this.validationModel.deactivateIndexField(tableItem.indexField);

                    //clear input template & trigger change
                    tableItem.indexingTemplate(null);
                    this.valueChangesArray.push("null");
                }
            }
        }

        public loadTableItems(dialogGuid: string, fcGuid: string, trayGuid: string, isFcStorage: boolean, validationEntries?: IValidationEntry[]): JQueryPromise<IndexAssignmentTableItem[]> {
            return jQuery.Deferred(dfd => {
                if (!dialogGuid) {
                    dfd.resolve([]);
                    return;
                }

                this._validationModelFactory.createIndexAssignmentValidationModel(dialogGuid, fcGuid, trayGuid, isFcStorage, validationEntries).done(x => {
                    if (x) {
                        this.validationModel = x;
                    }

                    //if edit case
                    if (validationEntries) {
                        this.validationEntries(validationEntries);
                    } else {
                        //creating new config
                        this.validationEntries([]);
                    }

                    this.items(this.mapIndexFieldsToTableRows());
                    
                    dfd.resolve(this.items());
                });
            });
        }

        public addAnotherKeyword(tableItem: IndexAssignmentTableItem, index: number) {
            //add another line below the current position
            let keywordField = this.validationModel.activeIndexFields.find(x => x.name === tableItem.indexField.name);
            this.items.splice(index + 1, 0, new IndexAssignmentTableItem(keywordField, this.valueChangesArray));
        }

        public removeKeyword(tableItem: IndexAssignmentTableItem, removeRow?: boolean) {
            //remove value of keyword field if changing value source and remove valuesource too
            this.removeOneKeywordValue(tableItem, true);

            //only if no other keywordfeld left, deactivate it finally
            let keywordValueSourceField = tableItem.indexField.valueSource as KeywordValueSource;
            if (keywordValueSourceField.activeValueSources.length < 1) {
                this.validationModel.deactivateIndexField(tableItem.indexField);
            }

            //reset input template;
            tableItem.indexingTemplate(null);
            
            //while click on "-"
            let nullValueSource = tableItem.valueSources.find(x => x.name === 'NullValueSource');
            tableItem.selectedValueSource(nullValueSource);

            //remove line
            if (removeRow) {
                this.items.remove(tableItem);
            }

            if (keywordValueSourceField.activeValueSources.length === 1) {
                this.hideMinusOnLastKeywordField(tableItem.indexField.name);
            }

            //trigger change
            this.valueChangesArray.push("null");
        }

        private hideMinusOnLastKeywordField(fieldName) {
            let keywordTableItem = this.items().find(x => x.indexField.name === fieldName);

            if (keywordTableItem) {
                keywordTableItem.showMinus(false);
            }
        }

        private removeOneKeywordValue(tableItem: IndexAssignmentTableItem, removeValueSource: boolean = false): void {
            let keywordValueSourceField = tableItem.indexField.valueSource as KeywordValueSource;

            //fault tolerance. If input value has no entry and you select null value source or remove keyword
            let oneValueSourceField = keywordValueSourceField.activeValueSources.find(x => {
                if (x.valueField.value) {
                    return x.valueField.value.value() === (tableItem.indexingTemplate() && tableItem.indexingTemplate().value());
                } else {
                    return (tableItem.indexingTemplate() && tableItem.indexingTemplate().value() === null);
                }
            });

            if (oneValueSourceField) {
                oneValueSourceField.valueField.removeValue(); //re-validates all left fields to clear leftovers

                if (removeValueSource) {
                    keywordValueSourceField.activeValueSources.removeItem(oneValueSourceField);
                }
            }
        }

        private initIndexingComponent() {
            this._validationModelFactory = new Models.ValidationModelFactory(this._connectionManager, this.importer, this.exporter, this.settingsService);
        }

        private mapIndexFieldsToTableRows(): IndexAssignmentTableItem[] {
            let items: IndexAssignmentTableItem[] = [];
            
            //add already imported fields first
            this.validationModel.activeIndexFields.forEach(x => {
                if (x.valueSource.name === 'KeywordValueSource') {
                    let kwValueSource: KeywordValueSource = x.valueSource as KeywordValueSource;

                    kwValueSource.activeValueSources.forEach(valueSource => {
                        let entry = new IndexAssignmentTableItem(x, this.valueChangesArray);

                        if (kwValueSource.activeValueSources.length === 1) {
                            entry.showMinus(false);
                        }

                        entry.selectedValueSource(x.availableValueSources.find(allValueSource => allValueSource.name === valueSource.name));

                        entry.indexingTemplate(InputTemplate.createInputTemplate(valueSource, entry.indexField.dwField, this.valueChangesArray));
                        
                        if (valueSource) {
                            if (valueSource.valueField) {
                                if (valueSource.valueField.value) {
                                    entry.indexingTemplate().value(valueSource.valueField.value.value());
                                }
                            }
                        }

                        items.push(entry);
                    });

                } else {
                    let entry = new IndexAssignmentTableItem(x, this.valueChangesArray);
                    entry.loadExistingValues();
                    items.push(entry);
                }
            });
            
            this.validationModel.availableIndexFields.forEach(x => {
                items.push(new IndexAssignmentTableItem(x, this.valueChangesArray));
            });

            return items;
        }
    }
}