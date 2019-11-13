using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class TableComponent : ComponentDefinition
    {
        public TableComponent()
            : base(/*dependencies: GetDependencies(),*/ scripts: GetScripts(), templates: GetTemplates())
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
            var t = typeof(TableComponent);
            return new List<ResourceDefinition>(new string[] 
            {
                "TableDataProvider.js",
                "VirtualTableDataProvider.js",
                "DefaultTableBehaviours.js",
                "LoadingQueue.js",
                "TableVM.js",
                "SortableTableBehaviourVM.js",
                "FilterTableBehaviourVM.js",
                "VirtualTableVM.js",
                "Column.js",
                "EditableTableBehaviour.js"
            }
            .Select(s => new ResourceDefinition(t, string.Format("{0}/table/Scripts/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }

        private static List<ResourceDefinition> GetTemplates()
        {
            return new List<ResourceDefinition>(new string[] 
            { 
                "Table.html"
            }
            .Select(s => new ResourceDefinition(typeof(TableComponent), string.Format("{0}/table/Templates/{1}", ComponentDefinition.SharedWidgetComponentsPath, s))));
        }
    }
}
