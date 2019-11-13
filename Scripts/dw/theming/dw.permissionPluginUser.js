(function ($) {

  $.widget("DocuWare.permissionPluginUser", {
    options: {
      captions: {
        addAll: " ++ ",
        removeAll: " -- ",
        itemsCount: "item(s)"
      },
      searchable: true,
      animated: 'fast',
      show: 'slideDown',
      hide: 'slideUp',
      dividerLocation: 0.6,
      height: 200,
      locked: false
    },
    _create: function () {
      var self = this;
      this.element.hide();
      this.id = this.element.attr("id");
      this.container = $('<div class="ui-multiselect ui-helper-clearfix ui-widget"></div>').insertAfter(this.element);
      this.count = 0; // number of currently selected options
      this.availableContainer = $('<div class="availableUser"></div>').appendTo(this.container); //add class so diff available and selected?
      this.selectedContainer = $('<div class="selectedUser"></div>').appendTo(this.container);

      this.tabsContainerSource = $('<div id="tabsSourceUser"></div>').appendTo(this.availableContainer);
      this.tabsContainerSourceButtons = $('<ul></ul>').appendTo(this.tabsContainerSource);

      this.tabsContainerTarget = $('<div id="tabsTargetUser"></div>').appendTo(this.selectedContainer);
      this.tabsContainerTargetButtons = $('<ul></ul>').appendTo(this.tabsContainerTarget);

      this.optGroups = $("optgroup", $(this.element).find("select"));
      this.targetEntries = $("li", $("ul", this.element));

      var oneTab;
      var availableList;
      this.optGroups.each(function (i, el) {
        //add for every optgroup header, an equivalent button in Tabs container - TODO - check here for populating the available/selected lists
        $("<li><a href='#sourceTabUser-" + i + "'>" + el.label + "</a></li>").appendTo(self.tabsContainerSourceButtons);

        //now we've got to put all elments of an optgroup into the tabs
        oneTab = $("<div id='sourceTabUser-" + i + "'></div>").appendTo(self.tabsContainerSource);
        $('<div class="actions ui-widget-header ui-helper-clearfix"><input type="text" class="search empty ui-widget-content ui-corner-all"/><a href="#" class="add-all">' + self.options.captions.addAll + '</a></div>').appendTo(oneTab);
        availableList = $('<ul class="availableUser connected-list"><li class="ui-helper-hidden-accessible"></li></ul>').bind('selectstart', function () { return false; }).appendTo(oneTab);
        availableList.height(self.options.height);

        //bind to every option the parent <ul>
        $("option", el).each(function (index, opt) {
          $(opt).data("parentTabUser", availableList)
        });
      });

      var selectedList;
      this.targetEntries.each(function (i, el) {
        $("<li><a href='#targetTabUser-" + i + "'>" + $(el).text() + "</a></li>").appendTo(self.tabsContainerTargetButtons);

        oneTab = $("<div id='targetTabUser-" + i + "'></div>").appendTo(self.tabsContainerTarget);
        oneTab.data("activeTargetTabId", el.id)

        $('<div class="actions ui-widget-header ui-helper-clearfix"><span class="count">0 ' + self.options.captions.itemsCount + '</span><a href="#" class="remove-all">' + self.options.captions.removeAll + '</a></div>').appendTo(oneTab);

        selectedList = $('<ul class="selectedUser connected-list"><li class="ui-helper-hidden-accessible"></li></ul>').bind('selectstart', function () { return false; }).appendTo(oneTab);
        selectedList.height(self.options.height);

        $(el).data("linkedTargetTabUser", oneTab.attr("id"))
      });


      // set dimensions
      this.container.width(this.element.width() + 1);
      this.selectedContainer.width(Math.floor(this.element.width() * this.options.dividerLocation));
      this.availableContainer.width(Math.floor(this.element.width() * (1 - this.options.dividerLocation)));

      //activate Tabs
      this.tabsContainerSource.tabs({
        select: function (event, ui) {
          self.activeSourceTab = ui;
          self.availableList = $("ul", "#" + ui.panel.id);
        },
        show: function (event, ui) {
          self.activeSourceTab = ui;
          self.availableList = $("ul", "#" + ui.panel.id)
        }
      });
      this.tabsContainerTarget.tabs({
        select: function (event, ui) { self.activeTargetTab = ui; },
        show: function (event, ui) {
          self.activeTargetTab = ui;
          self._switchTab();

          self._updateCount();
        }
      });

      if (!this.options.animated) {
        this.options.show = 'show';
        this.options.hide = 'hide';
      }

      // init lists
      this._populateLists($("option", this.optGroups));

      // set up livesearch
      if (this.options.searchable) {
        this._registerSearchEvents(this.availableContainer.find('input.search'));
      } else {
        $('.search').hide();
      }

      // batch actions
      this.container.find(".remove-all").click(function () {
        var activeTargetOptgroupId = $("#" + self.activeTargetTab.panel.id).data("activeTargetTabId");
        var activeTargetTabId = self.activeTargetTab.panel.id;

        $(".selectedUser #" + activeTargetTabId + " ul .ui-element").each(function (i, el) {
          self.syncSelectedList($(el), activeTargetOptgroupId, false);
        });

        //get all options
        var options = $("option", self.optGroups)
        self._populateLists(options);
        return false;
      });

      //Add all at once
      this.container.find(".add-all").click(function () {

        var activeTargetOptgroupId = $("#" + self.activeTargetTab.panel.id).data("activeTargetTabId");
        var activeSourceTabId = self.activeSourceTab.panel.id;

        //this must navigate to current viewed available tab -> e.g. $(".available #sourceTab-0 ul .ui-element")
        //add all should only add visible items
        $(".availableUser #" + activeSourceTabId + " ul li.ui-element:not([style*='display: none'])").each(function (i, el) {
          self.syncSelectedList($(el), activeTargetOptgroupId, true);
        });

        //get all options
        var options = $("option", self.optGroups)
        self._populateLists(options);

        // clear filter after adding all
        $("#" + activeSourceTabId + " input.search").val('');

        return false;
      });

      //if lock is set, apply it
      if (this.options.locked)
        this._applyLockState(this.options.locked)
    },
    destroy: function () {
      this.element.show();
      this.container.remove();

      $.Widget.prototype.destroy.apply(this, arguments);
    },
    // Use the _setOption method to respond to changes to options
    _setOption: function (key, value) {
      switch (key) {
        case "locked":
          // handle changes to lock option only if there are changes
          if (this.options[key] != value) {
            this._applyLockState(value);
          }

          break;
      }

      // In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
      $.Widget.prototype._setOption.apply(this, arguments);
      // In jQuery UI 1.9 and above, you use the _super method instead
      //this._super("_setOption", key, value);
    },
    _applyLockState: function (hasLock) {
      if (hasLock) {
        //extend classname on li to identify temporary disabled elements
        $(".ui-tabs-panel .ui-element:not(.permLock)").addClass("tempLock").addClass("ui-state-disabled");

        //remove click & doubleclick events on entries
        $('.tempLock a.action').off("click");
        $('.tempLock').off('dblclick');

        //disable action links for ADD/REMOVE ALL
        $(".actions .add-all, .actions .remove-all").hide();
      }
      else {
        var self = this;
        //register add/remove events
        $(".tempLock .ui-icon-plus").parent().each(function (i, el) { self._registerAddEvents($(el)) })
        $(".tempLock .ui-icon-minus").parent().each(function (i, el) { self._registerRemoveEvents($(el)) })
        //register double click event
        $(".tempLock").each(function (i, el) { self._registerDoubleClickEvents($(el)) });

        if ($(".tempLock") != undefined) {
          $(".tempLock").removeClass("ui-state-disabled").removeClass("tempLock");
        }

        $(".actions .add-all, .actions .remove-all").show();
      }
    },
    //hide/show entries from availble list according to selected "target tab"
    _switchTab: function () {
      //get current active target tab(e.g. "userTab")
      var activeTargetTab = $("#" + this.activeTargetTab.panel.id).data("activeTargetTabId");

      //and show only entries from currently selected source tab(e.g. userTab)
      $(".availableUser ul .ui-element").each(function (i, el) {
        if ($(el).data("connectedTo") == activeTargetTab) {
          $(el).show();
        }
        else {
          $(el).hide();
        }
      });

      var itemCount = $(this.activeTargetTab.panel).find("ul li.ui-element").length;
      this.count = itemCount;
    },
    //every option must be available as many times as there are source tabs
    //afterwards hide unselected target tab
    _populateLists: function (options) {
      //first of all remove all items in any tab, they will be added through current selection
      //or init mapping
      $(".availableUser ul").each(function (i, el) { $(el).children('.ui-element').remove(); })
      $(".selectedUser ul").each(function (i, el) { $(el).children('.ui-element').remove(); })


      var targetLists = $(this.targetEntries);
      this.count = 0;
      var that = this;
      var selectedIn;
      var lockedIn;
      var linkedTargetTab;

      function preInitArray() {
        var arr = new Array();
        $(targetLists).each(function (i, el) { arr.push(i.toString()) });
        return arr;
      }

      //iterate through every target tab
      targetLists.each(function (index, el) {
        //in order to place one option element either to source or target tab...
        var items = $(options.map(function (i) {
          var targetList = el.id
          var allowedIn = ($(this).attr("allowedin") != undefined) ? $(this).attr("allowedin").split(",") : preInitArray();

          //if option has 'lock' to current target tab
          //activate bool and set as further 'selectedin' element if not exist
          lockedIn = $(this).attr("locked");
          this.isLockedInCurrentTab = (lockedIn == targetList && allowedIn.indexOf(lockedIn) > -1 || allowedIn.indexOf(targetList) == -1)


          if (allowedIn.indexOf(lockedIn) > -1) {
            if (lockedIn != undefined) {
              var tempSelectedArr = new Array();
              if ($(this).attr("selectedin") != undefined) {
                tempSelectedArr = $(this).attr("selectedin").split(",");
              }
              //add lockedIn tab to selected tab if not exists
              if (tempSelectedArr.indexOf(lockedIn) == -1) {
                tempSelectedArr.push(lockedIn);
              }

              $(this).attr("selectedin", tempSelectedArr.join(","));
            }
          }


          //get selectedIn attribute values(also ',' list)
          selectedIn = $(this).attr("selectedin");
          this.isSelected = (selectedIn != undefined);

          if (this.isSelected) {
            if (selectedIn.split(",").indexOf(targetList) > -1) {
              selectedIn = targetList;
            }
            else {
              this.isSelected = false;
              selectedIn = undefined;
            }
          }

          try {
            //check also, if linkedTargetTab(attribute: "selectedin") does really exist
            linkedTargetTab = $("#" + $("#" + selectedIn).data("linkedTargetTabUser") + " ul");
            //and add entry to linked or active tab
            var item = that._getOptionNode(this, targetList).appendTo(this.isSelected ? linkedTargetTab : $(this).data("parentTabUser")).show()
          } catch (e) {
            this.isSelected = false; //revert back to non-selected if targetTabId couldn't be found
            var item = that._getOptionNode(this, targetList).appendTo($(this).data("parentTabUser")).show()
          }

          if (this.isSelected) {
            that.count += 1;
          }

          that._applyItemState(item, this.isSelected, this.isLockedInCurrentTab);
          item.data('idx', i);

          return item[0]
        }));
      });

      this._switchTab();

      // update count
      this._updateCount();
    },
    _updateCount: function () {
      this.selectedContainer.find('span.count').text(this.count + " " + this.options.captions.itemsCount);
    },
    _getOptionNode: function (option, connectedTo) {
      option = $(option);
      var node = $('<li class="ui-state-default ui-element" title="' + option.text() + '"><span class="ui-icon"/>' + option.text() + '<a href="#" class="action"><span class="ui-corner-all ui-icon"/></a></li>').hide();
      //var node = $('<li class="ui-state-default ui-element" title="' + option.text() + " - " + connectedTo + '"><span class="ui-icon"/>' + option.text() + " - " + connectedTo + '<a href="#" class="action"><span class="ui-corner-all ui-icon"/></a></li>').hide();
      node.data('optionLink', option);
      node.data('connectedTo', connectedTo);
      return node;
    },
    // clones an item with associated data
    // didn't find a smarter away around this
    _cloneWithData: function (clonee) {
      var clone = clonee.clone(false, false);
      clone.data('optionLink', clonee.data('optionLink'));
      clone.data('idx', clonee.data('idx'));
      clone.data('connectedTo', clonee.data('connectedTo'))
      return clone;
    },
    //syncs original SELECT element with selected Tabs in attribute "selectedin"
    syncSelectedList: function (item, activeTab, isExtend) {
      //get current selectedIn status
      var selectedArr = new Array();
      var currentStatus = item.data('optionLink').attr('selectedin');
      var newStatus = "";

      //if lists exists transform to array
      //to easily extend array
      if (currentStatus != undefined) {
        selectedArr = currentStatus.split(",")
      }


      if (isExtend) {
        //add only if not exists and allowed in desired tab
        var allowedArr = (item.data('optionLink').attr("allowedin") != undefined) ? item.data('optionLink').attr("allowedin").split(",") : new Array();

        if (allowedArr.length == 0 && selectedArr.indexOf(activeTab) == -1 || allowedArr.indexOf(activeTab) > -1) {
          //add only if is not in the list
          if (selectedArr.indexOf(activeTab) == -1)
            selectedArr.push(activeTab);
        }
      }
      else {
        //only options without a lock can be removed!
        if (!$(item).hasClass("permLock")) {
          var pos = selectedArr.indexOf(activeTab);
          selectedArr.splice(pos, 1);
        }
      }


      newStatus = selectedArr.join(",");

      if (newStatus.length > 0) {
        item.data('optionLink').attr('selectedin', newStatus);
      }
      else {
        item.data('optionLink').removeAttr('selectedin');
      }
    },
    _setSelected: function (item, selected) {
      var activeTargetTabId = $("#" + this.activeTargetTab.panel.id).data("activeTargetTabId");

      if (selected) {
        this.syncSelectedList(item, activeTargetTabId, true);

        var selectedItem = this._cloneWithData(item);
        item[this.options.hide](this.options.animated, function () { $(this).remove(); });

        //this gets called on double-clicking
        selectedItem.appendTo("#" + this.activeTargetTab.panel.id + " ul").hide()[this.options.show](this.options.animated);

        this._applyItemState(selectedItem, true);
        return selectedItem;
      } else {  //step into here, after deselecting item
        this.syncSelectedList(item, activeTargetTabId, false);

        // look for successor based on initial option index
        var items = $("li", $(".availableUser"))

        var availableItem = this._cloneWithData(item);
        var tabOrigin = availableItem.data('optionLink').data("parentTabUser");
        availableItem.appendTo(tabOrigin);

        item[this.options.hide](this.options.animated, function () { $(this).remove(); });
        availableItem.hide()[this.options.show](this.options.animated);

        this._applyItemState(availableItem, false);
        return availableItem;
      }
    },
    _applyItemState: function (item, selected, isLocked) {
      item.children('span').removeClass('ui-icon-arrowthick-2-n-s').addClass('ui-helper-hidden').removeClass('ui-icon');

      if (selected) {
        if (isLocked) {
          item.find('a.action span').addClass('ui-icon-locked').removeClass('ui-icon-plus');
          item.addClass("ui-state-disabled").addClass("permLock")
        }
        else {
          item.find('a.action span').addClass('ui-icon-minus').removeClass('ui-icon-plus');
          this._registerRemoveEvents(item.find('a.action'));
        }
      } else {
        if (isLocked) {
          item.find('a.action span').addClass('ui-icon-locked').removeClass('ui-icon-plus');
          item.addClass("ui-state-disabled").addClass("permLock")
        }
        else {
          item.find('a.action span').addClass('ui-icon-plus').removeClass('ui-icon-minus');
          this._registerAddEvents(item.find('a.action'));
        }
      }
      this._registerDoubleClickEvents(item);
      this._registerHoverEvents(item);
    },
    _registerDoubleClickEvents: function (elements) {
      $(elements).on('dblclick', function (e) {
        //fire only one single click in case of a doubleclick on the + icon
        if (!jQuery(e.target).parent().is("a.action")) {
          elements.find('a.action').click();
        }
      });
    },
    _registerHoverEvents: function (elements) {
      elements.removeClass('ui-state-hover');
      elements.mouseover(function () {
        $(this).addClass('ui-state-hover');
      });
      elements.mouseout(function () {
        $(this).removeClass('ui-state-hover');
      });
    },
    _registerAddEvents: function (elements) {
      var self = this;

      elements.click(function () {
        var item = self._setSelected($(this).parent(), true);
        self.count += 1;
        self._updateCount();
        return false;
      });
    },
    _registerRemoveEvents: function (elements) {
      var self = this;
      elements.click(function () {
        self._setSelected($(this).parent(), false);
        self.count -= 1;
        self._updateCount();
        return false;
      });
    },
    _registerSearchEvents: function (input) {
      var self = this;

      input.focus(function () {
        $(this).addClass('ui-state-active');
      })

            .blur(function () {
              $(this).removeClass('ui-state-active');
            })
		    .keypress(function (e) {
		      if (e.keyCode == 13)
		        return false;
		    })
		    .keyup(function () {
		      self._filter.apply(this, [self.availableList, jQuery.data(self.activeTargetTab.panel, "activeTargetTabId")]);
		    });
    },
    // taken from John Resig's liveUpdate script
    _filter: function (list, activeTargetTab) {
      var input = $(this);

      //put scope only on activeTargetTab items, cause list holds also hidden entries
      //which gets activated on target tab switch
      var rows = list.children("li.ui-element").filter(function () {
          return $(this).data('connectedTo') && $(this).data('connectedTo') == activeTargetTab;
      });
      var cache = rows.map(function (index, element) {
          return $(this).text().toLowerCase();
      });

      var term = $.trim(input.val().toLowerCase())
      var scores = [];

      if (!term) {
        //show all entries only for current tab to avoid duplicates
        $(list.children("li")).each(function (i, el) {
          if (jQuery.data(el, "connectedTo") == activeTargetTab) {
            $(el).show();
          }
        });
      } else {
        rows.hide();

        cache.each(function (i) {
          if (this.indexOf(term) > -1) { scores.push(i); }
        });

        $.each(scores, function () {
          $(rows[this]).show();
        });
      }
    }
  });
})(jQuery);