using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DocuWare.Web.Mvc.Resources.Bundling;

// ReSharper disable once CheckNamespace
namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class FontPickerComponent : ComponentDefinition
    {
        public FontPickerComponent()
            : base(scripts: GetScripts(), templates: GetTemplates())
        { }


        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                ComponentDefinition.Get<DWCoreComponent>(),
                ComponentDefinition.Get<DWUIComponent>(),
            };
        }

        private static List<ResourceDefinition> GetScripts()
        {
            var t = typeof(FieldsMappingComponent);
            return new List<ResourceDefinition>(new string[]
            {
                "DefaultFontPickerParams.js",
                "FontPickerVM.js",
                "FontPickerComponent.js"
            }
            .Select(s => new ResourceDefinition(t, $"{ComponentDefinition.SharedComponentsPath}/Bindings/Component/FontPickerComponent/Scripts/{s}")));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[]
            {
                "FontPickerComponent.html"
            }
            .Select(s => new ResourceDefinition(typeof(FieldsMappingComponent), $"{ComponentDefinition.SharedComponentsPath}/Bindings/Component/FontPickerComponent/Templates/{s}")));
        }
    }
}

