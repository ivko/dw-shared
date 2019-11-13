/// <reference path="../IndexAssignment.ts"/>

namespace DW.IndexAssignment.Models {
    import IValidationModel = Interfaces.IValidationModel;
    import IIndexField = Interfaces.IIndexField;
    import IValueSourceFactory = Interfaces.IValueSourceFactory;
    import IValidationEntry = Interfaces.IValidationEntry;
    import IValidationImporter = Interfaces.IValidationImporter;
    import IValidationExporter = Interfaces.IValidationExporter;

    export class ValidationModel implements IValidationModel {
        private _validationRequired: boolean;

        private _exporter: IValidationExporter;
        private _importer: IValidationImporter;

        get hasValidationErrors(): boolean {
            if (this._validationRequired === false) {
                return false;
            }

            if (this.activeIndexFields.find(this.hasIndexFieldValidationErrors)) {
                return true;
            }

            if (this._availableIndexFields.find(this.hasIndexFieldValidationErrors)) {
                return true;
            }

            return false;
        }

        private _activeIndexFields: IIndexField[] = [];
        get activeIndexFields(): IIndexField[] {
            return this._activeIndexFields;
        }

        private _availableIndexFields: IIndexField[] = [];
        get availableIndexFields(): IIndexField[] {
            return this._availableIndexFields;
        }

        private _valueSourceFactories: IValueSourceFactory[] = [];
        get valueSourceFactories(): IValueSourceFactory[] {
            return this._valueSourceFactories;
        }

        private _defaultValueSourceFactory: IValueSourceFactory;
        get defaultValueSourceFactory(): IValueSourceFactory {
            return this._defaultValueSourceFactory;
        }

        public name: string;
        public filecabinetGuid: string;
        public dialogGuid: string;
        public trayGuid: string;

        constructor(valueSourceFactories: IValueSourceFactory[], defaultValueSourceFactory: IValueSourceFactory, indexFields: IIndexField[], exporter: IValidationExporter, importer: IValidationImporter) {
            this._valueSourceFactories = valueSourceFactories;
            this._defaultValueSourceFactory = defaultValueSourceFactory;

            this._importer = importer;
            this._exporter = exporter;

            this.initFields(indexFields);
        }

        public validateFields(): JQueryDeferred<void> {
            if (this._validationRequired === false) {
                return DW.Utils.resolvedDeferred;
            }

            return $.Deferred((dfd) => {
                try {
                    this._activeIndexFields.forEach((x) => {
                        if (x.valueSource) {
                            x.valueSource.validateValues();
                        }
                    });

                    this._availableIndexFields.forEach((x) => {
                        if (x.valueSource) {
                            x.valueSource.validateValues();
                        }
                    });
                    
                    dfd.resolve();
                } catch (e) {
                    dfd.reject(e);
                } 
            });
        }

        public activateIndexField(field: IIndexField): void {
            for (let i: number = 0; i < this._availableIndexFields.length; i++) {
                if (this._availableIndexFields[i] === field) {
                    field.activateValueSource(this._defaultValueSourceFactory.create(field.dwField));

                    this._activeIndexFields.push(field);
                    this._availableIndexFields.splice(i, 1);

                    return;
                }
            }

            throw new Error(DW.IndexAssignment.localize('IndexAssignment_Error_Field_Not_Available'));
        }

        public deactivateIndexField(field: IIndexField): void {
            for (let i: number = 0; i < this._activeIndexFields.length; i++) {
                if (this._activeIndexFields[i] === field) {
                    field.activateValueSource(this._defaultValueSourceFactory.create(field.dwField));

                    this._availableIndexFields.push(field);
                    this._activeIndexFields.splice(i, 1);

                    return;
                }
            }
        }

        public importEntries(entries: IValidationEntry[]) {
            return this._importer.import(entries, this);
        }

        public exportEntries(): IValidationEntry[] {
            return this._exporter.exportEntries(this.activeIndexFields);
        }

        private initFields(indexFields: IIndexField[]) {
            this._availableIndexFields = indexFields;
            this._availableIndexFields.forEach(x => {
                x.activateValueSource(this._defaultValueSourceFactory.create(x.dwField));
            });
        }

        private hasIndexFieldValidationErrors(field: IIndexField): boolean {
            return field.valueSource.valueField.validationErrors.length > 0;
        }
    }
}