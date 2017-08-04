# PwdValidator

Demo URL https://pwdchkr.herokuapp.com/

## How to use?
```
// JS
$('#password').passwordCheck({
                pwdErrorHolder: "#pwd-error-list",
                pwdToggler: "#toggle-password",
                pwdMeter: "#pwd-meter"
            });


//HTML
<div class="password-holder">
                    <input type="password" id="password" placeholder="Enter Password here" autofocus>
                    <span class="glyphicon glyphicon-eye-open toggler" aria-hidden="true" title="Show password" id="toggle-password"></span>
                </div>
                <div class="password-strength-meter progress" id="pwd-meter">
                    <div class="progress-bar" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" style="width: 90%">
                        <span class="sr-only"></span>
                    </div>
                </div>
                <div class="password-errors-holder">
                    <ul id="pwd-error-list">
                    </ul>
                </div>
```