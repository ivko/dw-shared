(function ($) {
  // Register namespace
  $.extend(true, window, {
    "Slick": {
      "AutoTooltips": AutoTooltips
    }
  });

  /**
   * AutoTooltips plugin to show/hide tooltips when columns are too narrow to fit content.
   * @constructor
   * @param {boolean} [options.enableForCells=true]        - Enable tooltip for grid cells
   * @param {boolean} [options.enableForHeaderCells=false] - Enable tooltip for header cells
   * @param {number}  [options.maxToolTipLength=null]      - The maximum length for a tooltip
   */
  function AutoTooltips(options) {
    var _grid;
    var _self = this;
    var _defaults = {
      enableForCells: true,
      enableForHeaderCells: false,
      maxToolTipLength: null
    };
    
    /**
     * Initialize plugin.
     */
    function init(grid) {
      options = $.extend(true, {}, _defaults, options);
      _grid = grid;
      if (options.enableForCells) {
          _grid.onMouseEnter.subscribe(handleMouseEnter);
          _grid.onMouseLeave.subscribe(handleMouseLeave);
      }
      if (options.enableForHeaderCells) {
          _grid.onHeaderMouseEnter.subscribe(handleHeaderMouseEnter);
          _grid.onHeaderMouseLeave.subscribe(handleHeaderMouseLeave);
      }
    }
    
    /**
     * Destroy plugin.
     */
    function destroy() {
        if (options.enableForCells) {
            _grid.onMouseEnter.unsubscribe(handleMouseEnter);
            _grid.onMouseLeave.unsubscribe(handleMouseLeave);
        }
        if (options.enableForHeaderCells) {
            _grid.onHeaderMouseEnter.unsubscribe(handleHeaderMouseEnter);
            _grid.onHeaderMouseLeave.unsubscribe(handleHeaderMouseLeave);
        }
    }
    
    /**
     * Handle mouse entering grid cell to add/remove tooltip.
     * @param {jQuery.Event} e - The event
     */

    function getCalculatedWidth(text, fontw, fontSize) {
        var $textwidth = $('<div style="position: absolute; top: 0; left: 0; visibility: hidden"><div>').css('font-size', fontSize).css('font-weight', fontw).appendTo('.grid-canvas:visible');
        $textwidth.text(text);
        var maxWidth = $textwidth.width();
        $textwidth.remove();
        return maxWidth;
    }    

    function handleMouseEnter(e) {
        var cell = _grid.getCellFromEvent(e);
        if (cell) {
            var $node = $(_grid.getCellNode(cell.row, cell.cell));//get the cell node - it can contain one string(grid), or several strings (thumbnail/cardview)
            var innerCells = $node.find(".tooltipContainer");
            if (innerCells.length == 0) {//grid mode
                if ($node[0].title) return;

                setNodeTooltipText($node);
            }
            else {//thumbnail/cardview
                attachTooltipsToContainer($node, ".tooltipContainer");//check for 
                attachTooltipsToContainer($node, ".content");
            }
        }
    }

    function attachTooltipsToContainer($node, containerClass) {
        $node.find(containerClass).each(function () {
            var $subnode = $(this);
            if ($subnode[0].title) return;

            setNodeTooltipText($subnode);
        });
    }

    function setNodeTooltipText($node) {
        var text;
        //var containerWidth = (mode == "gridMode" || mode == "cardMode") ? $node.width() : $node.parent().width();
        if ($node.parent().find(':truncated').length !== 0) {
            text = $.trim($node.text());
            if (options.maxToolTipLength && text.length > options.maxToolTipLength) {
                text = text.substr(0, options.maxToolTipLength - 3) + "...";
            }
        } else {
            text = "";
        }
        $node.attr("title", text);
    }

    function handleMouseLeave(e) {
        var cell = _grid.getCellFromEvent(e);
        if (cell) {
            var $node = $(_grid.getCellNode(cell.row, cell.cell))
            var innerCells = $node.find(".tooltipContainer");
            if (innerCells.length == 0) {//grid mode
                removeTooltip($node);
            }
            else {
                removeTooltipsFromContainer($node, ".tooltipContainer");
                removeTooltipsFromContainer($node, ".content");
            }
        }
    }

    function removeTooltipsFromContainer($node, containerClass) {
        $node.find(containerClass).each(function () {
            var $subnode = $(this);
            removeTooltip($subnode);
        });
    }

    function removeTooltip($node) {
        if ($node[0].title)
            $node[0].title = "";
    }
    
    /**
     * Handle mouse entering header cell to add/remove tooltip.
     * @param {jQuery.Event} e     - The event
     * @param {object} args.column - The column definition
     */
    function handleHeaderMouseEnter(e, args) {
      var column = args.column,
          $node = $(e.target).closest(".slick-header-column"),
          text;
      if (column && !column.toolTip) {
          text = $('<div />').html(column.name).text();
          $node.attr("title", ($node.is(':truncated')) ? text : "");
      }
    }

    function handleHeaderMouseLeave(e, args) {
        var $node = $(e.target).closest(".slick-header-column");
        removeTooltip($node);
    }
    
    // Public API
    $.extend(this, {
      "init": init,
      "destroy": destroy
    });
  }
})(jQuery);