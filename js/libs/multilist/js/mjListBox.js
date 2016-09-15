$(document).ready(function() {

// reference:
// http://learn.jquery.com/plugins/basic-plugin-creation/
    
(function ($) {

    var mjListBox = {

        _init: function (options, el) {

            // items structure:

            // id: string
            // text:            mandatory
            // selected: 0,1    (only used if type is not checkbox or radiobutton)
            // checked: 0,1,2
            // value: null 
            // disabled: 0,1

            var default_options = {
                data: null,                 // json data
                image_path: "images/",      // if you want to use images set this to the base path of you images
                type: "checkbox",           // checkbox, radiobutton or input. This field is not used if template_id is set
                multi_select: false,        // not implemented
                filter: false,              // show the filterbox
                template_id: null,           // element id of a underscore.js list item template

                // common properties

                width: 'auto',
                height: 'auto',
                disabled: false,
                theme: null
            };

            // plus any other custom data field

            this.settings = $.extend({}, default_options, options);
            this.el = el;
            this.$el = $(el);

            // plugin have been applied previously
            // blow away any existing instance

            this.close();

            this._render();
            this._startListening();

            return this;
        },

        _render: function () {
/*
            if (this.settings.template_id) {

                // use the template
                // underscore.js template for each list item

                var self = this;

                var template = _.template($("#" + this.settings.template_id).html());

                $.each(this.settings.data, function (i, o) {

                    // we need an index for tabindex 

                    o.index = i;
                    var str = template(o);

                    var e = $(str);

                    self.$el.append(e);

                    // give the li some data 

                    e.data("data", o);

                    // for each data-action within the current item attach data

                    $.each(e.find("[data-action]"), function (j, x) {
                        $.data(x, "data", o);
                    });
                });
            }
            else {
*/
                this._validateAll();

                this.save();        // save state

                this.$el.html(this._buildHTML());

                if (this.settings.filter) {

                    var h = this.$el.find(".mj-listbox .mj-list").height();

                    // leave some room for the filter

                    var FILTER_HEIGHT = 36;

                    if (this.settings.data.length > 0)
                        this.$el.find(".mj-listbox .mj-list").height(h - FILTER_HEIGHT);
                }
            //}

                //this.$el.css({ width: "'" + this.settings.width + "'", height: "'" + this.settings.height + "'" });

            return this;
        },

        _buildItemHTML: function (o, index) {

            var c = "";

            if (o.disabled)
                c += " mj-disabled";

            // can be disabled and selected
            // cant select items in a checkbox or radiobutton list

            var type = this.settings.type;

            if (o.selected == 1 && type != "checkbox" && type != "radiobutton")
                c += " mj-selected";

            // ths tabindex is so we can use the up,down arrow keys
            // the mj-cell is so that we dont need to use float left and we can center items vertically

            var str = "<li class='mj-item" + c + "' tabindex=" + index + ">";

            if (this.settings.template_id)
            {
                var template = _.template($("#" + this.settings.template_id).html());

                str += template(o);

                //var e = $(str);

                //self.$el.append(e);

                // give the li some data 

                //e.data("data", o);

                // for each data-action within the current item attach data

                //$.each(e.find("[data-action]"), function (j, x) {
                    //$.data(x, "data", o);
                //});
            }
            else
            {
                var x = "";

                switch (o.checked) {
                    case 1: x = " checked"; break;
                    case 2: x = " half-ticked"; break;
                }
                
                switch (type) {

                    case "checkbox":

                        str += "<div>";
                        str += "<div class='mj-checkbox-box" + x + "'></div>";
                        str += "</div>";

                        break;

                    case "radiobutton":

                        str += "<div>";
                        str += "<div class='mj-cell mj-radio" + x + "'><div class='mj-dot'></div></div>";
                        str += "</div>";

                        break;
                }

                if (o.image) {

                    str += "<div>";
                    str += "<img class='mj-image ' src='" + this.settings.image_path + o.image + "' />";
                    str += "</div>";
                }

                // input comes after text/label

                if (type == "input") {

                    str += "<div>";
                    str += "<div class='mj-label'>" + o.text + "</div>";
                    str += "</div>";

                    str += "<div>";
                    str += "<input class='mj-input' type='text' value='" + o.value + "' />";
                    str += "</div>";
                }
                else {

                    str += "<div>";
                    str += "<div class='mj-text'>" + o.text + "</div>";
                    str += "</div>";
                }
            }

            str += "</li>";

            var output = $(str);

            if (this.settings.template_id)
            {
                $.each(output.find("[data-action]"), function (j, x) {
                    $.data(x, "data", o);
                });
            }

            // attach some data

            output.data("data", o);

            return output;
        },

        _buildHTML: function () {

            var self = this;            
            
            var a = $("<div>", { class: 'mj-listbox mj-widget' });
            var b = $("<ul>", {class: 'mj-list'});

            // need this loop to be fast
            // index goes up by 100 in case we start insertingn new items
            // dont want to rewrite all the tabindexes again

            $.each(this.settings.data, function (index, o) {
                b.append(self._buildItemHTML(o, index * 100));
            });

            a.html(b);

            if (this.settings.filter) {
                
                var str = "<div class='mj-filter-box'>";
                str += " <div class='searchbox-container'>";
                str += "  <input class='searchbox' />";        // on ipad we autofocus cases the keyboard to appear
                str += " </div>";
                str += "<div class='search-btn'></div>";
                str += "</div>";

                a.append($(str));
            }
           
            return a;
        },

        _validateInt: function(x)
        {
            // valid values: 0,1,2

            if (x == null || x == undefined)
                return 0;

            if (x == "0" || x == 0 || x == false)
                return 0;

            if (x == "1" || x == 1 || x == true)
                return 1;

            if (x == "2" || x == 2)
                return 2;

            return 0;
        },

        _validateItem: function(o)
        {
            if (o.id == null || o.id == undefined)
                o.id = o.text;

            o.checked = this._validateInt(o.checked);
            o.selected = this._validateInt(o.selected);
            o.disabled = this._validateInt(o.disabled);

            if (o.value == undefined)
                o.value = null;   
        },

        _validateAll: function () {

            var self = this;

            if (this.settings.data == null)
                this.settings.data = [];

            if (this.settings.template_id)
                this.settings.type = "";

            $.each(this.settings.data, function (index, o) {

                self._validateItem(o);
            });
        },

        _startListening: function () {

            var self = this;

            this._stopListening();

            this.$el.find(".mj-list .mj-item").hover(
              function () {
                  $(this).addClass("mj-hover");
              }, function () {
                  $(this).removeClass("mj-hover");
              }
            );

            this.$el.on('mousewheel DOMMouseScroll', function (e) {

                ////e.preventDefault();
                ////e.stopPropagation();

                //console.log("wheel event: ");
                ////console.log(e);

                //var n = Math.abs(self.$el.find('.mj-listbox .mj-item:first').position().top);

                //var len = self.settings.data.length;

                //var visible = self.$el.find('ul li:visible').length;

                //console.log("n = " + n + " visible = " + visible);

                ////if (n >= len - 1)
                ////    e.preventDefault();
 
                //if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
                //    // scroll up

                //    console.log("up");
                //}
                //else {
                //    // scroll down
                //    console.log("down");
                //}
            });

            var hasTouchEvents = ("ontouchstart" in document.documentElement);

            if (this.settings.template_id) {

                // user template provided

                this.$el.on("click", "[data-action]", function (e) {

                    e.preventDefault();

                    self.$el.find("li.mj-hover").removeClass("mj-hover");

                    var x = $(e.currentTarget);

                    // x.data() will get data for the whole element including the action
                    
                    self.$el.trigger("mjClick", x.data());

                    self.deselectAll();     // dont handle multiple select yet

                    var o = x.data().data;

                    if (o) {
                        self._select(x.parent(), o);
                        self.$el.trigger("selected", o);
                    }
                });

                this.$el.on("keyup", "[data-action]", function (e) {

                    e.preventDefault();

                    //self.$el.find("li").removeClass("mj-hover");

                    var x = $(e.currentTarget);

                    // x.data() will get data for the whole element including the action

                    self.$el.trigger("mjKeyup", x.data());
                });
            }
            else {

                this.$el.on("click", ".mj-list .mj-item", function (e) {

                    e.preventDefault();

                    //self.$el.find("li").removeClass("mj-hover");

                    var ee = $(e.currentTarget);

                    var o = ee.data("data");

                    if (!o) {
                        $.error("mjListBox item click: item data not found");
                        return;
                    }

                    // cant click on disabled item

                    if (o.disabled)
                        return;

                    switch (self.settings.type)
                    {
                        case "checkbox":

                            if (o.checked == 1) {

                                self._uncheck(ee, o);
                                self.$el.trigger("checkChange", o);
                            }
                            else {

                                self._check(ee, o);
                                self.$el.trigger("checkChange", o);
                            }
                            break;

                        case "radiobutton":

                            // if we clicked on an unselected item do something
  
                            self._check(ee, o);
                            self.$el.trigger("checkChange", o);
                            break;

                        default:
                            self.deselectAll();     // dont handle multiple select yet
                            self._select(ee, o);
                            self.$el.trigger("selected", o);
                            break;
                    }
                });

                if (this.settings.type == "input") {

                    this.$el.on("keyup", ".mj-list .mj-item input", function (e) {

                        var ee = $(e.currentTarget);

                        var val = ee.val();

                        //if (e.keyCode == 32)
                        //    val += " ";

                        var x = ee.closest(".mj-item");

                        if (x) {

                            var o = x.data("data");

                            // update the value field

                            o.value = val;

                            self.$el.trigger("inputKeyup", o);
                        }
                    });
                }
            }

            this.$el.on("keyup", ".mj-listbox .mj-filter-box .searchbox", function (e) {

                var str = $(e.currentTarget).val();

                self.filter(str);
            });

            this._enableKeyEvents();
        },

        _enableKeyEvents: function () {

            var self = this;

            // assumes list is made of list items

            this.$el.on("keydown", "li", function (e) {                

                var key = e.keyCode;
                var target = $(e.currentTarget);

                //self.$el.find("li").removeClass("mj-hover");

                var KEY_SPACE = 32;
                var KEY_UP = 38;
                var KEY_DOWN = 40;

                switch (key) {

                    case KEY_SPACE:

                        e.preventDefault();

                        var o = $(target).data("data");

                        if (o)
                            self.toggle(o.id);
                        
                        break;

                    case KEY_UP: // arrow up

                        e.preventDefault();

                        target.prev().focus();

                        var ee = $(target.prev());

                        var o = $(target.prev()).data("data");

                        if (o) {

                            if (self.isSelectable()) {
                                self.deselectAll();
                                self._select(ee, o);
                            }

                            self.$el.trigger("arrowIn", o);
                        }

                        break;

                    case KEY_DOWN: // arrow down

                        e.preventDefault();

                        target.next().focus();

                        var ee = $(target.next());

                        var o = $(target.next()).data("data");

                        if (o) {

                            if (self.isSelectable()) {
                                self.deselectAll();
                                self._select(ee, o);
                            }

                            self.$el.trigger("arrowIn", o);
                        }

                        break;
                }
            });

            //this.$el.on("focusin", "li", function (e) {

            //});

            this.$el.on("focusout", "li", function (e) {

                //$(e.currentTarget).removeClass("mj-hover");
            });

            // select the 1st selected or checked

            var n = -1;

            for (var i = 0, len = this.settings.data.length; i < len; i++)
            {
                var o = self.settings.data[i];

                if (o.selected == 1 || o.checked == 1)
                {
                    n = i;
                    break;
                }
            }

            if (n != -1) {

                if (this.$el.find("li:eq(" + n + ")"))
                    this.$el.find("li:eq(" + n + ")").focus();

            }
        },

        _stopListening: function()
        {
            this.$el.off();
        },

        _getElement: function (id) {

            return this.$el.find(".mj-list .mj-item").filter(
               function () { return $(this).data("data").id == id; }
            );
        },

        isSelectable: function()
        {
            return (this.settings.type != "checkbox" && this.settings.type != "radiobutton");       
        },

        //-----------------------------------------------------------------------------------
        // public methods

        getItem: function (id) {

            // find the element in the data array with this id

            if (id == undefined || id == null)
                return null;

            for (var i = 0, len = this.settings.data.length; i < len; i++) {

                var o = this.settings.data[i];

                if (o.id == id)
                    return o;
            }

            $.error("mjListBox.getItem: item '" + id + "' not found");

            return null;
        },

        getItemAt: function (n) {

            var e = this.$el.find(".mj-list .mj-item:eq(" + n + ")");

            if (e)            
                return e.data("data");

            return null;
        },

        filter: function (str) {

            $.expr[':'].containsIgnoreCase = function (n, i, m) {
                return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            };

            this.$el.find(".mj-list li").show();
            this.$el.find(".mj-list li:not(:containsIgnoreCase('" + str + "'))").hide();
        },

        save: function () {

            var self = this;

            // save the state of the list

            this.original_data = [];

            $.each(this.settings.data, function (index, o) {
                self.original_data.push({ checked: o.checked, value: o.value });
            });
        },

        hasChanged: function () {

            if (this.settings.template_id)
                return false;

            for (var i = 0, len = this.settings.data.length; i < len; i++) {

                var a = this.settings.data[i];
                var b = this.original_data[i];

                // if new state is undefined dont count it as a change

                if (a.checked != b.checked || a.value != b.value)
                    return true;
            }

            return false;
        },

        //-------------------------------------------------------------------------
        // checkbox and radiobutton functions

        toggle: function(id)
        {
            var o = this.getItem(id);

            if (!o)
                return;
            
            if (this._isSelectable())
            {
                if (o.selected == 1)
                    this.deselect(id);
                else
                    this.select(id);
            }
            else
            {
                if (o.checked == 1)
                    this.uncheck(id);
                else
                    this.check(id);
            }
        },

        _check: function(e, o)
        {
            if (!e || !o)
                return false;

            if (this.isSelectable())
                return false;
            
            o.checked = 1;

            switch (this.settings.type)
            {
                case "checkbox":
                    e.find(".mj-checkbox-box").addClass("checked").removeClass("half-ticked");
                    break;

                case "radiobutton":

                    this.uncheckAll();

                    // finally check the radio

                    e.find(".mj-radio").addClass("checked");
                    o.checked = 1;

                    break;
            }

            return true;
        },

        check: function (id) {

            var o = this.getItem(id);

            if (!o) 
                return;

            var e = this._getElement(id);

            return this._check(e, o);
        },

        checkAt: function(n)
        {
            if (this.isSelectable())
                return false;

            var e = this.$el.find(".mj-list .mj-item:eq(" + n + ")");

            if (e)
            {
                var o = e.data("data");               
                return this._check(e, o);                
            }

            return false;
        },

        _uncheck: function (e, o) {

            if (!e || !o)
                return false;

            o.checked = 0;
            e.find(".mj-checkbox-box").removeClass("checked").removeClass("half-ticked");
            e.find(".mj-radio").removeClass("checked"); // could be a radio

            return true;
        },

        uncheck: function (id) {

            if (this.isSelectable())
                return false;

            var o = this.getItem(id);

            if (!o)
                return;

            var e = this._getElement(id);
            return this._uncheck(e, o);
        },

        unchecktAt: function(n)
        {
            if (this.isSelectable())
                return false;

            var e = this.$el.find(".mj-list .mj-item:eq(" + n + ")");

            if (e)
            {
                var o = e.data("data");              
                return this._uncheck(e, o);                
            }

            return false;
        },

        getChecked: function () {

            var arr = [];

            $.each(this.settings.data, function (index, o) {

                if (o.checked == 1)
                    arr.push(o);
            });

            return arr;
        },

        isChecked: function (id) {

            var o = this.getItem(id);

            if (o)
                return o.checked == 1;

            return false;
        },

        checkAll: function () {

            // dont call check for every item, too slow

            if (this.isSelectable())
                return false;

            $.each(this.settings.data, function (index, o) {
                o.checked = 1;
            });

            this.$el.find(".mj-list .mj-item .mj-checkbox-box").addClass("checked").removeClass("half-ticked");
            this.$el.find(".mj-list .mj-item .mj-radio").addClass("checked");
        },

        uncheckAll: function () {

            if (this.isSelectable())
                return false;

            // dont call uncheck for every item, too slow

            $.each(this.settings.data, function (index, o) {
                o.checked = 0;
            });

            this.$el.find(".mj-list .mj-item .mj-checkbox-box").removeClass("checked").removeClass("half-ticked");
            this.$el.find(".mj-list .mj-item .mj-radio").removeClass("checked");
        },

        halfTick: function (id) {

            if (this.settings.type != "checkbox")
                return;

            var o = this.getItem(id);

            if (!o)
                return;

            var e = this._getElement(id);

            this.uncheck(id);

            o.checked = 2;

            if (e)
                e.find(".mj-checkbox-box").removeClass("checked").addClass("half-ticked");
        },

        halfTickAll: function () {

            if (this.settings.type != "checkbox")
                return;

            this.$el.find(".mj-list .mj-item .mj-checkbox-box").removeClass("checked").addClass("half-ticked");

            var data = this.settings.data;

            $.each(this.settings.data, function (index, o) {
                o.checked = 2;
            });
        },

        uncheckHalfTicked: function () {

            if (this.settings.type != "checkbox")
                return false;

            // dont call halfTick for every item, too slow

            // deselect all items which are half ticked

            this.$el.find(".mj-list .mj-item .mj-checkbox-box.half-ticked").removeClass("half-ticked");

            $.each(this.settings.data, function (index, o) {

                if (o.checked == 2)
                    o.checked = 0;
            });
        },

        //----------------------------------------------------------------------------------------------
        // enable disable functions

        _disable: function(e, o)
        {
            if (!e || !o)
                return;

            o.disabled = 1;
            e.addClass("mj-disabled");
        },

        disable: function (id) {

            var o = this.getItem(id);
            var e = this._getElement(id);
            this._disable(e, o);
        },

        disableAt: function(n)
        {
            var e = this.$el.find(".mj-list .mj-item:eq(" + n + ")").first();

            if (e)
            {
                var o = e.data("data");
                this._disable(e, o);
            }
        },

        disableAll: function()
        {
            this.$el.find(".mj-list .mj-item").addClass("mj-disabled");

            $.each(this.settings.data, function (index, o) {
                o.disabled = 1;
            });
        },

        _enable: function (e, o) {

            if (!e || !o)
                return;

            o.disabled = 0;
            e.removeClass("mj-disabled");
        },

        enable: function (id) {

            var o = this.getItem(id);
            var e = this._getElement(id);
            this._enable(e, o);
        },

        enableAt: function (n) {

            var e = this.$el.find(".mj-list .mj-item:eq(" + n + ")").first();

            if (e) {
                var o = e.data("data");
                this._enable(e, o);
            }
        },

        enableAll: function () {

            this.$el.find(".mj-list .mj-item").removeClass("mj-disabled");

            $.each(this.settings.data, function (index, o) {
                o.disabled = 0;
            });
        },

        //-------------------------------------------------------------------------
        // select functions

        selectAll: function () {

            if (!this.isSelectable())
                return false;

            // dont call select for every item, too slow

            $.each(this.settings.data, function (index, o) {
                o.selected = 1;
            });

            this.$el.find(".mj-list .mj-item").addClass("mj-selected");
        },

        deselectAll: function () {

            if (!this.isSelectable())
                return false;

            // dont call deselect for every item, too slow

            $.each(this.settings.data, function (index, o) {
                o.selected = 0;
            });

            this.$el.find(".mj-list .mj-item").removeClass("mj-selected");
        },

        getSelected: function () {

            var arr = [];

            $.each(this.settings.data, function (index, o) {

                if (o.selected == 1)
                    arr.push(o);
            });

            return arr;
        },

        isSelected: function (id) {

            var o = this.getItem(id);

            if (o)
                return o.selected == 1;

            return false;
        },

        _select: function (e, o) {

            if (!e || !o)
                return false;

            o.selected = 1;
            e.addClass("mj-selected");
        },

        _deselect: function (e, o) {

            if (!e || !o)
                return false;

            o.selected = 0;
            e.removeClass("mj-selected");
        },

        select: function(id)
        {
            if (!this.isSelectable())
                return false;

            var o = this.getItem(id);

            if (!o)
                return;

            var e = this._getElement(id);
            this._select(e, o);
        },

        deselect: function (id) {

            if (!this.isSelectable())
                return false;

            var o = this.getItem(id);

            if (!o)
                return;

            var e = this._getElement(id);
            this._deselect(e, o);
        },

        //--------------------------------------------------------------------------------
        // add, insert, update, remove functions

        add: function(data)
        {            
            this.settings.data.push(data);

            var str = this._buildItemHTML(data);
            
            this.$el.find(".mj-list").append(str);
        },

        insert: function(id, data)
        {
            var e = this._getElement(id);

            if (e) {

                this._validateItem(data);
                this.settings.data.push(data);                
                e.append( this._buildItemHTML(data) );
            }
        },
        
        insertAt: function(n, data)
        {
            var e = this.$el.find(".mj-list .mj-item:eq(" + n + ")").first();

            if (e)
            {
                this._validateItem(data);
                this.settings.data.push(data);
                e.append( this._buildItemHTML(data) );
            } 
        },

        update: function(id, data)
        {
            var e = this._getElement(id);

            if (!e)
                return false;

            var o = e.data("data");

            $.removeData(e, 'data');

            //this._validateItem(data);      // dont validateItem, we may omit properties eg change text only

            o = $.extend(o, data);

            console.log(o);

            var str = this._buildItemHTML(o);
            e.html(str);
        },

        updateAt: function(n, data)
        {
            var e = this.$el.find(".mj-list .mj-item:eq(" + n + ")").first();

            if (e)
            {
                var o = e.data("data");

                if (o)                
                    this.update(o.id);                
            }             
        },

        remove: function(id)
        {
            var found = false;

            this.settings.data = $.grep(this.settings.data, function (o) {

                // remove element from array

                if (o.id == id)
                    found = true;

                return o.id != id;
            });

            var e = this._getElement(id);

            if (!e || e.length == 0)
                return false;

            e.remove();        // remove the li

            return true;
        },

        removeAt: function(n)
        {
            var e = this.$el.find(".mj-list .mj-item:eq(" + n + ")").first();

            if (e)
            {
                var o = e.data("data");

                if (o)                
                    return this.remove(o.id);
            }            
        },

        //-----------------------------------------------------------------------------------------
        // misc functions

        close: function () {

            // dont clear the data
            // important to turn off events

            this._stopListening();

            // we may still want to get the data after the listbox has closed so dont remove the data

            $.removeData(this.el, 'mj-listbox-data');
           
            this.$el.html("");            
        },

        scrollTo: function (n, animate) {

            var e = this._getElement(n);

            if (e) {

                // need to use position rather than offset

                var pos = e.position().top;

                if (animate == false)
                    this.$el.find(".mj-list").css({ scrollTop: pos });
                else
                    this.$el.find(".mj-list").animate({ scrollTop: pos }, 300);
            }
        }
    }

    $.fn.mjListBox = function (options) {

/*
        function create(name) {
            function F() { };
            F.prototype = mjListBox;
            var f = new F;
            return f;
        }
*/

        // within a plugin use this not $(this) to refer to the element to attach to
        // this refers to the element we are attaching to
        // needs to return this for chainability

        if (mjListBox[options]) {

            // options is the name of a method in mjListBox

            var o = $(this).data('mj-listbox-data');

            // cant call slice directly on arguments

            if (o)
                return o[options].apply(o, Array.prototype.slice.call(arguments, 1));

            // if o is not found then the mjListBox has not been attached to the element
            // its not an necessarily and error

            return null;
        }
        else if (!options || typeof options === 'object') {

            // options is empty or an object
            // create the listbox            
            // check that element exists using this.length

            if (!this.length) {
                $.error("mjListBox: cant create, the html element to attach to '" + this.selected + "' does not exist.");
                return null;
            }

            // Note: a jquery query select can refer to any number of html elements
            // return is for chainability, dont have to return anything

            return this.each(function (index, o) {

                // remove any previous data

                //$.removeData(this, 'mj-listbox-instance');

                var x = Object.create(mjListBox);
                   
                x._init(options, o);

                // attach object instance to this html element

                $.data(o, 'mj-listbox-data', x);
            });
        }
        else {

            // method does not exist

            $.error('Method ' + options + ' does not exist in mjListBox');
        }
    };
})(jQuery);     // pass jQuery as an argument to the immiediatly executed javascript function so that $ always refers to jquery

}); // document.ready
