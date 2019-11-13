using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class DialogsComponent : ComponentDefinition
    {
        public DialogsComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ExternalComponent>(),
                ComponentDefinition.Get<DWCoreComponent>()
            };
        }
        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(DialogsComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                  "jquery.ui.dialog.js",
                  "DialogModes.js",
                  "Dialog.js",
                  "ko.dialogBindings.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/dialogs/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
    }
}
