/******************************************
 * WEB222NGG
 * Assignment 2
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: October 24, 2020
 ********************************************
 * images from unsplash.com | canva.com
 ********************************************/

// script for form validation

(function(){   
    window.onload = function(){
        var form = document.querySelector('.needs-validation');
        form.onsubmit = function (event) {

            // check if the form is valid
            if(!form.checkValidity()) {
                form.classList.add('was-validated');
                event.preventDefault();
                return false;
            }           

            return true;
        }

        // password validation. preference source: https://www.w3schools.com/howto/howto_js_password_validation.asp
        var pw = document.querySelector('#password');
        var letter = document.querySelector("#letter");
        var capital = document.querySelector("#capital");
        var number = document.querySelector("#number");
        var length = document.querySelector("#length");

        // When the user clicks on the password field, show the message box
        pw.onfocus = function() {
        document.querySelector("#message").style.display = "block";
        }

        // When the user clicks outside of the password field, hide the message box
        pw.onblur = function() {
        document.querySelector("#message").style.display = "none";
        }

        // When the user starts to type something inside the password field
        pw.onkeyup = function() {
            // Validate lowercase letters
            var lowerCaseLetters = /[a-z]/g;
            if(pw.value.match(lowerCaseLetters)) {
                letter.classList.remove("invalid");
                letter.classList.add("valid");
            } else {
                letter.classList.remove("valid");
                letter.classList.add("invalid");
            }

            // Validate capital letters
            var upperCaseLetters = /[A-Z]/g;
            if(pw.value.match(upperCaseLetters)) {
                capital.classList.remove("invalid");
                capital.classList.add("valid");
            } else {
                capital.classList.remove("valid");
                capital.classList.add("invalid");
            }

            // Validate numbers
            var numbers = /[0-9]/g;
            if(pw.value.match(numbers)) {
                number.classList.remove("invalid");
                number.classList.add("valid");
            } else {
                number.classList.remove("valid");
                number.classList.add("invalid");
            }

            // Validate length
            if(pw.value.length >= 8) {
                length.classList.remove("invalid");
                length.classList.add("valid");
            } else {
                length.classList.remove("valid");
                length.classList.add("invalid");
            }
        } 
        
        // check confirm password
        var confirmPw = document.querySelector("#confirmPassword");

        function validatePassword(){
            if(pw.value != confirmPw.value) {
                confirmPw.setCustomValidity("Please make sure your passwords match");
            } else {
                confirmPw.setCustomValidity('');
            }
        }

        pw.onchange = validatePassword;
        confirmPw.onkeyup = validatePassword;
    }
})();
