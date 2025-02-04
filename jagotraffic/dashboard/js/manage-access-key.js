$(document).ready(function () {
  const formCreate = $('#formCreate');
  const formSetting = $('#formSetting');
  const formBilling = $('#formBilling');
  const modalCreate = $('#modalCreate');
  const modalSetting = $('#modalSetting');

  const billingId = $('#billingId');
  const billingType = $('#billingType');
  const billingPeriod = $('#billingPeriod');

  let showKey = {},
    isPromo = false,
    isBillingVisible = false,
    mode = 'new',
    updateBillingTimeout;

  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  /** load Key */
  loadKeys();

  /** form step create */
  $('.btn-create').click(function () {
    $('#step-1').show();
    $('#step-2').hide();
    formCreate[0].reset();
    modalCreate.modal('show');
  });

  $('.btn-next').click(function () {
    $('#step-1').hide();
    $('#step-2').show();
  });

  $('.btn-prev').click(function () {
    $('#step-1').show();
    $('#step-2').hide();
  });

  $('#formCreate').submit(function (e) {
    e.preventDefault();
  });

  $('.btn-submit').click(function () {
    formCreate.block({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?',
      type: 'POST',
      data: $(this).serialize(),
      success: function (res) {
        loadKeys();
        formCreate.unblock();
        modalCreate.modal('hide');

        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        formCreate.unblock();

        const msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Bad News!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
  });

  formSetting.submit(function (e) {
    e.preventDefault();

    formSetting.block({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?',
      type: 'PUT',
      data: $(this).serialize(),
      success: function (res) {
        loadKeys();
        formSetting.unblock();
        formSetting[0].reset();
        modalSetting.modal('hide');

        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        formSetting.unblock();
        let msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Bad News!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
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
      icon: 'question',
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

  $(document).on('click', '.show-key', function () {
    let idKey = $(this).data('id');
    let key = $(this).data('key');

    if (typeof showKey[idKey] === 'undefined') {
      showKey[idKey] = false;
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
    $.get('?type=detail&id=' + id, function (res) {
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

      modalSetting.modal('show');
    });
  }

  function loadKeys() {
    $('#list-keys').html('');
    $('#loadingKeys').show();

    const Colors = {
      Active: 'label-success',
      Pending: 'label-warning',
      Expired: 'label-danger',
    };

    $.get('?type=json', function (res) {
      $('#loadingKeys').hide();

      if (res.data?.length === 0) {
        $('#list-keys').html(`<div class="col-md-12">
          <div class="bg-lighter rounded p-3 mb-3 position-relative">
            <span class="text-muted">You don't have an access key yet.
          </div>
        </div>`);
        return;
      }

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

        $('#list-keys').append(
          '<div class="col-md-6 col-xl-4 mb-4">' +
            '<div class="card card-key">' +
            '<div class="card-body">' +
            '<div class="d-flex justify-content-center justify-content-between">' +
            '<h5 class="card-title">' +
            key.name +
            '</h5>' +
            (key.type === 'trial' && key.status === 'Expired' ? '' : dropdown) +
            '</div>' +
            '<div class="d-flex align-items-center mb-6">' +
            '<span class="badge rounded-pill bg-label-primary me-2">' +
            key.type.capitalize() +
            '</span>' +
            '<span class="badge rounded-pill bg-' +
            Colors[key.status] +
            '">' +
            key.status.capitalize() +
            '</span>' +
            '</div>' +
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
    });
  }

  function deleteKey(id) {
    $.blockUI({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?id=' + id,
      type: 'DELETE',
      success: function (res) {
        loadKeys();
        $.unblockUI();

        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        $.unblockUI();
        const msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Bad News!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
  }

  /** Product billing */
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
        });
      },
      error: function (e) {
        formBilling.unblock();
        const msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Bad News!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
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
    billingType.prop('disabled', false);

    updateBilling(id, type);
  });

  $(document).on('click', '.btn-renew', function () {
    const id = $(this).data('id');
    const type = $(this).data('type');

    mode = 'renew';
    billingType.prop('disabled', true);

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
          title: 'Bad News!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
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
  /** /Product billing */

  /** Payment Proccess */
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
        });
      },
      onError: function (data) {
        Swal.fire({
          title: 'Bad News!',
          text: data.msg,
          icon: 'info',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      onClose: function () {
        Swal.fire({
          title: 'Warning!',
          text: 'The payment window has closed!',
          icon: 'info',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
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
          title: 'Good News!',
          text: 'Your payment has been successful 🎉',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        }).then(() => location.reload());
      },
      error: function (e) {
        $.unblockUI();
        const msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Bad News!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
  }
  /** /Payment Proccess */

  const copyText = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() =>
        Swal.fire({
          title: 'Good News!',
          text: 'Successfully copied Access Key',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        })
      )
      .catch(() => console.log('Gagal mengcopy!'));
  };

  String.prototype.capitalize = function () {
    return this.split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
});
