$(function () {
  const formIndexing = $('#formIndexing'),
    select2 = $('.select2');

  if (select2) {
    select2.each(function () {
      var e = $(this);
      e.wrap('<div class="position-relative"></div>').select2({
        placeholder: 'Select value',
        dropdownParent: e.parent(),
      });
    });
  }

  $('.btn-login').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to connect to your <strong>Yandex Search</strong> account',
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
        thirdPartyAccess('yandex', {
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

  $('.btn-logout').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to remove the connection to your <strong>Yandex Search</strong> account',
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
        thirdPartyRemoveAccess('yandex', {
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

  formIndexing.submit(function (e) {
    e.preventDefault();

    formIndexing.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: $(this).serialize(),
      url: $(this).attr('action'),
      type: 'POST',
      success: function (res) {
        formIndexing.unblock();
        formIndexing[0].reset();

        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        formIndexing.unblock();
        const msg = e.responseJSON?.msg || 'There is an error!';

        Swal.fire({
          title: 'Bad News!',
          text: msg,
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
  });
});
