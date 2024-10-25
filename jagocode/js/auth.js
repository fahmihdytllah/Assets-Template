/**
 *  Pages Authentication
 */

'use strict';

const btnSubmit = $('.btn-submit');

let type = 'number';
let jagoCaptcha = null;

const getParam = function (name) {
  return (location.search.split(name + '=')[1] || '').split('&')[0];
};

const getRedirectTo = getParam('redirectTo');
const redirectTo = getRedirectTo ? getRedirectTo : '/';

const loadCaptcha = () => {
  grecaptcha.ready(function () {
    grecaptcha.execute('6Le3QkQqAAAAAEMi7-7X9FAu9TcdA0qH-t46IHu4').then((token) => {
      jagoCaptcha = token;
      btnSubmit.prop('disabled', false);
    });
  });
};

$(function () {
  const formAuthentication = document.querySelector('#formAuthentication');
  const formAuth = $('#formAuthentication');
  const phoneCountry = $('#phoneCountry');
  const phoneCode = $('#phoneCode');

  /** load data phone number */
  if (phoneCountry) {
    $.get('https://ipwhois.app/json/', function (data) {
      phoneCode.val(data.country_phone.replace('+', ''));
      phoneCountry.html(`${data.country_code} (${data.country_phone})`);
    });
  }

  /** Load Google reCapctha */
  if (typeof grecaptcha === 'object') {
    loadCaptcha();
  }

  if (formAuthentication) {
    const fv = FormValidation.formValidation(formAuthentication, {
      fields: {
        name: {
          validators: {
            notEmpty: {
              message: 'Please enter full name',
            },
            stringLength: {
              min: 7,
              message: 'Full name must be more than 7 characters',
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
        'email-username': {
          validators: {
            notEmpty: {
              message: 'Please enter email / username',
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
          rowSelector: '.mb-6',
        }),
        submitButton: new FormValidation.plugins.SubmitButton(),

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
      /** Load Google reCapctha */
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
        url: '?redirectTo=' + redirectTo,
        data: $(formAuth).serialize(),
        headers: {
          'X-Jago-Captcha': jagoCaptcha,
        },
        success: function (res) {
          formAuth.unblock();
          toastr.success(res.msg, 'Good Job!');

          if (res?.redirectTo) {
            setTimeout(() => {
              window.location.href = res?.redirectTo ? res.redirectTo : redirectTo;
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

  $('.login-github').click(function () {
    openPopup('github');
    type = 'github';
  });

  $('.login-facebook').click(function () {
    openPopup('facebook');
    type = 'facebook';
  });

  $('.login-x').click(function () {
    openPopup('x');
    type = 'x';
  });

  $(window).on('message', function (event) {
    const origin = event.originalEvent.origin;

    if (origin === 'https://account.jagocode.id') {
      const code = event.originalEvent?.data?.code;
      if (code) {
        fetchData(code);
      }
    }
  });

  function openPopup(type) {
    const width = 500;
    const height = 600;

    const screenWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;

    const left = (screenWidth - width) / 2 + window.screenX;
    const top = (screenHeight - height) / 2 + window.screenY;

    const popupWindow = window.open(
      '/auth/redirect?type=' + type,
      'Login Account',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    if (popupWindow) {
      popupWindow.focus();
    } else {
      alert('Popup blocked. Please allow popups for this website.');
    }
  }
});

function fetchData(code) {
  const mode = window.location.pathname.split('/').pop();

  /** Load Google reCapctha */
  if (typeof grecaptcha === 'object') {
    loadCaptcha();
  }

  $.blockUI({
    message: elementLoader,
    css: { backgroundColor: 'transparent', border: '0' },
    overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
  });

  let data = {
    type,
    code,
    mode,
  };

  $.ajax({
    url: '/auth/exchange',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function (res) {
      $.unblockUI();
      toastr.success(res.msg, 'Good Job!');
      setTimeout(() => {
        window.location.href = res?.redirectTo ? res.redirectTo : redirectTo;
      }, 2000);
    },
    error: function (err) {
      $.unblockUI();
      const msg = err.responseJSON?.msg;
      toastr.error(msg ? msg : 'There is an error!', 'Opss!');
    },
  });
}

function callbackGoogle(response) {
  type = 'google';
  fetchData(response.credential);
}
