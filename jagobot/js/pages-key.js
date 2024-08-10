$(document).ready(function () {
  const formAddKey = $('#formAddKey');
  const formSettingKey = $('#formSettingKey');
  const countryPhone = $('#countryPhone');
  const countryCode = $('#countryCode');

  // load Key
  loadKeys();

  // handle event
  $('#formAddKey').submit(function (e) {
    e.preventDefault();
    formAddKey.block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: $(this).attr('action'),
      type: 'POST',
      data: $(this).serialize(),
      success: function (res) {
        formAddKey.unblock();
        $('#modalAddKey').modal('hide');
        loadKeys();
        Swal.fire({ title: 'Good job!', text: res.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      error: function (e) {
        formAddKey.unblock();
        let msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
    });
  });

  formSettingKey.submit(function (e) {
    e.preventDefault();
    formSettingKey.block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: $(this).attr('action'),
      type: 'PUT',
      data: $(this).serialize(),
      success: function (res) {
        formSettingKey.unblock();
        loadKeys();
        $('#settingKeyModal').modal('hide');
        Swal.fire({ title: 'Good job!', text: res.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      error: function (e) {
        formSettingKey.unblock();
        let msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
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

  $('#autoSendReport').change(function () {
    if ($(this).is(':checked')) {
      $('#formNumber').show();
    } else {
      $('#formNumber').hide();
    }
  });

  $('#withProxy').change(function () {
    if ($(this).is(':checked')) {
      $('#formProxy').show();
    } else {
      $('#formProxy').hide();
    }
  });

  $('#customReferer').change(function () {
    if ($(this).is(':checked')) {
      $('#formReferer').show();
    } else {
      $('#formReferer').hide();
    }
  });

  $('#randomUserAgent').change(function () {
    if ($(this).is(':checked')) {
      $('#autoSwitch').prop('disabled', false);
    } else {
      $('#autoSwitch').prop('disabled', true);
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
      customClass: { confirmButton: 'btn btn-primary waves-effect waves-light', cancelButton: 'btn btn-outline-danger ms-2 waves-effect waves-light' },
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
      customClass: { confirmButton: 'btn btn-primary waves-effect waves-light', cancelButton: 'btn btn-outline-danger ms-2 waves-effect waves-light' },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        buyKey(idKey, typeKey);
      }
    });
  });

  function settingKey(id) {
    $.get(`keys?type=detail&id=${id}`, function (res) {
      $('#idKey').val(res.data._id);
      $('#nameEditKey').val(res.data.name);
      $('#taskBot').val(res.data.taskBot);
      $('#clickAds').val(res.data.clickAds);
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

      if (res.data.type === 'trial') {
        $('#exBlog').prop('checked', false);
        $('#exBlog').prop('disabled', true);
        $('#withProxy').prop('checked', false);
        $('#withProxy').prop('disabled', true);
        $('#customReferer').prop('checked', false);
        $('#customReferer').prop('disabled', true);
        $('#randomUserAgent').prop('checked', false);
        $('#randomUserAgent').prop('disabled', true);
        $('#autoSwitch').prop('checked', false);
        $('#autoSwitch').prop('disabled', true);
        $('#autoSendReport').prop('checked', false);
        $('#autoSendReport').prop('disabled', true);
      }

      if (res.data.type === 'basic') {
        $('#exBlog').prop('disabled', false);
        $('#withProxy').prop('checked', false);
        $('#withProxy').prop('disabled', true);
        $('#customReferer').prop('checked', false);
        $('#customReferer').prop('disabled', true);
        $('#randomUserAgent').prop('checked', false);
        $('#randomUserAgent').prop('disabled', true);
        $('#autoSwitch').prop('checked', false);
        $('#autoSwitch').prop('disabled', true);
        $('#autoSendReport').prop('checked', false);
        $('#autoSendReport').prop('disabled', true);
      }

      if (res.data.type === 'premium') {
        $('#exBlog').prop('disabled', false);
        $('#withProxy').prop('disabled', false);
        $('#customReferer').prop('checked', false);
        $('#customReferer').prop('disabled', true);
        $('#randomUserAgent').prop('checked', false);
        $('#randomUserAgent').prop('disabled', true);
        $('#autoSwitch').prop('checked', false);
        $('#autoSwitch').prop('disabled', true);
        $('#autoSendReport').prop('checked', false);
        $('#autoSendReport').prop('disabled', true);
      }

      if (res.data.type === 'unlimited') {
        $('#exBlog').prop('disabled', false);
        $('#withProxy').prop('disabled', false);
        $('#customReferer').prop('disabled', false);
        $('#randomUserAgent').prop('disabled', false);
        $('#autoSendReport').prop('disabled', false);
      }

      if (res.data.regularVisitor) {
        $('#visitor').prop('checked', true);
      }

      if (res.data.type !== 'trial' && res.data.exBlog) {
        $('#exBlog').prop('checked', true);
      }

      if ((res.data.type !== 'trial' || res.data.type !== 'basic') && res.data.withProxy) {
        $('#withProxy').prop('checked', true);
        $('#formProxy').show();
        $('#listProxy').val(res.data.proxy.join('\n'));
      } else {
        $('#withProxy').prop('checked', false);
        $('#formProxy').hide();
      }

      if (res.data.type === 'unlimited' && res.data.customReferer) {
        $('#customReferer').prop('checked', true);
        $('#formReferer').show();
        $('#listReferer').val(res.data.referer.join('\n'));
      } else {
        $('#customReferer').prop('checked', false);
        $('#formReferer').hide();
      }

      if (res.data.type === 'unlimited' && res.data.randomUserAgent) {
        $('#randomUserAgent').prop('checked', true);
        $('#autoSwitch').prop('disabled', false);
        $('#autoSwitch').prop('checked', true);
      } else {
        $('#randomUserAgent').prop('checked', false);
        $('#autoSwitch').prop('disabled', true);
      }

      if (res.data.type === 'unlimited' && res.data.autoSendReport) {
        $('#autoSendReport').prop('checked', true);
        $('#formNumber').show();
        $('#number').val(res.data.number);
        countryPhone.val(res.data.countryPhone);
      } else {
        $('#formNumber').hide();
        $('#autoSendReport').prop('checked', false);
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
              ? ` <button data-id="${key._id}" data-type="${key.type}" class="btn btn-sm rounded-pill btn-label-primary mb-2 btn-buy">
              <span class="ti-xs ti ti-wallet me-1"></span>${key.status === 'Pending' ? 'Bayar' : 'Perpanjang'}
            </button><br/>`
              : '';

          $('#listKeys').append(`<div class="col-md-6">
            <div class="bg-lighter rounded p-3 mb-3 position-relative">
              <div class="dropdown api-key-actions">
                <a class="btn dropdown-toggle text-muted hide-arrow p-0" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical ti-sm"></i></a>
                <div class="dropdown-menu dropdown-menu-end">
                  <button class="dropdown-item key-setting" data-id="${key._id}" ${key.status === 'Expired' ? 'disabled' : ''}><i class="ti ti-settings-code me-2"></i>Pengaturan</button>
                  <button class="dropdown-item key-delete" data-id="${key._id}" ${key.type === 'trial' && key.status === 'Expired' ? 'disabled' : ''}><i class="ti ti-trash me-2"></i>Hapus</button>
                </div>
              </div>
              <div class="d-flex align-items-center mb-3">
                <h4 class="mb-0 me-3">${key.name}</h4>
                <span class="badge bg-label-info me-2">${key.type.toUpperCase()}</span>
                <span class="badge bg-label-${statusKey}">${key.status.toUpperCase()}</span>
              </div>
              <div class="d-flex align-items-center mb-3">
                <p class="me-2 mb-0 fw-medium">${key.key}</p>
                <span class="text-muted cursor-pointer copy-key" data-key="${key.key}"><i class="ti ti-copy ti-sm"></i></span>
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
    $.blockUI({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
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
        const msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
    });
  }

  function handlerPay(token) {
    fpay(token, {
      onSuccess: function (data) {
        paymentProcess(data);
      },
      onPending: function (data) {
        Swal.fire({ title: 'Info!', text: data.msg, icon: 'info', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      onError: function (data) {
        Swal.fire({ title: 'Upss!', text: data.msg, icon: 'info', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      onClose: function () {
        Swal.fire({ title: 'Warning!', text: 'The payment window has closed!', icon: 'info', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
    });
  }

  function paymentProcess(res) {
    $.blockUI({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      data: {
        orderId: res.transaction.order_id,
        paymentMethod: res.transaction.payment_method,
      },
      url: '/api/payment/process',
      type: 'POST',
      success: function (res) {
        $.unblockUI();
        Swal.fire({ title: 'Good job!', text: 'Your payment has been successful 🎉', icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 }).then(() => location.reload());
      },
      error: function (e) {
        $.unblockUI();
        const msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
    });
  }

  function deleteKey(id) {
    $.blockUI({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: 'keys?id=' + id,
      type: 'DELETE',
      success: function (res) {
        $.unblockUI();
        loadKeys();
        Swal.fire({ title: 'Good job!', text: res.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      error: function (e) {
        $.unblockUI();
        let msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
    });
  }

  const copyText = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => Swal.fire({ title: 'Good job!', text: 'Successfully copied Access Key', icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 }))
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
