import {Disposable} from "../model/disposable";

/*
 *http://wiki.docuware.ag/mediawiki/index.php/Reusable_Components#Commands
 */
export interface CommandOptions {
  requires?: any;
  execute(requires: any, ...args): any;
  canExecute?:(isExecuting: boolean, requires: any)=> boolean;
  available?: (requires: any) => boolean;
}

export class Command extends Disposable {

  requires: any;
  public isExecuting: KnockoutObservable<boolean>;

  constructor();
  constructor(options?: CommandOptions);

  /**
    * Calls the class constructor.
    * Called when creating a nes instance of the class (var Command = new Command())
    * @return {void}
    */
  //public initialize(options?: CommandOptions): void;

  /**
    * Set required
    * @param requires The requres json
    * @return {void}
    */
  public setRequires(requires: any): void;

  /**
    * At runtime executing can be suspended in a case of
    * currently running command or specific UI mode
    * @param isExecuting Shows if the command is executiong at the moment.
    * @param requires The requres json
    * @return {boolean}
    */
  public canExecute(isExecuting: boolean, requires: any): boolean;

  /**
    * Global availability
    * for example user doesnt have right to execute the command
    * as user rights usualy dont change at runtime
    * @param requires The requres json
    * @return {boolean} value can be cached(this is left to the command)
    */
  public available(requires?: any): boolean;

  /**
    * Knockout binding context dependent
    * for example one command can be attached
    * simultaneously on context menu and button
    * this function is called for both
    * @param requires The requres json
    * @return {boolean} can return promise for async
    */
  public visible(requires?: any): boolean;

  /**
    * Actual command body function
    * can return promise for async
    * @param requires The requres json
    * @return {void}
    */
  public execute(requires?: any, ...args): any; // void, JQueryPromise<any>
}

export class Bundle extends Disposable {

  public commands;
  /**
    * Calls the class constructor.
    * Called when creating a nes instance of the class (var CommandsBundle = new CommandsBundle())
    * @return {void}
    */
  public initialize(): void;

  /**
    * Set commands
    * @param commands Array of commands
    * @return {void}
    */
  public setCommands(commands: Command[]): void;

  /**
    * Extend commands params
    * @param params 
    * @return {void}
    */
  public extendCommandsParams(...params: any[]): void; 

  /**
    * Init commands
    * @return {void}
    */
  public initCommands(): void;
}