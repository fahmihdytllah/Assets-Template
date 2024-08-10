$(function () {
  loadHistory();

  $(document).on('click', '.btn-upgrade', function () {
    let type = $(this).data('type');

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
        upgradePlans(type);
      }
    });
  });

  function upgradePlans(type) {
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: '/api/payment',
      data: { type },
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
      message: elementLoader,
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
        const msg = e.responseJSON.msg;
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

  function loadHistory() {
    $('.card-billing').block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.get('?type=json', function (res) {
      $('.listHistorys').html('');
      $('.card-billing').unblock();

      if (!res.data?.length) {
        $('.listHistorys').append(`<tr>
          <td class="text-center" colspan="5">There are no transactions at this time.</td>
        </tr>`);
      }

      res.data.forEach((history) => {
        $('.listHistorys').append(`<tr>
          <td>${history.transactionId}</td>
          <td>${history.paymentMethod}</td>
          <td><span class="badge bg-label-info rounded-pill me-1">${history.type}</span></td>
          <td><span class="badge bg-label-${history.status === 'PENDING' ? 'danger' : 'success'} me-1">${
          history.status
        }</span></td>
          <td>${toLocalDateString(history.createdAt)}</td>
        </tr>`);
      });
    });
  }

  function toLocalDateString(isoDateString, locale = 'default') {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(isoDateString);
    return date.toLocaleDateString(locale, options);
  }
});
