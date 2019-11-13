namespace DWTS {
    export interface IMultiEditableTableEntryColumn {
        isSelected: KnockoutObservable<boolean>;
        enabled: KnockoutObservable<boolean>;
        value: KnockoutObservable<any>;
    }

    export interface IMultiEditableTableEntryColumnData {
        vm: IMultiEditableTableEntryColumn;
        isActive: KnockoutObservable<boolean>;
    }

    export interface IMultiEditableTableEntry {
        columnsData: Array<IMultiEditableTableEntryColumnData>;
        dispose: () => void;
    }

    export interface IColumnsPair {
        current: IMultiEditableTableEntryColumn,
        next: IMultiEditableTableEntryColumn
    }

    export class EditableTableBehaviour<T extends DWTS.Interfaces.Tables.ITable<IMultiEditableTableEntry> |
        DWTS.Interfaces.Tables.IVirtualTable<IMultiEditableTableEntry>> extends DWTS.Disposable {

        public columnsTableVM: T;
        public addEntryCommand: DW.Command;
        public removeEntryCommand: DW.Command;
        
        constructor(
            createTable: () => T,
            private createEntry: () => IMultiEditableTableEntry,
            public infoResource = "") {
            super();
            this.columnsTableVM = this.addDisposable<T>(createTable());

            this.initCommands();
        }

        private initCommands(): void {
            this.addEntryCommand = new DW.Command({
                execute: (requires) => {
                    this.stopEdit();
                    let newEntry = this.createEntry();
                    this.addEntries([newEntry], true);
                    newEntry.columnsData[0].vm.isSelected(true);
                    //this.selectColumn(newEntry.columnsData[0], newEntry);
                },
                canExecute: () => this.canAddEntry()
            });

            this.removeEntryCommand = new DW.Command({
                execute: (requires) => {
                    this.removeEntry(requires.data);
                }
            });
        }

        public canAddEntry(): boolean {
            return true;
        }

        public addEntry(): void {
            let adapter = new DW.CommandBindingAdapter(this.addEntryCommand, { $data: {} });
            adapter.execute().always(() => adapter.dispose());
        }

        public addEntries(entries: Array<IMultiEditableTableEntry>, append: boolean): void {
            this.columnsTableVM.setItems(entries, append);
        }

        public getEntries(): Array<IMultiEditableTableEntry> {
            return this.columnsTableVM.getItems();
        }

        //public addEntries2(dataRows, append, populateCallback): Array<IMultiEditableTableEntry> {
        //    let entries: Array<IMultiEditableTableEntry> = [];
        //    let entryVM: IMultiEditableTableEntry;
        //    dataRows.forEach((dataRow) => {
        //        entryVM = this.createEntry();
        //        populateCallback(entryVM, dataRow);
        //        entries.push(entryVM);
        //    });

        //    append ? this.entries(this.entries().concat(entries)) : this.entries(entries);
        //    return this.entries();
        //}

        private entryHasValues(entry): boolean {
            return entry.columnsData.some((data) => {
                return DW.Utils.isRealObject(data.vm.value());
            });
        }

        private removeEntry(entryVM: IMultiEditableTableEntry): void {
            this.columnsTableVM.removeItem(entryVM);
            entryVM.dispose();
        }

        public clear(): void {
            DW.Utils.dispose(this.columnsTableVM.empty());
        }

        public isEmpty(): boolean {
            return this.columnsTableVM.isEmpty();
        }

        private stopEdit(): void {
            this.columnsTableVM.getItems().forEach((entry) => {
                entry.columnsData.forEach((data) => {
                    data.isActive(false);
                });
            });
        }
        public activateRow(entry: IMultiEditableTableEntry): void {
            if (this.columnsTableVM.activeRow.peek() !== entry) {
                this.columnsTableVM.setActiveRow(entry, true);
            }
        }
        private selectNextAvailableColumn(options): any | { endOfColumns: boolean } {
            let columnsData = options.columnsData,
                columnIndex = options.columnIndex,
                columnsLength = options.columnsLength,
                dir = options.dir;

            if ((columnIndex < columnsLength - 1 && dir > 0) || (dir < 0 && columnIndex > 0)) {
                //we are in the middle of a row
                let nextIndex = columnIndex + dir;
                if (columnsData[nextIndex].vm.enabled()) {
                    columnsData[nextIndex].vm.isSelected(true);
                    return columnsData[nextIndex].vm;
                }
                else {
                    options.columnIndex = nextIndex;
                    return this.selectNextAvailableColumn(options);
                }
            }
            else {
                //we are at the end(begin) of the row, so go to next/previous row
                let entryIndex = -1,
                    entries = this.columnsTableVM.getItems(),
                    currentEntry = entries.find((entry, index) => {
                        let found = (entry.columnsData == columnsData);
                        if (found)
                            entryIndex = index;
                        return found;
                    }),
                    selectNext = (entryIndex: number, columnIndex: number) => {
                        let nextColumnData = entries[entryIndex + dir].columnsData;
                        if (nextColumnData[columnIndex].vm.enabled()) {
                            nextColumnData[columnIndex].vm.isSelected(true);
                            return nextColumnData[columnIndex].vm;
                        }
                        else {
                            options.columnIndex = columnIndex + dir;
                            options.columnsData = nextColumnData;

                            return this.selectNextAvailableColumn(options);
                        }
                    }

                if (dir < 0) {
                    //go up
                    if (entryIndex + dir >= 0) {
                        //we are in the middle of the rows, so we go to the last cell of the upper row
                        return selectNext(entryIndex, columnsLength - 1);
                    }
                    else {
                        //we are at the top row
                        if (!this.entryHasValues(currentEntry)) {
                            return this.handleEndOfColumns(currentEntry);
                        } else {
                            return { endOfColumns: true };
                        }
                    }
                }
                if (dir > 0) {
                    //go down
                    if (entryIndex + dir < entries.length) {
                        //we are in the middle of the rows and we can go down
                        return selectNext(entryIndex, 0);
                    }
                    else if (this.entryHasValues(currentEntry)) {
                        //we are at the bottom of the rows
                        this.addEntry()
                    }
                    else {
                        //we are at the end of the row, but we still did not enter anything in the current one
                        return this.handleEndOfColumns(currentEntry);
                    }
                }
                return {};
            }
        }

        private handleEndOfColumns(currentEntry: IMultiEditableTableEntry): { endOfColumns: boolean } {
            setTimeout(() => {
                this.removeEntry(currentEntry);
            }, 0);

            return { endOfColumns: true };
        }

        public selectNextColumn(data: IMultiEditableTableEntryColumnData, entry: IMultiEditableTableEntry, dir = 1): any | { endOfColumns: boolean } {
            let columnsData = entry.columnsData;
            return this.selectNextAvailableColumn({
                columnsData: columnsData,
                columnIndex: columnsData.indexOf(data),
                columnsLength: columnsData.length,
                dir: dir
            });
        }

        public removeEmptyRow(entry: IMultiEditableTableEntry): void {
            setTimeout(() => {
                //entry: the just focused row
                //remove current row if the row has empty state
                //cell is blured but we have to check if another cell of this row has just focused
                let columnsData = entry.columnsData;

                for (let key in columnsData) {
                    if (columnsData.hasOwnProperty(key) && columnsData[key].vm.isSelected.peek()) {
                        return;//another cell of this row has just focused... stop validation
                    }
                }

                let isEmpty = true;
                for (let key in columnsData) {
                    if (columnsData.hasOwnProperty(key) && !!columnsData[key].vm.value.peek()) {
                        isEmpty = false;
                        break;
                    }
                }

                if (isEmpty) {
                    this.removeEntry(entry);
                }
            }, 0);
        }
    }
}