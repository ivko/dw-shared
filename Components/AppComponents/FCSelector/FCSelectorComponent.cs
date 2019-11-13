using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class FCSelectorComponent : ComponentDefinition
    {
        public FCSelectorComponent()
            : base(scripts: GetScripts(), templates: GetTemplates(), localization: GetLocalization(), dependencies: GetDependencies())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<ConnectionDialogComponent>()
            };
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(FCSelectorComponent);
            return new List<ResourceDefinition>(new string[]
            {
                "Utils.js",
                "Commands.js",
                "ComponentApi.js",
                "FileCabinetListVM.js",
                "FileCabinetSelectorVM.js",
                "FCSelectorVM.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/FCSelector/Scripts/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
            {
                "DropDownMenu.html",
                "FCSelector.html"
            }
            .Select(s => new ResourceDefinition(typeof(FCSelectorComponent), string.Format("{0}/FCSelector/Templates/{1}", ComponentDefinition.SharedAppComponentsPath, s))));
        }

        private static LocalizationDefinition GetLocalization()
        {
            return new LocalizationDefinition("FCSelector", "~/bin/SharedResources/Components/AppComponents/FCSelector/Localization");
        }
    }
}
