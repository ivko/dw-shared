using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ToggleItemComponent : ComponentDefinition
    {

        public ToggleItemComponent()
            : base(/*dependencies: GetDependencies(),*/ scripts: GetScripts())
        { }

        //private static List<ComponentDependency> GetDependencies()
        //{
        //    return new List<ComponentDependency>() 
        //    {
        //        new ComponentDependency(ComponentDefinition.Get<ExternalComponent>()),
        //        new ComponentDependency(ComponentDefinition.Get<DWCoreComponent>())
        //    };
        //}

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(ToggleItemComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "ToggleItemVM.js",
                "ToggleItemsCommands.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/ToggleItemComponent/Scripts/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }
    }
}
