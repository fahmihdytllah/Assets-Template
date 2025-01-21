$(function () {
  const formAddPost = $('#formAddPost');

  $('.btn-login').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to connect to your <strong>Linkedin</strong> account',
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
        thirdPartyAccess('linkedin', {
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
      html: 'Want to remove the connection to your <strong>Linkedin</strong> account',
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
        thirdPartyRemoveAccess('linkedin', {
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

  formAddPost.submit(function (e) {
    e.preventDefault();

    formAddPost.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: $(this).serialize(),
      url: $(this).attr('action'),
      type: 'POST',
      success: function (res) {
        formAddPost.unblock();
        formAddPost[0].reset();
        $('#addPost').modal('hide');

        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        formAddPost.unblock();
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
