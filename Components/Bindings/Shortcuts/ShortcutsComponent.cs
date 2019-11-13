using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class ShortcutsComponent: ComponentDefinition
    {
        public ShortcutsComponent()
            : base(dependencies: GetDependencies(), scripts: GetScripts()/*, templates: GetTemplates()*/)
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
            var t = typeof(ShortcutsComponent);
            return new List<ResourceDefinition>(new string[]
            {
                "Bindings/Shortcuts/ko.shortcuts.js",
                "Bindings/Shortcuts/ko.contextMenuShortcuts.js",
                "Bindings/Shortcuts/ko.dynamicKeysShortcuts.js",
                "Bindings/Shortcuts/ShortcutsDispatcher.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/{1}", ComponentDefinition.SharedComponentsPath, s))));
        }
    }
}
