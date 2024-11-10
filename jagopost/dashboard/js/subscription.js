$(function () {
  $(document).on('click', '.btn-upgrade', function () {
    const plan = $(this).data('plan');

    Swal.fire({
      text: 'Are you sure you want to upgrade this account?',
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
        } else {
          upgradePaidPlans(plan);
        }
      }
    });
  });

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

  function upgradePaidPlans(plan) {
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '/api/payment',
      data: { plan },
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
