(function ($, ko, DW) {
    DW.Diagnostics = DW.Diagnostics || {};

    DW.Diagnostics.TickTypes = {
        Client: "Client",
        Server: "Server"
    };

    DW.Diagnostics.EmptyTimeLogger = new Class({
        initialize: function () {

        },

        start: function () {

        },
        stop: function () {

        },
        tick: function () {

        },
        getSummary: function () {

        },
        startChild: function () {

        },
        stopChild: function () {

        },
        getChildLogger: function () {

        }
    });

    DW.Diagnostics.ActionData = new Class({
        action: "",
        timeStarted: 0,
        timeEnded: 0,
        timeEllapsed: 0,
        type: "client",

        initialize: function () {

        },
    });

    //Time logger - logs time ticks when the user decides. It is not used directly by itself. Instead use LoggerManager.createAndStartLogger()
    DW.Diagnostics.TotalTimeLogger = new Class({
        Extends: DW.Diagnostics.EmptyTimeLogger,
        startTime: null, // start time - this is initialized when we call Start() function
        stopTime: null, // stop time, when we finish getting information ... TODO: is it really necessary

        startDateTime: null,
        stopDateTime: null,

        key: "",
        title: "",
        loggedActions: [],
        totalInfo: "",

        initialize: function (key, title) {
            /// <summary>
            /// Initializes the time logger
            /// </summary>
            /// <param name="key">the key its instance is assigned to</param>
            /// <param name="description">description what that time logger is used for.</param>

            this.key = key;
            this.title = title;
        },
        start: function (/* startTime */) {
            /// <summary>
            /// Sets start time and resets the end time. It is possible to pass the start time manually.
            /// </summary>
            this.startDateTime = Date.now();

            if (arguments && arguments.length == 1)
                this.startTime = arguments[0];
            else
                this.startTime = Date.now();

            this.stopTime = null;
            this.loggedActions = [];
            this.totalInfo = "";
        },

        stop: function () {
            /// <summary>
            /// Sets the stop time
            /// </summary>
            this.stopDateTime = Date.now();
            this.stopTime = Date.now();
        },
        getSummary: function (showTitle, showTotalInfo) {
            /// <summary>
            /// Show summary for the collected time information.
            /// </summary>
            var totalClientTime = 0,
                totalServerTime = 0,
                totalTime = this.stopTime - this.startTime;

            return {
                loggedActions: [],
                totalInfo: this.totalInfo,
                title: showTitle ? this.title : '',
                totalTime: totalTime,
                totalClientTime: 0,
                totalServerTime: 0
            };
        }
    });
    //Time logger - logs time ticks when the user decides. It is not used directly by itself. Instead use LoggerManager.createAndStartLogger()
    DW.Diagnostics.TimeLogger = new Class({
        Extends: DW.Diagnostics.TotalTimeLogger,
        timeTicks: null, // simple json object of time stamps and description       
        childLoggers: {},

        initialize: function (key, title) {
            /// <summary>
            /// Initializes the time logger
            /// </summary>
            /// <param name="key">the key its instance is assigned to</param>
            /// <param name="description">description what that time logger is used for.</param>
            this.parent(key, title);
            this.timeTicks = [];
            this.asyncTimeTicks = [];

        },


        startChild: function (title, childLoggerKey, tickType) {
            if (!this.startTime || this.stopTime) return; // if it is not started, we can't tick

            var time = Date.now();

            var childLogger = new DW.Diagnostics.TimeLogger(childLoggerKey, title);
            childLogger.start(time);
            this.childLoggers[childLoggerKey] = childLogger;

            this.timeTicks.push({
                time: time,
                title: title,
                tickType: tickType || DW.Diagnostics.TickTypes.Client,
                childLoggerKey: childLoggerKey
            });

            return this.childLoggers[childLoggerKey];

        },
        stopChild: function (childLoggerKey) {
            if (!!this.childLoggers[childLoggerKey])
                this.childLoggers[childLoggerKey].stop();
        },

        getChildLogger: function (childLoggerKey) {
            if (!!this.childLoggers[childLoggerKey]) {
                return this.childLoggers[childLoggerKey];
            }
            else {
                return DW.Diagnostics.EmptyTimeLogger();
            }
        },

        tick: function (title, tickType) {
            /// <summary>
            /// Adds one tick to the logging information. The time is automatically placed.
            /// </summary>
            /// <param name="title">Tick title (description)</param>
            /// <param name="tickType">Tick type. Check DW.Diagnostics.TickTypes for more information</param>

            if (!this.startTime || this.stopTime) return; // if it is not started, we can't tick

            var time = Date.now(); //this will save the time in miliseconds from year 1970

            this.timeTicks.push({
                time: time,
                title: title,
                tickType: tickType || DW.Diagnostics.TickTypes.Client,
                childLoggerKey: null
            });
        },

        getSummary: function (showTitle, showTotalInfo) {
            /// <summary>
            /// Show summary for the collected time information.
            /// </summary>
            var totalClientTime = 0,
                totalServerTime = 0,
                totalTime = this.stopTime - this.startTime;

            if (this.timeTicks && this.timeTicks.length > 0 && this.stopTime) {
                for (var i = 0; i < this.timeTicks.length; i++) {
                    var actionData = new DW.Diagnostics.ActionData();


                    var duration = 0;
                    var time = DW.Utils.dateObjectToTimeString(this.timeTicks[i].time);
                    duration = i == 0 ? (this.timeTicks[i].time - this.startTime) : (this.timeTicks[i].time - this.timeTicks[i - 1].time);

                    actionData.action = this.timeTicks[i].title;
                    actionData.endTime = this.timeTicks[i].time;
                    actionData.startTime = i == 0 ? this.startTime : this.timeTicks[i - 1].time;
                    actionData.timeEllapsed = duration + "ms";

                    if (this.timeTicks[i].childLoggerKey) {
                        childLogger = this.childLoggers[this.timeTicks[i].childLoggerKey];
                        var summary = childLogger.getSummary(false);

                        // if we don't have ticks in the child logger, we get the type of the start point. If it's server we set it to the global server time
                        if (childLogger.timeTicks.length == 0 && this.timeTicks[i].tickType == DW.Diagnostics.TickTypes.Server) {
                            childLogger.loggedActions[0].type = "server"; //works only becasuse we are sure there are no ticks among the children
                            totalServerTime += summary.totalTime;
                        }
                        else {
                            //this is the case in which we have some tick inside
                            if (this.timeTicks[i].tickType == DW.Diagnostics.TickTypes.Server)
                                childLogger.loggedActions[childLogger.loggedActions.length - 1].type = "server";
                            totalServerTime += summary.totalServerTime;
                        }
                        childLogger.loggedActions.unshift(actionData);
                        this.loggedActions = this.loggedActions.concat(childLogger.loggedActions);
                    }
                    else {
                        this.loggedActions.push(actionData);
                        if (this.timeTicks[i].tickType == DW.Diagnostics.TickTypes.Server) {
                            actionData.type = "server";
                            totalServerTime += duration;
                        }
                    }
                }

                var actionData = new DW.Diagnostics.ActionData();
                this.loggedActions.push(actionData);
                actionData.action = this.title;
                actionData.endTime = this.stopTime;
                actionData.startTime = this.startTime;
                actionData.timeEllapsed = this.stopTime - this.startTime + "ms";
            }
            else if (this.timeTicks && this.timeTicks <= 0 && this.stopTime) {
                var actionData = new DW.Diagnostics.ActionData();
                this.loggedActions.push(actionData);
                actionData.action = this.title;
                actionData.endTime = this.stopTime;
                actionData.startTime = this.startTime;
                actionData.timeEllapsed = this.stopTime - this.startTime + "ms";
            }

            return {
                loggedActions: this.loggedActions,
                totalInfo: this.totalInfo,
                title: showTitle ? this.title : '',
                totalTime: totalTime,
                totalClientTime: totalClientTime,
                totalServerTime: totalServerTime
            };
        }
    });

    /*
    This class is used for triggering loggers. It holds the loggers in hash table. 
    When the user calls createAndStartLogger() it checks whether the diagnostic mode is on. 
    If so, it creates new instance of TimeLogger and holds it in hash table associated with the key,
    which the user has passed to the createAndStartLogger() function. This class is used by static instance, 
    which is created in "startUp.js", among all the other static classes. This means that it can be started at one place
    and stoped at other place in the code, without passing instances of the loggers.
    
    The class defines command "switchDiagnosticMode" which actually triggers on/off the diagnostic mode. This is 
    done by shortcut key combination "Ctrl+Shift+Backspace" and is defined globaly for the website.
    
    Way of usage: 
    1) Call PerformanceCounter.createAndStartLogger(key, description) - pass the key and the description of the logger. 
        Note that the description will be used as title in the summary info toast message
    2) Use getLogger() in the the following way to place ticks around the code you want to monitor:
        
        PerformanceCounter.getLogger("the_key_from_createAndStartTrigger()").tick("description_of_the_tick", "tick_type");
    
            Tick types could be one of the DW.Diagnostics.TickTypes enum values (it is defined in the beginning of this file)
    3) At the end call:
    
        PerformanceCounter.stopLogger("the_key_from_createAndStartTrigger()")
        To stop collecting information for this logger and show summary information for all collected ticks
    
        NOTE: When this function is called, the instance in the has is deleted. When used with the same key again,
              new instance of TimeLogger is created.
    
    How the time calculations are done: 
    
    When createAndStartLogger() function is called for timer it initializes start time for that logger. 
    Each tick saves the time when it appeared. At the end the durations are calculated in the following formula:
    First duration is calculated by extracting the start time from the first tick's time (FirstTickTime - StartTime).
    Each next duration is calculated by extracting the i-th tick's time minus (i-1)-th tick's time -> Tick[i].time - Tick[i-1].time
    
    NOTE: stopLogger() doesn't add tick. If you want to measure the time between the previous tick and the stop moment of the 
    logger you should place one tick just before calling the stopLogger(). See the timeline diagram bellow
    
    StartTime       Tick1          Tick2               LastTick
        |-------------|-------------|----------------------|
        |<-duration1->|<-duration2->|<-   lastDuration   ->|stopLogger()
    
    */

    DW.Commands = DW.Commands || {};
    DW.Commands.SwitchDiagnosticModeCommand = new Class({
        Extends: DW.Command,
        name: 'switchDiagnosticMode',
        initialize: function (performanceCounter) {
            this.performanceCounter = performanceCounter;
        },
        execute: function (requires) {
            this.performanceCounter.diagnosticMode(!this.performanceCounter.diagnosticMode());

            if (this.performanceCounter.diagnosticMode())
                toastr.infoUnsafe("", "Diagnostic mode is <b>ON</b>");
            else
                toastr.infoUnsafe("", "Diagnostic mode is <b>OFF</b>");
        }
    });

    //DW.Diagnostics.MetricsPerformanceCounterPrototype = new Class({
    //    Extends: DW.Disposable,
    //    loggers: null,
    //    diagnosticMode: null,
    //    summaryVisitor: null,
    //    trackMetrics: false,
    //    initialize: function (summaryVisitor) {
    //        var self = this;
    //        this.trackMetrics = trackMetrics;
    //        this.summaryVisitor = summaryVisitor || function () { };
    //        this.loggers = {}; // hash table of loggers
    //        this.diagnosticMode = DW.PersistFactory.getPersistState('Diagnostics').persistItem("isDiagnosticsModeEnabled", false);
    //        this.switchDiagnosticMode = new DW.Commands.SwitchDiagnosticModeCommand(this);
    //    }
    //});

    DW.Diagnostics.PerformanceCounterPrototype = new Class({
        Extends: DW.Disposable,
        loggers: null,
        diagnosticMode: null,
        summaryVisitor: null,
        trackMetrics: false,
        initialize: function (summaryVisitor, trackMetrics) {
            var self = this;
            this.trackMetrics = trackMetrics;
            this.summaryVisitor = summaryVisitor || function () { };
            this.loggers = {}; // hash table of loggers
            this.diagnosticMode = DW.PersistFactory.getPersistState('Diagnostics').persistItem("isDiagnosticsModeEnabled", false);
            this.switchDiagnosticMode = new DW.Commands.SwitchDiagnosticModeCommand(this);
        },

        startLogger: function (key, description, context) {
            /// <summary>
            /// Create new time logger and starts it
            /// </summary>
            /// <param name="key">Key which this logger instance will correspond to</param>
            /// <param name="description">Description for the logger, which will then be used for title of the summary information</param>
            if (!key) return; // ?

            if (this.diagnosticMode()) {
                this.loggers[key] = {
                    logger: new DW.Diagnostics.TimeLogger(key, description),
                    context: context
                };
                this.loggers[key].logger.start();
            }
            else if (this.trackMetrics) {
                this.loggers[key] = {
                    logger: new DW.Diagnostics.TimeLogger(key, description),
                    context: context
                };
                this.loggers[key].logger.start();
            }
            else {
                this.loggers[key] = {
                    logger: new DW.Diagnostics.EmptyTimeLogger(),
                    context: context
                };
            }
        },

        getLoggerEntry: function (key /* childKey, subChildKey, subSubChildKey,...*/) {
            var loggerEntry = {
                logger: new DW.Diagnostics.EmptyTimeLogger(),
                context: {}
            };

            if (key && this.loggers[key]) {
                loggerEntry = this.loggers[key];

                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        var tempLogger = logger.getChildLogger(arguments[i]);
                        if (!tempLogger) tempLogger = new DW.Diagnostics.EmptyTimeLogger();
                        loggerEntry.logger = tempLogger;
                    }
                }
            }
            
            return loggerEntry;
        },

        getLogger: function (key /* childKey, subChildKey, subSubChildKey,...*/) {
            return this.getLoggerEntry(key).logger;
        },

        stopLogger: function (key) {
            /// <summary>
            /// Stop logger and show its summary info
            /// </summary>
            /// <param name="key">Key which corresponds to the logger</param>

            if (this.loggers[key]) {
                var loggerObj = this.loggers[key],
                    logger = loggerObj.logger;
                logger.stop();
                var absoluteStart = logger.startDateTime;
                var absoluteEnd = logger.stopDateTime;
                var summary = logger.getSummary(true, true);
                delete this.loggers[key];

                // finally show the toastr
                // do not hide the message on mouse hover, remove timeout, make it global, and close the message only on click/tap over it or somewhere else
                if (summary) {
                    if (this.diagnosticMode()) {
                        // TODO: The last element is Total Summary so we don't want to include it.
                        summary.loggedActions.pop();
                        for (var i = 0; i < summary.loggedActions.length; i++) {
                            this.convertFromStringTimeToPercentCoordinates(summary.loggedActions[i].startTime, summary.loggedActions[i].endTime, absoluteStart, absoluteEnd, summary.loggedActions[i]);
                        }
                        var $content = DW.Utils.renderTemplate('diagnostic-time-logger', summary);
                        toastr.noIconUnsafe(summary.title, $content, { scope: toastrScope.global, tapToDismiss: true, closeOnHover: false, timeOut: 0 })
                            .addClass('diagnostic-time-logger');
                    }
                    if (!loggerObj.context || !loggerObj.context.skipMetrics)
                        this.summaryVisitor(summary, key, loggerObj.context);
                }
            }
        },
        convertFromStringTimeToPercentCoordinates: function (startTime, stopTime, absoluteStartTime, absoluteStopTime, element) {
            absoluteStartTime = new Date(absoluteStartTime);
            //from string to dateTimes to miliseconds
            var size = new Date(absoluteStopTime) - absoluteStartTime;
            startTime = new Date(startTime) - absoluteStartTime;
            stopTime = new Date(stopTime) - absoluteStartTime;
            //from absolute miliseconds to relative percentages
            element.start = startTime * 100 / size;
            element.width = Math.max(1, (stopTime - startTime) * 100 / size);
        }
    });
})($, ko, DW);