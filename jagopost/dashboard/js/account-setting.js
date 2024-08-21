/**
 * Account Settings - Account
 */

'use strict';

// Inisialisasi Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyClXd1AAB_Nzlm52X4GB7V9TR0Rv8YCu1w',
  authDomain: 'jago-code.firebaseapp.com',
  projectId: 'jago-code',
  storageBucket: 'jago-code.appspot.com',
  messagingSenderId: '733341114140',
  appId: '1:733341114140:web:aee7d8fd24e979e9bba4d9',
  measurementId: 'G-4CDRVEBPJD',
};

firebase.initializeApp(firebaseConfig);

// Referensi ke Firebase Storage
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    const formAccSettings = document.querySelector('#formAccountSettings'),
      formChangePass = document.querySelector('#formChangePassword'),
      deactivateAcc = document.querySelector('#formAccountDeactivation'),
      deactivateButton = deactivateAcc.querySelector('.deactivate-account');

    // Form validation for setting account
    if (formAccSettings) {
      const fv = FormValidation.formValidation(formAccSettings, {
        fields: {
          name: {
            validators: {
              notEmpty: {
                message: 'Please enter first name',
              },
            },
          },
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
          // number: {
          //   validators: {
          //     notEmpty: {
          //       message: 'Please enter number whatsapp'
          //     },
          //     stringLength: {
          //       min: 7,
          //       message: 'Number must be more than 7 characters'
          //     }
          //   }
          // }
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
        },
        init: (instance) => {
          instance.on('plugins.message.placed', function (e) {
            if (e.element.parentElement.classList.contains('input-group')) {
              e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
            }
          });
        },
      });

      const formSetting = $('#formAccountSettings');
      fv.on('core.form.valid', function () {
        formSetting.block({
          message: elementLoader,
          css: { backgroundColor: 'transparent', border: '0' },
          overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
        });

        $.ajax({
          type: 'POST',
          url: '?type=updateAccount',
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
              text: msg,
              customClass: {
                confirmButton: 'btn btn-danger waves-effect waves-light',
              },
            });
          },
        });
      });
    }

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
        },
        init: (instance) => {
          instance.on('plugins.message.placed', function (e) {
            if (e.element.parentElement.classList.contains('input-group')) {
              e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
            }
          });
        },
      });

      const formChangePassword = $('#formChangePassword');
      fv.on('core.form.valid', function () {
        formChangePassword.block({
          message: elementLoader,
          css: { backgroundColor: 'transparent', border: '0' },
          overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
        });

        $.ajax({
          type: 'POST',
          url: '?type=changePassword',
          data: $(formChangePassword).serialize(),
          success: function (res) {
            formChangePassword.unblock();
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
            formChangePassword.unblock();
            const msg = error.responseJSON?.msg;
            Swal.fire({
              icon: 'error',
              title: 'Opps!',
              text: msg,
              customClass: {
                confirmButton: 'btn btn-danger waves-effect waves-light',
              },
            });
          },
        });
      });
    }

    if (deactivateAcc) {
      const fv = FormValidation.formValidation(deactivateAcc, {
        fields: {
          accountActivation: {
            validators: {
              notEmpty: {
                message: 'Please confirm you want to delete account',
              },
            },
          },
        },
        plugins: {
          trigger: new FormValidation.plugins.Trigger(),
          bootstrap5: new FormValidation.plugins.Bootstrap5({
            eleValidClass: '',
          }),
          submitButton: new FormValidation.plugins.SubmitButton(),
          fieldStatus: new FormValidation.plugins.FieldStatus({
            onStatusChanged: function (areFieldsValid) {
              areFieldsValid
                ? // Enable the submit button
                  // so user has a chance to submit the form again
                  deactivateButton.removeAttribute('disabled')
                : // Disable the submit button
                  deactivateButton.setAttribute('disabled', 'disabled');
            },
          }),
          // Submit the form when all fields are valid
          // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
        },
        init: (instance) => {
          instance.on('plugins.message.placed', function (e) {
            if (e.element.parentElement.classList.contains('input-group')) {
              e.element.parentElement.insertAdjacentElement('afterend', e.messageElement);
            }
          });
        },
      });
    }

    // Deactivate account alert
    const accountActivation = document.querySelector('#accountActivation');

    // Alert With Functional Confirm Button
    if (deactivateButton) {
      deactivateButton.onclick = function () {
        if (accountActivation.checked == true) {
          Swal.fire({
            text: 'Are you sure you would like to deactivate your account?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            customClass: {
              confirmButton: 'btn btn-primary me-2 waves-effect waves-light',
              cancelButton: 'btn btn-label-secondary waves-effect waves-light',
            },
            buttonsStyling: false,
          }).then(function (result) {
            if (result.value) {
              $.blockUI({
                message: elementLoader,
                css: { backgroundColor: 'transparent', border: '0' },
                overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
              });

              $.ajax({
                type: 'DELETE',
                url: '?',
                success: function (res) {
                  $.unblockUI();

                  Swal.fire({
                    icon: 'success',
                    title: 'Good Job!',
                    text: res.msg,
                    customClass: {
                      confirmButton: 'btn btn-success waves-effect waves-light',
                    },
                  }).then(() => (window.location.href = '/auth/login'));
                },
                error: function (error) {
                  $.unblockUI();
                  const msg = error.responseJSON?.msg;
                  Swal.fire({
                    icon: 'error',
                    title: 'Opps!',
                    text: msg,
                    customClass: {
                      confirmButton: 'btn btn-danger waves-effect waves-light',
                    },
                  });
                },
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              Swal.fire({
                title: 'Cancelled',
                text: 'Deactivation Cancelled!!',
                icon: 'error',
                customClass: {
                  confirmButton: 'btn btn-success waves-effect waves-light',
                },
              });
            }
          });
        }
      };
    }

    // Update/reset user image of account page
    let accountUserImage = document.getElementById('uploadedAvatar');
    const fileInput = document.querySelector('.account-file-input'),
      resetFileInput = document.querySelector('.account-image-reset');

    if (accountUserImage) {
      const resetImage = accountUserImage.src;
      fileInput.onchange = () => {
        if (fileInput.files[0]) {
          accountUserImage.src = window.URL.createObjectURL(fileInput.files[0]);

          $('.btn-save').prop('disabled', true);
          const file = $('.account-file-input')[0].files[0];
          if (file) {
            const storageRef = storage.ref().child('avatars/' + file.name);
            const uploadTask = storageRef.put(file);
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload progress: ' + progress + '%');
              },
              (error) => {
                console.error('Error uploading file: ', error);
              },
              () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                  $('#avatar').val(downloadURL);
                  $('.btn-save').prop('disabled', false);
                });
              }
            );
          }
        }
      };
      resetFileInput.onclick = () => {
        fileInput.value = '';
        accountUserImage.src = resetImage;
      };
    }
  })();
});

// Select2 (jquery)
$(function () {
  const countryPhone = $('#countryPhone'),
    countryCode = $('#countryCode'),
    select2 = $('.select2');

  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>').select2({
        placeholder: 'Select value',
        dropdownParent: $this.parent(),
      });
    });
  }

  if (countryPhone) {
    $.get('https://ipwhois.app/json/', function (data) {
      countryPhone.val(data.country_phone.replace('+', ''));
      countryCode.html(`${data.country_code} (${data.country_phone})`);
    });
  }
});
