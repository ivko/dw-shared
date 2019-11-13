using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class SlickGridComponent : ComponentDefinition
    {
        public SlickGridComponent()
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
            var t = typeof(SlickGridComponent);
            return new List<ResourceDefinition>(new string[] 
            {
                "slickGrid/js/slick.core.js",
                "slickGrid/js/slick.grid.js",
                "slickGrid/js/slick.rowselectionmodel.js",
                "slickGrid/js/slick.cellselectionmodel.js",
                "slickGrid/js/slick.cellrangeselector.js",
                "slickGrid/js/slick.cellrangedecorator.js",
                "slickGrid/js/slick.autotooltips.js",
                "slickGrid/js/slick.droppable.js",
                "slickGrid/js/dataViewDragProcessor.js",
                "slickGrid/js/ko.bindingHandlers.slickGrid.js",
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
    }
}
