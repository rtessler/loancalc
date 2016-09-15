$(document).ready(function () {

    /*
		Requirements:

		- merge columns: TBD
		- automatic resizing of columns: TBD
		- custom rendering of cells: done
		- center text in columns: done
		- virtual mode: done
		- phone/ipad scrolling
		- freeze columns: TBD
	*/

    (function ($) {

        var mjGrid = {

            init: function (options, el) {

                var default_options = {                    
                    columns: null,
                    rows: null,                     // eg [{id: 1, text: 'abc'}, {id: 2, text: 'def'}]
                    pagesize: 10,                   // number of rows visible
                    columnCellFormatter: null,      // function to draw column header cell
                    cellFormatter: null,            // function to draw a row cell

                    // common properties

                    width: 'auto',
                    height: 'auto',
                    disabled: false,
                    theme: null
                };

                this.start = 0;     // row start position

                this.settings = $.extend({}, default_options, options);
                this.el = el;
                this.$el = $(el);

                this.validateData();

                // plugin have been applied previously
                // blow away any existing instance

                this.close();

                this.render();
                this.startListening();

                return this;
            },

            validateData: function()
            {
                if (this.settings.columns == null || this.settings.columns == undefined)
                    this.settings.columns = [];

                if (this.settings.rows == null || this.settings.rows == undefined)
                    this.settings.rows = [];
            },

            render: function () {

                var self = this;

                var str = "<div class='mj-grid mj-widget'>";

                    str += "<div class='mj-table-container'>";

                        str += "<div class='mj-grid-table'>";

                            str += "<div class='mj-grid-header'>";      // like thead
               
                            str += this.drawHeaderRow();

                            str += "</div>";

                            str += "<div class='mj-grid-body'>";        // like tbody

                            str += this.drawRows();

                            str += "</div>";
                
                        str += "</div>";

                    str += "</div>";

                    // give it a scrollbar if necessary

                    if (this.settings.rows.length > this.settings.pagesize)
                        str += "<div class='mj-grid-scrollbar'></div>";

                str += "</div>";

                this.$el.html(str);                

                if (this.settings.rows.length > this.settings.pagesize) {
                    this.$el.find(".mj-grid-scrollbar").mjScrollBar({ min: 0, max: this.settings.rows.length - this.settings.pagesize });

                    this.$el.find(".mj-grid-scrollbar").on("valueChange", function (e, n) {

                        self.scroll(n);
                    });
                }
                else
                {
                    this.$el.find(".mj-grid .mj-table-container").css("right", "0px");
                }

                return this;
            },

            drawHeaderRow: function()
            {
                var self = this;

                // render the columns row

                var str = "";

                if (this.settings.columns && this.settings.columns.length > 0) {

                    str += "<div>";

                    for (var i = 0; i < this.settings.columns.length; i++) {
        
                        var o = this.settings.columns[i];

                        str += "<div>";

                        if (typeof this.settings.columnCellFormatter == 'function')
                            str += self.settings.columnCellFormatter(o, i);                       
                        else
                            str += o;                        

                        str += "</div>";
                    }

                    str += "</div>";
                }

                return str;
            },

            drawRows: function () {

                // this function is called repeatedly as we scroll so it needs to be fast

                var str = "";

                var n = this.start + this.settings.pagesize;
                var m = this.settings.rows.length ;
                var rowlen = this.settings.rows[0].length;

                var maxi = Math.min(n, m);

                // virtual grid

                for (var i = this.start; i < maxi; i++)
                {
                    var r = this.settings.rows[i];

                    str += "<div>";

                    for (var j = 0; j < rowlen; j++) {

                        var c = r[j];

                        str += "<div>";

                        if (typeof this.settings.cellFormatter == 'function') {
                            str += this.settings.cellFormatter(c, i, j);
                        }
                        else {
                            str += c;
                        }

                        str += "</div>";
                    }

                    str += "</div>";
                }

                return str;
            },

            startListening: function () {

                var self = this;

                this.stopListening();

                this.$el.on("click", ".mj-grid-body > div > div", function (e) {

                    // body cell click

                    e.preventDefault();

                    var index = $(e.currentTarget).parent().index();

                    var o = self.getRow(index);
                    self.$el.trigger("rowCellClick", o);
                });

                this.$el.on("mouseover", ".mj-grid-body > div > div", function (e) {

                    // body cell hover
    
                    e.preventDefault();
                });
    
                this.$el.on("mouseout", ".mj-grid-body > div > div", function (e) {
    
                    e.preventDefault();    
                });
            },

            stopListening: function () {
                this.$el.off();
            },

            //-----------------------------------------------------------------------------------
            // public methods

            disableRow: function (id) {
            },

            getRow: function (index) {

                if (index == undefined || index == null)
                    return null;

                // cant break out of $.each, use normal for

                if (index >= this.settings.rows.length)
                    return null;

                return this.settings.rows[index];

                //for (var i = 0, len = this.settings.data.length; i < len; i++) {

                //    var o = this.settings.data[i];

                //    if (o.id == id)
                //        return o;
                //}

                //return null;
            },

            //getRowElement: function (id) {
            //    return this.$el.find("div.mj-grid li a.node[nodeid='" + id + "']");
            //},

            addRow: function (data) {

                // TBD

                this.settings.rows.push(data);
            },

            insertRow: function (id, data) {

                // TBD

               this.settings.rows.push(data);                
            },

            updateRow: function (data) {

                // TBD

            },

            updateCell: function(data, i, j)
            {
                // TBD
            },

            deleteRow: function (id) {

                // TBD

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

                var e = this.getNodeElement(id);

                if (!e || e.length == 0)
                    return;

                this.settings.data.splice(index, 1);

                e.parent().remove();        // remove the li
            },

            scroll: function (n) {
                this.start = n;

                var str = this.drawRows();

                this.$el.find(".mj-grid-body").html(str);
            },

            close: function () {

                // dont clear the data
                // important to turn off events

                this.stopListening();
                this.$el.data(this, 'mj-grid-data', null);
                this.$el.html("");
            },

            //colSpan: function (i, j, n) {

            //},

            //colSplit: function (i, j, data) {

            //}
        }

        $.fn.mjGrid = function (options) {

            if (mjGrid[options]) {

                // options is the name of a method in mjGrid

                var o = $(this).data('mj-grid-data');

                // cant call slice directly on arguments

                if (o)
                    return o[options].apply(o, Array.prototype.slice.call(arguments, 1));

                // if o is not found then the mjGrid has not been attached to the element
                // its not an necessarily and error

            }
            else if (!options || typeof options === 'object') {

                // options is empty or an object
                // create the grid            
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjGrid: cant create, the html element to attach to '" + this.selected + "' does not exist.");
                    return null;
                }

                // Note: a jquery query select can refer to any number of html elements
                // return is for chainability, dont have to return anything

                return this.each(function (index, o) {

                    var x = Object.create(mjGrid);

                    x.init(options, o);

                    // attach object instance to this html element

                    $.data(o, 'mj-grid-data', x);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + options + ' does not exist in mjGrid');
            }
        };
    })(jQuery);

});

// grid = new Slick.Grid("#myGrid", data, columns, options);