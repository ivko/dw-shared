namespace DWTS.ComboboxComponent {

    export class ComboboxVM<T> extends DWTS.ViewModel {
        // items' metadata
        public displayProp: string;
        public valueProp: string;
        public captionOptions: DWTS.Interfaces.Components.ComboboxComponent.IComboboxCaptionOptions;

        // items' data
        public availableItems: KnockoutObservableArray<any> = ko.observableArray();
        public selectedItem: KnockoutObservable<any>;

        public elementAttributes: { class: string, id: string };

        private filter: (items: Array<any>, selectedItem: any) => Array<any>;
        private enabled: () => boolean;
        private isLocked: () => boolean = () => false;

        private valueSelector: DWTS.Interfaces.Components.ComboboxComponent.IValueSelectorOptions<T>;

        constructor(options: DWTS.Interfaces.Components.ComboboxComponent.IComboboxComponentOptions<T>) {
            super();

            this.valueProp = options.optionsValue;
            this.displayProp = options.optionsText;
            this.elementAttributes = options.elementAttributes;
            this.captionOptions = {
                text: options.captionText,
                value: options.captionValue || "",
                noneText: options.captionNoneText
            };
            this.enabled = options.enabled ? options.enabled : () => true; // function to monitor if component is enabled
            this.filter = options.filter ? options.filter : (items) => { return items; };

            this.valueSelector = options.valueSelector;

            this.selectedItem = ko.observable(this.valueSelector.getSelectedControllerItem(options.value(), this.valueProp));

            let items = this.filter(options.options().slice(), this.selectedItem);

            options.orderAlphabetically === true ? items.alphanumSort(1, this.displayProp, true) : null;

            this.initInaccessibleItem(items, options.value(), options.invalidResource);
            this.initCaptionItem(items);
            this.availableItems(items);


            //set the external selected value
            this.addDisposable(this.selectedItem.subscribe((item) => {
                let newItem = this.valueSelector.findItem(item, this.availableItems.peek(), this.valueProp);
                options.value(newItem);
            }));

            this.initSelected(this.availableItems().slice(), options.value(), true);
            this.initLock(options.lock); //monitor if the component is still unactive and uninitialized


            //update the combobox items when the external items array is updated
            this.addDisposable(options.options.subscribe((newItems) => {
                let currentItems = this.availableItems.peek(),
                    items = this.filter(newItems.slice(), this.selectedItem), //check this
                    currentSelected = options.value.peek();
                options.orderAlphabetically === true ? items.alphanumSort(1, this.displayProp, true) : null;

                if (currentItems.length && !this.itemExists(items, currentSelected) && !currentItems.some((item) => {
                    return currentSelected === item[this.valueProp] && !!this.displayProp && !!options.invalidResource && item[this.displayProp] === options.invalidResource;
                })) {
                    //we are updating the items at later point and there is no item that could match the previous selection
                    this.resetSelected();
                }
                else this.initInaccessibleItem(items, currentSelected, options.invalidResource);

                this.initCaptionItem(items);
                this.availableItems(items);

                if (this.isCaption(this.selectedItem.peek()) && (!this.isLocked || !this.isLocked()))
                    this.initSelected(items, null, true);
            }));

            //update the combobox selected item when the external selected value is updated
            this.addDisposable(options.value.subscribe((newItem) => {
                let items = this.availableItems.peek().slice();

                this.initInaccessibleItem(items, newItem, options.invalidResource);
                this.availableItems(items);
                this.initSelected(items, newItem, false);
            }));
        }

        private initLock(isLocked: () => boolean) {
            if (!!isLocked) {
                this.isLocked = isLocked;
                // if access to the component can be locked,
                // provide logic for both cases (locked/unlocked)

                this.addDisposable(ko.computed(() => {
                    let items = this.availableItems.peek().slice(),
                        selected = this.selectedItem.peek();

                    this.initCaptionItem(items);
                    this.availableItems([]);
                    this.availableItems(items);

                    if (!this.isLocked()) {
                        let selected = this.selectedItem.peek();

                        this.initSelected(items, selected, true);
                    };
                }));
            }
        }
        
        private itemExists(items: Array<any>, value): boolean {
            return items.some((item) => {
                return item[this.valueProp] == this.valueSelector.getItemValue(value, this.valueProp);
            });
        }

        private initInaccessibleItem(items: Array<any>, initialValue, invalidResource: string) {
            //check the caption case with (initialValue[this.vm.valueProp])?
            if (invalidResource && initialValue && !this.isCaption(initialValue) && !this.itemExists(items, initialValue)) {

                items.push(this.valueSelector.buildInaccessibleItem(initialValue, this.displayProp, invalidResource, this.valueProp));
            }
        }

        private buildCaptionItem(isEmpty: boolean) {
            return isEmpty || this.isLocked() ?
                { [this.valueProp]: this.captionOptions.value, [this.displayProp]: this.captionOptions.noneText } :
                { [this.valueProp]: this.captionOptions.value, [this.displayProp]: this.captionOptions.text };
        }

        private initCaptionItem(items: Array<any>) {
            if (!this.captionOptions.noneText && !this.captionOptions.text) {
                //no caption provided to the component
                return;
            }

            let captionItem = this.buildCaptionItem(items.length == 0);

            //add the caption to the array
            let currentCaption = items.find((item) => item[this.valueProp] == this.captionOptions.value);

            if (!currentCaption) items.unshift(captionItem);
            else currentCaption[this.displayProp] = captionItem[this.displayProp];

            //this.availableItems(items);
        }

        private autoSelectFirstItem(items: Array<any>) {
            let value = this.captionOptions.value; //'' by default

            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (item[this.valueProp] !== this.captionOptions.value) {
                    if (value == this.captionOptions.value)
                        value = item[this.valueProp];
                    else {
                        value = this.captionOptions.value;
                        break;
                    }
                }
            }

            this.selectedItem(value);
        }

        private initSelected(items: Array<any>, selected: T, autoselect: boolean) {
            // preselect the first value if selected is not present

            if (selected || !autoselect) {
                if (autoselect && (this.isCaption(selected) || !items.some((item) => { return item[this.valueProp] == this.valueSelector.getItemValue(selected, this.valueProp) }))) {
                    this.autoSelectFirstItem(items);
                } else {
                    this.selectedItem(this.valueSelector.getItemValue(selected, this.valueProp));
                }
            } else {
                this.autoSelectFirstItem(items);
            }
        }

        private isCaption(item: T): boolean {
            return this.valueSelector.getItemValue(item, this.valueProp) == this.captionOptions.value;
        }

        private resetSelected() {
            this.selectedItem(this.captionOptions.value);
        }
    }

}



