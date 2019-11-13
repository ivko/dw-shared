using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ToastrComponent : ComponentDefinition
    {
        public ToastrComponent()
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
            var t = typeof(ToastrComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "toastr.js",
                "ko.bindingHandlers.toastr.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/toastr/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
       
    }
}
