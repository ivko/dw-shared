module DisposableApi {
    export function dispose(obj) {
        if (!obj) return;
        if ($.isFunction(obj.dispose)) {
            obj.dispose();
        } else if ($.isArray(obj)) {
            obj.forEach(function (item) {
                DisposableApi.dispose(item);
            });
        }
    }
}
namespace DWTS {

    export interface IDisposable {
        addDisposable<T>(disposable: T): T;
        removeDisposable<T>(disposable: T): T;
        addDisposableTask<T>(task: JQueryPromise<T>): JQueryPromise<T> ;
        dispose(): void;
    }

    export class Disposable implements IDisposable {      

        protected disposables: any[];
        protected disposed: boolean;
        private _disposableTasks: any[];

        constructor() {
            this.disposables = [];
            this._disposableTasks = [];
            this.disposed = false;        
        }

        public addDisposable<T>(disposable: T) : T{
            this.disposables.push(disposable);
            return disposable;
        }

        public removeDisposable<T>(disposable: T) : T {
            let index = this.disposables.indexOf(disposable);
            if (index >= 0) {
                this.disposables.splice(index, 1);
            }
            return disposable;
        }

        public addDisposableTask<T>(task: JQueryPromise<T>) : JQueryPromise<T> {
            let dfd = DW.Deferred<T>();
            this._disposableTasks.push(dfd);
            dfd.always(function () {
                this._disposableTasks.erase(dfd);
            }.bind(this));
            DW.When(task)
                .progress(dfd.notify)
                .done(dfd.resolve)
                .fail(dfd.reject)
            return dfd.promise();
        }

        public dispose(): void {
            if (!this.hasOwnProperty('disposables')) return;
            DisposableApi.dispose(this.disposables);
            //create new array, so it can be iterate safly
            this._disposableTasks
                .map(function (task) {
                    return task;
                })
                .forEach(function (task) {
                    task.reject({
                        canceled: true
                    });
                });

            delete this._disposableTasks;
            delete this.disposables;
        }
    }
}