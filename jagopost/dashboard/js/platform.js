$(function () {
  const formLoginWordpress = $('#formLoginWordpress');
  let localData = null;

  $('#selectPlatform').change(function () {
    if (localData?.platform !== $(this).val()) {
      $('.btn-save').prop('disabled', false);
    } else {
      $('.btn-save').prop('disabled', true);
    }

    if ($(this).val() === 'blogger') {
      $('.btn-login-wordpress').hide();
      $('.btn-logout-wordpress').hide();

      if (localData?.isLoggedBlogger) {
        $('.btn-logout-blogger').show();
      } else {
        $('.btn-login-blogger').show();
      }
    } else {
      $('.btn-login-blogger').hide();
      $('.btn-logout-blogger').hide();

      if (localData?.isLoggedWordpress) {
        $('.btn-logout-wordpress').show();
      } else {
        $('.btn-login-wordpress').show();
      }
    }
  });

  $.get('?type=json', function (res) {
    localData = res;
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

  $('.btn-login-blogger button').click(function () {
    window.location.href = '/oauth/google_grant_access';
  });

  $('.btn-logout-blogger button').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to log out of your blogger account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        window.location.href = '/oauth/google_logout';
      }
    });
  });

  $('.btn-logout-wordpress button').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to log out of your wordpress account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        window.location.href = '/oauth/wordpress_logout';
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

  formLoginWordpress.submit(function (e) {
    e.preventDefault();

    formLoginWordpress.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      type: 'POST',
      url: '/oauth/wordpress_grant_access',
      data: $(formLoginWordpress).serialize(),
      success: function (res) {
        formLoginWordpress.unblock();

        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success waves-effect waves-light' },
        }).then(() => location.reload());
      },
      error: function (error) {
        formLoginWordpress.unblock();
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
