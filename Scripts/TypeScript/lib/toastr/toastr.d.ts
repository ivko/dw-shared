// Type definitions for Toastr 2.0.1
// Project: https://github.com/CodeSeven/toastr
// Definitions by: Boris Yankov <https://github.com/borisyankov/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped


/// <reference path="../jquery/jquery.d.ts" />

interface ToastrButtonsOptions {

    value?: boolean | string;
    text?: boolean | string;
    label?: boolean | string;
    className?: string;
    url?: boolean | string,
    urlTarget?: string;
    role?: string;
    focus?: boolean;
}

interface ToastrButtons {

    ok?: ToastrButtonsOptions,
    cancel?: ToastrButtonsOptions
}
interface ToastrOptions {
	/**
	* Optionally override the animation easing to show or hide the toasts. Default is swing. swing and linear are built into jQuery.
	*/
	showEasing?: string;
	/**
	* Optionally override the animation easing to show or hide the toasts. Default is swing. swing and linear are built into jQuery.
	*/
	hideEasing?: string;
	/**
	* Use the jQuery show/hide method of your choice. These default to fadeIn/fadeOut. The methods fadeIn/fadeOut, slideDown/slideUp, and show/hide are built into jQuery.
	*/
	showMethod?: string;
	/**
	* Use the jQuery show/hide method of your choice. These default to fadeIn/fadeOut. The methods fadeIn/fadeOut, slideDown/slideUp, and show/hide are built into jQuery.
	*/
	hideMethod?: string;
	/**
	* Should a close button be shown
	*/
	closeButton?: boolean;
	/**
	* Html for the close button
	*/
	closeHtml?: string;
	/**
	* Should clicking on toast dismiss it?
	*/
	tapToDismiss?: boolean;
	/**
	* CSS class the toast element will be given
	*/
	toastClass?: string;
	/**
	* Id toast container will be given
	*/
	containerId?: string;
	/**
	* Should debug details be outputted to the console
	*/
	debug?: boolean;
	/**
	* Time in milliseconds the toast should take to show
	*/
    showDuration?: number;
    /**
	* Time in milliseconds the toast should take to fade in
	*/
    fadeIn?: number;
    /**
	* Time in milliseconds the toast should take to fade out
	*/
    fadeOut?: number;
	/**
	* onShown function callback
	**/
	onShown?: () => void;
	/**
	* Time in milliseconds the toast should take to hide
	*/
	hideDuration?: number;
	/**
	* onHidden function callback
	**/
	onHidden?: () => void;
	/**
	* Time in milliseconds the toast should be displayed after mouse over
	*/
	extendedTimeOut?: number;
	iconClasses?: {
		/**
		* Icon to use on error toasts
		*/
		error: string;
		/**
		* Icon to use on info toasts
		*/
		info: string;
		/**
		* Icon to use on success toasts
		*/
		success: string;
		/**
		* Icon to use on warning toasts
		*/
        warning: string;
        /**
		* Icon to use on confirmation toasts. (Added by DocuWare.)
		*/
        confirm: string;
        /**
		* Do not use an icon. (Added by DocuWare.)
		*/
        noIcon: string;
    };
    buttons?: ToastrButtons;

    roles?: { confirm: string, cancel: string };
	/**
	* Icon to use for toast
	*/
	iconClass?: string;
	/**
	* Where toast should be displayed
	*/
	positionClass?: string;
	/**
	* Where toast should be displayed - background
	*/
	backgroundpositionClass?: string;
	/**
	* Time in milliseconds that the toast should be displayed
	*/
	timeOut?: number;
	/**
	* CSS class the title element will be given
	*/
	titleClass?: string;
	/**
	* CSS class the message element will be given
	*/
	messageClass?: string;
	/**
	* Set newest toast to appear on top
	**/
	newestOnTop?: boolean;
	/**
	* The element to put the toastr container
	**/
	target?: string;
	/**
	* Rather than having identical toasts stack, set the preventDuplicates property to true. Duplicates are matched to the previous toast based on their message content.
	*/
	preventDuplicates?: boolean;
	/**
	* Visually indicates how long before a toast expires.
	*/
	progressBar?: boolean;
	/**
	* Function to execute on toast click
	*/
	onclick?: () => void;
	/**
	* Set if toastr should parse containing html 
	**/
    allowHtml?: boolean;
    /**
     * The text to be shown on the Ok button.
     */
    okText?: string;
    /**
     * The text to be shown on the Cancel button.
     */
    cancelText?: string;
    closingCallback? : () => void;
}

interface ToastrDisplayMethod {
	/**
	* Create a toast.
	*
	* @param message Message to display in toast
	*/
	(message: string): JQuery;
	/**
	* Create a toast.
	*
	* @param message Message to display in toast
	* @param title Title to display on toast
	*/
	(message: string, title: string): JQuery;
	/**
	* Create a toast.
	*
	* @param message Message to display in toast
	* @param title Title to display on toast
	* @param overrides Option values for toast
	*/
    (message: string, title: string, overrides: ToastrOptions): JQuery;
}

