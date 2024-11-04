$(function () {
  loadHistory();

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
          <td>${history.paymentMethod || '-'}</td>
          <td><span class="badge bg-label-info rounded-pill me-1">${history.plan.toUpperCase()}</span></td>
          <td><span class="badge bg-label-${history.status === 'pending' ? 'danger' : 'success'} me-1">${
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
