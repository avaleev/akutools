$(function(){
// akutool_popup functionality --------------------------------------------------

    // add backside wrapper and close button
    $(".akutool_popup").wrap("<div class='akutool_popup_wrap'></div>");
    $(".akutool_popup").append("<button class='akutool_popup_close'>X</button>");

    // active popup passes active class to its parent wrapper
    $(".akutool_popup.akutool_active").parent().addClass("akutool_active");
    $(".akutool_popup.akutool_active").removeClass("akutool_active");

// end of akutool_popup implementation ------------------------------------------



// akutool_form functionality ---------------------------------------------------

    // akutool_form_custom rulesett implementation

    const demo_users = [
        {
            uid:        '1',
            username:   'Akuma',
            email:      'vasya@pupkin.com',
            pwd:        'qwerty1234',
            newsletter: true,
            usertype:   'admin'
        },
        {
            uid:        '2',
            username:   'Yoru',
            email:      'yoru@night.co.jp',
            pwd:        'iamthenight',
            newsletter: false,
            usertype:   'user'
        }
    ];

    // returns a response object with response and message strings
    function ruleCheck(rule, value) {
        var response = 'success';
        var message  = null;

        // you can define your own rules to be checked in 
        switch(rule) {
            case 'custom-rule-1':
                if (/^[a-zA-Z0-9]*$/.test(value) == false) {
                    response = "failure";
                    message  = "Nickname can only contain alphanumeric symbols";
                    break;
                }
                if (value.slice(0, 1).match(/^[a-zA-Z]*$/) == null) {
                    response = "failure";
                    message  = "Nickname can only start with alphabetic symbols";
                    break;
                }

                $(demo_users).each( function() {
                    if(this.username === value) {
                        response = "failure";
                        message  = "This nickname is already taken, please try another";
                    }
                });
                break;
            // e-mail validation
            case 'email':
                let email = value.split('@');
                if(email.length != 2) {
                    response = "failure";
                    message  = "Provided e-mail address is invalid";
                } else {
                    let domain = email[1].split('.');
                    let dname  = domain[0];
                            
                    if(domain.length < 2) {
                        response = "failure";
                        message  = "Provided e-mail address is invalid";
                    } else {
                        if(dname.length < 1 || domain[1].length < 2) {
                            response = "failure";
                            message  = "Provided e-mail address is invalid";
                        }
                    }
                }
                break;
            // matching re-enter password and password fields
            case 'password_match':
                // you can pass anchors to jQuery objects in value attribute
                if(value.val() != $(".akutool_form_password#" + value.attr("for")).val()) {
                    response = "failure";
                    message  = "Passwords do not match";
                }
                break;
            default:
                response = "warning";
                message  = "Error: Undefined validation rule (" + rule + ") was called";
        }

        return { response: response, message: message };
    }

    function assignResult(target, result) {
        if (result.response == 'success') {
            target.parent().find("i.fas").remove();
            target.removeClass('akutool_field_failure');
            target.removeClass('akutool_field_warning');

            target.addClass('akutool_field_success');
            target.parent().append("<i class='fas fa-check-circle akutool_success'></i>");            
        } else if (result.response == 'failure') {
            target.parent().find("i.fas").remove();
            target.removeClass('akutool_field_success');
            target.removeClass('akutool_field_warning');

            target.addClass('akutool_field_failure');
            target.parent().append("<i class='fas fa-times-circle akutool_failure' data-message='" + result.message + "'></i>");  
        } else if (result == 'empty') {
            target.parent().find("i.fas").remove();
            target.removeClass('akutool_field_success');
            target.removeClass('akutool_field_failure');
            target.removeClass('akutool_field_warning');
        } else {
            target.parent().find("i.fas").remove();
            target.removeClass('akutool_field_success');
            target.removeClass('akutool_field_failure');

            target.addClass('akutool_field_warning');
            target.parent().append("<i class='fas fa-times-circle akutool_warning' data-message='" + result.message + "'></i>");  
        }
    }


    // akutool_form_placeholder style simulation --------------------------------

    $('.akutool_form_placeholder').wrap("<div class='akutool_placeholder_wrapper'></div>");
    $('.akutool_form_placeholder').each(function() {
        if($(this).val() != '') {
            $(this).parent().append("<label for='" + $(this).attr("id") + "' class='akutool_fake_placeholder akutool_placeholder_up'>" + $(this).attr("placeholder") + "</label>");
        } else {
            $(this).parent().append("<label for='" + $(this).attr("id") + "' class='akutool_fake_placeholder'>" + $(this).attr("placeholder") + "</label>");
        }
        
        $(this).attr("placeholder", '');
    });

    $("body").on("focusin", ".akutool_form_placeholder", function() {
        if(!$(this).parent().find(".akutool_fake_placeholder").hasClass("akutool_placeholder_up")) {
            if($(this).parent().find(".akutool_fake_placeholder").attr("class") != undefined) {
                $(this).parent().find(".akutool_fake_placeholder").addClass("akutool_placeholder_up");
            } else {
                $(this).parent().parent().find(".akutool_fake_placeholder").addClass("akutool_placeholder_up");
            }
        }
    }).on("focusout", ".akutool_form_placeholder", function() {
        if($(this).val() == '') {
            if($(this).parent().find(".akutool_fake_placeholder").attr("class") != undefined) {
                $(this).parent().find(".akutool_fake_placeholder").removeClass("akutool_placeholder_up");
            } else {
                $(this).parent().parent().find(".akutool_fake_placeholder").removeClass("akutool_placeholder_up");
            }
        }
    });

    // end of placeholder styling -----------------------------------------------


    // akutool_form_password strength check event handler -----------------------

    $(".akutool_form_password").wrap("<div class='akutool_pwd_wrapper'></div>");
    $(".akutool_pwd_wrapper").append("<div class='akutool_pwd_strength'></div>");
    $(".akutool_pwd_wrapper").append("<div class='akutool_pwd_strength_stat'></div>");

    var pwd_strength_check = null;
    $("body").on("focusin", ".akutool_form_password", function() {
        var strength = [false, false, false, false, false];

        let mole      = $(this);
        let indicator = $(this).parent().children('.akutool_pwd_strength');
        let stat      = $(this).parent().children('.akutool_pwd_strength_stat');

        pwd_strength_check = setInterval(function (){
            if(mole.val() == '') {
                strength[0] = strength[1] = strength[2] = strength[3] = strength[4] = false;
            } else {
                strength[0] = (mole.val().match(/[a-z]/) != null)? true : false;
                strength[1] = (mole.val().match(/[A-Z]/) != null)? true : false;
                strength[2] = (mole.val().match(/[0-9]/) != null)? true : false;
                strength[3] = (/^[a-zA-Z0-9- ]*$/.test(mole.val()) == false)? true : false;
                strength[4] = (mole.val().length > 7)? true : false;
            }
            
            if(indicator.hasClass("vryweak"))   { indicator.removeClass("vryweak");   stat.text(''); }
            if(indicator.hasClass("weak"))      { indicator.removeClass("weak");      stat.text(''); }
            if(indicator.hasClass("good"))      { indicator.removeClass("good");      stat.text(''); }
            if(indicator.hasClass("strong"))    { indicator.removeClass("strong");    stat.text(''); }
            if(indicator.hasClass("vrystrong")) { indicator.removeClass("vrystrong"); stat.text(''); }

            switch(strength.filter(v => v).length) {
                case 1:
                    indicator.addClass("vryweak");
                    stat.text("Very Weak");
                    break;
                case 2:
                    indicator.addClass("weak");
                    stat.text("Weak");
                    break;
                case 3:
                    indicator.addClass("good");
                    stat.text("Good");
                    break;
                case 4:
                    indicator.addClass("strong");
                    stat.text("Strong");
                    break;
                case 5:
                    indicator.addClass("vrystrong");
                    stat.text("Very Strong");
                    break;
                default:
                    break;
            }
        }, 200);
    }).on("focusout", ".akutool_form_password", function (){
        clearInterval(pwd_strength_check);
    });

    // end of password strength check -------------------------------------------


    // akutool_form_custom validation event handler -----------------------------

    var custom_validation = null;
    $("body").on("focusin", ".akutool_form_custom", function() {
        let mole  = $(this);
        custom_validation = setInterval(function (){
            if (mole.val() != '') {
                let result = ruleCheck(mole.data("rule"), mole.val());
                assignResult(mole, result);
            } else {
                assignResult(mole, 'empty');
            }
        }, 200);
    }).on("focusout", ".akutool_form_custom", function (){
        clearInterval(custom_validation);
    });

    // end of custom input validation -------------------------------------------


    // akutool_form_pwdcheck password match check event handler -----------------

    $(".akutool_form_pwdcheck").wrap("<div class='akutool_pwdcheck_wrapper'></div>");

    var pwdcheck_validation = null;
    $("body").on("focusin", ".akutool_form_pwdcheck", function() {
        let mole  = $(this);
        pwdcheck_validation = setInterval(function (){
            if(mole.val() != '') {
                let result = ruleCheck('password_match', mole);
                assignResult(mole, result);
                assignResult($(".akutool_form_password#" + mole.attr("for")), result);
            } else {
                assignResult(mole, 'empty');
                assignResult($(".akutool_form_password#" + mole.attr("for")), 'empty');
            }
        }, 200);
    }).on("focusout", ".akutool_form_pwdcheck", function (){
        clearInterval(pwdcheck_validation);
    });

    // end of password match check ----------------------------------------------


    // akutool_form_email validation event handler ------------------------------

    var email_validation = null;
    $("body").on("focusin", ".akutool_form_email", function() {
        let mole  = $(this);
        email_validation = setInterval(function (){
            if( mole.val() != '' ) {
                let result = ruleCheck("email", mole.val());
                assignResult(mole, result);
            } else {
                assignResult(mole, 'empty');
            }
        }, 200);
    }).on("focusout", ".akutool_form_email", function (){
        clearInterval(email_validation);
    });

    // end of email check -------------------------------------------------------


    // radio and check boxes ----------------------------------------------------

    $('.akutool_form_checkbox').wrap("<div class='akutool_checkbox_wrapper'></div>");
    $('.akutool_checkbox_wrapper').each(function() {
        if($(this).next().attr('for') == $(this).children('input').attr('id')) {
            $(this).next().appendTo($(this));
        }
    });
    $('.akutool_checkbox_wrapper').append("<div class='akutool_checkbox_indicator'></div>");
    $('.akutool_checkbox_wrapper').append("<div class='akutool_checkbox_trigger'></div>");

    $('.akutool_form_radiogroup > input').wrap("<div class='akutool_radio_wrapper'></div>");
    $('.akutool_radio_wrapper').each(function() {
        if($(this).next().attr('for') == $(this).children('input').attr('id')) {
            $(this).next().appendTo($(this));
        }
    });

    // radio and check boxes end ------------------------------------------------

// end of akutool_form implementation -------------------------------------------

});