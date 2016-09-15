$(document).ready(function() {

    // reference:
    // http://learn.jquery.com/plugins/basic-plugin-creation/
    
    (function ($) {

        var mjScrollBar = {

            _init: function (options, el) {

                var default_options = {
                    vertical: true,
                    min: 0,
                    max: 1000,
                    value: 0,	
                    step: 10,
                    largestep: 50,
                    showButtons: true,

                    // common properties

                    width: 'auto',
                    height: 'auto',
                    disabled: false,
                    theme: null
                };

                this.settings = $.extend({}, default_options, options);
                this.el = el;
                this.$el = $(el);

                this.range = this.settings.max - this.settings.min;

                var MAX_INT = 4294967295;

                this.prev_pos = MAX_INT;

                // plugin have been applied previously
                // blow away any existing instance

                this.close();

                this._render();
                this._startListening();

                return this;
            },

            _calcMaxScroll: function()
            {
                var track = this.$el.find(".mj-scrollbar-track");
                var thumb = this.$el.find(".mj-scrollbar-thumb");

                // recalculate size of scrollbar track just in case scrollbar has been resized

                if (this.settings.vertical)
                    this.maxscroll = track.height() - thumb.height();    // subtract size of thumb
                else
                    this.maxscroll = track.width() - thumb.width();    // subtract size of thumb
            },

            _render: function()
            {
                var s = "<div class='mj-scrollbar mj-widget'>";

                s += "  <div class='mj-arrow mj-arrow-up'></div>";

                s += " <div class='mj-scrollbar-track'>";
                s += "  <div class='mj-scrollbar-thumb'></div>";
                s += " </div>";

                s += "  <div class='mj-arrow mj-arrow-down'></div>";
	
                s += "</div>";

                this.$el.html(s);

                this.setValue(this.settings.value);
            },

            _stopListening: function () {
                this.$el.off();
            },

            _startListening: function()
            {
                var self = this;

                this.scrolling = false;
                this.mousestart = 0;
                this.maxscroll = 0;
                this.start_pos = 0;

                //this.t = 0;
	
                this.hasTouchEvents = ("ontouchstart" in document.documentElement);	

                this.$el.on("mousedown", ".mj-scrollbar-thumb", function (e) {

                    e.preventDefault();

                    self.scrolling = true;                    

                    var pos = self.$el.find(".mj-scrollbar-thumb").position();

                    self.$el.find(".mj-scrollbar-thumb").addClass("mj-scrollbar-thumb-drag");

                    self._calcMaxScroll();

                    // recalculate size of scrollbar track just in case scrollbar has been resized

                    if (self.settings.vertical) {
                        self.start_pos = pos.top;
                        self.mousestart = e.pageY;		// save starting position
                    }
                    else {
                        self.start_pos = pos.left;
                        self.mousestart = e.pageX;		// save starting position
                    }

                    //self.t = setInterval(function () {self.draw(); }, 50);
		
                    $(document).bind("mousemove", self, self.drag);
                    $(document).bind("mouseup", self, self.dragend);
                });

                this.$el.on("click", ".mj-arrow", function(e) {

                    e.preventDefault();

                    var val = parseInt(self.settings.value);

                    //console.log("arrow: val = " + val);

                    if ($(e.currentTarget).hasClass("mj-arrow-down"))
                    {
                        self.setValue(val + 1);
                    }
                    else
                    {
                        self.setValue(val - 1);
                    }
                });
            },

            drag: function (e) {

                // preventdefault stops select all

                e.preventDefault();

                var self = e.data;

                if (!self.scrolling)
                    return;

                var delta = parseInt(e.pageY - self.mousestart);

                if (delta == 0)
                    return;		

                self._move(self.start_pos + delta);
            },

            dragend: function (e) {

                e.preventDefault();

                var self = e.data;

                self.scrolling = false;

                //if (self.t)
                //    window.clearInterval(self.t);

                self.$el.find(".mj-scrollbar-thumb").removeClass("mj-scrollbar-thumb-drag");

                $(document).unbind("mousemove", self, self.drag);
                $(document).unbind("mouseup", self, self.dragend);
            },
	
            _move: function(pos)
            {			
                    if (pos <= 0)
                        pos = 0;
                    else
                    if (pos >= this.maxscroll)
                        pos = this.maxscroll;

                    if (pos == this.prev_pos)
                        return;

                    this.prev_pos = pos;

                    var thumb = this.$el.find(".mj-scrollbar-thumb");

                    if (this.settings.vertical)
                        thumb.css({ top: pos });
                    else
                        thumb.css({ left: pos });

                    this.settings.value = this.settings.min + (pos / this.maxscroll) * this.range;

                    this.$el.trigger("valueChange", parseInt(this.settings.value));

                    //$(".mj-scrollbar-thumb").css("transform", "translateY(" + y + "px)");	
			
                    /*
			        var pos = $(".mj-scrollbar-thumb").position();
			
			        y = y - pos.top ;
									
			        $(".mj-scrollbar-thumb").animate({
				        top: "+=" + y,
			          }, 10, function() {
				        // Animation complete.
			          });	
		          */
            },

            setValue: function(val)
            {
                if (val < this.settings.min)
                    val = this.settings.min;

                if (val > this.settings.max)
                    val = this.settings.max;

                this._calcMaxScroll();

                var pos = ((val - this.settings.min) / this.range) * this.maxscroll;

                //console.log("val = " + val + " this.maxscroll = " + this.maxscroll + " this.range = " + this.range + " calc = " + pos);

                this._move(pos);
            },

            getValue: function()
            {
                this.$el.trigger("valueChange", parseInt(this.settings.value));
            },

            close: function () {

                // dont clear the data
                // important to turn off events

                this._stopListening();

                // we may still want to get the data after the scrollbar has closed so dont remove the data

                $.removeData(this.el, 'mj-scrollbar-data');
           
                this.$el.html("");            
            }
        }

        $.fn.mjScrollBar = function (options) {

            // within a plugin use this not $(this) to refer to the element to attach to
            // this refers to the element we are attaching to
            // needs to return this for chainability

            if (mjScrollBar[options]) {

                // options is the name of a method in mjScrollBar

                var o = $(this).data('mj-scrollbar-data');

                // cant call slice directly on arguments

                if (o)
                    return o[options].apply(o, Array.prototype.slice.call(arguments, 1));

                // if o is not found then the mjScrollBar has not been attached to the element
                // its not an necessarily and error

                return null;
            }
            else if (!options || typeof options === 'object') {

                // options is empty or an object
                // create the scrollbar            
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjScrollBar: cant create, the html element to attach to '" + this.selected + "' does not exist.");
                    return null;
                }

                // Note: a jquery query select can refer to any number of html elements
                // return is for chainability, dont have to return anything

                return this.each(function (index, o) {

                    var x = Object.create(mjScrollBar);
                   
                    x._init(options, o);

                    // attach object instance to this html element

                    $.data(o, 'mj-scrollbar-data', x);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + options + ' does not exist in mjScrollBar');
            }
        };
})(jQuery);     // pass jQuery as an argument to the immiediatly executed javascript function so that $ always refers to jquery

}); // document.ready


