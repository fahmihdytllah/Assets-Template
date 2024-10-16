$(document).ready(function () {
  const formAccessToken = $('#formAccessToken');

  let mode = 'new';
  let idToken = false;
  let showToken = {};

  loadTokens();

  $(document).on('click', '.token-new', function () {
    mode = 'new';
    $('#modalAccessToken').modal('show');
  });

  $(document).on('click', '.token-edit', function () {
    mode = 'edit';
    idToken = $(this).data('id');

    tokenDetail(idToken);
  });

  $(document).on('click', '.token-copy', function () {
    copyText($(this).data('token'));
  });

  $(document).on('click', '.token-delete', function () {
    idToken = $(this).data('id');

    Swal.fire({
      text: 'Are you sure you want to delete this token?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary waves-effect waves-light',
        cancelButton: 'btn btn-outline-danger ms-2 waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        deleteToken(idToken);
      }
    });
  });

  $(document).on('click', '.token-show', function () {
    let idToken = $(this).data('id');
    let token = $(this).data('token');

    if (typeof showToken[idToken] === 'undefined') {
      showToken[idToken] = false;
    }

    if (showToken[idToken]) {
      $('#token-' + idToken).html('******************');
      $(this).html('<i class="ti ti-eye ti-sm"></i>');
    } else {
      $('#token-' + idToken).html(token);
      $(this).html('<i class="ti ti-eye-off ti-sm"></i>');
    }

    showToken[idToken] = !showToken[idToken];
  });

  formAccessToken.submit(function (e) {
    e.preventDefault();

    formAccessToken.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?id=' + idToken,
      type: mode === 'new' ? 'POST' : 'PUT',
      data: formAccessToken.serialize(),
      success: function (res) {
        loadTokens();
        formAccessToken.unblock();
        formAccessToken[0].reset();
        $('#modalAccessToken').modal('hide');

        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formAccessToken.unblock();
        let msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
    });
  });

  function tokenDetail(id) {
    $.get('?type=detail&id=' + id, function (res) {
      mode = 'edit';

      $('#name').val(res.name);
      $('#host').val(res.host);
      $('#modalAccessToken').modal('show');
    });
  }

  function loadTokens() {
    $('#listTokens').html('');
    $('#loadingTokens').show();

    $.get('?type=json', function (res) {
      $('#loadingTokens').hide();

      if (res.data?.length === 0) {
        $('#listTokens').html(`<div class="col-md-12">
          <div class="bg-lighter rounded p-3 mb-3 position-relative">
            <span class="text-muted">You don't have an access token yet.
          </div>
        </div>`);
        return;
      }

      res.data.forEach((token) => {
        $('#listTokens').append(`<div class="col-md-6 col-xl-4">
            <div class="card card-key mb-3">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="d-flex align-items-center">
                  <h4 class="mb-0 me-3">${token.name}</h4>
                  <span class="badge rounded-pill bg-label-${token.isActive ? 'success' : 'danger'}">${
          token.isActive ? 'Active' : 'inActive'
        }</span>
                </div>

                <div class="dropdown">
                  <a class="btn dropdown-toggle text-muted hide-arrow p-0" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical ti-sm"></i></a>
                  <div class="dropdown-menu dropdown-menu-start">
                    <button class="dropdown-item token-edit" data-id="${
                      token._id
                    }"><i class="ti ti-edit-2 me-2"></i>Edit</button>
                    <button class="dropdown-item text-danger token-delete" data-id="${
                      token._id
                    }"><i class="ti ti-trash me-2"></i>Delete</button>
                  </div>
                </div>
              </div>

              <div class="d-flex align-items-center mb-3">
                <p class="me-2 mb-0 fw-medium" id="token-${token._id}">******************</p>
                  <span class="text-muted cursor-pointer me-2 token-show" data-id="${token._id}" data-token="${
          token.accessToken
        }"><i class="ti ti-eye ti-sm"></i></span>
                <span class="text-muted cursor-pointer token-copy" data-token="${
                  token.accessToken
                }"><i class="ti ti-copy ti-sm"></i></span>
              </div>
              <span class="text-muted">Created at ${token.formattedDate}</span>
            </div>
          </div>`);
      });
    });
  }

  function deleteToken(id) {
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?id=' + id,
      type: 'DELETE',
      success: function (res) {
        $.unblockUI();
        loadTokens();
        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        $.unblockUI();
        let msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
    });
  }

  const copyText = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() =>
        Swal.fire({
          title: 'Good job!',
          text: 'Successfully copied Access Token',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        })
      )
      .catch(() => console.log('Gagal mengcopy!'));
  };
});
