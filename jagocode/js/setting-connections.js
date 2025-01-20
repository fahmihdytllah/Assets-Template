$(function () {
  /**
   * Handle Grant Access Third Party
   */
  $('.btn-login').click(function () {
    const id = $(this).data('id');
    const provider = $(this).data('provider');

    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to connect to your <strong>' + provider + '</strong> account',
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
        thirdPartyAccess(id, {
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
   * Handle Remove Access Third Party
   */
  $('.btn-logout').click(function () {
    const id = $(this).data('id');
    const provider = $(this).data('provider');

    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to remove the connection to your <strong>' + provider + '</strong> account',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        thirdPartyRemoveAccess(id, {
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
});
