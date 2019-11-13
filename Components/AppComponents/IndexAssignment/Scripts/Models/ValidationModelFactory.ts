namespace DW.IndexAssignment.Models {
    import IValidationModel = Interfaces.IValidationModel;
    import ISettingsService = Interfaces.ISettingsService;
    import IIndexField = Interfaces.IIndexField;
    import IValueSourceFactory = Interfaces.IValueSourceFactory;
    import FixedValueSourceFactory = Models.ValueSourceFactories.FixedValueSourceFactory;
    import EmailPropertySourceFactory = Models.ValueSourceFactories.EmailPropertySourceFactory;
    import NullValueSourceFactory = Models.ValueSourceFactories.NullValueSourceFactory;
    import KeywordValueSourceFactory = Models.ValueSourceFactories.KeywordValueSourceFactory;
    import IValidationEntry = Interfaces.IValidationEntry;
    import IValidationImporter = Interfaces.IValidationImporter;
    import IValidationExporter = Interfaces.IValidationExporter;

    export class ValidationModelFactory {
        private _settingsService: ISettingsService;
        private _validationRequired: boolean;

        constructor(public readonly conMgr: any, public importer: IValidationImporter, public exporter: IValidationExporter, settingsService?: ISettingsService) {
            if (settingsService) {
                this._settingsService = settingsService;
            }
        }

        public createIndexAssignmentValidationModel(dialogGuid: string, fcGuid: string, trayGuid: string, isFcStorage: boolean, validationEntries?: IValidationEntry[]): JQueryPromise<IValidationModel> {
            this._validationRequired = isFcStorage;

            let valueSourceFactories = this.initValueSourceFactories();

            if (!this._settingsService) {
                this._settingsService = new SettingsService(valueSourceFactories, this.conMgr);
            }

            let validationModel: IValidationModel;

            return $.Deferred((dfd) => {
                this.retrieveFields(dialogGuid, fcGuid).done(indexFields => {
                    validationModel = new ValidationModel(valueSourceFactories, this.getDefaultValueSourceFactory(), indexFields, this.exporter, this.importer);
                    
                    validationModel.dialogGuid = dialogGuid;
                    validationModel.filecabinetGuid = isFcStorage ? fcGuid: null;
                    validationModel.trayGuid = isFcStorage ? null: trayGuid;

                    if (validationEntries) {
                        try {
                            validationModel.importEntries(validationEntries);    
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    dfd.resolve(validationModel);
                });
            });
        }

        private initValueSourceFactories(): IValueSourceFactory[] {
            let factories: IValueSourceFactory[] = [];

            factories.push(new NullValueSourceFactory(this._validationRequired));
            factories.push(new FixedValueSourceFactory(this._validationRequired));
            factories.push(new EmailPropertySourceFactory(this._validationRequired));
            factories.push(new KeywordValueSourceFactory(this._validationRequired));

            return factories;
        }

        private getDefaultValueSourceFactory(): IValueSourceFactory {
            return new NullValueSourceFactory(this._validationRequired);
        }

        private retrieveFields(dialogGuid: string, fcGuid: string): JQueryPromise<IIndexField[]> {
            if (dialogGuid === DW.Utils.EMPTY_GUID) {
                return DW.Utils.resolvedDeferredWithParam([]);
            }

            return this._settingsService.getDialogFields(dialogGuid, fcGuid, this._validationRequired);
        }
    }   
}