var app = app || {};

app.LoanCalculatorView = Backbone.View.extend({

    className: 'loan-calculator-view',

    template: _.template($('#loan-calculator-template').html()),

    initialize: function (options) {

        this.type = options.type;       
    },

    events: {
        "click .info": "info",
        "click .email": "showEmailForm",
        "click .print": "print",
        "click .save": "save",
        "click .show-description": "showDescription"
    },

    render: function () {

        this.$el.html(this.template());

        return this;
    },

    postRender: function()
    {
        var view = null;
        var title;

        switch (parseInt(this.type))
        {
            case app.CALC_TYPE_LOAN_REPAYMENT:
                view = new app.LoanRepaymentView();
                title = "Loan Repayment";
                break;
                
            case app.CALC_TYPE_BORROWING_POWER:
                view = new app.BorrowingPowerView();
                title = "Borrowing Power";
                break;
                
            case app.CALC_TYPE_EXTRA_REPAYMENT:
                view = new app.ExtraRepaymentView();
                title = "Extra Repayment";
                break;
                
            case app.CALC_TYPE_LOAN_COMPARISON:
                view = new app.LoanComparisonView();
                title = "Loan Comparison";
                break;
                
            case app.CALC_TYPE_LUMP_SUM:
                view = new app.LumpSumView();
                title = "Lump Sum";
                break;
                
            case app.CALC_TYPE_PRINCIPAL_AND_INTEREST:
                view = new app.PrincipalAndInterestView();
                title = "Principal and Interest";
                break;
                
            case app.CALC_TYPE_SPLIT_LOAN:
                view = new app.SplitLoanView();
                title = "Split Loan";
                break;
                
            case app.CALC_TYPE_STAMP_DUTY:

                if (app.country == "UK" || app.country == "GB")
                    view = new app.ukStampDutyView();
                else
                    view = new app.StampDutyView();

                title = "Stamp Duty";
                break;
         }

        if (view)
        {
            this.$(".calculator-container").html(view.render().el);
            view.postRender();
            this.$(".main-title").html(title);
        }
    },

    info: function(e)
    {
        e.preventDefault();

        this.$( "#infodialog" ).html("<h3>The Loan Repayments View.</h3<p> The Loan Repayments View calculates the type of repayment required, at the frequency requested, in respect of the loan parameters entered, namely amount, term and interest rate.</p>");
        this.$( "#infodialog" ).dialog();
    },

    showEmailForm: function(e)
    {
        var self = this;

        e.preventDefault();

        self.$(".calc .email").toggle(function() { 
            var h = self.$(".calc .outer-container").height();
            self.$(".calc .outer-container").height(h + 330); 
            self.$(".calc #email-form").toggle(); 
            self.$(".calc #message").val(resultToString(result));

            self.enail_view = new app.EmailView();
            self.email_container.html(self.email_view.render().el);
            },
        function() { 
            var h = self.$(".calc .outer-container").height();
            self.$(".calc .outer-container").height(h - 330); 
            self.$(".calc #email-form").toggle(); 

            self.email_view.close();
        }); 
    },

    print: function(e)
    {
        e.preventDefault();

        window.print();

        //this.$(".calculator-container")[0].print();
    },
        
    save: function(e) {

        e.preventDefault();
                    
        //var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
        var uriContent = "data:application/text," + encodeURIComponent(resultToString(result));
        w = window.open(uriContent, 'loan_repayment.txt');
    },

    showDescription: function () {

        $(".description").toggle();
    }

});