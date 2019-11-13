/// <reference path="../../../../../Scripts/TypeScript/lib/WafServices/DataContracts.d.ts"/>

namespace DW.IndexAssignment.Models {
    import ISettingsService = Interfaces.ISettingsService;
    import IValueSourceFactory = Interfaces.IValueSourceFactory;
    import IIndexField = Interfaces.IIndexField;
    import IndexField = IndexFields.IndexField;
    import IDwField = Interfaces.IDwField;
    import DataContracts = dev.docuware.com.settings;

    export class SettingsService implements ISettingsService {
        private _factories: IValueSourceFactory[];
        private _service: any;
        private _connectionManager: any;
        private _fieldMasks: DataContracts.organization.RegularExpression[] = [];

        constructor(valueSourceFactories: IValueSourceFactory[], conMgr: any) {
            this._factories = valueSourceFactories;

            this._service = (<any>window).$SS;
            this._connectionManager = conMgr;

            this.initializeOrganizationWideValues();
        }

        public getDialogFields(dialogGuid: string, fcGuid: string, validationRequired: boolean): JQueryPromise<IIndexField[]> {
            let fields: IndexField[] = [];
            let self = this;

            return $.Deferred(dfd => {
                DW.Utils.whenAllDone(this.getStoreDialogFields(dialogGuid), this.getFcFields(fcGuid)).done(
                    (dlgFields: DataContracts.filecabinet.DialogField[], fcFields: DataContracts.filecabinet.Field[]) => {
                        const mergeFields = (dlgFields, fcFields, fieldMasks) =>
                            dlgFields.map(itm => ({
                                ...fcFields.find((item) => (item.Guid === itm.FieldGuid) && item),
                                ...itm,
                                ...fieldMasks.find((item) => item.Header.Guid === itm.MaskGuid && item)
                            }));

                        let mergedArr = mergeFields(dlgFields, fcFields, self._fieldMasks);
                        
                        mergedArr.forEach(x => {
                            let customField = {
                                fieldLabel: x.DisplayName,
                                fieldType: x.Type,
                                maxLength: x.DWLength,
                                readOnly: (!x.Writable),
                                prefillValue: x.FixedEntry,
                                required: x.Required,
                                numberPrecision: x.DigitsAfterDecimalPoint,
                                fieldMask: x.Mask,
                                fieldMaskTooltip: x.ErrorText,
                                fieldMaskPlaceholder: x.SampleEditText
                            } as IDwField;
                            
                            fields.push(new IndexField(x.DBName, x.DisplayName, customField, this._factories));
                        });
                        
                        dfd.resolve(fields);
                    });
            });
        }

        private getFcFields(fcGuid: string): JQueryPromise<DataContracts.filecabinet.Field[]> {
            let fileCabinetQuery: DataContracts.filecabinet.FileCabinetQuery = new DataContracts.filecabinet.FileCabinetQuery();
            fileCabinetQuery.Guid = fcGuid;

            let output: DataContracts.filecabinet.Field[] = [];

            return jQuery.Deferred(dfd => {
                this._connectionManager.invoke(this._service.getFileCabinets, [fileCabinetQuery]).done(fcs => {

                    if (fcs) {
                        output = fcs[0].Fields;
                    }

                    dfd.resolve(output);
                }).fail((err) => {
                    dfd.reject(err);
                });
            });
        }

        private getStoreDialogFields(dialogGuid: string): JQueryPromise<DataContracts.filecabinet.DialogField[]> {
            let dialogQuery: DataContracts.filecabinet.StoreDialogQuery = new dev.docuware.com.settings.filecabinet.StoreDialogQuery();
            let flags: DataContracts.filecabinet.StoreDialogContentFilterFlag.Whole;

            dialogQuery.Guid = dialogGuid;
            dialogQuery.QueryUsage = DataContracts.interop.QueryUsage.Runtime;

            let output: DataContracts.filecabinet.DialogField[] = [];

            return jQuery.Deferred(dfd => {
                this._connectionManager.invoke(this._service.getStoreDialogs, [dialogQuery, flags]).done(dialog => {

                    if (dialog && dialog.length) {
                        //fields must be visible, do not include "table fields" or "tablefields"
                        output = dialog[0].Fields.filter(x => x.Visible && x.Type !== DataContracts.interop.DWFieldType.Table); //DWFieldType: 7 ==> TABLEFIELDS
                    }

                    dfd.resolve(output);
                }).fail((err) => {
                    dfd.reject(err);
                });
            });
        }

        private getFieldMasks() : JQueryPromise<DataContracts.organization.RegularExpression[]> {
            let regexQuery: DataContracts.organization.RegExQuery = new DataContracts.organization.RegExQuery();
            let output: DataContracts.organization.RegularExpression[] = [];

            return jQuery.Deferred(dfd => {
                this._connectionManager.invoke(this._service.getRegularExpressions, [regexQuery]).done((masks: DataContracts.organization.RegularExpression[]) => {
                    if (masks && masks.length) {
                        output = masks;
                    }

                    dfd.resolve(output);
                }).fail(err => {
                    dfd.reject(err);
                });
            });
        }

        private initializeOrganizationWideValues(): void {
            let self = this;

            this.getFieldMasks().done((masks: DataContracts.organization.RegularExpression[]) => {
                self._fieldMasks = masks;
            });
        }
    }
}