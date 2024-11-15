$(document).ready(function () {
  const formAddKey = $('#formAddKey');
  const formSettingKey = $('#formSettingKey');
  const formBilling = $('#formBilling');

  const billingId = $('#billingId');
  const billingType = $('#billingType');
  const billingPeriod = $('#billingPeriod');

  let showKey = {},
    isPromo = false,
    isBillingVisible = false,
    mode = 'new',
    updateBillingTimeout;

  /** load Key */
  loadKeys();

  /** handle event */
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

  $('#applyPromo').click(function () {
    formBilling.block({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '/api/applyPromo',
      data: formBilling.serialize(),
      type: 'POST',
      success: function (res) {
        formBilling.unblock();
        $('.amount-subtotal').text(res.subtotal);
        $('.amount-discount').text(res.discount);
        $('.amount-total').text(res.total);
        isPromo = true;

        Swal.fire({
          title: 'Good News',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: false,
        });
      },
      error: function (e) {
        formBilling.unblock();
        const msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: false,
        });
      },
    });
  });

  $('#modalBilling').on('shown.bs.modal', function () {
    isBillingVisible = true;
  });

  $('#modalBilling').on('hidden.bs.modal', function () {
    isBillingVisible = false;
  });

  billingPeriod.on('input', function () {
    const id = billingId.val();
    const type = billingType.val();
    const period = $(this).val();
    updateBilling(id, type, period);
  });

  $('#decrease').on('click', function () {
    let period = parseInt(billingPeriod.val());
    const id = billingId.val();
    const type = billingType.val();

    if (period > 1) {
      period--;
      billingPeriod.val(period);
      updateBilling(id, type, period);
    }
  });

  $('#increase').on('click', function () {
    let period = parseInt(billingPeriod.val());
    const id = billingId.val();
    const type = billingType.val();

    if (period < 12) {
      period++;
      billingPeriod.val(period);
      updateBilling(id, type, period);
    }
  });

  billingType.change(function () {
    const id = billingId.val();
    const type = $(this).val();
    updateBilling(id, type);
  });

  $(document).on('click', '.btn-buy', function () {
    const id = $(this).data('id');
    const type = $(this).data('type');
    mode = 'new';
    updateBilling(id, type);
  });

  $(document).on('click', '.btn-renew', function () {
    const id = $(this).data('id');
    const type = $(this).data('type');
    mode = 'renew';
    updateBilling(id, type);
  });

  formBilling.submit(function (e) {
    e.preventDefault();

    const id = billingId.val();
    const type = billingType.val();
    const period = billingPeriod.val();
    const code = isPromo ? $('#promoCode').val() : null;

    $.blockUI({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '/api/payment',
      data: { id, type, code, mode, period },
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
          buttonsStyling: false,
        });
      },
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

  const updateBilling = (id, type, period) => {
    clearTimeout(updateBillingTimeout);

    updateBillingTimeout = setTimeout(() => {
      billingInfo(id, type, period);
    }, 600);
  };

  function billingInfo(id, type, period) {
    !isBillingVisible &&
      $.blockUI({
        message: itemLoader,
        css: { backgroundColor: 'transparent', border: '0' },
        overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
      });

    $.ajax({
      data: { id, type, period },
      url: '/api/billingInfo',
      type: 'POST',
      success: function (res) {
        !isBillingVisible && $.unblockUI();

        billingId.val(id);
        billingType.val(type);
        billingPeriod.val(res.period);

        $('.amount-subtotal').text(res.subtotal);
        $('.amount-discount').text(res.discount);
        $('.amount-total').text(res.total);

        $('#modalBilling').modal('show');
      },
      error: function (err) {
        !isBillingVisible && $.unblockUI();
        console.log(err);
      },
    });
  }

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

    const Colors = {
      Active: 'label-success',
      Pending: 'label-warning',
      Expired: 'label-danger',
    };

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
          const buttonBuyOrRenew =
            (key.status === 'Expired' && key.type !== 'trial') || key.status === 'Pending'
              ? '<button data-id="' +
                key._id +
                '" data-type="' +
                key.type +
                '" class="btn btn-label-primary btn-sm btn-buy rounded-pill mt-4 ">' +
                '<span class="ti-xs ti ti-wallet me-1"></span>' +
                (key.status === 'Pending' ? 'Buy Now' : 'Renew') +
                '</button><br/>'
              : '';

          const buttonRenew =
            '<button class="dropdown-item btn-renew" data-id="' +
            key._id +
            '" data-type="' +
            key.type +
            '" ' +
            '><i class="ti ti-wallet me-2"></i>Renew</button>';

          const buttonSetting =
            '<button class="dropdown-item key-setting" data-id="' +
            key._id +
            '" ' +
            '><i class="ti ti-settings-code me-2"></i>Setting</button>';

          const dropdown =
            '<button class="btn dropdown-toggle dropdown-toggle-split hide-arrow cursor-pointer" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical"></i></button>' +
            '<div class="dropdown-menu">' +
            (key.status === 'Active' ? buttonSetting : '') +
            (key.status !== 'Pending' ? buttonRenew : '') +
            (key.status !== 'Pending' || key.status === 'Active' ? '<div class="dropdown-divider"></div>' : '') +
            '<button class="dropdown-item text-danger key-delete" data-id="' +
            key._id +
            '" ' +
            '><i class="ti ti-trash me-2"></i>Delete</button>' +
            '</div>';

          $('#listKeys').append(
            '<div class="col-md-6 col-xl-4 mb-4">' +
              '<div class="card card-key">' +
              '<div class="card-header header-elements">' +
              '<h5 class="mb-0 me-2">' +
              key.name +
              '</h5>' +
              '<div class="card-header-elements">' +
              '<span class="badge bg-label-info rounded-pill me-1">' +
              key.type.toUpperCase() +
              '</span>' +
              '<span class="badge bg-' +
              Colors[key.status] +
              ' rounded-pill">' +
              key.status.toUpperCase() +
              '</span>' +
              '</div>' +
              '<div class="card-header-elements ms-auto">' +
              (key.type === 'trial' && key.status === 'Expired' ? '' : dropdown) +
              '</div>' +
              '</div>' +
              '<div class="card-body">' +
              '<div class="d-flex align-items-center">' +
              '<p class="me-2 mb-0 fw-medium" id="key-' +
              key._id +
              '">******************</p> ' +
              '<span class="text-muted cursor-pointer me-2 show-key" data-id="' +
              key._id +
              '" data-key="' +
              key.key +
              '"><i class="ti ti-eye ti-sm"></i></span>' +
              '<span class="text-muted cursor-pointer copy-key" data-key="' +
              key.key +
              '"><i class="ti ti-copy ti-sm"></i></span>' +
              '</div>' +
              buttonBuyOrRenew +
              '</div>' +
              '<div class="card-footer">' +
              '<span class="text-muted">Expires on ' +
              moment(key.expiredAt).calendar() +
              '</span>' +
              '</div>' +
              '</div>' +
              '</div>'
          );
        });
      }
    });
  }

  function handlerPay(token) {
    JagoPay(token, {
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
        orderId: res.referenceId,
        paymentMethod: res.paymentMethod.name,
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
});
