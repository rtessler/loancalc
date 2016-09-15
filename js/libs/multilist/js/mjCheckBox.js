$(document).ready(function () {

    (function ($) {

        var mjCheckBox = {

            _init: function (options, el) {

                var default_options = {
                    id: 1,
                    text: "select",
                    checked: 0,         // 0,1,2
                    image: null,
                    data: null,
                    original_value: 0,
                    tristate: 0,         // 0 or 1

                    // common properties

                    width: 'auto',
                    height: 'auto',
                    disabled: false,
                    theme: null
                };

                this.settings = $.extend({}, default_options, options);
                this.el = el;
                this.$el = $(el);

                // plugin have been applied previously
                // blow away any existing instance

                this.close();

                this._validateData();

                this._render();
                this._startListening();

                return this;
            },

            _render: function () {

                this.settings.original_value = this.settings.checked;

                var x = "";

                if (this.settings.disabled == 1)
                    x += " mj-disabled";

                var e = $("<div>", { class: "mj-checkbox mj-table mj-widget" + x });

                e.data("data", this.settings); // attach some data

                x = "";

                switch (this.settings.checked) {
                    case 1: x += " checked"; break;
                    case 2: x += " half-ticked"; break;
                    default: break;
                }
                
                var str = "<div class='mj-cell'><div class='mj-checkbox-box " + x + "'></div></div>";

                if (this.settings.image)
                    str += "<img class='mj-image mj-cell' src='" + this.settings.image + "' />";

                str += "<div class='mj-cell mj-text'>" + this.settings.text + "</div>";

                e.html(str);

                this.$el.html(e);

                return this;
            },

            _validateData: function()
            {
                var o = this.settings;

                if (o.checked == undefined || o.checked == null || o.checked == false || o.checked == "0")
                    o.checked = 0;

                if (o.checked == "1" || o.checked == true)
                    o.checked = 1;

                if (o.checked == "2")
                    o.checked = 2;

                if (o.text == null || o.text == undefined)
                    o.text = "";

                if (o.id == null || o.id == undefined)
                    o.id = o.text;

                if (o.disabled == undefined || o.disabled == null || o.disabled == false)
                    o.disabled = 0;

                if (o.disabled == "1" || o.disabled == true)
                    o.disabled = 1;

                if (o.tristate == undefined || o.tristate == null || o.tristate == false || o.tristate == "0")
                    o.tristate = 0;

                if (o.tristate == "1" || o.tristate == true)
                    o.tristate = 1;
            },

            _startListening: function () {

                var self = this;

                this._stopListening();

                this.$el.on("click", ".mj-checkbox", function (e) {                    

                    e.preventDefault();

                    var o = $(e.currentTarget).data("data");

                    if (o.disabled == 1)
                        return;

                    if (o.tristate == 1) {

                        switch (o.checked) {
                            case 0:
                                $(e.currentTarget).find(".mj-checkbox-box").addClass("checked").removeClass("half-ticked");
                                o.checked = 1;
                                break;
                            case 1:
                                $(e.currentTarget).find(".mj-checkbox-box").removeClass("checked").addClass("half-ticked");
                                o.checked = 2;
                                break;
                            case 2:
                                $(e.currentTarget).find(".mj-checkbox-box").removeClass("checked").removeClass("half-ticked");
                                o.checked = 0;
                                break;
                        }
                    }
                    else {

                        switch (o.checked) {
                            case 0:
                                $(e.currentTarget).find(".mj-checkbox-box").addClass("checked").removeClass("half-ticked");
                                o.checked = 1;
                                break;
                            case 1:
                                $(e.currentTarget).find(".mj-checkbox-box").removeClass("checked").removeClass("half-ticked");
                                o.checked = 0;
                                break;
                        }
                    }

                    self.$el.trigger("change", o);
                });
            },

            _stopListening: function () {
                this.$el.off();
            },

            //-----------------------------------------------------------------------------------
            // public methods

            hasChanged: function () {

                return (this.settings.checked != this.settings.original_value);
            },

            check: function () {

                this.$el.find(".mj-checkbox-box").addClass("checked").removeClass("half-ticked");
                this.settings.checked = 1;
            },

            uncheck: function () {

                this.$el.find(".mj-checkbox-box").removeClass("checked").removeClass("half-ticked");
                this.settings.checked = 0;
            },

            set: function(val)
            {
                switch (val)
                {
                    case 0: this.uncheck(); break;
                    case 1: this.check(); break;
                    case 2: this.halfTick(); break;
                }
            },

            enable: function () {

                this.$el.find(".mj-checkbox-box").removeClass("mj-disabled");
                this.settings.disabled = 0;
            },

            disable: function () {

                this.$el.find(".mj-checkbox-box").addClass("mj-disabled");
                this.settings.disabled = 1;
            },

            halfTick: function () {

                this.$el.find(".mj-checkbox-box").addClass("checked").addClass("half-ticked");
                this.settings.checked = 2;
            },

            val: function () {

                return this.settings;
            },

            message: function (msg) {

                if (window.console && window.console.log) {
                    console.log(msg);
                }
            },

            close: function () {

                // dont clear the data
                // important to turn off events

                this._stopListening();
                //this.$el.data(this, 'mj-checkbox-data', null);
                $.removeData(this.el, 'mj-checkbox-data');
                this.$el.html("");                
            }
        }

        $.fn.mjCheckBox = function (options) {
                       
            if (mjCheckBox[options]) {

                // options is the name of a method in mjCheckBox

                var o = $(this).data('mj-checkbox-data');

                // cant call slice directly on arguments

                if (o)
                    return o[options].apply(o, Array.prototype.slice.call(arguments, 1));

                // if o is not found then the mjCheckBox has not been attached to the element
                // its not an necessarily and error

                return null;
            }
            else if (typeof options === 'object' || !options) {

                // options is empty or an object
                // create the listbox            
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjCheckBox: cant create, the html element to attach to '" + this.selected + "' does not exist.");
                    return null;
                }

                // Note: a jquery query select can refer to any number of html elements
                // return is for chainability, dont have to return anything

                return this.each(function (index, o) {

                    // remove any previous data

                    //$.removeData(this, 'mj-checkbox-instance');

                    var x = Object.create(mjCheckBox);

                    x._init(options, o);

                    // attach object instance to this html element

                    $.data(o, 'mj-checkbox-data', x);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + method + ' does not exist in mjCheckBox');
            }
        };
    })(jQuery);

});