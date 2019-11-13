using DocuWare.Web.Mvc.Resources.Bundling;
using System.Collections.Generic;
using System.Linq;

namespace DocuWare.Web.Mvc.Resources.SharedResources.Components
{
    public class DWUIComponent : ComponentDefinition
    {
        public DWUIComponent()
            : base(dependencies: GetDependencies())
        { }

        private static IEnumerable<ComponentDefinition> GetDependencies()
        {
            return new ComponentDefinition[]
            {
                Get<ExternalComponent>(),
                Get<DWCoreComponent>(),

                Get<KnockoutComponent>(),

                Get<ScrollbarComponent>(),
                Get<AutocompleteComponent>(),
                Get<TooltipComponent>(),
                Get<PopoverComponent>(),
                Get<ToastrComponent>(),
                Get<TabsComponent>(),
                Get<AccordionComponent>(),
                Get<DialogsComponent>(),
                Get<SpectrumComponent>(),
                Get<ResizableColumnsComponent>(),
                Get<SelectComponent>(),
                Get<SlickGridComponent>(),
                Get<MenusComponent>(),
                Get<DWActivityComponent>(),
                Get<InputMaskComponent>(),
                Get<TableComponent>(),
                Get<ValueFormattingComponent>()
            };
        }
    }
}
