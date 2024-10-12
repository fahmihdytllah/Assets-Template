/**
 *  Page auth two steps
 */

'use strict';

const twoStepsForm = document.querySelector('#twoStepsForm');
const formVerify = $('#twoStepsForm');
const countdownElement = $('#countdown');
const btnGetCode = $('#getCode');

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    let maskWrapper = document.querySelector('.numeral-mask-wrapper');

    for (let pin of maskWrapper.children) {
      pin.onkeyup = function (e) {
        // Check if the key pressed is a number (0-9)
        if (/^\d$/.test(e.key)) {
          // While entering value, go to next
          if (pin.nextElementSibling) {
            if (this.value.length === parseInt(this.attributes['maxlength'].value)) {
              pin.nextElementSibling.focus();
            }
          }
        } else if (e.key === 'Backspace') {
          // While deleting entered value, go to previous
          if (pin.previousElementSibling) {
            pin.previousElementSibling.focus();
          }
        }
      };
      // Prevent the default behavior for the minus key
      pin.onkeypress = function (e) {
        if (e.key === '-') {
          e.preventDefault();
        }
      };
    }

    // Form validation for Add new record
    if (twoStepsForm) {
      const fv = FormValidation.formValidation(twoStepsForm, {
        fields: {
          otp: {
            validators: {
              notEmpty: {
                message: 'Please enter otp',
              },
            },
          },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: '.mb-6',
          }),
          submitButton: new FormValidation.plugins.SubmitButton(),
          // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
          autoFocus: new FormValidation.plugins.AutoFocus(),
        },
      });

      fv.on('core.form.valid', function () {
        formVerify.block({
          message: elementLoader,
          css: { backgroundColor: 'transparent', border: '0' },
          overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
        });

        /** Load Google reCapctha */
        if (typeof grecaptcha === 'object') {
          loadCaptcha();
        }

        $.ajax({
          type: 'POST',
          url: '?',
          data: $(formVerify).serialize(),
          headers: {
            'X-Jago-Captcha': jagoCaptcha,
          },
          success: function (res) {
            formVerify.unblock();
            toastr.success(res.msg, 'Good Job!');
            setTimeout(() => {
              window.location.href = res?.redirectTo ? res.redirectTo : redirectTo;
            }, 2000);
          },
          error: function (error) {
            formVerify.unblock();
            const msg = error.responseJSON?.msg;
            toastr.error(msg, 'Opss!');
          },
        });
      });

      const numeralMaskList = twoStepsForm.querySelectorAll('.numeral-mask');
      const keyupHandler = function () {
        let otpFlag = true,
          otpVal = '';
        numeralMaskList.forEach((numeralMaskEl) => {
          if (numeralMaskEl.value === '') {
            otpFlag = false;
            twoStepsForm.querySelector('[name="code"]').value = '';
          }
          otpVal = otpVal + numeralMaskEl.value;
        });
        if (otpFlag) {
          twoStepsForm.querySelector('[name="code"]').value = otpVal;
        }
      };
      numeralMaskList.forEach((numeralMaskEle) => {
        numeralMaskEle.addEventListener('keyup', keyupHandler);
      });
    }
  })();
});

if (btnGetCode) {
  btnGetCode.click(function () {
    formVerify.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?type=resend',
      type: 'GET',
      success: function (d) {
        formVerify.unblock();
        btnGetCode.hide();
        startCountdown(60, countdownElement, () => {
          btnGetCode.show();
          countdownElement.hide();
        });
      },
      error: function (e) {
        formVerify.unblock();
        const msg = e.responseJSON.msg;
        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: false,
        });
      },
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
