'use strict';

document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    const formAccSettings = document.querySelector('#formAccountSettings'),
      deactivateAcc = document.querySelector('#formAccountDeactivation'),
      deactivateButton = deactivateAcc.querySelector('.deactivate-account');

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
              deleteAcccount(result.value);
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

    function deleteAcccount(value) {
      $.blockUI({
        message: elementLoader,
        css: { backgroundColor: 'transparent', border: '0' },
        overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
      });

      $.ajax({
        type: 'DELETE',
        url: '?screet=' + value,
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
    }

    // Update/reset user image of account page
    let accountUserImage = document.getElementById('uploadedAvatar');

    let cropper;

    const fileInput = document.querySelector('.account-file-input');
    const resetFileInput = document.querySelector('.account-image-reset');
    const avatarCropped = document.getElementById('avatarCropped');

    const modalCropped = $('#modalCropped');
    const btnCrop = $('.btn-crop');
    // const avatarCropped = $('#avatarCropped');

    modalCropped
      .on('shown.bs.modal', function () {
        cropper = new Cropper(avatarCropped, {
          aspectRatio: 1,
          viewMode: 3,
        });
      })
      .on('hidden.bs.modal', function () {
        cropper.destroy();
        cropper = null;
      });

    if (accountUserImage) {
      const resetImage = accountUserImage.src;
      fileInput.onchange = () => {
        if (fileInput.files[0]) {
          const previewImage = window.URL.createObjectURL(fileInput.files[0]);

          $('.btn-save').prop('disabled', true);

          modalCropped.modal('show');
          avatarCropped.src = previewImage;
        }

        btnCrop.on('click', function () {
          let initialAvatarURL;
          let canvas;

          modalCropped.modal('hide');

          if (cropper) {
            canvas = cropper.getCroppedCanvas({
              width: 150,
              height: 150,
            });

            initialAvatarURL = accountUserImage.src;
            accountUserImage.src = canvas.toDataURL();

            canvas.toBlob(function (blob) {
              let formData = new FormData();
              formData.append('file', blob, 'avatar.jpg');

              $.ajax('https://api.jagocode.my.id/upload?type=avatar&service=aws', {
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                mimeType: 'multipart/form-data',
                xhr: function () {
                  var xhr = new XMLHttpRequest();
                  xhr.upload.onprogress = function (e) {
                    var percent = '0';
                    var percentage = '0%';

                    if (e.lengthComputable) {
                      percent = Math.round((e.loaded / e.total) * 100);
                      percentage = percent + '%';
                      console.log('Upload progress: ' + percentage);
                    }
                  };
                  return xhr;
                },
                success: function (res) {
                  const result = JSON.parse(res);
                  accountUserImage.src = result.fileUrl;
                  $('#avatar').val(result.fileUrl);
                },
                error: function () {
                  accountUserImage.src = initialAvatarURL;
                  console.log('Upload error...');
                },
                complete: function () {
                  $('.btn-save').prop('disabled', false);
                },
              });
            });
          }
        });
      };
      resetFileInput.onclick = () => {
        fileInput.value = '';
        accountUserImage.src = resetImage;
      };
    }
  })();
});

$(function () {
  const select2 = $('.select2');
  const phoneCountry = $('#phoneCountry');
  const phoneCode = $('#phoneCode');

  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>').select2({
        placeholder: 'Select value',
        dropdownParent: $this.parent(),
      });
    });
  }

  if (phoneCountry) {
    $.get('https://ipwhois.app/json/', function (data) {
      phoneCountry.val(data.country_phone.replace('+', ''));
      phoneCode.html(`${data.country_code} (${data.country_phone})`);
    });
  }
});
