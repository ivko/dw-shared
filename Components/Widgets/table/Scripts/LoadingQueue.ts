namespace DWTS {

    export interface ILoadingTask {
        task: JQueryDeferred<any>;
        id: string;
    }

    // TO DO: implement and use it in TableVieModel 
    export class LoadingQueue extends DWTS.ViewModel {

        private tasks: [];

        constructor() {
            super();
        }

        public isLoading(): boolean {
            return this.tasks.length > 0;
        }

        public addLoadingTask(): void {
            //var task = $.Deferred<void>(),
            //    taskPromise = this.loadingTask.promise();
            //this.loadingQuque.tasks.push({ promise: taskPromise });
        }

        public removeLoadingTask(): void {
            //this.tasks.remove()
        }

        public getLoadingPromise(): JQueryDeferred<any> {
            if (this.tasks.length) {
                return this.tasks[this.tasks.length - 1];
            }
            return DW.Utils.resolvedDeferred;
        }

    }

}