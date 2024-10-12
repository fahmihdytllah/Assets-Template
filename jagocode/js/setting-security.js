'use strict';

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    const formChangePass = document.querySelector('#formAccountSettings'),
      formSetting = document.querySelector('#formAccountSettings');

    // Form validation for Change password
    if (formChangePass) {
      const fv = FormValidation.formValidation(formChangePass, {
        fields: {
          currentPassword: {
            validators: {
              notEmpty: {
                message: 'Please current password',
              },
              stringLength: {
                min: 8,
                message: 'Password must be more than 8 characters',
              },
            },
          },
          newPassword: {
            validators: {
              notEmpty: {
                message: 'Please enter new password',
              },
              stringLength: {
                min: 8,
                message: 'Password must be more than 8 characters',
              },
            },
          },
          confirmPassword: {
            validators: {
              notEmpty: {
                message: 'Please confirm new password',
              },
              identical: {
                compare: function () {
                  return formChangePass.querySelector('[name="newPassword"]').value;
                },
                message: 'The password and its confirm are not the same',
              },
              stringLength: {
                min: 8,
                message: 'Password must be more than 8 characters',
              },
            },
          },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
            rowSelector: '.col-md-6',
          }),
          submitButton: new FormValidation.plugins.SubmitButton(),
          // Submit the form when all fields are valid
          // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
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
        formSetting.block({
          message: elementLoader,
          css: { backgroundColor: 'transparent', border: '0' },
          overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
        });

        $.ajax({
          type: 'POST',
          url: '?',
          data: $(formSetting).serialize(),
          success: function (res) {
            formSetting.unblock();

            Swal.fire({
              icon: 'success',
              title: 'Good Job!',
              text: res.msg,
              customClass: {
                confirmButton: 'btn btn-success waves-effect waves-light',
              },
            });
          },
          error: function (error) {
            formSetting.unblock();
            const msg = error.responseJSON?.msg;
            Swal.fire({
              icon: 'error',
              title: 'Opps!',
              text: msg ? msg : 'There is an error!',
              customClass: {
                confirmButton: 'btn btn-danger waves-effect waves-light',
              },
            });
          },
        });
      });
    }
  })();
});
