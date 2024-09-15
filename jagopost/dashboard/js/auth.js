/**
 *  Pages Authentication
 */

'use strict';
const formAuthentication = document.querySelector('#formAuthentication');
const formAuth = $('#formAuthentication');
const countryPhone = $('#countryPhone');
const countryCode = $('#countryCode');
const fieldToken = $('#token');
const btnSubmit = $('.btn-submit');
let token;

// Utils function
function loadCaptcha() {
  grecaptcha.ready(function () {
    grecaptcha.execute('6Le3QkQqAAAAAEMi7-7X9FAu9TcdA0qH-t46IHu4').then((_token) => {
      token = _token;
      fieldToken.val(_token);
      btnSubmit.prop('disabled', false);
    });
  });
}

const getParam = function (name) {
  return (location.search.split(name + '=')[1] || '').split('&')[0];
};

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    // Load Google reCapctha
    if (typeof grecaptcha === 'object') {
      loadCaptcha();
    }

    // Form validation for Add new record
    if (formAuthentication) {
      const fv = FormValidation.formValidation(formAuthentication, {
        fields: {
          username: {
            validators: {
              notEmpty: {
                message: 'Please enter username',
              },
              stringLength: {
                min: 6,
                message: 'Username must be more than 6 characters',
              },
            },
          },
          number: {
            validators: {
              notEmpty: {
                message: 'Please enter number whatsapp',
              },
              stringLength: {
                min: 7,
                message: 'Number must be more than 7 characters',
              },
            },
          },
          email: {
            validators: {
              notEmpty: {
                message: 'Please enter your email',
              },
              emailAddress: {
                message: 'Please enter valid email address',
              },
            },
          },
          'number-username': {
            validators: {
              notEmpty: {
                message: 'Please enter number / username',
              },
              stringLength: {
                min: 6,
                message: 'Username must be more than 6 characters',
              },
            },
          },
          password: {
            validators: {
              notEmpty: {
                message: 'Please enter your password',
              },
              stringLength: {
                min: 6,
                message: 'Password must be more than 6 characters',
              },
            },
          },
          'confirm-password': {
            validators: {
              notEmpty: {
                message: 'Please confirm password',
              },
              identical: {
                compare: function () {
                  return formAuthentication.querySelector('[name="password"]').value;
                },
                message: 'The password and its confirm are not the same',
              },
              stringLength: {
                min: 6,
                message: 'Password must be more than 6 characters',
              },
            },
          },
          terms: {
            validators: {
              notEmpty: {
                message: 'Please agree terms & conditions',
              },
            },
          },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: '.mb-3',
          }),
          submitButton: new FormValidation.plugins.SubmitButton(),
          //   defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
          autoFocus: new FormValidation.plugins.AutoFocus(),
        },
        init: (instance) => {
          instance.on('plugins.message.placed', function (e) {
            if (e.element.parentElement.classList.contains('input-group')) {
              e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
            }
          });
        },
      });

      fv.on('core.form.valid', function () {
        // Load Google reCapctha
        if (typeof grecaptcha === 'object') {
          loadCaptcha();
        }

        formAuth.block({
          message: elementLoader,
          css: { backgroundColor: 'transparent', border: '0' },
          overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
        });

        $.ajax({
          type: 'POST',
          url: '?',
          data: $(formAuth).serialize(),
          success: function (res) {
            formAuth.unblock();
            toastr.success(res.msg, 'Good Job!');
            if (res?.redirectTo) {
              setTimeout(() => {
                const redirectUri = getParam('redirectTo');
                window.location.href = redirectUri ? redirectUri : res?.redirectTo;
              }, 2000);
            }
          },
          error: function (err) {
            formAuth.unblock();
            let msg = err.responseJSON?.msg;
            toastr.error(msg ? msg : 'There is an error!', 'Opss!');
          },
        });
      });
    }

    // Input phone number
    if (countryPhone) {
      $.get('https://ipwhois.app/json/', function (data) {
        countryPhone.val(data.country_phone.replace('+', ''));
        countryCode.html(`${data.country_code} (${data.country_phone})`);
      });
    }
  })();
});

function callbackGoogleLogin(response) {
  // Load Google reCapctha
  if (typeof grecaptcha === 'object') {
    loadCaptcha();
  }

  $.blockUI({
    message: elementLoader,
    css: { backgroundColor: 'transparent', border: '0' },
    overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
  });

  $.ajax({
    data: `credential=${response.credential}&token=${token}`,
    url: '/auth/googleLogin',
    type: 'POST',
    success: function (res) {
      $.unblockUI();
      toastr.success(res.msg, 'Good Job!');
      setTimeout(() => {
        const redirectUri = getParam('redirectTo');
        window.location.href = redirectUri ? redirectUri : res?.redirectTo;
      }, 1500);
    },
    error: function (err) {
      $.unblockUI();
      let msg = err.responseJSON?.msg;
      toastr.error(msg ? msg : 'There is an error!', 'Opss!');
    },
  });
}

function callbackGoogleRegister(response) {
  // Load Google reCapctha
  if (typeof grecaptcha === 'object') {
    loadCaptcha();
  }

  $.blockUI({
    message: elementLoader,
    css: { backgroundColor: 'transparent', border: '0' },
    overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
  });

  $.ajax({
    data: `credential=${response.credential}&token=${token}`,
    url: '/auth/googleRegister',
    type: 'POST',
    success: function (res) {
      $.unblockUI();
      toastr.success(res.msg, 'Good Job!');
      setTimeout(() => {
        const redirectUri = getParam('redirectTo');
        window.location.href = redirectUri ? redirectUri : res?.redirectTo;
      }, 1500);
    },
    error: function (err) {
      $.unblockUI();
      let msg = err.responseJSON?.msg;
      toastr.error(msg ? msg : 'There is an error!', 'Opss!');
    },
  });
}
