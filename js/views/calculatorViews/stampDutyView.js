var app = app || {};

app.StampDutyView = app.BaseView.extend({

    className: 'stamp-duty-view',

    template: _.template($('#stamp-duty-template').html()),

    initialize: function (options) {

        this.redraw();
    },

    render: function () {

        this.$el.html(this.template());

        this.startListening();

        return this;
    },

    postRender: function()
    {
        this.redraw();      
    },

    events: {
        'keydown input': 'validateNumericInput'
    },

    validateNumericInput: function (e) {
        return app.validateNumericInput(e);
    },

    getInputs: function()
	{
		var state = this.$(".state").val();
		
        var property_value = getVal(this.$(".property-value"));			
		
        var property_type = $("input:radio[name ='property-type']:checked").val();
        var first_home_buyer = $("input[name='first-home-buyer']:checked").val();

        console.log("property_type = " + property_type);
	
        return {state: state, 
            property_value: property_value, 
            property_type: property_type, 
            first_home_buyer: first_home_buyer};
    },

    startListening: function()
    {
        var self = this;
	
        self.$(".property-value-slider").slider({
            min: 0, max: app.MAX_PROPERTY_VALUE, step: 5000, range: "min", animate: "true", value: app.DEFAULT_PROPERTY_VALUE,
            slide: function( event, ui ) {
                self.$(".property-value" ).val( ui.value );
            },	
            stop: function( event, ui ) {
                self.$(".property-value" ).val( ui.value );
                self.redraw();
            }		
        });	
		
        self.$(".loan-amount-slider" ).slider({ min: 1000, max: app.MAX_LOAN, step: 5000, range: "min", animate: "true", value: 100000,
            slide: function( event, ui ) {
                self.$(".loan-amount" ).val( addCommas(ui.value) );
            },
            stop: function( event, ui ) {
                self.$(".loan-amount" ).val( addCommas(ui.value) );
                self.redraw();
            }
        });
		
        self.$(".property-value").change(function() {
		
            self.redraw();		
            var v = parseFloat(self.$(".property-value").val());
            self.$(".property-value-slider" ).slider({ value: v });		
        });	
	 
        self.$(".loan-amount").change(function() {

            self.redraw();		
            var v = removeCommas(self.$(".loan-amount").val());
            v = parseFloat(v);
		
            self.$(".loan-amount-slider" ).slider({ value: v });
        });	 
	
        self.$(".state").change(function() {
            self.redraw();
        });	
	 			 
        self.$("input:radio").click(function () {
            self.redraw();
        });
    },
	
    redraw: function()
    {
        var inputs = this.getInputs();		
        var arr = [];
        var i = 0, j = 0;
        var duty = 0;
        var registration_fee = 0;
        var transfer_fee = 0;
		
        // http://www.varcalc.com.au/calculators/main/640AU/stampduty.asp		
		
        switch (inputs.state)
        {
            case "ACT":
        
                arr.push({min:0, max:200000, f:0, p:2.40, q:0});
                arr.push({min:200001, max:300000, f:4800, p:3.70, q:200001});
                arr.push({min:300001, max:500000, f:8550, p:4.75, q:300000});
                arr.push({min:500001, max:750000, f:18050, p:5.50, q:500000});
                arr.push({min:750000, max:1000000, f:31800, p:6.50, q:750000});
                arr.push({min:1000000, max:100000000, f:48050, p:7.25, q:1000000});

                registration_fee = 110;
                transfer_fee = 213;	
                break;

            case "NSW":
           	
                arr.push({min:0, max:14000, f:0, p:1.25, q:0}); 			
                arr.push({min:14001, max:30000, f:175, p:1.5, q:14000});	
                arr.push({min:30001, max:80000, f:415, p:1.75, q:30000});	
                arr.push({min:80001, max:300000, f:1290, p:3.5, q:80000});	
                arr.push({min:300001, max:1000000, f:8990, p:4.5, q:300000});	
                arr.push({min:1000000, max:3000000, f:40490, p:5.5, q:1000000});	
                arr.push({min:3000000, max:10000000, f:0, p:7, q:3000000});	
			
                registration_fee = 102;
                transfer_fee = 204;		
                break;

            case "NT":
                	
                registration_fee = 109;
                transfer_fee = 109;
                break;

            case "QLD":

                if (inputs.property_type == "investment")
                {
                    arr.push({min:0, max:5000, f:0, p:0, q:0});
                    arr.push({min:5001, max:105000, f:0, p:1.5, q:5000});
                    arr.push({min:105001, max:480000, f:1500, p:3.5, q:105000});
                    arr.push({min:480001, max:980000, f:14625, p:4.5, q:480000});
                    arr.push({min:980000, max:100000000, f:37125, p:5.25, q:980000});
                }
                else
                {											
                    arr.push({min:0, max:350000, f:0, p:1, q:0});
                    arr.push({min:350001, max:540000, f:3500, p:3.5, q:350000});
                    arr.push({min:540001, max:980000, f:10150, p:4.5, q:540000});
                    arr.push({min:980000, max:100000000, f:29950, p:5.25, q:980000});						
                }
			
                registration_fee = 137.10;
					
                transfer_fee = 137.10;
			
                if (inputs.property_value > 180000)
                    transfer_fee += 28.8 * (inputs.property_value - 180000) / 10000;

                break;

            case "SA":
                        
                arr.push({min:0, max:12000, f:0, p:1, q:0});
                arr.push({min:12001, max:30000, f:120, p:2, q:12000});
                arr.push({min:30001, max:50000, f:480, p:3, q:30000});
                arr.push({min:50001, max:100000, f:1080, p:3.5, q:50000});
                arr.push({min:100001, max:200000, f:2830, p:4, q:100000});
                arr.push({min:200001, max:250000, f:6830, p:4.25, q:200000});			
                arr.push({min:250001, max:300000, f:8955, p:4.75, q:250000});
                arr.push({min:300001, max:500000, f:11330, p:5, q:300000});			
                arr.push({min:500000, max:100000000, f:21330, p:5.5, q:500000});
			
                registration_fee = 144;
						
                if (inputs.property_value < 5000)
                    transfer_fee = 144;
                else
                if (inputs.property_value > 5000 && inputs.property_value < 20001)
                    transfer_fee = 159
                else
                if (inputs.property_value > 20000 && inputs.property_value < 40001)
                    transfer_fee = 175;
                else
                if (inputs.property_value > 40000)	
                    transfer_fee = 245 + 71 * (inputs.property_value - 50000) / 10000;	
                
                break;

            case "TAS":

                arr.push({min:0, max:1300, f:20, p:0, q:0});
                arr.push({min:13001, max:25000, f:20, p:1.75, q:13000});
                arr.push({min:25001, max:75000, f:435, p:2.25, q:25000});
                arr.push({min:75001, max:200000, f:1560, p:3.5, q:75000});
                arr.push({min:200001, max:375000, f:5935, p:4.35, q:200000});
                arr.push({min:375001, max:725000, f:12935, p:4.25, q:375000});
                arr.push({min:725001, max:100000000, f:27810, p:4.50, q:725000});
			
                registration_fee = 123.12;
                transfer_fee = 188.64;				
                break;
                
            case "VIC":
                                
                if (inputs.property_type == "investment")
                {													
                    arr.push({min:0, max:25000, f:0, p:1.4, q:0});
                    arr.push({min:25001, max:130000, f:350, p:2.4, q:25000});
                    arr.push({min:130001, max:960000, f:2870, p:6, q:130000});
                    arr.push({min:960001, max:100000000, f:0, p:5.5, q:0});
                }
                else
                {			
                    arr.push({min:0, max:130000, f:0, p:0, q:0});
                    arr.push({min:130000, max:440000, f:2870, p:5, q:130000});
                    arr.push({min:440001, max:550000, f:18370, p:6, q:440000});
                    arr.push({min:550000, max:100000000, f:0, p:0, q:0});	
                }
		
                registration_fee = 105;			
                transfer_fee = 127.90;	
                break;

           case "WA":
                                    
                registration_fee = 160;
                /*			
                            if (inputs.property_type == "investment")
                            {
                                arr.push({min:0, max:80000, f:0, p:1.9, q:0});
                                arr.push({min:80001, max:100000, f:1520, p:2.85, q:80000});
                                arr.push({min:100001, max:250000, f:2090, p:3.8, q:100000});
                                arr.push({min:250001, max:500000, f:7790, p:4.75, q:250000});
                                arr.push({min:500001, max:100000000, f:19665, p:5.15, q:500000});
                            }
                            else
                            {*/
			
                if (inputs.first_home_buyer == "no")
                {
                    arr.push({min:0, max:120000, f:0, p: 1.9, q: 0});
                    arr.push({min:120001, max:150000, f:2280, p:2.85, q: 120000});
                    arr.push({min:150001, max:360000, f:3135, p:3.8, q: 150000});
                    arr.push({min:360001, max:725000, f:11115, p:4.75, q:360000});
                    arr.push({min:725001 , max:10000000, f:28453, p:5.15, q:725000});	
                }
                //}
			
                // transfer fee
			
                var t = new Array();
                
                t.push({min:0, max:85000, val: 160});
                t.push({min:85001, max:120000, val: 170});
                t.push({min:120001, max:200000, val: 190});
                t.push({min:200001, max:300000, val: 210});
                t.push({min:300001, max:400000, val: 230});
                t.push({min:400001, max:500000, val: 250});
                t.push({min:500001, max:600000, val: 270});
                t.push({min:600001, max:700000, val: 290});
                t.push({min:700001, max:800000, val: 310});
                t.push({min:800001, max:900000, val: 330});
                t.push({min:900001, max:1000000, val: 350});
                t.push({min:1000001, max:1100000, val: 370});
                t.push({min:1100001, max:1200000, val: 390});
                t.push({min:1200001, max:1300000, val: 410});
                t.push({min:1300001, max:1400000, val: 430});
                t.push({min:1400001, max:1500000, val: 450});	
                t.push({min:1500001, max:1600000, val: 470});
                t.push({min:1600001, max:1700000, val: 490});	
                t.push({min:1700001, max:1800000, val: 510});
                t.push({min:1800001, max:1900000, val: 530});
                t.push({min:1900001, max:2000000, val: 550});	
                t.push({min:2000000, max:100000000, val: 550});		
			
                for (var j = 0; j < t.length; j++)
                {
                    if (inputs.property_value >= t[j].min && inputs.property_value <= t[j].max)
                    {
                        transfer_fee = t[j].val;
					
                        if (t[j].min == 2000000)
                            transfer_fee = 550 + 20 * (inputs.property_value / 100000);
                        break;
                    }
                }
                break;
        }
		
        for (var i = 0; i < arr.length; i++)
        {
            if (inputs.property_value >= arr[i].min && inputs.property_value <= arr[i].max)
            {
                duty = arr[i].f + (arr[i].p / 100.0) * (inputs.property_value - arr[i].q);
                break;
            }
        }	
		
        if (inputs.state == "NT")
        {
            // special rule for NT
			
            if (inputs.property_type == "investment" || inputs.first_home_buyer == "no")
            {
                if (inputs.property_value < 525000)
                {
                    var v = inputs.property_value / 1000;
                    duty = (0.06571441 * Math.pow(v, 2) ) + 15.0 * v;
                }
                else
                    duty = 0.0495 * inputs.property_value;
            }
        }
		
        if (inputs.state == "VIC" && inputs.first_home_buyer && inputs.property_type != "investment")
        {
            // 20 % reduction for 1st home buyers in VIC
			
            duty = 0.8 * duty;
        }
			
        this.$(".duty").html(format(duty, "C"));	
        this.$(".registration-fee").html(format(registration_fee, "C"));
        this.$(".transfer-fee").html(format(transfer_fee, "C"));			
		
        var total = duty + registration_fee + transfer_fee;
		
        this.$(".total").html(format(total, "C"));
		
        this.result = [];
        
        this.result.push({key: "Stamp Duty", value: ""});
        this.result.push({key: "state", value: inputs.state});
        this.result.push({key: "property value", value: addCommas(inputs.property_value.toFixed(0))});
        //this.result.push({key: "loan amount", value: "$" + addCommas(inputs.loan_amount.toFixed(0))});
		
        this.result.push({key: "property type", value: inputs.property_type});
        this.result.push({key: "first home buyer", value: inputs.first_home_buyer});
								
        this.result.push({key: "registration fee", value: format(registration_fee, "C")});				
        this.result.push({key: "transfer fee", value: format(transfer_fee, "C")});		
        this.result.push({key: "stamp duty", value: format(duty, "C")});		
		
        this.result.push({key: "total", value: format(total, "C")});	
    }
});