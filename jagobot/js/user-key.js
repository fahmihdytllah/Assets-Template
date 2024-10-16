$(document).ready(function () {
  const formAddKey = $('#formAddKey');
  const formSettingKey = $('#formSettingKey');
  const countryPhone = $('#countryPhone');
  const countryCode = $('#countryCode');
  let showKey = {};

  // load Key
  loadKeys();

  // handle event
  $('#formAddKey').submit(function (e) {
    e.preventDefault();
    formAddKey.block({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: $(this).attr('action'),
      type: 'POST',
      data: $(this).serialize(),
      success: function (res) {
        formAddKey.unblock();
        $('#modalAddKey').modal('hide');
        loadKeys();
        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formAddKey.unblock();
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

  formSettingKey.submit(function (e) {
    e.preventDefault();
    formSettingKey.block({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: $(this).attr('action'),
      type: 'PUT',
      data: $(this).serialize(),
      success: function (res) {
        loadKeys();
        formSettingKey.unblock();
        formSettingKey[0].reset();
        $('#settingKeyModal').modal('hide');
        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formSettingKey.unblock();
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

  $('#urlType').change(function () {
    const type = $(this).val();
    if (type === 'blogger' || type === 'wordpress') {
      $('#fromFeed').show();
      $('#fromManual').hide();
    } else {
      $('#fromFeed').hide();
      $('#fromManual').show();
    }
  });

  $('#isAdClick').change(function () {
    if ($(this).is(':checked')) {
      $('#formAdClick').show();
    } else {
      $('#formAdClick').hide();
    }
  });

  $('#isCustomProxy').change(function () {
    if ($(this).is(':checked')) {
      $('#formProxy').show();
    } else {
      $('#formProxy').hide();
    }
  });

  $('#isCustomReferer').change(function () {
    if ($(this).is(':checked')) {
      $('#formReferer').show();
    } else {
      $('#formReferer').hide();
    }
  });

  $('#isRandomDesktop').change(function () {
    if ($(this).is(':checked')) {
      $('#isAutoSwitch').prop('disabled', false);
    } else {
      $('#isAutoSwitch').prop('checked', false);
      $('#isAutoSwitch').prop('disabled', true);
    }
  });

  $(document).on('click', '.copy-key', function () {
    copyText($(this).data('key'));
  });

  $(document).on('click', '.key-setting', function () {
    settingKey($(this).data('id'));
  });

  $(document).on('click', '.key-delete', function () {
    let idKey = $(this).data('id');
    Swal.fire({
      text: 'Are you sure you want to delete this key?',
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
        deleteKey(idKey);
      }
    });
  });

  $(document).on('click', '.btn-buy', function () {
    let idKey = $(this).data('id');
    let typeKey = $(this).data('type');
    Swal.fire({
      text: 'Are you sure you want to buy this key?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary waves-effect waves-light',
        cancelButton: 'btn btn-outline-danger ms-2 waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        buyKey(idKey, typeKey);
      }
    });
  });

  $(document).on('click', '.show-key', function () {
    let idKey = $(this).data('id');
    let key = $(this).data('key');

    if (typeof showKey[idKey] === 'undefined') {
      showKey[idKey] = false; // Inisialisasi jika belum ada
    }

    if (showKey[idKey]) {
      $('#key-' + idKey).html('******************');
      $(this).html('<i class="ti ti-eye ti-sm"></i>');
    } else {
      $('#key-' + idKey).html(key);
      $(this).html('<i class="ti ti-eye-off ti-sm"></i>');
    }

    showKey[idKey] = !showKey[idKey];
  });

  function settingKey(id) {
    $.get('keys?type=detail&id=' + id, function (res) {
      /** Append data */
      $('#idKey').val(res.data._id);
      $('#nameEditKey').val(res.data.name);
      $('#taskBot').val(res.data.taskBot);
      $('#urlType').val(res.data.urlType);

      if (res.data.urlType === 'blogger' || res.data.urlType === 'wordpress') {
        $('#fromFeed').show();
        $('#fromManual').hide();
        $('#urlFeed').val(res.data.urlFeed);
      } else {
        $('#fromFeed').hide();
        $('#fromManual').show();
        $('#urlManual').val(res.data.urlManual.join('\n'));
      }

      if (res.data.isRegularVisitor) {
        $('#isRegularVisitor').prop('checked', true);
      }

      if (res.data.exBlog) {
        $('#exBlog').prop('checked', true);
      }

      if (res.data.isAdClick) {
        $('#isAdClick').prop('checked', true);
        $('#formAdClick').show();
        $('#repeatAdClick').val(res.data.repeatAdClick);
        $('input[name="adType"][value="' + res.data.adType + '"]').prop('checked', true);
      } else {
        $('#isAdClick').prop('checked', false);
        $('#formAdClick').hide();
      }

      if (res.data.isCustomProxy) {
        $('#isCustomProxy').prop('checked', true);
        $('#formProxy').show();
        $('#listProxys').val(res.data.listProxys.join('\n'));
      } else {
        $('#isCustomProxy').prop('checked', false);
        $('#formProxy').hide();
      }

      if (res.data.isCustomReferer) {
        $('#isCustomReferer').prop('checked', true);
        $('#formReferer').show();
        $('#listReferers').val(res.data.listReferers.join('\n'));
      } else {
        $('#isCustomReferer').prop('checked', false);
        $('#formReferer').hide();
      }

      if (res.data.isRandomDesktop) {
        $('#isRandomDesktop').prop('checked', true);
        $('#isAutoSwitch').prop('disabled', false);
        $('#isAutoSwitch').prop('checked', true);
      } else {
        $('#isAutoSwitch').prop('checked', false);
        $('#isRandomDesktop').prop('checked', false);
        $('#isAutoSwitch').prop('disabled', true);
      }

      if (res.data.isAutoSendReport) {
        $('#isAutoSendReport').prop('checked', true);
      } else {
        $('#isAutoSendReport').prop('checked', false);
      }

      /** Lock feature */
      if (res.data.type === 'trial') {
        $('#isAdClick').prop('checked', false);
        $('#isAdClick').prop('disabled', true);
        $('#isCustomProxy').prop('checked', false);
        $('#isCustomProxy').prop('disabled', true);
        $('#isAutoSendReport').prop('checked', false);
        $('#isAutoSendReport').prop('disabled', true);
        $('#isRandomDesktop').prop('checked', false);
        $('#isRandomDesktop').prop('disabled', true);
        $('#isAutoSwitch').prop('checked', false);
        $('#isAutoSwitch').prop('disabled', true);
        $('#isCustomReferer').prop('checked', false);
        $('#isCustomReferer').prop('disabled', true);
      }

      if (res.data.type === 'basic') {
        $('#isAdClick').prop('checked', false);
        $('#isAdClick').prop('disabled', true);
        $('#isCustomProxy').prop('checked', false);
        $('#isCustomProxy').prop('disabled', true);
        $('#isAutoSendReport').prop('checked', false);
        $('#isAutoSendReport').prop('disabled', true);
      }

      if (res.data.type === 'premium') {
        $('#isAutoSendReport').prop('checked', false);
        $('#isAutoSendReport').prop('disabled', true);
      }

      /** Unlock feature */
      if (res.data.type === 'basic') {
        $('#isRandomDesktop').prop('disabled', false);
        $('#isAutoSwitch').prop('disabled', false);
        $('#isCustomReferer').prop('disabled', false);
      }

      if (res.data.type === 'premium') {
        $('#isAdClick').prop('disabled', false);
        $('#isCustomProxy').prop('disabled', false);
      }

      if (res.data.type === 'unlimited') {
        $('#isAutoSendReport').prop('disabled', false);
      }

      $('#settingKeyModal').modal('show');
    });
  }

  function loadKeys() {
    $('#listKeys').html('');
    $('#loadingKeys').show();

    $.get('keys?type=json', function (res) {
      $('#loadingKeys').hide();
      if (res.data?.length === 0) {
        $('#listKeys').html(`<div class="col-md-12">
          <div class="bg-lighter rounded p-3 mb-3 position-relative">
            <span class="text-muted">You don't have an access key yet.
          </div>
        </div>`);
      } else {
        res.data.forEach((key) => {
          const statusKey = key.status === 'Active' ? 'success' : key.status === 'Pending' ? 'warning' : 'danger';
          const isBtnBuyOrRenew =
            (key.status === 'Expired' && key.type !== 'trial') || key.status === 'Pending'
              ? ` <button data-id="${key._id}" data-type="${
                  key.type
                }" class="btn btn-sm rounded-pill btn-label-primary mb-2 btn-buy">
              <span class="ti-xs ti ti-wallet me-1"></span>${key.status === 'Pending' ? 'Buy Now' : 'Renew'}
            </button><br/>`
              : '';

          $('#listKeys').append(`<div class="col-md-6 col-xl-4">
            <div class="card card-key mb-3">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="d-flex align-items-center">
                  <h4 class="mb-0 me-3">${key.name}</h4>
                  <span class="badge rounded-pill bg-label-info me-2">${key.type.toUpperCase()}</span>
                  <span class="badge rounded-pill bg-label-${statusKey}">${key.status.toUpperCase()}</span>
                </div>

                <div class="dropdown">
                  <a class="btn dropdown-toggle text-muted hide-arrow p-0" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical ti-sm"></i></a>
                  <div class="dropdown-menu dropdown-menu-start">
                    <button class="dropdown-item key-setting" data-id="${key._id}" ${
            key.status === 'Expired' ? 'disabled' : ''
          }><i class="ti ti-settings-code me-2"></i>Setting</button>
                    <button class="dropdown-item text-danger key-delete" data-id="${key._id}" ${
            key.type === 'trial' && key.status === 'Expired' ? 'disabled' : ''
          }><i class="ti ti-trash me-2"></i>Delete</button>
                  </div>
                </div>
              </div>

              <div class="d-flex align-items-center mb-3">
                <p class="me-2 mb-0 fw-medium" id="key-${key._id}">******************</p>
                  <span class="text-muted cursor-pointer me-2 show-key" data-id="${key._id}" data-key="${
            key.key
          }"><i class="ti ti-eye ti-sm"></i></span>
                <span class="text-muted cursor-pointer copy-key" data-key="${
                  key.key
                }"><i class="ti ti-copy ti-sm"></i></span>
              </div>
              ${isBtnBuyOrRenew}
              <span class="text-muted">Expires on ${moment(key.expiredAt).calendar()}</span>
            </div>
          </div>`);
        });
      }
    });
  }

  function buyKey(id, type) {
    $.blockUI({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: '/api/payment',
      data: { id, type },
      type: 'POST',
      success: function (res) {
        $.unblockUI();
        handlerPay(res.token);
      },
      error: function (e) {
        $.unblockUI();
        const msg = e.responseJSON?.msg;
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

  function handlerPay(token) {
    fpay(token, {
      onSuccess: function (data) {
        paymentProcess(data);
      },
      onPending: function (data) {
        Swal.fire({
          title: 'Info!',
          text: data.msg,
          icon: 'info',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      onError: function (data) {
        Swal.fire({
          title: 'Upss!',
          text: data.msg,
          icon: 'info',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      onClose: function () {
        Swal.fire({
          title: 'Warning!',
          text: 'The payment window has closed!',
          icon: 'info',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
    });
  }

  function paymentProcess(res) {
    $.blockUI({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      data: {
        orderId: res.transaction.order_id,
        paymentMethod: res.transaction.payment_method,
      },
      url: '/api/payment/process',
      type: 'POST',
      success: function (res) {
        $.unblockUI();
        Swal.fire({
          title: 'Good job!',
          text: 'Your payment has been successful 🎉',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        }).then(() => location.reload());
      },
      error: function (e) {
        $.unblockUI();
        const msg = e.responseJSON?.msg;
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

  function deleteKey(id) {
    $.blockUI({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: 'keys?id=' + id,
      type: 'DELETE',
      success: function (res) {
        $.unblockUI();
        loadKeys();
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
          text: 'Successfully copied Access Key',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        })
      )
      .catch(() => console.log('Gagal mengcopy!'));
  };

  // Input phone number
  if (countryPhone) {
    $.get('https://ipwhois.app/json/', function (data) {
      countryPhone.val(data.country_phone.replace('+', ''));
      countryCode.html(`${data.country_code} (${data.country_phone})`);
    });
  }
});
