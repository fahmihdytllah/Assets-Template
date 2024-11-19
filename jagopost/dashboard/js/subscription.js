$(function () {
  const formBilling = $('#formBilling');
  const billingPlan = $('#billingPlan');
  const billingPeriod = $('#billingPeriod');

  let mode = 'new',
    isPromo = false,
    isBillingVisible = false,
    updateBillingTimeout;

  /** Billing Info */
  $('#modalBilling').on('shown.bs.modal', function () {
    isBillingVisible = true;
  });

  $('#modalBilling').on('hidden.bs.modal', function () {
    isBillingVisible = false;
  });

  billingPeriod.on('input', function () {
    const plan = billingPlan.val();
    const period = $(this).val();

    updateBilling(plan, period);
  });

  $('#decrease').on('click', function () {
    let period = parseInt(billingPeriod.val());
    const plan = billingPlan.val();

    if (period > 1) {
      period--;
      billingPeriod.val(period);
      updateBilling(plan, period);
    }
  });

  $('#increase').on('click', function () {
    let period = parseInt(billingPeriod.val());
    const plan = billingPlan.val();

    if (period < 12) {
      period++;
      billingPeriod.val(period);
      updateBilling(plan, period);
    }
  });

  billingPlan.change(function () {
    const plan = $(this).val();

    updateBilling(plan);
  });

  $(document).on('click', '.btn-upgrade', function () {
    const plan = $(this).data('plan');

    if (plan === 'free') {
      Swal.fire({
        text: 'Are you sure you want to change to a Free subscription?',
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
          if (plan === 'free') {
            upgradeFreePlans(plan);
          }
        }
      });
    } else {
      mode = 'new';
      billingPlan.prop('disabled', false);

      updateBilling(plan);
    }
  });

  $(document).on('click', '.btn-renew', function () {
    const plan = $(this).data('plan');

    mode = 'renew';
    billingPlan.prop('disabled', true);

    updateBilling(plan);
  });

  $('#applyPromo').click(function () {
    formBilling.block({
      message: elementLoader,
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

  formBilling.submit(function (e) {
    e.preventDefault();

    const plan = billingPlan.val();
    const period = billingPeriod.val();
    const code = isPromo ? $('#promoCode').val() : null;

    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '/api/payment',
      data: { plan, code, mode, period },
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

  const updateBilling = (plan, period) => {
    clearTimeout(updateBillingTimeout);

    updateBillingTimeout = setTimeout(() => {
      billingInfo(plan, period);
    }, 600);
  };

  function billingInfo(plan, period) {
    !isBillingVisible &&
      $.blockUI({
        message: elementLoader,
        css: { backgroundColor: 'transparent', border: '0' },
        overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
      });

    $.ajax({
      data: { plan, period },
      url: '/api/billingInfo',
      type: 'POST',
      success: function (res) {
        !isBillingVisible && $.unblockUI();

        billingPlan.val(plan);
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

  function upgradeFreePlans(plan) {
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '/api/subscription',
      data: { plan },
      type: 'POST',
      success: function (res) {
        $.unblockUI();
        Swal.fire({
          title: 'Good job!',
          text: res.msg,
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
      message: elementLoader,
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
});
