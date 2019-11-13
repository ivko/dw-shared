using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class DWActivityComponent : ComponentDefinition
    {
        public DWActivityComponent()
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
            var t = typeof(DWActivityComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "jquery.ui.dwActivity.js",
                "ko.bindingHandlers.dwActivity.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/dwActivity/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
    }
}
