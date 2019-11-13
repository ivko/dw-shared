//must pass all options to jQuery Tabs
//requires jQuery UI(Tabs)

/*
*
* DocuWare wizard dialog
* ========================================================================================
*   - custom buttons through options
*   - custom event injections for default dialog buttons(onDialog...)
*   - no FX events on opening dialog
*
* 
* Depends:
* ???
*
* Optional:
* ???
* 
*/

(function ($) {
  // The jQuery.DocuWare namespace will automatically be created if it doesn't exist
  $.widget("DocuWare.wizardDialog", {
    // These options will be used as defaults
    options: {
      dialogTitle: "",
      dialogWidth: 770,
      dialogHeight: 565,
      closeOnEscape: true,
      buttonCaptions: ["Cancel", "Next", "Previous", "Finish"],
      onDialogOpen: function () { return true },
      onDialogClose: function () { return true },
      onDialogShow: function () { return true },
      onTabsCreate: function () { return true },
      onTabShow: function () { return true },
      onTabSelect: function () { return true },
      onCancelBtn: function () { return true },
      onPrevBtn: function () { return true },
      onNextBtn: function () { return true },
      onFinishBtn: function () { return true },
      helpLinks: {
        defaultLink: "",
        links: []
      }
    },
    // The _create method is where you set up the widget
    _create: function () {
      // this.element -- a jQuery object of the element the widget was invoked on.
      // this.options --  the merged options hash
      var pluginOptions = this.options;
      var self = this;
      $.fx.speeds._default = 0; //set animation duration to "0" in order to disable effects

      this.cancelBtn = {
        id: 'wiz-btn-cancel',
        text: pluginOptions.buttonCaptions[0],
        click: function () {
          if (!pluginOptions.onCancelBtn())
            return

          $(this).dialog('close');

          return true;
        }
      }
      this.nextBtn = {
        id: 'wiz-btn-next',
        text: pluginOptions.buttonCaptions[1],
        click: function () {
          if (!pluginOptions.onNextBtn())
            return


          var selector = $('#wizard .steps');
          var selectedTabIndex = selector.tabs('option', 'selected');
          var nextTabPos = selectedTabIndex + 1;

          //only if next tab is not disabled
          if (!self.isDisabled(nextTabPos)) {
            selector.tabs('option', 'selected', nextTabPos);   //ITS A KIND OF MAGIC!!!
            selector.tabs('select', nextTabPos); //zero-based
          }
          return true;
        }
      }
      this.prevBtn = {
        id: 'wiz-btn-prev',
        text: pluginOptions.buttonCaptions[2],
        click: function () {
          if (!pluginOptions.onPrevBtn())
            return



          var selector = $('#wizard .steps');
          var selectedTabIndex = selector.tabs('option', 'selected');
          var prevTabPos = selectedTabIndex - 1;

          //only if next tab is not disabled
          if (!self.isDisabled(prevTabPos)) {
            selector.tabs('option', 'selected', prevTabPos);   //ITS A KIND OF MAGIC!!!
            selector.tabs('select', prevTabPos); //zero-based
          }

          return true;
        }
      }
      this.finishBtn = {
        id: 'wiz-btn-finish',
        text: pluginOptions.buttonCaptions[3],
        click: function () {
          if (!pluginOptions.onFinishBtn())
            return

          $(this).dialog('close');
          return true;
        }
      }

      //transform dialog
      this.element.dialog({
        modal: true,
        autoOpen: false,
        width: pluginOptions.dialogWidth,
        height: pluginOptions.dialogHeight,
        resizable: false,
        closeOnEscape: pluginOptions.closeOnEscape,
        title: pluginOptions.dialogTitle,
        open: function () {
          $(".ui-dialog-titlebar-close").hide();
          self._onWizardOpen();

          pluginOptions.onDialogOpen();
        },
        close: function () {
          pluginOptions.onDialogClose();
        },
        show: function () {
          pluginOptions.onDialogShow()
        },
        dialogClass: 'wizard-dialog',
        buttons: [self.cancelBtn, self.prevBtn, self.nextBtn, self.finishBtn]
      });


      //transform into jQuery tabs
      $(this.element).find(".steps").tabs({
        create: function () {
          pluginOptions.onTabsCreate();

          //disable all tabs initially
          self.disableAll();
        },
        select: function (event, ui) {
          //let the caller decide wether to select tab
          if (!pluginOptions.onTabSelect(ui.index))
            return false;
        },
        show: function () {
          self._onWizardTabShow();

          pluginOptions.onTabShow();
        }
      });

      //and add arrows after each tab
      $(".wizard .steps.ui-tabs .tabs li").append("<div class='tab-arrow'></div>");

      //add help <a> to wizard
      var helpBtn = $("div.ui-tabs", self.element).prepend('<a href="#" id="wizardHelpButton" title="" target="_blank" class="button help"></a>')
      $("#wizardHelpButton").live("mousedown", function () {
        var link = pluginOptions.helpLinks.defaultLink;

        if (pluginOptions.helpLinks.links[self.tabposition()] != undefined)
          link = pluginOptions.helpLinks.links[self.tabposition()]

        $(this).attr("href", link)
      })
    },
    show: function () {
      $("#wizard").dialog("open");
    },
    close: function () {
      $("#wizard").dialog('close');
    },
    tabposition: function () {
      return $("#wizard .steps").tabs("option", "selected");
    },
    tabenable: function (tabIndex) {
      $("#wizard .steps").tabs("enable", tabIndex);
    },
    tabselect: function (tabPosition) {
      $("#wizard .steps").tabs('select', tabPosition);
    },
    tablength: function () {
      return $("#wizard .steps").tabs("length")
    },
    resetTabPosition: function () {
      $("#wizard .steps").tabs('select', 0);
    },
    enableAll: function () {
      var tabLength = $("#wizard .steps").tabs("length");

      for (var i = 0; i < tabLength; i++) {
        this.tabenable(i);
      }
    },
    enableNext: function () {
      var tabPos = this.tabposition();

      if (tabPos == NaN)
        return;

      //cause zero-based
      tabPos++
      this.tabenable(tabPos++)
    },
    disableAll: function () {
      //switch to first tab and disable all others
      this.resetTabPosition();

      var tabLength = $("#wizard .steps").tabs("length");
      var tabArr = new Array(tabLength);

      for (var i = 0; i < tabLength; i++) {
        tabArr[i] = (i + 1)
      }

      $("#wizard .steps").tabs("option", "disabled", tabArr);
    },
    isDisabled: function (index) {
      return $.inArray(index, $("#wizard .steps").tabs("option", "disabled")) > -1;
    },
    _onWizardOpen: function () {
      //open always first tab
      $("#wizard .steps").tabs('select', 0);

      $.DocuWare.wizardDialog.prototype._onWizardTabShow();
      return true;
    },
    _onWizardTabShow: function () {
      var finishBtn, nextBtn, prevBtn, step, steps, thisStep, _i, _len;
      steps = $("#wizard .step");

      for (_i = 0, _len = steps.length; _i < _len; _i++) {
        step = steps[_i];
        if ($(step).is(':visible')) thisStep = $(step);
      }
      //thisStep == tab which is active
      if (thisStep != null) {
        prevBtn = $('#wiz-btn-prev');
        nextBtn = $('#wiz-btn-next');
        finishBtn = $('#wiz-btn-finish');
        if (thisStep.attr('id') === 'step-1') {
          prevBtn.hide();
        } else {
          prevBtn.show();
        }

        if (thisStep.attr('id') === 'step-' + _len) {
          finishBtn.show();
          nextBtn.hide();
        } else {
          finishBtn.hide();
          nextBtn.show();
        }
      }
      return true;
    },
    // Use the destroy method to reverse everything your plugin has applied
    destroy: function () {
      $.Widget.prototype.destroy.call(this);
    }
  });
})(jQuery);