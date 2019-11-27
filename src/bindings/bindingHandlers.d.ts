interface KnockoutBindingHandlers {

    tooltip: KnockoutBindingHandler,

    autocompleteMenu: KnockoutBindingHandler,

    /**
    * Create and show infobox on hover
    * @param keyStringResourceValue { string } - usage example: data-bind="infobox: 'DialogFulltext_RebuildFulltext_Label'"
    */
    infobox: KnockoutBindingHandler,

    /**
    * Create delegated events handling 
    * should be assigned to container element
    * @param eventsArray { string[] } - usage example: <tbody data-bind="delegatedHandler: ['click', 'dblclick', 'mousedown']"/>
    */
    delegatedHandler: KnockoutBindingHandler,

    /**
    * knockout-sortable is a binding for Knockout.js designed to connect observableArrays with jQuery UI's sortable functionality. 
    * This allows a user to drag and drop items within a list or between lists and have the corresponding observableArrays updated appropriately.
    * @param object { JSON } - usage example: <ul data-bind="sortable: { template: 'itemTmpl', data: items }"></ul>
    * https://github.com/rniemeyer/knockout-sortable
    */
    sortable: KnockoutBindingHandler,

    /**
    * With draggable binding you can place on single items that can be moved into a sortable collection. 
    * When the item is dropped into a sortable, the plugin will attempt to call a clone function on the item to make a suitable copy of it, 
    * otherwise it will use the item directly. Additionally, the dragged callback can be used to provide a copy of the object, as described above.
    * @param object { JSON } - usage example: <div data-bind="draggable: { template: 'itemTmpl', data: item }"></div>
    * https://github.com/rniemeyer/knockout-sortable
    */
    draggable: KnockoutBindingHandler,

    /**
    * KoLite contains a set of helpers to aid in creating MVVM applications using JavaScript and Knockout. Including: asyncCommand, command, activity, dirtyFlag
    * @param isExecuting { function() { return boolean; } } - usage example: <button data-bind="activity: saveCommand.isExecuting, command: saveCommand">Save</button>
    * http://www.johnpapa.net/kolite1-1/
    * https://github.com/CodeSeven/KoLite
    */
    activity: KnockoutBindingHandler,

    /**
    * Numeric binding
    * @param  object { JSON }
    */
    numeric: KnockoutBindingHandler,

    /**
    * Console log of binding value accessor
    * @param value { any }
    */
    debugBinding: KnockoutBindingHandler,

    /**
    * Set element to focus
    */
    setFocus: KnockoutBindingHandler,

    /**
    * Removes class 'ui-state-disabled' if element have value
    */
    enableEx: KnockoutBindingHandler,

    /**
    * Adds class 'ui-state-disabled'
    */
    disableEx: KnockoutBindingHandler,

    /**
    * Handler for highlighting the text in the control which has focus - currently used in the handling of the rename document in the result views
    * @param isSelected { boolean } - usage example: selected: $parent.list.selectedIndex() == $index(),
    */
    selected: KnockoutBindingHandler,

    /**
    * Trigger additional click
    * @param object { JSON }
    */
    clickrelay: KnockoutBindingHandler,

    /**
    * Console log of binding element, value accessor, and count
    * @param value { any }
    */
    logger: KnockoutBindingHandler,

    // data-bind="spinner2: maxFulltextHitcount, spinnerOptions: { min: 0, step: 1, max: 2147483647, intOnly: true }"

    /**
    * Executes spinner widget
    * @param maxFulltextHitcount { any } 
    * @param spinnerOptions { JSON } - usage example: data-bind="spinner2: maxFulltextHitcount, spinnerOptions: { min: 0, step: 1, max: 2147483647, intOnly: true }"
    */
    spinner2: KnockoutBindingHandler,

    /**
    * Executes command on enter
    */
    enter: KnockoutBindingHandler,

    /**
    * Generate unique id
    */
    uniqueId: KnockoutBindingHandler,

    /**
    * Generate for attribute of unique id
    */
    uniqueFor: KnockoutBindingHandler,

    /**
    * Scroll to an element with a true param
    * @param scroll { function() { return boolean; } } - usage example: scrollElementIntoView: function () { return $data == $parent.scrollRow(); }
    */
    scrollElementIntoView: KnockoutBindingHandler,

    /**
    * Select element on focus
    */
    autoSelectText: KnockoutBindingHandler,

    /**
    * Used to insert special amout of text at current caret position in textarea and input
    * @param value { observable } - usage example: insertAtCaret: { valueProvider: currentServerVariable }
    */
    insertAtCaret: KnockoutBindingHandler,

    /**
    * Show the popover widget
    * @param template { string } 
    * @param options { JSON } - usage example: popover: { templateName: 'popover-users-and-roles', viewModel: $data, options: { container: 'body', trigger: 'hover' } }
    */
    popover: KnockoutBindingHandler,

    /**
    * Show the tooltip widget
    * @param container { string } 
    * @param title { string|observable } 
    * @param placement { string } 
    * @param tooltipType { string } - usage example: tooltip2: { container: 'body', title: name, placement : 'bottom', tooltipType: 'hideable'}
    */
    tooltip2: KnockoutBindingHandler,

    /**
    * Positions an element
    * @param template { string } 
    * @param options { JSON } - usage example: data-bind="position: { isVisible: $data.visible, positionAtElement: true, stopPropagation: true, template: $data.template, focusElement: '.ui-menu', closeOnEscape: true, data: $data.data }"
    */
    position: KnockoutBindingHandler,

    /**
    * Not used sort binding
    */
    dwSortable: KnockoutBindingHandler,

    /**
    * Remove checked attr of element
    */
    uncheck : KnockoutBindingHandler,
 
    /**
    * <summary>
    *     Command custom binding
    *     Two options for valueAccessor: 
    *         - command (a class that extends DW.Command), 
    *         - an object that maps specific event or custom binding handler to a command
    * </summary>
    * <param name="valueAccessor" type="DW.Command or {event_1: DW.Command, event_2: DW.Command }"></param>
    * For source code refer to CommandBindingHandler.js 
    */
    command: KnockoutBindingHandler,

    /**
    * Delegated command binding
    * example usage: data-bind="delegatedCommand: $parents[1].addFilter" - to child //// data-bind="delegatedHandler: ['click', 'mousedown']" to parent
    */
    delegatedCommand: KnockoutBindingHandler,

    /**
    * Delegated double click command binding
    * example usage: data-bind="delegatedDblClickCommand: $parents[1].editFieldSettings" - to child //// data-bind="delegatedHandler: ['click', 'dblclick', 'mousedown']" to parent
    */
    delegatedDblClickCommand: KnockoutBindingHandler,

    /**
    * <summary>
    *     Group commands visibility binding. Controls element visibility, so if all the passed to the binding commands have false visible function return value, the element is hidden
    * </summary>
    */
    commandGroupVisibile: KnockoutBindingHandler,

    /**
    * <summary>
    *     Group commands enable binding. Controls element enabled/disabled state, so if all the passed to the binding commands have false canExecute return value, the element is disabled
    * </summary>
    */
    commandGroupEnable: KnockoutBindingHandler,

    /**
    * Initialize calendarsPicker widget
    * @param value { date } 
    * @param datepickerOptions { JSON } - usage example:  <input type="text" data-bind="datepicker: $data.value, datepickerOptions: { changeMonth: true, changeYear: true, showButtonPanel: true }" />
    */
    datepicker: KnockoutBindingHandler,

    /**
    * Initialize calendarsPicker widget
    * @param value { date } 
    * @param datepickerOptions { JSON } - usage example:  datetimepicker: EndDateTime, enable: $root.Enable, datepickerOptions: { changeMonth: true, changeYear: true, showButtonPanel: true, isRangeEndDate: true } />
    */
    datetimepicker: KnockoutBindingHandler,

    /**
    * Initialize calendarsPicker widget
    * @param value { date } 
    * @param datepickerOptions { JSON } - usage example:  readOnlyDatePicker: $data.value, datepickerOptions: { changeMonth: true, changeYear: true, showButtonPanel: true, isRangeStartDate: $data.isRangeStart, isRangeEndDate: $data.isRangeEnd, disabled: !data.isCustomEntryEnabled}
    */ 
    readOnlyDatePicker: KnockoutBindingHandler,

    /**
    * Initialize calendarsPicker widget
    * @param value { date } 
    * @param datepickerOptions { JSON } - usage example:  readOnlyDateTimePicker: $data.value, datepickerOptions: { changeMonth: true, changeYear: true, showButtonPanel: true, isRangeStartDate: $data.isRangeStart, isRangeEndDate: $data.isRangeEnd, disabled: !data.isCustomEntryEnabled}
    */ 
    readOnlyDateTimePicker: KnockoutBindingHandler,

    /**
    * Initialize timeEntry widget
    * @param value { string } 
    * @param datepickerOptions { JSON } - usage example:  data-bind="timeentry: ScheduleStartTime, enable:RunAtEnabled"
    */ 
    timeentry: KnockoutBindingHandler,

    /**
    * Initialize dialog widget - not used
    */ 
    dwDialog: KnockoutBindingHandler,
    jqDialog: KnockoutBindingHandler,
    openDialog : KnockoutBindingHandler,
    wfjqDialog: KnockoutBindingHandler,

    /**
    * Fix dialog height after load
    * @param fix { boolean } - usage example: data-bind="fixedDialogHeight: true"
    */ 
    fixedDialogHeight: KnockoutBindingHandler,

    /**
    * Initialize dwScrollbar widget 
    * @param contentSelector { boolean }
    * @param options { JSON } usage example - data-bind="dwScrollbar: { contentSelector: false, options: { } }"
    */ 
    dwScrollbar: KnockoutBindingHandler,

    /*
    * Initialize inputmask widget 
    * @param value { string }
    * @param alias { string }
    * @param regex { string }
    * @param autoUnmask { boolean }
    * usage example - inputMask: { value: $data.value, alias:'Regex', regex:'\\+\\D{2}\\d?-\\d{2}\\d{0,2}?-\\d{3}\\d{0,7}', autoUnmask:true },*/
    inputMask: KnockoutBindingHandler,

     /**
    * Initialize context menu
    * @param contextMenu { dataVm } - usage example:  data-bind="contextMenu: $data"
    */
    contextMenu: KnockoutBindingHandler,

    /**
    * Initialize autoNumeric control
    * Works with floating numbers and decimal string
    * @param minimum { string|number }
    * @param numericValueOptions { JSON } - usage example: data-bind="numericValue: minimum, numericValueOptions: numberOptions"
    */
    numericValue: KnockoutBindingHandler,

    /**
    * Triggers change() of the element
    */
    fireChange: KnockoutBindingHandler,

    /**
    * Initialize simple SlickGrid
    */
    simpleSlickGrid: KnockoutBindingHandler,

    /**
    * Initialize toastr widget
    * usage example in js - toastr.warning("", $R('String_Resource'));
    */
    toastr: KnockoutBindingHandler,

    /**
    * Starts validationEngine control - not used
    * can be used for controlling validation engine within
    * field assignment eg. to handle flaws showing validation error messages
    */
    validationEngineController: KnockoutBindingHandler,

    /**
    * loose coupled function for adding proper jQuery-ValidationEngine css attributes
    * and input masks with "meio mask"-plugin
    */
    validationMask: KnockoutBindingHandler,

    /**
    * all fixed entry fields are hidden by default. Show appropriate field
    */
    isVisible: KnockoutBindingHandler,

    /**
    * Double click handler
    * usage example - data-bind="doubleClick: functionHandler"
    */
    doubleClick: KnockoutBindingHandler,

    /**
    * Custom binding to initialize a jQuery UI button
    * usage example - data-bind="jqButton: { options: { label: resx['Label_FormDescription'], icons: { primary: ' dw-icon-plus ico-dec-2' } } }"
    */
    jqButton: KnockoutBindingHandler,

    /**
    * Connect items with observableArrays
    * usage example - data-bind="sortableList: vm.ActiveFormConfig.FormTemplates"
    */
    sortableList: KnockoutBindingHandler,

    /**
    * usage example - data-bind="mxCheckButton: vm.FormTemplateDesigner.Zones.selectedWebFormField, mxCheckButtonValue: ID, mxCheckButtonClick: vm.FormTemplateDesigner.Zones.SelectedWebFormFieldChanged, attr: { id: ID, title: ID, type: Type }, jqButton: { options: { icons: { primary: IconClass }, label: Label() } }"
    */
    mxCheckButton: KnockoutBindingHandler,

    /**
    * Represent Signature Pad v1.4.0 https://github.com/szimek/signature_pad
    * usage example - data-bind="signatureField: $data, attr: { 'width': + $data.Width() + 'px' , 'height': + $data.Height() + 'px' }"
    */
    signatureField: KnockoutBindingHandler,

    /**
    * usage example - data-bind='enableSaveBtnOnChanges: vm.folderHasChanges(), click: vm.changeWatchedFolder'
    */
    enableSaveBtnOnChanges: KnockoutBindingHandler,

    /**
    * Starts datepicker widget - not used
    */
    anyDatePicker: KnockoutBindingHandler,

    /**
    * Enables button
    * usage example : data-bind='buttonEnable: RunEnable'
    */
    buttonEnable: KnockoutBindingHandler,

    /**
    * Text to button
    * usage example : data-bind='buttonText: resx['WizardRunOnceTitle']"'
    */
    buttonText: KnockoutBindingHandler,

    /**
    * Apply dialog widget
    * @param options { JSON }
    * usage example : data-bind="dialog: { autoOpen: false, resizable: false, modal: true, dialogClass: 'dw-dialogs', close: function(){}, open: function{}"
    */
    dialog: KnockoutBindingHandler,

    /**
    * Checkbox class binding
    * @param options { JSON }
    * usage example : data-bind="checkbox: {container: assignedRoles, checkedCssClass: 'checked', value: '@role.Guid'}"
    */
    checkbox: KnockoutBindingHandler,

    /**
    * Apply accordion widget
    * @param options { JSON }
    */
    accordion: KnockoutBindingHandler,

    /**
    * Apply button widget
    * @param options { JSON }
    */
    button: KnockoutBindingHandler,

    /**
    * Toggles the class silverlightHidden
    */
    cssCustomHidden: KnockoutBindingHandler,

    /**
    * Apply qb autocomplete menu
    * @param data { viewModel } 
    * @param viewModelOptions { JSON } 
    * usage example data-bind="textInput: $data.value, qbAutocompleteMenu: { data: $data, viewModelOptions: { fieldValue: $data.value, setSelectListValue: $data.value, suggestionsProvider: $data.systemFunctions } }"
    */
    qbAutocompleteMenu: KnockoutBindingHandler,

    /**
    * Apply fc autocomplete menu
    * @param data { viewModel } 
    * @param viewModelOptions { JSON } 
    * usage example data-bind="fcAutocompleteMenu: { enabled: $data.enabled, data: $data, viewModelOptions: { selectListDialogExpression: $parent.buildSelectListDialogExpression.bind($parent) } }"
    */
    fcAutocompleteMenu: KnockoutBindingHandler,

    /**
    * Grids works WEC
    */
    exportjobslist: KnockoutBindingHandler,
    importjobslist: KnockoutBindingHandler,
    availablecontainers: KnockoutBindingHandler,

    /**
    * ----------------------------------------------------------------------
    * Custom Knockout bindings defined by team DocProc for graphical editing
    * ----------------------------------------------------------------------
    */

    /**
    * Makes a graph node (NodeVM) draggable within its container when bound to a boolean that is true.
    */
    nodeDraggable: KnockoutBindingHandler;


    /**
    * Makes a graph node (NodeVM) resizable within its container when bound to a boolean that is true.
    */
    nodeResizable: KnockoutBindingHandler;

    /**
    * Renders an SVG connector for a link (LinkVM), from its source node (NodeVM) to its target node (NodeVM).
    */
    linkConnector: KnockoutBindingHandler;

    repositionOnWindowResize: KnockoutBindingHandler;

    resizeObserver: KnockoutBindingHandler;

    responsiveNavigation: KnockoutBindingHandler;

    treeViewNavigation: KnockoutBindingHandler;

    safeHtml: KnockoutBindingHandler;

    selectFocused: KnockoutBindingHandler;

    insertToCaret: KnockoutBindingHandler;
    
    /**
    * -------------------------
    * End of DocProc extensions
    * -------------------------
    */

   
}