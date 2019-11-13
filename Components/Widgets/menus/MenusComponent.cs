using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;


namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class MenusComponent : ComponentDefinition
    {
        public MenusComponent()
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
            var t = typeof(MenusComponent);
            return new List<ResourceDefinition>(new string[] 
            { 
                "jquery.ui.baseMenu.js",
                "ko.bindingHandlers.baseMenu.js",
                "jquery.ui.contextMenu.js",
                "ko.bindingHandlers.contextMenu.js",
                "jquery.ui.horizontalMenu.js",
                "ko.bindingHandlers.horizontalMenu.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/menus/js/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
    }
}
