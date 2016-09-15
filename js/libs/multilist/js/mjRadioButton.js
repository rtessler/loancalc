$(document).ready(function () {

    (function ($) {

        var mjRadioButton = {

            _init: function (options, el) {

                var default_options = {
                    id: 1,
                    text: "select",
                    checked: 0,
                    image: null,
                    data: null,
                    original_value: 0,

                    // common properties

                    width: 'auto',
                    height: 'auto',
                    disabled: false,
                    theme: null
                };

                this.settings = $.extend({}, default_options, options);
                this.el = el;
                this.$el = $(el);

                this._validateData();

                // plugin have been applied previously
                // blow away any existing instance

                this.close();

                this._render();
                this._startListening();

                return this;
            },

            _render: function () {

                this.settings.original_value = this.settings.checked;

                var c = "";

                if (this.settings.disabled)
                    c += " mj-disabled";

                var e = $("<div>", { class: "mj-radiobutton mj-widget mj-table" + c });

                e.data("data", this.settings);

                var str = "<div class='mj-cell'>";

                var checked = (this.settings.checked == 1) ? " checked" : "";

                str += "<div class='mj-cell mj-radio" + checked + "'><div class='mj-dot'></div></div>";

                str += "</div>";

                if (this.settings.image)
                    str += "<img class='mj-image mj-cell ' src='" + this.settings.image + "' />";

                str += "<div class='mj-text mj-cell'>" + this.settings.text + "</div>";

                str += "</div>";

                e.html(str);

                this.$el.html(e);

                return this;
            },

            _startListening: function () {

                var self = this;

                this._stopListening();

                this.$el.on("click", ".mj-radiobutton", function (e) {

                    e.preventDefault();

                    var o = $(e.currentTarget).data("data");

                    if (o.disabled)
                        return;

                    if (o.checked == 1) {

                        self.$el.find(".mj-radio").removeClass("checked");
                        o.checked = 0;
                    }
                    else {

                        self.$el.find(".mj-radio").addClass("checked");
                        o.checked = 1;
                    }

                    self.$el.trigger("change", o);
                });
            },

            _stopListening: function () {
                this.$el.off();
            },

            _validateData: function () {
                var o = this.settings;

                if (o.checked == undefined || o.checked == null || o.checked == false || o.checked == "0")
                    o.checked = 0;

                if (o.checked == "1" || o.checked == true)
                    o.checked = 1;

                if (o.text == null || o.text == undefined)
                    o.text = "";

                if (o.id == null || o.id == undefined)
                    o.id = o.text;

                if (o.disabled == undefined || o.disabled == null || o.disabled == false)
                    o.disabled = 0;

                if (o.disabled == "1" || o.disabled == true)
                    o.disabled = 1;
            },

            //-----------------------------------------------------------------------------------
            // public methods

            hasChanged: function () {

                return (this.settings.checked != this.settings.original_value);
            },

            check: function () {

                //if (this.settings.disabled)
                //    return;

                this.$el.find(".mj-radio").addClass("checked").removeClass("half-ticked");
                this.settings.checked = 1;
            },

            uncheck: function () {

                //if (this.settings.disabled)
                //    return;

                this.$el.find(".mj-radio").removeClass("checked").removeClass("half-ticked");
                this.settings.checked = 0;
            },

            set: function (val) {
                switch (val) {
                    case 0: this.uncheck(); break;
                    case 1: this.check(); break;
                }
            },

            enable: function () {

                this.$el.find(".mj-radiobutton").removeClass("mj-disabled");
                this.settings.disabled = false;
            },

            disable: function () {

                this.$el.find(".mj-radiobutton").addClass("mj-disabled");
                this.settings.disabled = true;
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
                //this.$el.data(this, 'mj-radiobutton-data', null);
                $.removeData(this.el, 'mj-radiobutton-data');
                this.$el.html("");
            }
        }

        $.fn.mjRadioButton = function (options) {

            function createMRadiobutton(name) {
                function F() { };
                F.prototype = mjRadioButton;
                var f = new F;
                return f;
            }

            if (mjRadioButton[options]) {

                // options is the name of a method in Radiobutton

                var o = $(this).data('mj-radiobutton-data');

                if (o) {

                    return o[options].apply(o, Array.prototype.slice.call(arguments, 1));

                }
            }
            else if (typeof options === 'object' || !options) {

                // options is empty or an object
                // within a plugin use this not $(this)
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjRadioButton cant create since the base element to attach to '" + this.selected + "' does not exist");
                    return null;
                }

                // return is for chainability, dont have to return anything
                // if the selector was multiply defined you would be creating plugin for each selector

                return this.each(function (index, o) {

                    var o = Object.create(mjRadioButton);
                    //var o = createmjRadioButton();

                    o._init(options, this);
                    $.data(this, 'mj-radiobutton-data', o);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + options + ' does not exist on mjRadioButton');
            }
        };
    })(jQuery);

});