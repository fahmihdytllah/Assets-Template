/**
 *  Pages Authentication
 */

'use strict';
const numeralMask = document.querySelectorAll('.numeral-mask');
const formAuthentication = document.querySelector('#formAuthentication');
const formAuth = $('#formAuthentication');
const countdownElement = $('#countdown');
const btnGetOtp = $('#getOtp');
const countryPhone = $('#countryPhone');
const countryCode = $('#countryCode');

function param(name) {
  return (location.search.split(name + '=')[1] || '').split('&')[0];
}

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    // Form validation for Add new record
    if (formAuthentication) {
      const fv = FormValidation.formValidation(formAuthentication, {
        fields: {
          name: {
            validators: {
              notEmpty: {
                message: 'Please enter name'
              },
              stringLength: {
                min: 5,
                message: 'Name must be more than 5 characters'
              }
            }
          },
          number: {
            validators: {
              notEmpty: {
                message: 'Please enter number'
              },
              stringLength: {
                min: 10,
                message: 'Number must be more than 10 characters'
              }
            }
          },
          username: {
            validators: {
              notEmpty: {
                message: 'Please enter username'
              },
              stringLength: {
                min: 6,
                message: 'Username must be more than 6 characters'
              }
            }
          },
          email: {
            validators: {
              notEmpty: {
                message: 'Please enter your email'
              },
              emailAddress: {
                message: 'Please enter valid email address'
              }
            }
          },
          'email-username': {
            validators: {
              notEmpty: {
                message: 'Please enter email / username'
              },
              stringLength: {
                min: 6,
                message: 'Username must be more than 6 characters'
              }
            }
          },
          password: {
            validators: {
              notEmpty: {
                message: 'Please enter your password'
              },
              stringLength: {
                min: 6,
                message: 'Password must be more than 6 characters'
              }
            }
          },
          'confirm-password': {
            validators: {
              notEmpty: {
                message: 'Please confirm password'
              },
              identical: {
                compare: function () {
                  return formAuthentication.querySelector('[name="password"]').value;
                },
                message: 'The password and its confirm are not the same'
              },
              stringLength: {
                min: 6,
                message: 'Password must be more than 6 characters'
              }
            }
          },
          otp: {
            validators: {
              notEmpty: {
                message: 'Please enter otp'
              },
              stringLength: {
                min: 6,
                message: 'OTP must be more than 6 characters'
              }
            }
          },
          terms: {
            validators: {
              notEmpty: {
                message: 'Please agree terms & conditions'
              }
            }
          }
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: '.mb-3'
          }),
          submitButton: new FormValidation.plugins.SubmitButton(),
          // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
          autoFocus: new FormValidation.plugins.AutoFocus()
        },
        init: instance => {
          instance.on('plugins.message.placed', function (e) {
            if (e.element.parentElement.classList.contains('input-group')) {
              e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
            }
          });
        }
      });

      fv.on('core.form.valid', function () {
        formAuth.block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
        $.ajax({
          data: formAuth.serialize(),
          url: formAuth.attr('action'),
          type: 'POST',
          success: function (d) {
            formAuth.unblock();
            Swal.fire({ title: 'Good job!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: false }).then(() => {
              if (param('redirect_uri')) window.location.href = param('redirect_uri');
              else window.location.href = d.redirect_uri;
            });
          },
          error: function (e) {
            formAuth.unblock();
            const msg = e.responseJSON.msg;
            Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: false });
          }
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

    // Two Steps Verification
    // Verification masking
    if (numeralMask.length) {
      numeralMask.forEach(e => {
        new Cleave(e, {
          numeral: true
        });
      });
    }
  })();
});

if (btnGetOtp) {
  btnGetOtp.click(function () {
    formAuth.block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: '/auth/getOtp',
      data: {
        countryPhone: countryPhone.val(),
        number: $('#number').val()
      },
      type: 'POST',
      success: function (d) {
        formAuth.unblock();
        btnGetOtp.hide();
        startCountdown(60, countdownElement, () => {
          btnGetOtp.show();
          countdownElement.hide();
        });
      },
      error: function (e) {
        formAuth.unblock();
        const msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: false });
      }
    });
  });
}

function startCountdown(duration, displayElement, callback) {
  displayElement.show();
  let seconds = duration;
  const countdown = setInterval(() => {
    seconds--;
    displayElement.text(seconds);

    if (seconds <= 0) {
      clearInterval(countdown);
      if (typeof callback === 'function') {
        callback();
      }
    }
  }, 1000);
}
