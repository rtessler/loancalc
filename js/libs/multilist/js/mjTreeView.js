$(document).ready(function () {

    (function ($) {

        var mjTreeView = {

            _init: function (options, el) {

                var default_settings = {
                    data: null,
                    image_path: "images/",
                    type: "checkbox",       // checkbox, radiobutton, null
                    expand_selected: false, // if true show subitems for selected nodes
                    expand_checked: false,  // if true show subitems for checked nodes
                    animation_duration: 50,  // time in milliseconds, 0 for no animation
                    recursive: true,         // if true selecting a node selects all child nodes and their parents
                    has_hierarchy: false,     // if true, data is already hierarchly defined (each node has a items element if it has children)
                    filter: false,

                    // common properties

                    width: 'auto',
                    height: 'auto',
                    disabled: false,
                    theme: null
                };

                // node data structure

                // {id: int, mandatory
                // pid: int, optional, if pid is null its a root node with no parent
                // text: string, optional
                // image: string, optional
                // selected: true,false, optional (ignored is type is checkbox or radiobutton)
                // checked: 0|1|2, 0, optional is not checked, 1 is checked, 2 is half ticked (ignored if type is not checkbox or radiobutton)
                // disabled: true or false, optional

                this.settings = $.extend({}, default_settings, options);

                // if the filter is enabled we need to save the original data before we filter it out

                if (this.settings.filter)
                    this._copyData();

                if (!this.settings.has_hierarchy) {
                    this.validateData();                      // turn undefined text and selected into values
                    this._buildHierarchy();                   // create hierarchy
                }
                else {
                    this._setParents(this.settings.data, null);
                    var output = [];
                    this._createNodeMap(this.settings.data, output);
                    this.settings.data = output;
                    this.validateData();
                }

                this.save();      // save original data so we can tell if something has changed

                this.el = el;
                this.$el = $(el);

                // plugin have been applied previously
                // blow away any existing instance

                this.close();

                this._render();
                this._startListening();
            },

            _copyData: function()
            {
                this.original_data = $.map(this.settings.data, function (obj) {
                    return $.extend(true, {}, obj);
                });
            },

            validateParent: function(o)
            {
                // if element is checked or selected make sure parent is checked or selected

                if ((o.selected || o.checked == 1) && o.pid != null) {

                    // find the parent

                    for (var i = 0, len = this.settings.data.length; i < len; i++) {
                            
                        var p = this.settings.data[i];

                        if (p.id == o.pid)
                        {
                            if (this.isCheckboxOrRadiobutton()) {

                                if (o.checked == 1)
                                    p.checked = 1;
                            }
                            else {

                                if (o.selected)
                                    p.selected = true;
                            }

                            this.validateParent(p);
                            break;
                        }
                    }
                }
            },

            validateData: function()
            {
                var self = this;
                
                // go through data adding text and selected fields where necessary

                $.each(this.settings.data, function (index, o) {

                    if (o.id === undefined) {
                        this._message("mjTreeView.validateData: treeview data contains a node with no id");      // fatal error
                        return;
                    }

                    if (o.pid === undefined)
                        o.pid = null;

                    if (o.text === undefined)
                        o.text = "";

                    // valid values of selected is true,false
                    // checked and selected are mutually exclusive

                    if (self.isCheckboxOrRadiobutton()) {

                        // valid values for checked is 0,1,2

                        if (o.checked === undefined || o.checked == false)
                            o.checked = 0;

                        if (o.checked == true)      // allow values of true
                            o.checked = 1;

                        if (o.checked != 0 && o.checked != 1 && o.checked != 2)
                            o.checked = 0;

                        o.selected = null;
                    }
                    else {

                        if (o.selected === undefined || o.selected == 0)
                            o.selected = false;

                        if (o.selected == 1)
                            o.selected = true;

                        if (o.selected != true && o.selected != false)
                            o.selected = false;

                        o.checked = null;
                    }


                    self.validateParent(o);
                });
            },       

            _startListening: function () {

                var self = this;

                // we may be recreating the plugin for the second time
                // if we do not stop listening to events on the element we get strange behaviour

                this._stopListening();

                //this.$el.on("click", ".mj-list .mj-item:has(.mj-list) > .mj-expander", function (e) {
                this.$el.on("click", ".mj-expander", function (e) {

                    // clicked on the expander

                    // expand/collapse	

                    var o = $(this).parent().find(".mj-content").data("d");

                    if ($(this).parent().find(".mj-list").is(":visible")) {
                        // collapse

                        $(this).removeClass("mj-open").addClass("mj-closed");
                        self.$el.trigger("collapse", o);
                    }
                    else {
                        // expand

                        $(this).removeClass("mj-closed").addClass("mj-open");
                        self.$el.trigger("expand", o);
                    }

                    $(this).parent().find(".mj-list").first().slideToggle(self.settings.animation_duration);
                });

                this.$el.find("click", ".mj-list .mj-item .mj-content").unbind('click');

                this.$el.on("click", ".mj-list .mj-item .mj-content", function (e) {                    

                    // clicked on the checkbox, radio or text

                    e.preventDefault();

                    var o = $(e.currentTarget).data("d");                    

                    if (o) {

                        if (o.disabled)
                            return;

                        if (self.isCheckboxOrRadiobutton()) {
                           
                            if (o.checked == 1) {                                
                                self.uncheck(o.id);
                                self.$el.trigger("checkChange", o);
                            }
                            else {
                                self.check(o.id);
                                self.$el.trigger("checkChange", o);
                            }
                        }
                        else {

                            if (o.selected) {
                                self.deselect(o.id);
                                self.$el.trigger("selected", o);
                            }
                            else {
                                self.select(o.id);
                                self.$el.trigger("selected", o);
                            }
                        }
                    }
                    else {
                        self._message("mjTreeView: node click: node " + id + " not found");
                    }
                });

                if (this.settings.filter) {

                    this.$el.on("keyup", ".mj-treeview .mj-searchbox-container .mj-searchbox", function (e) {

                        e.preventDefault();

                        var str = $(e.currentTarget).val();

                        self._filter(str);
                    });
                }
            },

            _stopListening: function()
            {
                this.$el.off();
            },

            _buildHierarchy: function()
            {
                var self = this;

                // build the hierarchy
                // add array of child nodes (items) to each node

                $.each(this.settings.data, function (index, o) {

                    // destroy any existing hierarchy

                    o.items = null;
                });

                $.each(this.settings.data, function (index, o) {

                    if (o.pid != undefined && o.pid != null) {                        

                        var p = self.getItem(o.pid);        // get parent

                        if (p) {

                            if (!p.items)
                               p.items = [];

                            p.items.push(o);             
                        }
                        else {
                            // parent does not exists
                            // error in data or node appears before its parent

                            $.error("mjTreeView.buildHierarchy: error in data, parent node " + o.pid + " not found.");
                        }
                    }
                });
            },

            _setParents: function(data, pid)
            {
                var self = this;
            
                // set the pid element for each node

                $.each(data, function (index, o) {

                    o.pid = pid;

                    if (o.items && o.items.length > 0)
                        self._setParents(o.items, o.id);                    
                });
            },

            _createNodeMap: function (data, output) {

                // this flattens the hierarchy into a normal node array

                var self = this;

                // set the pid element for each node

                $.each(data, function (index, o) {

                    output.push(o);

                    if (o.items && o.items.length > 0)
                        self._createNodeMap(o.items, output);
                });
            },

            _buildItemHTML: function (o) {

                var c = "mj-content ";

                if (o.disabled)
                    c += "mj-disabled ";

                // cant be selected and and disabled

                if (o.selected && !o.disabled)
                    c += "selected ";

                var e = $("<div>", { class: c });

                var checked = "";

                switch (o.checked) {
                    case 1: checked = " checked"; break;
                    case 2: checked = " half-ticked"; break;
                }
                
                switch (this.settings.type) {

                    case "checkbox":

                        var str = "<div >";
                        str += "<div class='mj-checkbox-box" + checked + "'></div>";
                        str += "</div>";

                        e.append(str);

                        break;

                    case "radiobutton":

                        var str = "<div >";
                        str += "<div class='mj-radio" + checked + "'><div class='mj-dot'></div></div>";
                        str += "</div>";

                        e.append(str);
                        break;
                }                

                if (o.image) {

                    var str = "<div >";
                    str += "<img class='mj-image ' src='" + this.settings.image_path + o.image + "' />";
                    str += "</div>";

                    e.append(str);
                }

                var text = (o.text == undefined) ? "" : o.text;

                var str = "<div >";
                str += "<span class='mj-text'>" + text + "</span></div>";
                str += "</div>";

                e.append(str);

                e.data("d", o);

                return e;
            },

            _buildListHTML: function (items, level) {

                // build a string which can be inserted into the DOM

                var self = this;

                // start a new list

                var e = $("<ul>", { class: 'mj-list' });

                // this loop to needs to be fast

                for (var j = 0; j < items.length; j++) {                                        

                    var o = items[j];

                    o.level = level;

                    // start a new item

                    var i = $("<li>", { class: 'mj-item' });

                    var x = self._buildItemHTML(o);

                    if (o.items && o.items.length > 0) {

                        if ((self.settings.expand_selected || self.settings.expand_checked) && (o.selected || o.checked == 1)) {

                            i.append("<div class='mj-expander mj-open'></div>");
                            i.append(x);
                            //i.append("<div class='clear'></div>");

                        }
                        else {

                            i.append("<div class='mj-expander mj-closed'></div>");
                            i.append(x);
                            //i.append("<div class='clear'></div>");
                        }

                        // has child items

                        var new_list = self._buildListHTML(o.items, level + 1);

                        i.append(new_list);
                    }
                    else {

                        // leaf node
                        // root node with no children

                        i.addClass("mj-leaf");
                        i.append(x);                        
                    }

                    e.append(i);
                }

                return e;
            },

            _render: function () {

                var self = this;

                var rootnodes = [];

                for (var i = 0, len = this.settings.data.length; i < len; i++) {

                    var o = this.settings.data[i];

                    if (o.pid == undefined || o.pid == null)
                        rootnodes.push(o);                    
                }
                
                var a = $("<div>", { class: 'mj-treeview mj-widget' });
                var b = $("<div>", { class: 'mj-root' });                
                //var c = this._buildListHTML(rootnodes, 0);

                $.each(rootnodes, function (index, o) {                    

                    var c = self._buildListHTML([o], 0);

                    b.append(c);
                });

                //b.html(c);
                a.html(b);

                if (this.settings.filter) {

                    // add on a filter box

                    var str = "<div class='mj-filter-box'>";
                    str += " <div class='mj-searchbox-container'>";
                    str += "  <input class='mj-searchbox' />";        // on ipad we autofocus cases the keyboard to appear
                    str += " </div>";
                    str += " <div class='mj-search-btn'></div>";
                    str += "</div>";

                    a.append(str);
                }

                this.$el.html(a);

                if (this.settings.filter) {

                    // leave space for the filter

                    this.$el.find(".mj-treeview .mj-root").css("bottom", "36px");
                }

                //this.$el.css({ width: "'" + this.settings.width + "'", height: "'" + this.settings.height + "'" });

                return this;
            },

            _message: function (msg) {

                if (window.console && window.console.log)
                    console.log(msg);
            },

            _filter: function (str) {

                var self = this;

                str = str.toLowerCase();

                for (var i = 0, len = this.original_data.length; i < len; i++)
                {
                    var o = this.original_data[i];
                    o.visible = false;
                }

                for (var i = 0; i < this.original_data.length; i++) {

                    var o = this.original_data[i];

                    if (o.text.toLowerCase().indexOf(str) >= 0) {

                        o.visible = true;

                        // need to display parents of any matching node

                        var node = o;                        
                        var parent = null;
                        
                        do {

                            parent = null;

                            if (node.id != null && node.pid != null) {

                                for (var j = 0; j < this.original_data.length; j++) {

                                    var x = this.original_data[j];

                                    if (x.id == node.pid) {
                                        parent = x;
                                        break;
                                    }
                                }
                            }

                            if (parent) {
                                parent.visible = true;
                                node = parent;
                            }

                        }
                        while (parent != null);
                    }
                }

                var data2 = [];

                for (var i = 0, len = this.original_data.length; i < len; i++) {

                    var o = this.original_data[i];

                    if (o.visible)
                        data2.push(o);
                }

                // replace the data

                this.settings.data = data2;
                
                //if (!this.settings.has_hierarchy) {

                    $.each(this.settings.data, function (index, o) {
                        o.items = [];
                    });

                    this.validateData();                      // turn undefined text and selected into values

                    this._buildHierarchy();                 // create hierarchy
                //}
                //else {

                //    this._setParents(this.settings.data, null);
                //    var output = [];
                //    this._createNodeMap(this.settings.data, output);
                //    this.settings.data = output;
                //    this.validateData();
                //}

                var rootnodes = [];

                $.each(this.settings.data, function (index, o) {

                    if (o.pid == undefined || o.pid == null)
                        rootnodes.push(o);                    
                });

                this.$el.find(".mj-root").html(this._buildListHTML(rootnodes, 0));
            },

            _getElement: function (id) {

                return this.$el.find(".mj-content").filter(
                    function () { return $(this).data("d").id == id; }
                );
            },

            //----------------------------------------------------------------------------
            // public interface
            //----------------------------------------------------------------------------

            save: function () {

                // save original data

                //this.original_data = $.map(this.settings.data, function (obj) {
                //    return $.extend(true, {}, obj);
                //});

                this.original = [];

                // important we validateData before calling save

                for (var i = 0, len = this.settings.data.length; i < len; i++) {

                    var d = this.settings.data[i];

                    this.original.push({ checked: d.checked, selected: d.selected });
                }
            },

            hasChanged: function () {

                for (var i = 0, len = this.settings.data.length; i < len; i++) {

                    var a = this.settings.data[i];
                    var b = this.original[i];

                    if ( a && b && (a.checked != b.checked || a.selected != b.selected))
                        return true;
                }

                return false;
            },

            getItem: function (id) {

                // find node by id in original data

                if (id == undefined || id == null)
                    return null;

                // cant break out of $.each, use normal for statement

                for (var i = 0, len = this.settings.data.length; i < len; i++) {

                    var o = this.settings.data[i];

                    if (o.id == id)
                        return o;
                }

                return null;
            },
          
            //------------------------------------------------------------------------------------------------
            // enable, disable functions

            enable: function()
            {
                this.$el.find(".mj-content").removeClass("mj-disabled");

                $.each(this.settings.data, function (index, o) {
                    o.disabled == true;
                });
            },

            disable: function()
            {
                this.$el.find(".mj-content").addClass("mj-disabled");

                $.each(this.settings.data, function (index, o) {
                    o.disabled == false;
                });
            },

            enableItem: function (id) {

                var o = this.getItem(id);

                if (o) {
                    o.disabled = false;
                    var e = this._getElement(id);
                    e.find(".mj-content").removeClass("mj-disabled");
                }
            },

            disableItem: function (id) {

                var o = this.getItem(id);

                if (o) {
                    o.disabled = true;
                    var e = this._getElement(id);
                    e.find(".mj-content").addClass("mj-disabled");
                }
            },

            //---------------------------------------------------------------------------------------------------------
            // checkbox and radiobutton functions

            isCheckboxOrRadiobutton: function()
            {
                return !$.inArray(this.settings.type, ["checkbox", "radiobutton"]);
            },

            toggle: function (id) {

                var o = this.getItem(id);

                if (!o)
                    return;

                if (this.isCheckboxOrRadiobutton()) {

                    if (o.checked == 1)
                        this.uncheck(id);
                    else
                        this.check(id);
                }
                else
                {
                    if (o.selected)
                        this.deselect(id);
                    else
                        this.select(id);
                }
            },

            checkParent: function (id) {

                var o = this.getItem(id);

                if (o) {

                    if (o.pid != undefined && o.pid != null) {

                        // there is a parent

                        var e = this._getElement(o.pid);

                        o = this.getItem(o.pid);

                        if (o) {

                            e.find(".mj-checkbox-box").addClass("checked").removeClass("half-ticked");
                            o.checked = 1;
                            this.checkParent(o.id);        // recursive
                        }
                    }
                }
                else {
                    $.error("treeview.checkParent: node " + id + " not found");
                }
            },

            checkAll: function () {

                // dont call select for every node, too slow

                if (!this.isCheckboxOrRadiobutton())
                    return;

                $.each(this.settings.data, function (index, o) {
                    o.checked = 1;
                });

                this.$el.find(".mj-checkbox-box").addClass("checked").removeClass("half-ticked");
                this.$el.find(".mj-radio").addClass("checked").removeClass("half-ticked");
            },

            uncheckAll: function () {

                // dont call deselect for every node, too slow

                if (!this.isCheckboxOrRadiobutton())
                    return;

                $.each(this.settings.data, function (index, o) {
                    o.checked = 0;
                });

                this.$el.find(".mj-checkbox-box").removeClass("checked").removeClass("half-ticked");
                this.$el.find(".mj-radio").removeClass("checked").removeClass("half-ticked");
            },

            check: function(id)
            {
                if (!this.isCheckboxOrRadiobutton())
                    return;

                var self = this;
                var o = this.getItem(id);

                if (o) {

                    var e = this._getElement(id);

                    if (e) {

                        o.checked = 1;

                        e.find(".mj-checkbox-box").addClass("checked").removeClass("half-ticked");
                        e.find(".mj-radio").addClass("checked").removeClass("half-ticked");

                        if (this.settings.recursive) {

                            // select all parents of this node

                            this.checkParent(o.id);

                            // select the children of this node

                            if (o.items) {

                                $.each(o.items, function (index, n) {
                                    self.check(n.id);
                                });
                            }
                        }
                    }
                }
                else {
                    this._message("mjTreeView.check: node " + id + " not found");
                }
            },

            uncheck: function(id)
            {
                if (!this.isCheckboxOrRadiobutton())
                    return;

                var self = this;
                var o = this.getItem(id);

                if (o) {
                    var e = this._getElement(id);

                    o.checked = 0;

                    if (e) {

                        e.find(".mj-checkbox-box").removeClass("checked").removeClass("half-ticked");
                        e.find(".mj-radio").removeClass("checked").removeClass("half-ticked");

                        // deselect children of this node
                        // always do this, ignore settings.recursive, doesnt make sense to not deselect children

                        if (o.items) {

                            $.each(o.items, function (index, n) {
                                self.uncheck(n.id);         // recursive
                            });
                        }
                    }
                }
                else {
                    this._message("mjTreeView.uncheck: node " + id + " not found");
                }
            },

            checkAt: function(n)
            {
                // TBD
            },

            uncheckAt: function(n)
            {
                // TBD
            },

            checkAll: function()
            {
                // dont call check for every item, too slow

                if (!this.isCheckboxOrRadiobutton())
                    return false;

                $.each(this.settings.data, function (index, o) {
                    o.checked = 1;
                });

                this.$el.find(".mj-checkbox-box").addClass("checked").removeClass("half-ticked");
                this.$el.find(".mj-radio").addClass("checked");
            },

            uncheckAll: function()
            {
                // dont call check for every item, too slow

                if (!this.isCheckboxOrRadiobutton())
                    return false;

                $.each(this.settings.data, function (index, o) {
                    o.checked = 0;
                });

                this.$el.find(".mj-checkbox-box").removeClass("checked").removeClass("half-ticked");
                this.$el.find(".mj-radio").removeClass("checked");
            },

            getChecked: function()
            {
                var arr = [];

                $.each(this.settings.data, function (index, o) {

                    if (o.checked == 1)
                        arr.push(o);
                });

                return arr;
            },

            halfTick: function (id) {

                if (!this.isCheckboxOrRadiobutton())
                    return false;

                var o = this.getItem(id);

                if (o) {
                    var e = this._getElement(id);

                    if (e) {

                        this.uncheck(id);       // uncheck child nodes

                        o.checked = 2;

                        e.find(".mj-checkbox-box").removeClass("checked").addClass("half-ticked");
                        e.find(".mj-radio").removeClass("checked").addClass("half-ticked");
                    }
                }
                else {
                    this._message("mjTreeView.halfTick: node " + id + " not found");
                }
            },

            halfTickAt: function(n)
            {
                // TBD
            },

            halfTickAll: function () {

                if (!this.isCheckboxOrRadiobutton())
                    return false;

                // dont call halfTick for every node, too slow

                $.each(this.settings.data, function (index, o) {
                    o.checked = 2;
                });

                this.$el.find(".mj-checkbox-box").removeClass("checked").addClass("half-ticked");
                this.$el.find(".mj-radio").removeClass("checked").addClass("half-ticked");
            },

            deselectHalfTicked: function () {

                if (!this.isCheckboxOrRadiobutton())
                    return false;

                // dont call halfTick for every node, too slow
                // deselect all nodes which are half ticked

                $.each(this.settings.data, function (index, o) {

                    if (o.checked == 2)
                        o.checked = 0;
                });

                this.$el.find(".mj-checkbox-box.half-ticked").removeClass("half-ticked");
                this.$el.find(".mj-radio.half-ticked").removeClass("half-ticked");
            },

            //--------------------------------------------------------------------------
            // select functions

            selectParent: function (id) {

                var o = this.getItem(id);

                if (o) {

                    if (o.pid != undefined && o.pid != null) {
                        var p = this._getElement(o.pid);

                        o = this.getItem(o.pid);

                        if (o) {
                            p.addClass("selected");
                            o.selected = true;
                            this.selectParent(o.id);        // recursive
                        }
                    }
                }
                else {
                    $.error("treeview.selectParent: node " + id + " not found");
                }
            },

            select: function (id) {

                if (this.isCheckboxOrRadiobutton())
                    return;

                var self = this;
                var o = this.getItem(id);

                if (o) {

                    var e = this._getElement(id);

                    if (e) {

                        o.selected = true;

                        e.addClass("selected");

                        if (this.settings.recursive) {

                            // select all parents of this node

                            this.selectParent(o.id);

                            // select the children of this node

                            if (o.items) {

                                $.each(o.items, function (index, n) {
                                    self.select(n.id);
                                });
                            }
                        }
                    }
                }
                else {
                    this._message("mjTreeView.select: node " + id + " not found");
                }
            },

            deselect: function (id) {

                if (this.isCheckboxOrRadiobutton())
                    return;

                var self = this;
                var o = this.getItem(id);

                if (o) {
                    var e = this._getElement(id);

                    o.selected = false;
                    e.removeClass("selected");

                    // deselect children of this node
                    // always do this, ignore settings.recursive, doesnt make sense to not deselect children

                    if (o.items) {

                        $.each(o.items, function (index, n) {
                            self.deselect(n.id);
                        });
                    }
                }
                else {
                    this._message("mjTreeView.deselect: node " + id + " not found");
                }
            },

            getSelected: function () {

                var arr = [];

                $.each(this.settings.data, function (index, o) {

                    if (o.selected)
                        arr.push(o);
                });

                return arr;
            },

            isSelected: function (id) {

                var o = this.getItem(id);

                if (o)
                    return (o.selected);

                return false;
            },

            selectAll: function () {

                if (this.isCheckboxOrRadiobutton())
                    return;

                // dont call select for every node, too slow

                $.each(this.settings.data, function (index, o) {
                    o.selected = true;
                });

                this.$el.find(".mj-content").addClass("selected");
            },

            deselectAll: function () {

                if (this.isCheckboxOrRadiobutton())
                    return;

                // dont call deselect for every node, too slow

                $.each(this.settings.data, function (index, o) {
                    o.selected = false;
                });

                this.$el.find(".mj-content").removeClass("selected");
            },

            //--------------------------------------------------------------------------------------------------------------

            getAllItems: function()
            {
                return this.settings.data;
            },

            isRootNode: function(id)
            {
                var o = this.getItem(id);

                if (!o)
                    return false;

                if (o.pid == undefined || o.pid == null)
                    return true;

                return false;
            },

            getSiblings: function (id) {

                var self = this;

                var n = this.getItem(id);

                var siblings = [];

                if (!n)
                    return siblings; 

                if (n) {
                    $.each(this.settings.data, function (index, o) {

                        // both root nodes or same parent

                        if ((o.pid == n.pid || (self.isRootNode(o.id) && self.isRootNode(n.id))) && o.id != n.id)
                            siblings.push(o);
                    });
                }

                return siblings;
            },

            //----------------------------------------------------------------------------------------------------
            // add, insert, update, remove

            insert: function(id, data)
            {
                var e = this._getElement(id);

                if (e) {

                    this.settings.data.push(data);
                    var o = this._buildItemHTML(data);
                    o.data(data);

                    e.parent().append(o);
                }
            },

            update: function(data)
            {
                var e = this._getElement(data.id);

                if (e) {

                    var o = this._buildItemHTML(data);
                    o.data(data);
                    e.html(o);
                }
            },

            remove: function(id)
            {
                // remove a single node

                if (this.settings.data.length == 0)
                    return;

                var index = 0;
                var len = this.settings.data.length;

                for (; index < len; index++) {

                    var o = this.settings.data[index];

                    if (o.id == id)
                        break;
                }

                if (index >= len)
                    return;

                var e = this._getElement(id);

                if (!e || e.length == 0)
                    return;

                this.settings.data.splice(index, 1);

                e.parent().remove();        // remove the li
            },

            //------------------------------------------------------------------------------------

            expand: function(id)
            {                
                var o = this.getItem(id);

                if (!o || !o.items)
                    return;

                if (o.disabled)
                    return;

                var e = this._getElement(id);

                if (!e.prev().hasClass("mj-closed"))
                    return;     // already expanded

                e.prev().removeClass("mj-closed").addClass("mj-open");
                //this.$el.trigger("expand", o);

                e.parent().find(".mj-list").first().slideDown(this.settings.animation_duration);
            },

            collapse: function(id)
            {
                var o = this.getItem(id);

                if (!o || !o.items)
                    return;

                if (o.disabled)
                    return;

                var e = this._getElement(id);

                // collapse children first

                for (var i = 0; i < o.items.length; i++)
                    this.collapse(o.items[i].id);

                if (!e.prev().hasClass("mj-open"))
                    return;     // already closed

                e.prev().removeClass("mj-open").addClass("mj-closed");
                //this.$el.trigger("expand", o);

                e.parent().find(".mj-list").first().slideUp(this.settings.animation_duration);
            },

            expandAll: function()
            {
                var self = this;

                $.each(this.settings.data, function (index, o) {

                    self.expand(o.id);
                });
            },

            collapseAll: function()
            {
                var self = this;
                
                $.each(this.settings.data, function (index, o) {

                    self.collapse(o.id);
                });
            },    

            close: function () {

                // dont clear the data
                // important to turn off events

                this._stopListening();
                this.$el.data(this, 'mj-treeview-data', null);
                this.$el.html("");
            }
        }

        $.fn.mjTreeView = function (options) {
            
            if (mjTreeView[options]) {

                var q = $(this).data('mj-treeview-data');

                if (q) {

                    return q[options].apply(q, Array.prototype.slice.call(arguments, 1));

                }
            }
            else if (!options || typeof options === 'object') {

                // options is empty or an object
                // within a plugin use this not $(this)
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjTreeView cant create since the base element to attach to '" + this.selected + "' does not exist");
                    return null;
                }

                // return is for chainability, dont have to return anything
                // if the selector was multiply defined you would be creating plugin for each selector

                return this.each(function () {
                    var treeview = Object.create(mjTreeView);
                    treeview._init(options, this);
                    $.data(this, 'mj-treeview-data', treeview);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + options + ' does not exist on mjTreeView');
            }
        };
    })(jQuery);

});