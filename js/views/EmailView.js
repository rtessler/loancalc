var app = app || {};

app.EmailView = Backbone.View.extend({

    className: 'email-view',

    template: _.template($('#email-template').html()),

    initialize: function (options) {

    },

    render: function () {

        this.$el.html(this.template());

        return this;
    },

    events: {
        "click .calc #send_email": "sendEmail"
    },

    validateForm: function()
    {   
        this.$("#errmsg").html("");
    
        var from = this.$("#from").val();
        var to = this.$("#to").val();
        var subject = this.$("#subject").val();
        var message = this.$("#message").val();
        
        var errmsg = "";

        if (to == null || to == "")
            errmsg += "friends email address is required<br>";
            
        if (subject == null || subject == "")
            errmsg += "subject is required<br>";
        
        if (message == null || message == "")
            errmsg += "message is required<br>";
            
        var atpos=to.indexOf("@");
        var dotpos=to.lastIndexOf(".");
        
        if (atpos < 1 || dotpos < atpos+2 || dotpos+2 >= to.length)
            errmsg += "invalid friend email address<br>";       
                                
        if (errmsg.length > 0)
        {
            this.$(".calc #errmsg").html(errmsg);
            return false;
        }
            
        return true;
    },

    sendEmail: function(e) {

        e.preventDefault();

        var self =this;
            
        if (!self.validateForm())
            return false;
                
        var path = app.baseurl + "/send_email.php";
        
        var from = self.$("#from").val();
        var to = self.$("#to").val();
        var subject = self.$("#subject").val();
        var message = self.$("#message").val();
        
        /*
        var datastr ='from=' + from + '&to=' + to + '&subject=' + subject + '&message=' + message;  
        
        $.ajax({
        type: "POST",
        url: path,
        data: datastr,
        cache: false,
        success: function(html){
            $(".calc #email-response").fadeIn("slow");
            $(".calc #email-response").html(html);
            setTimeout('$(".calc #email-response").fadeOut("slow")',4000);
        }
        });     
        */
                
        self.$("#email-response").html("<img src='" + app.baseurl + "/images/ajax-loader2.gif" + "' />");
        
        $.ajax({ url: path,
             data: {from: from, to: to, subject: subject, message: message},
             type: 'GET',
             async: false,
             contentType: "application/json",
             dataType: 'jsonp',
             success: function(output) {
                self.$("#email-response").fadeIn("slow");
                self.$("#email-response").html(output.msg);
                setTimeout('$("#email-response").fadeOut("slow")',4000);              
            },
            error: function(e) {
                console.log("AJAX Error: " + e.message);
            }
        });         
        
        return false;
    } 

/*      
    var validator = new FormValidator('email-form', [{
        name: 'subject',   
        rules: 'required'
    }, {
        name: 'from',
        display: "your email",
        rules: 'required|valid_email'
    }, {
        name: 'to',
        display: "friends email",
        rules: 'required|valid_email'
    }, {
        name: 'message',
        rules: 'required'
    }], function(errors, event) {
        if (errors.length > 0) {
            var errorString = '';
        
            for (var i = 0, errorLength = errors.length; i < errorLength; i++) {
                errorString += errors[i].message + '<br />';
            }
            
            $("#errmsg").html(errorString);
            //document.getElementById("errmsg").innerHTML = errorString;

            return false;
        }
        else
        {
            send_email();
            return false;
        }
    });         
*/

});
