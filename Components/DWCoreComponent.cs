using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class DWCoreComponent : ComponentDefinition
    {
        public DWCoreComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts(), templates: GetTemplates())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>()
            };
        }

        private static List<ResourceDefinition> GetScripts()
        {
            return new string[]
            {
                "jquery.extensions.js",
                "jquery.ui.dwDaggable.js",
                "Deferred.js",
                "utils.js",
                "utils.isEqual.js",
                "Userlane.js",
                "ko.updateTiggers.js",
                "filteredTemplateEngine.js",
                "Range.js",
                "ViewModels/TS/Disposable.js",
                "Collections/CrudMap.js",
                "Collections/Dictionary.js",
                "Collections/Trackable.js",
                "Collections/Set.js",
                "Collections/ArrayTracker.js",
                "ViewModels/Disposable.js",
                "ViewModels/ViewModel.js",
                "ViewModels/BusyTriggerVM.js",
                "ViewModels/TS/ViewModel.js",
                "ViewModels/TS/BusyTriggerVM.js",
                "ViewModels/TS/ChangesTrackerVM.js",
                "ViewModels/TS/BaseDialogVM.js",
                "ViewModels/ScrollView.js",
                "ViewModels/UsersAndRolesCache.js",
                "ViewModels/BaseDialogVM.js",
                "ViewModels/BaseComponentApi.js",
                "ViewModels/OutOfOfficeSettingsVM.js",
                "Bindings/BindingHandler.js",
                "Bindings/ClearButton/clearButton.js",
                "Bindings/koJquiBindingFactory.js",
                "Bindings/knockoutExtensions.js",
                "Bindings/koBindingHandlers.js",
                "Bindings/knockout.activity.js",
                "Bindings/knockout-delegatedEvents.js",
                "Bindings/knockout-sortable.js",
                "Bindings/knockout.validation.js",
                "Bindings/knockoutCustomValidations.js",
                "Bindings/knockout.doughnut.js",
                "Bindings/position.js",
                "Bindings/svgOverlay.js",
                "Bindings/sortable.js",
                "Bindings/trackerEventDispatcher.js",
                "Bindings/uncheck.js",
                "Storage/BaseStorage.js",
                "Storage/LocalStorage.js",
                "Storage/PersistExtender.js",
                "Storage/PersistState.js",
                "Commands/Scripts/Command.js",
                "Commands/Scripts/CommandBindingHandler.js",
                "Commands/Scripts/CommandBindingAdapter.js",
                "Commands/Scripts/DelegatedCommandBindingHandler.js",
                "Commands/Scripts/CommandGroupBindingHandlers.js",
                "Diagnostics/Scripts/TimeLogger.js",
            }
            .Select(s => new ResourceDefinition(typeof(DWCoreComponent), string.Format("{0}/{1}", ComponentDefinition.SharedComponentsPath, s)))
            .ToList();
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new string[]
            {
                "Bindings/ClearButton/ClearButtonTemplate.html"
            }
            .Select(s => new ResourceDefinition(typeof(DWCoreComponent), string.Format("{0}/{1}", ComponentDefinition.SharedComponentsPath, s)))
            .ToList();
        }
    }
}