//added by DocuWare
interface ToastrDisplayMethodWithClass extends ToastrDisplayMethod {
    /**
	* Create a toast of a particular type.
	*
	* @param message Message to display in toast
	* @param title Title to display on toast
	* @param overrides Option values for toast
	* @param iconClass Type of icon to display. Warning by default.
	*/
    (message: string, title: string, overrides: ToastrOptions, iconClass?: string): JQuery;
}

//added by DocuWare
interface ToastrDisplayMethodWithCallback extends ToastrDisplayMethodWithClass {
    /**
	* Create a toast with a callback function.
	*
    * @param title Title to display on toast
	* @param message Message to display in toast
	* @param overrides Option values for toast, for overriding the defaults.
	* @param iconClass Type of icon to display
	* @param callback Function which will be called when the user clicks the Ok or Cancel buttons. It will be called with first parameter true for Ok and with false for Cancel.
	*/
    (message: string, title: string, callback: (confirm: boolean | string) => void, overrides: ToastrOptions, iconClass?: string): JQuery;
}

//added by DocuWare
interface ToastrDisplayMethodWithProgressBar {
     /**
	* Shows a progress notification. Doesn't escape the string. It allows showing html formatted message
    * @param title: Progress title
    * @param progress: a toastrProgress object used to define and controll the progress value.
	*/
    (message: string, progress: ToastrProgress): JQuery;

    /**
	* Shows a progress notification. Doesn't escape the string. It allows showing html formatted message
    * @param title: Progress title
    * @param progress: a toastrProgress object used to define and controll the progress value.
    * @param optionsOverride: used to override the default options just for the current progress notification instance.
	*/
    (message: string, progress: ToastrProgress, overrides: ToastrOptions): JQuery;
}

// added by DocuWare
// Class used to controll the progress notification. 
// The progressbar will automatically stop and disapper if the current value is equals to or bigger than the man value.
interface ToastrProgress {
        // The minimum value of the progressbar
        min: number;
        // The maximum value of the progressbar
        max: number;
        // The value of the progressbar.
        value: KnockoutObservable<number>;
        // Value indicating wether to stop and hide the progress bar.
        stop: KnockoutObservable<boolean>;
}

interface Toastr {
    defaults: ToastrOptions;//.buttons.ok
	/**
	* Clear toasts
	*/
	clear: {
		/**
		* Clear all toasts
		*/
		(): void;
		/**
		* Clear specific toast
		* 
		* @param toast Toast to clear
		*/
		(toast: JQuery): void;
	};
	/**
	* Create an error toast
	*/
    error: ToastrDisplayMethod;
    /**
	* Create an error toast. Doesn't escape the string. Allows showing HTML formatted message. (Added by DocuWare.)
	*/
    errorUnsafe: ToastrDisplayMethod;
	/**
	* Create an info toast
	*/
    info: ToastrDisplayMethod;
    /**
	* Create an info toast. Doesn't escape the string. Allows showing HTML formatted message. (Added by DocuWare.)
	*/
    infoUnsafe: ToastrDisplayMethod;
	/**
	* Create an options object
	*/
	options: ToastrOptions;
	/**
	* Create a success toast
	*/
    success: ToastrDisplayMethod;
    /**
	* Create a success toast. Doesn't escape the string. Allows showing HTML formatted message. (Added by DocuWare.)
	*/
    successUnsafe: ToastrDisplayMethod;
	/**
	* Create a warning toast
	*/
    warning: ToastrDisplayMethod;
    /**
	* Create a warning toast. Doesn't escape the string. Allows showing HTML formatted message. (Added by DocuWare.)
	*/
    warningUnsafe: ToastrDisplayMethod;
	
    /**
     * Create a notification toast. Doesn't escape the string. Allows showing HTML formatted message. (Added by DocuWare.)
     */
    notifyUnsafe: ToastrDisplayMethodWithClass;

    /**
     * Create a neutral toast. Doesn't escape the string. Allows showing HTML formatted message. (Added by DocuWare.)
     */
    noIconUnsafe: ToastrDisplayMethod;

    /**
     * Create a toast which must be confirmed by the user. (Added by DocuWare.)
     */
    confirm: ToastrDisplayMethodWithCallback;

    /**
     * Shows a confirm notification with Ok and Cancel buttons. The Ok and Cancel buttons text can be changed in options okText and cancelText.
     * Doesn't escape the string. Allows showing HTML formatted message. (Added by DocuWare.)        
     */
    confirmUnsafe: ToastrDisplayMethodWithCallback;

     /**
     * Create a progress notification. Allows showing HTML formatted message. (Added by DocuWare.)
     */
    progress: ToastrDisplayMethodWithProgressBar;

    /**
	* Get toastr version 
	*/
	version: string;
}

declare var toastr: Toastr;
declare module "toastr" {
    export = toastr;
}

declare var toastrProgress: ToastrProgress;
declare module "toastrProgress" {
    export = ToastrProgress;
}

