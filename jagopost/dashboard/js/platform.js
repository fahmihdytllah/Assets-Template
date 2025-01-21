$(function () {
  const formLoginWordpress = $('#formLoginWordpress');

  let LOCAL_DATA = null;

  $('#selectPlatform').change(function () {
    if (LOCAL_DATA?.platform !== $(this).val()) {
      $('.btn-save').prop('disabled', false);
    } else {
      $('.btn-save').prop('disabled', true);
    }

    if ($(this).val() === 'blogger') {
      $('.btn-login-wordpress').hide();
      $('.btn-logout-wordpress').hide();

      if (LOCAL_DATA?.isLoggedBlogger) {
        $('.btn-logout-blogger').show();
      } else {
        $('.btn-login-blogger').show();
      }
    } else {
      $('.btn-login-blogger').hide();
      $('.btn-logout-blogger').hide();

      if (LOCAL_DATA?.isLoggedWordpress) {
        $('.btn-logout-wordpress').show();
      } else {
        $('.btn-login-wordpress').show();
      }
    }
  });

  $.get('?type=json', function (res) {
    LOCAL_DATA = res;

    $('#selectPlatform').val(res.platform);

    if (res.platform === 'blogger') {
      if (res.isLoggedBlogger) {
        $('.btn-logout-blogger').show();
      } else {
        $('.btn-login-blogger').show();
        $('.btn-login-blogger button').prop('disabled', false);
      }
    } else {
      if (res.isLoggedWordpress) {
        $('.btn-logout-wordpress').show();
      } else {
        $('.btn-login-wordpress').show();
        $('.btn-login-wordpress button').prop('disabled', false);
      }
    }
  });

  /**
   * Platform Blogger
   */
  $('.btn-login-blogger button').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to connect to your <strong>Blogger</strong> account',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, connect it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        thirdPartyAccess('google-blogger', {
          onSuccess: (res) => {
            Swal.fire({
              title: 'Good News!',
              text: res.msg,
              icon: 'success',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            }).then(() => location.reload());
          },
          onError: (err) => {
            Swal.fire({
              title: 'Bad News!',
              text: err.msg,
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            });
          },
        });
      }
    });
  });

  $('.btn-logout-blogger button').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to remove the connection to your <strong>Blogger</strong> account',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        thirdPartyRemoveAccess('google-blogger', {
          onSuccess: (res) => {
            Swal.fire({
              title: 'Good News!',
              text: res.msg,
              icon: 'success',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            }).then(() => location.reload());
          },
          onError: (err) => {
            Swal.fire({
              title: 'Bad News!',
              text: err.msg,
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            });
          },
        });
      }
    });
  });

  /**
   * Platform Wordpress
   */
  $('.btn-login-wordpress button').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to connect to your <strong>Wordpress</strong> account',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, connect it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        thirdPartyAccess('wordpress', {
          onSuccess: (res) => {
            Swal.fire({
              title: 'Good News!',
              text: res.msg,
              icon: 'success',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            }).then(() => location.reload());
          },
          onError: (err) => {
            Swal.fire({
              title: 'Bad News!',
              text: err.msg,
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            });
          },
        });
      }
    });
  });

  $('.btn-logout-wordpress button').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to remove the connection to your <strong>Wordpress</strong> account',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        thirdPartyRemoveAccess('wordpress', {
          onSuccess: (res) => {
            Swal.fire({
              title: 'Good News!',
              text: res.msg,
              icon: 'success',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            }).then(() => location.reload());
          },
          onError: (err) => {
            Swal.fire({
              title: 'Bad News!',
              text: err.msg,
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            });
          },
        });
      }
    });
  });

  $('.btn-save').click(function () {
    $('.card-platform').block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      type: 'POST',
      url: '?',
      data: {
        platform: $('#selectPlatform').val(),
      },
      success: function (res) {
        $('.card-platform').unblock();

        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success waves-effect waves-light' },
        }).then(() => location.reload());
      },
      error: function (error) {
        $('.card-platform').unblock();
        const msg = error.responseJSON?.msg;

        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
  });
});
