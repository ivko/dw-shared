namespace PagesContainerComponent {

    export class PagesContainerVM extends DWTS.BusyTriggerVM {
        protected tasks: DWTS.Disposable;
        protected ready: KnockoutObservable<boolean> = ko.observable(false);
        protected pages: KnockoutObservableArray<IPage> = ko.observableArray([]);
        protected currentPage: KnockoutObservable<IPage> = ko.observable<IPage>();
        protected currentPageIndex: KnockoutObservable<number> = ko.observable(-1);
        public initializing: KnockoutObservable<boolean> = ko.observable(false);
        public isNavigationAvailable: KnockoutObservable<boolean> = ko.observable(true);
        public switchPageCommand: DW.Command;
        public init: () => JQueryPromise<void>;

        constructor(protected pagesFactory: () => JQueryPromise<IPage[]>) {
            super();

            this.pages = this.addDisposable(ko.observableArray<IPage>().trackHasItems());
            this.trackPages();

            this.switchPageCommand = this.addDisposable($.extend(new DW.Command(), {
                execute: (requires: { data: IPage }) => {
                    this.tryChangePage(requires.data, true);
                },
                canExecute: (isExecuting: boolean, requires: { data: IPage }) => {
                    var pageVM = requires.data;
                    return pageVM.canActivate();
                }
            }));

            this.init = DW.Utils.lazyDeferred<void>((dfd) => {
                this.initializing(true);
                DW.When(this.loadPages())
                    .then(dfd.resolve, dfd.reject)
                    .fail((error) => {
                        DW.Utils.handleError(error);
                        dfd.reject();
                    })
                    .always(() => {
                        this.initializing(false);
                    });
            });
        }

        protected loadPages(startupPageType?: string): JQueryPromise<void> {
            this.ready(false);
            this.tasks = new DWTS.Disposable();
            return this.pagesFactory()
                .then((pages: IPage[]) => {
                    this.initPages(pages, startupPageType);
                })
                .always(() => this.ready(true));
        }

        protected initPages(pages: IPage[], startupPageType?: string) {
            this.pages(pages);
            if (startupPageType) {
                this.navigatoToPage(startupPageType);
            } else {
                this.setFirstAvailablePage();
            }
        }

        private setFirstAvailablePage(): void {
            var activePageVM = this.pages().find((pageVM) => {
                return pageVM.canActivate();
            });
            this.currentPage(activePageVM);
        }

        public isCurrentPage(page: IPage): boolean {
            return this.currentPage() == page;
        }

        public tryChangePage(newPage: IPage, forceSet: boolean = false) {

            let canChangePage = false,
                currentPage = this.currentPage.peek(),
                scopeExited = false;/*sync navigateAway promise */

            if (!currentPage || currentPage === newPage) return true;

            let promise = this.tasks.addDisposableTask(currentPage.navigateAway(newPage))
                .done(() => {
                    canChangePage = true;
                    if (scopeExited || forceSet) {
                        //navigation decision took some time ...
                        //then we manually navigate to the desired page
                        this.currentPage(newPage);
                    }
                })
                .fail((error) => {
                    DW.Utils.handleError(error);
                    canChangePage = false;
                    this.onChangePageError(error);
                });

            //disable UI if 'navigateAway' performs an async job
            if (promise.state() == 'pending') this.addBusyPromise(promise);

            scopeExited = true;

            return canChangePage;
        }

        protected onChangePageError(error: DWTS.Error): void {
        }

        protected navigatoToPage(pageType: string) {
            let page = this.pages().find((p) => p.getType() == pageType);
            if (!page)
                this.setFirstAvailablePage();
            else {
                this.currentPage(page);
            }
        }

        private trackPages(): void {
            this.addDisposable(this.currentPageIndex.subscribe((index) => {
                if (this.pages().length > 0 && index < this.pages().length && index >= 0) {
                    let newPage = this.pages()[index];
                    if (newPage !== this.currentPage() && newPage.canActivate())
                        this.currentPage(newPage);
                }
                else {
                    this.currentPage(null);
                }
            }, this));

            this.addDisposable(this.currentPage.subscribe((pageVM: IPage) => {
                let index = this.pages().indexOf(pageVM);
                if (index >= 0) {
                    //if (this.active()) {
                    pageVM.show();
                    //}
                    this.currentPageIndex(index);
                }
                else {
                    this.currentPageIndex(-1);
                }
            }, this));

            this.addDisposable(this.currentPage.subscribe((oldPage: IPage) => {
                if (oldPage) oldPage.hide();
            }, this, "beforeChange"));
        }

        protected hasBusyPages(): boolean {
            return this.pages().some((inst) => inst.isBusy());
        }

        protected validatePage(page: IPage, showError: boolean = false): boolean {
            if (!page) return true;
            let validRes = page.validate();
            if (validRes.isValid) return true;
            if (showError) toastr.error("", validRes.messages[0]);
            return false;
        }

        protected warn(): void {
            if (!this.currentPage()) return;
            let result = this.currentPage().getWarnings();
            if (!result.isValid) toastr.warning("", result.messages[0]);
        }

        protected disposeTasks(): void {
            DW.Utils.dispose(this.tasks);
            this.tasks = null;
        }

        public dispose(): void {
            super.dispose();
            this.disposePages();
        }

        public disposePages(): void {
            DW.Utils.dispose(this.pages.removeAll());
            this.currentPage(null);
        }
    }
}