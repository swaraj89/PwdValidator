(function($) {

    var PasswordChecker = function($pwdField, options) {

        // var defaults = {

        // };

        // options = $.extend({}, defaults, options);

        var VALIDATOR = {
            errors: [],
            defaults: {
                length: 8,
                requires: ["length", "lower", "upper", "digit", "symbols"]
            },
            options: {
                length: 0,
                requires: []
            },
            rules: {
                upper: {
                    validate: function(password) {
                        return password.match(/[A-Z]/) != null;
                    },
                    message: "have capital letter"
                },
                lower: {
                    validate: function(password) {
                        return password.match(/[a-z]/) != null;
                    },
                    message: "have lower case letter"
                },
                digit: {
                    validate: function(password) {
                        return password.match(/\d/) != null;
                    },
                    message: "have numbers"
                },
                symbols: {
                    validate: function(password) {
                        return password.match(/[-!$%^#&@*()_+|~=`{}\[\]:";'<>?,.\/]/) != null;
                    },
                    message: "have symbols"
                },
                length: {
                    validate: function(password, options) {
                        return password.length >= options.length;
                    },
                    message: function(options) {
                        return "have at least " + options.length + " characters";
                    }
                }
            },
            setDefault: function(options) {
                var defaults = this.defaults;

                if (!options) {
                    this.options = defaults;
                }
            },
            startValidation: function(pwdText) {
                var options = this.options;
                var rulesToBeApplied = options.requires;
                var rulesAvailable = this.rules;
                var errorList = [];

                for (rule in rulesToBeApplied) {
                    var currentRule = rulesToBeApplied[rule];
                    var ruleValidator = rulesAvailable[currentRule].validate;
                    var ruleMessage = rulesAvailable[currentRule].message;

                    try {
                        if (typeof ruleValidator === 'function') {
                            if (ruleValidator(pwdText, options)) {
                                // validates
                            } else {
                                //in case of error
                                if (typeof ruleMessage === 'function') {
                                    ruleMessage = ruleMessage(options);
                                }
                                errorList.push(ruleMessage);
                            }
                        }
                    } catch (ex) {
                        throw new Exception('No validation rule present for ' + currentRule);
                    }
                }

                this.errors = errorList;
            },
            paintError: function($errorHolder) {
                var errorDOM = [];
                var errList = this.errors;
                $errorHolder.html("");

                if (errList.length > 0) {

                    for (error in errList) {
                        var msg = errList[error];
                        errorDOM.push('<li class="error"> <p class="text-danger"> Should ' + msg + '</p></li>')
                    }
                    $errorHolder.html(errorDOM.join(''));
                }
            },
            check: function(_options, pwdText, $errorHolder) {
                var hasAllRulesPassed = false;

                this.setDefault(_options);
                this.startValidation(pwdText);
                this.paintError($errorHolder);

                hasAllRulesPassed = (this.errors.length == 0);
                return hasAllRulesPassed;
            }
        }

        var STRENGTHCHECKER = {
            maxScore: 8,
            vioalationList: [],
            rules: {
                lettersOnly: {
                    regex: /^[a-zA-Z]+$/,
                    message: 'only Characters',
                },
                numbersOnly: {
                    regex: /^[0-9]+$/,
                    message: 'only Numbers',
                },
                repeatedCharacters: {
                    regex: /([a-z])\1/,
                    message: 'repeated Characters',
                    modifier: function(string) {
                        return string.toLowerCase();
                    }
                },
                consecUpperCase: {
                    regex: /([A-Z]){2}/,
                    message: 'Consecutive upper case',
                },
                consecLowerCase: {
                    regex: /([a-z]){2}/,
                    message: 'Consecutive Lower case',
                },
                consecNumbers: {
                    regex: /([0-9]){2}/,
                    message: 'Consecutive Numbers',
                },
                sequentialLetters: {
                    regex: /(?:ab|bc|cd|de|ef|gh|hi|ij|jk|kl|lm|mn|no|op|pq|qr|rs|st|tu|uv|vw|wx|xy|yz)/,
                    message: 'Sequential letters',
                    modifier: function(string) {
                        return string.toLowerCase();
                    }
                },
                sequentialNumbers: {
                    regex: /(?:01|12|23|34|45|56|67|78|89)/,
                    message: 'Sequential numbers',
                }
            },
            calculateScore: function(pwdText) {
                // get the score and reduce every time there is a vioalation
                var strongPwdRules = this.rules;
                var _score = 8;
                var vioalations = [];

                for (var rule in strongPwdRules) {
                    if (strongPwdRules.hasOwnProperty(rule)) {
                        var _modifiedPwd = pwdText;
                        var currentRule = strongPwdRules[rule];
                        var regex = currentRule.regex;
                        var modifier = currentRule.modifier;

                        if (modifier && typeof modifier === 'function') {
                            _modifiedPwd = modifier(_modifiedPwd);
                        }
                        var doesViolateCurrentRule = this.matcher(_modifiedPwd, regex);

                        if (doesViolateCurrentRule) {
                            _score--;
                            vioalations.push(currentRule.message);
                        }
                    }
                }

                this.vioalationList = vioalations;
                return _score;
            },
            matcher: function(string, regex) {
                return regex.test(string);
            },
            paintScore: function($elem, score) {
                var scoreInPercent = (score / this.maxScore) * 100
                var $progressBar = $elem.find('.progress-bar');
                $elem.show();
                if (scoreInPercent > 50) {
                    $progressBar.removeClass('progress-bar-danger')
                        .addClass('progress-bar-success');
                } else {
                    $progressBar.removeClass('progress-bar-success')
                        .addClass('progress-bar-danger');
                }

                $progressBar.width(scoreInPercent + '%');

            },
            paintViolations: function($messageHolder) {
                //this method can be used to print all the violations;
                var errorDOM = [];
                var violationsList = this.vioalationList;
                $messageHolder.html("");

                if (violationsList.length > 0) {

                    for (vioalation in violationsList) {
                        var msg = violationsList[vioalation];
                        errorDOM.push('<li class="error">  Your pwd could have been better if not for <span class="text-danger">' + msg + '</span></li>')
                    }
                    $messageHolder.html(errorDOM.join(''));
                }
            },
            reset: function($pwdMeter) {
                this.paintScore($pwdMeter, 0);
            },
            init: function(password, $pwdMeter, $pwdErrorHolder) {
                var score = this.calculateScore(password);
                this.paintScore($pwdMeter, score);
                this.paintViolations($pwdErrorHolder);
            }
        }

        function init() {
            var $pwdToggler = $(options.pwdToggler);
            var $pwdMeter = $(options.pwdMeter);
            var $pwdErrorHolder = $(options.pwdErrorHolder);

            $pwdToggler.on('click', function(evt) {
                var pwdFieldType = $pwdField.attr('type').toLowerCase();
                var isPwdField = (pwdFieldType === 'password');
                var changedType = isPwdField ? 'text' : 'password';

                $pwdField.attr('type', changedType);
            });

            $pwdField.on('keyup', function(evt) {
                var password = this.value;

                var isValidPassword = VALIDATOR.check(null, password, $pwdErrorHolder);

                if (isValidPassword) {
                    STRENGTHCHECKER.init(password, $pwdMeter, $pwdErrorHolder);
                    $(this).removeClass('error');
                } else {
                    STRENGTHCHECKER.reset($pwdMeter);
                    $(this).addClass('error');
                }

            });

            return this;
        }

        return init.call(this);
    }


    $.fn.passwordCheck = function(options) {
        return this.each(function() {
            new PasswordChecker($(this), options);
        });
    };
})(jQuery);