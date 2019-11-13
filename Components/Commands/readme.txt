 DW Commands
 ---------------------
 1.Requirements: 
	- JQuery, Mootools, Knockout, 
	- DW specific: 
		...\src\DocuWare\RestfulWebservices\AspMvcSharedResources\SharedResources\Components\Bindings\knockoutExtensions.js
		...\src\DocuWare\RestfulWebservices\AspMvcSharedResources\SharedResources\Components\ViewModels\Disposable.js
		...\src\DocuWare\RestfulWebservices\AspMvcSharedResources\SharedResources\Components\utils.js
		...\src\DocuWare\RestfulWebservices\AspMvcSharedResources\SharedResources\Components\Bindings\BindingHandler.js
		...\src\DocuWare\RestfulWebservices\AspMvcSharedResources\SharedResources\Components\Commands\Command.js
		...\src\DocuWare\RestfulWebservices\AspMvcSharedResources\SharedResources\Components\Commands\CommandBindingHandlers.js
		
		
 -custom command binding: 'command', defined with CommandBindingHandler class
 -command binding adapter: defined with CommandBindingAdapter, used for mediator between the command interface and the binding
 -command object: all objects that would be used as commands should extend the base DW.Command class

---------------------------------------------------------------------------------------------
Purpose:

 To have a stand alone object that represents an activity and capsulates it's own logic for visibility and enabled/disabled state of the element which it's bound to.
 So instead of:

	<button type="button" data-bind="click: displayDocument, enable: enableDisplayDocument, visible: hideDisplayDocument">Display Document</button>

 where we have to have separate displayDocument, enableDisplayDocument and hideDisplayDocument functionality, that all use at some point the same context, we use the 'commands':

	<button type="button" data-bind="command: displayDocumentCommand">Display Document</button>

 That way if there is another view model where the logic is similar and we have to define the same or similar activity/visibility/availability logic, we can just use the already defined command.

---------------------------------------------------------------------------------------------
Example: 

<!--For each document in the documents array in myVM, on click, use the displayCommand command to do something, if it is allowed-->
	<!--ko with: myVM1-->
	<div data-bind="foreach: documents">
		<button type="button" data-bind="command: $parent.displayDocumentCommand">Display document</button>
	</div>
	<!--/ko-->

    <!--ko with: myVM2-->
	<div data-bind="foreach: tasks">
		<button type="button" data-bind="command: $parent.displayTaskCommand">Display task</button>
	</div>
	<!--/ko-->

	var myVM1 = new Class({
        initialize: function () {
            this.displayDocumentCommand = new DisplayCommand();
			this.documents = ['doc1', 'doc2', 'doc3'];
        },
		display: function(doc){
			//do something specific for documents
		}	
	 });

	 var myVM2 = new Class({
        initialize: function () {
            this.displayTaskCommand = new DisplayCommand();
			this.tasks = ['task1', 'task2', 'task3'];
        },
		display: function(task){
			//do something specific for tasks
		}	
	 });

	var DisplayCommand = new Class({
        Extends: DW.Command,
		requires: {
			_myVM: function(vm){
				return !!(vm.documents) || !!(vm.tasks); // true/false
			}
		},
        execute: function (requires) {
			var item = requires.data;		//the current context in the html. In our case it is either a document or a task
			var _myVM = requires._myVM;		//some required parent context. In our case: myVM1 or myVM2 

			//do something that is same for documents and tasks

            _myVM.display(item);
        },
		canExecute: function (isExecuting, requires) {
			/* var item = requires.data;	
			var _myVM = requires._myVM;	*/

			var canExecute = true/*false*/;
			//some logic here...

            return this.parent(isExecuting, requires) && canExecute;
        },
        available: function (requires) {
			/* var item = requires.data;	
			var _myVM = requires._myVM;	*/

			var available = true/*false*/;
			//some logic here...

            return this.parent(requires) && available;
        },
        visible: function (requires) {
			/* var item = requires.data;	
			var _myVM = requires._myVM;	*/

			var visible = true/*false*/;
			//some logic here...

            return this.parent(requires) && visible;
        }
    });

----------------------------------------------------------------------------------------------
Special cases:
 When we want to specify on which event or custom binding handler the command should be executed we use:

	<button type="button" data-bind="command: {keyup: $parent.displayDocumentCommand"}>DisplayDocumentCommand</button>

 The canExecute, available and visible would apply the same way, but the command would be executed on keyup instead of on click.

 ---------------------------------------------------------------------------------------------
 Command Bundles:
 When we have more a view model that has many commands or than one view models that have similar set of commands, we define a command bundle.
 The bundle can take the view model as argument if neccesary and capsulate the commands logic.

 Example:
 //instead of:
	var myVM = new Class({
        initialize: function () {
            this.command_1 = new Command_1();
			this.command_2 = new Command_2();
			this.command_3 = new Command_3();
			//...
			this.command_n = new Command_N();
        }	
	 });

 //use:
	var myVM = new Class({
        initialize: function () {
            this.commands = new CommandBundle();
        }	
	 });

	//simple example:
	var CommandBundle = new Class({
		Extends: DW.Commands.Bundle,
		commands: {
			command_1: Command_1,
			command_2: Command_2,
			command_3: Command_3,
			//...
			command_n: Command_N
		}
	 });
	 //example with late initialization of the commands: when we want to pass some arguments to the commands initilize function
	 var CommandBundle = new Class({
		Extends: DW.Commands.Bundle,
		commands: {
			command_1: Command_1,
			command_2: Command_2
		},
		initialize: function(options){

			this.setCommands({ 
                command_3: { ctor: Command_3, args: [options] },
				command_4: { ctor: Command_4, args: [this, options] }, //this command would have as arguments in it's initialize function 1)this bundle; 2)the options
				//...
				command_n: { ctor: Command_N, args: [options] },
            });

			this.parent();
		}
	 });

 ---------------------------------------------------------------------------------------------
