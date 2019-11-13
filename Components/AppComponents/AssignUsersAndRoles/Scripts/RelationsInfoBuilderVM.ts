namespace DWTS {
    import DataContracts = dev.docuware.com.settings;

    export interface IRelationsInfoBuilderVM {
        name?: string;
        css?: string;
        canMatchRelation?: (rel, item) => boolean;
        getAll?: () => JQueryPromise<Array<DataContracts.interop.SettingsHeader>>;
        getRelations?: (force: boolean) => JQueryPromise<Array<DataContracts.relations.ResourceRelation>>;
        invalid?: boolean;
    }

    export interface IRelationInfoItem {
        displayName: string;
        css: string;
        relations: ILimitedResultObjectResult<DataContracts.interop.SettingsHeader>
    }

    export class RelationsInfoBuilderVM extends DWTS.ViewModel {
        public relationInfos: KnockoutObservableArray<IRelationInfoItem> = ko.observableArray([]);
        public relationsLoading: KnockoutObservable<boolean>;
        private visibleRolesCount: number = 10;

        constructor(private relations: Array<IRelationsInfoBuilderVM>, public noRelationsString: string) {
            super();
            this.relationsLoading = ko.observable(true);
        }

        private getLimitedRoles(array: Array<DataContracts.interop.SettingsHeader>): ILimitedResultObjectResult<DataContracts.interop.SettingsHeader> {
            return array.limitedResultObject<DataContracts.interop.SettingsHeader>(this.visibleRolesCount);
        }

        public hasRelativeRelationsInfo(): boolean {
            return this.relationInfos().length && this.relationInfos().some((item) => {
                return item.relations.result.length > 0;
            });
        }

        public invalidate(): void {
            this.relations.forEach((info) => {
                info.invalid = true;
            });
        }

        public loadRelations(): void {
            this.relationsLoading(true);

            let tasks = <Array<JQueryPromise<IRelationInfoItem>>>[];
            this.relations.forEach((groupOfRelation) => {
                let force = groupOfRelation.invalid;
                groupOfRelation.invalid = false;
                tasks.push(jQuery.when<any>(groupOfRelation.getAll(), groupOfRelation.getRelations(force))
                    .then((allItems: DataContracts.interop.SettingsHeader[], relations: DataContracts.relations.ResourceRelation[]) => {
                        let relationInfoItem = <IRelationInfoItem>{
                            displayName: groupOfRelation.name,
                            css: groupOfRelation.css,
                            relations: this.getLimitedRoles(relations.map((relation) => {
                                let result = allItems.find((item) => {
                                    return groupOfRelation.canMatchRelation(relation, item);
                                });
                                return result;
                            }).filter((item) => !!item))
                        };
                        return relationInfoItem;
                    }, DW.Utils.handleError))
            });

            DW.When.apply(this, tasks).then(function () {
                this.relationInfos($.makeArray(arguments));
            }.bind(this)).always(() => this.relationsLoading(false))
        }
    }
}