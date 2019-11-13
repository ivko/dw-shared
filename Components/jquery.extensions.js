(function ($) {

    $.extend($.expr.pseudos, {
        truncated: function (node) {
            var isTruncated;

            if (node.clientWidth == 0) {
                isTruncated = false;
            } else if (DW.Utils.isIE || DW.Utils.isFF || DW.Utils.isEdge) {
                var $node = $(node),
                    isInput = $node.is('input'),
                    display = node.style.display,
                    isDisplayDifferentFromBlock = display !== 'block';

                // Following calculations don't make sense if display is inline, for instance, because
                // inline elements wrap their content => they can never overflow. 
                // Therefore we always want to work with the element with display = block
                if (isDisplayDifferentFromBlock) {
                    $node.css('display', 'block');
                }

                if (isInput || DW.Utils.isIE || $node.css('padding-right') !== '0px') {
                    var text = isInput ? $node.val() : $node.text();
                    isTruncated = DW.Utils.isElementOverflowing(text, node);
                } else {
                    isTruncated = node.scrollWidth > node.clientWidth;
                }

                if (isDisplayDifferentFromBlock) {
                    $node.css('display', display);
                }
            } else {
                isTruncated = node.scrollWidth > node.clientWidth;
            }

            return isTruncated;
        }
    });

    $.fn.extend({
        scrollHeight: function () {
            return this.get(0).scrollHeight;
        },
        scrollWidth: function () {
            return this.get(0).scrollWidth;
        },
        hasScrollBar: function (orientation) {
            if (orientation == 'vertical') {
                return Math.round(this.scrollHeight()) > Math.round(this.innerHeight());
            }
            else if (orientation == 'horizontal') {
                return Math.round(this.scrollWidth()) > Math.round(this.innerWidth());
            }
            return this.hasScrollBar('horizontal') || this.hasScrollBar('vertical');
        },
        insertAtCaret: function (myValue) {
            return this.each(function (i) {
                if (document.selection) {
                    //For browsers like Internet Explorer
                    this.focus();
                    var sel = document.selection.createRange();
                    sel.text = myValue;
                    this.focus();
                }
                else if (this.selectionStart || this.selectionStart == '0') {
                    //For browsers like Firefox and Webkit based
                    var startPos = this.selectionStart;
                    var endPos = this.selectionEnd;
                    var scrollTop = this.scrollTop;
                    this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos, this.value.length);
                    this.focus();
                    this.selectionStart = startPos + myValue.length;
                    this.selectionEnd = startPos + myValue.length;
                    this.scrollTop = scrollTop;
                } else {
                    this.value += myValue;
                    this.focus();
                }
            });
        }
    });

    var extensions = {
        // Example extension:
        //extendDialogWidjet: function () {
        //    $.widget("ui.dialog", $.ui.dialog, {
        //        // ui.dialog code goes here
        //    });
        //}
    };

    $.each(extensions, function (feature, method) {
        method();
    });
})(jQuery);
