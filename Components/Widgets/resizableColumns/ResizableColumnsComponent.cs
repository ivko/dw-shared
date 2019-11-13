using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ResizableColumnsComponent : ComponentDefinition
    {
        public ResizableColumnsComponent()
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
            var t = typeof(ResizableColumnsComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "jquery.resizableColumns.js",
                "ko.bindingHandlers.resizableColumns.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/resizableColumns/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
    }
}
