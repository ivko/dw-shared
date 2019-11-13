/*
* DocuWare browser tabs
* ========================================================================================
*   - buttons as tab view, without using jQuery Tabs
*   - custom click events
*   - custom icons 
* 
* Depends:
*   - jQuery & jQuery UI
*/
(function ($) {
  // The jQuery.DocuWare namespace will automatically be created if it doesn't exist
  $.widget("DocuWare.browserTab", {
    // These options will be used as defaults
    options: {
      primaryIcon: {
        icon: '',
        click: function () { return }
      },
      secondaryIcon: {
        icon: '',
        click: function () { return }
      },
      newTabIcon: {
        text: '',
        click: function () { return }
      }
    },
    // The _create method is where you set up the widget
    _create: function () {
      // this.element -- a jQuery object of the element the widget was invoked on.
      // this.options --  the merged options hash
      var pluginOptions = this.options;
      var self = this;
      self.internal_cssClassName = "dw-browserTab";

      //add custom classname, we will be only working with this selector
      self.element.addClass(self.internal_cssClassName);

      //setup tab buttons
      self._initializeTabButtons();
    },
    _initializeTabButtons: function (newCreatedId) {
      var pluginOptions = this.options;

      //add custom class to all labels with a for tag if not already existing
      $("." + this.internal_cssClassName + " label").not(".tab-label").addClass("tab-label");

      //add custom icons for tabs(max 2 allowed)
      $("." + this.internal_cssClassName + " input").not(".ui-helper-hidden-accessible").button({
        icons: {
          primary: pluginOptions.primaryIcon.icon,
          secondary: pluginOptions.secondaryIcon.icon
        }
      })

      //transform to set of buttons. This is needed for a tablist effect
      $("." + this.internal_cssClassName).buttonset().disableSelection();

      //hide all primary and secondary icons that are not active
      this._toggleTabIcons();
      var self = this;
      $(".tab-label", this.element).bind("click", function (e) {
        self._toggleTabIcons(this);
      });


      //add button for "new Tab"
      if ($("." + this.internal_cssClassName + " .addTab").length == 0) {
        $("." + this.internal_cssClassName).append("<button class='addTab'>&nbsp;</button>​");
        $("." + this.internal_cssClassName + " .addTab").text(pluginOptions.newTabIcon.text);
        $("." + this.internal_cssClassName + " .addTab").button({ icons: { primary: 'ui-icon-plusthick' }, text: false });
        $("." + this.internal_cssClassName + " .addTab").click(function () {
          if (!pluginOptions.newTabIcon.click())
            return
        })
      }


      //add click and hover event for primary and secondary icon on new tabs
      var primarySelector = "." + this.internal_cssClassName + " .tab-label .ui-button-icon-primary";
      var secondarySelector = "." + this.internal_cssClassName + " .tab-label .ui-button-icon-secondary";

      if (newCreatedId != undefined) {
        primarySelector = "." + this.internal_cssClassName + " .tab-label[for=" + newCreatedId + "] .ui-button-icon-primary";
        secondarySelector = "." + this.internal_cssClassName + " .tab-label[for=" + newCreatedId + "] .ui-button-icon-secondary";
      }

      $(primarySelector).click(function () {
        if (!pluginOptions.primaryIcon.click())
          return;
      }).hover(function () {
        $(this).toggleClass('ui-state-highlight')
      });

      $(secondarySelector).click(function () {
        if (!pluginOptions.secondaryIcon.click())
          return;
      }).hover(function () {
        $(this).toggleClass('ui-state-highlight')
      });
    },
    _toggleTabIcons: function () {
      //make primary and secondary icon only available for active tab
      //icon in all other tabs will be hided
      $("." + this.internal_cssClassName + " .tab-label .ui-button-icon-primary, ." + this.internal_cssClassName + " .tab-label .ui-button-icon-secondary").hide();
      $("." + this.internal_cssClassName + " .ui-state-active .ui-button-icon-primary, ." + this.internal_cssClassName + " .ui-state-active .ui-button-icon-secondary").show();
    },
    addTab: function (id, label) {
      //add new tab with details
      $("." + this.internal_cssClassName + " .addTab").before("<input type='radio' id='" + id + "' name='radio' /><label for='" + id + "'>" + label + "</label>");
      this._initializeTabButtons(id);
    },
    refresh: function () {
      this._initializeTabButtons();
    },
    // Use the destroy method to reverse everything your plugin has applied
    destroy: function () {
      $.Widget.prototype.destroy.call(this);
    }
  })
})(jQuery);