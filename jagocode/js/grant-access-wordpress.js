'use strict';

$(function () {
  const formAccess = $('#formAccess');

  function redirectAuth(code) {
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');

    setTimeout(() => {
      window.opener.postMessage({ code }, state);
      window.close();
    }, 2000);
  }

  formAccess.on('submit', function (e) {
    e.preventDefault();

    formAccess.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?',
      type: 'POST',
      data: $(this).serialize(),
      success: function (res) {
        formAccess.unblock();
        toastr.success(res.msg, 'Good News!');
        redirectAuth(res.code);
      },
      error: function (err) {
        formAccess.unblock();
        const responseError = err.responseJSON?.msg;
        const textError = responseError ? responseError : 'There is an error!';
        toastr.error(textError, 'Bad News!');
      },
    });
  });
});
