$(document).ready(function () {
  loadBots();
  
  $(document).on('click', '.bot-delete', function () {
    let idBot = $(this).data('id');
    Swal.fire({ text: 'Apakah anda yakin ingin menghapus bot ini?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light', cancelButton: 'btn btn-outline-danger ms-2 waves-effect waves-light' }, buttonsStyling: false }).then(function (result) {
      if (result.value) {
        deleteBot(idBot);
      }
    });
  });

  function loadBots() {
    $('#listBots').html('');
    $('.card-table').block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });

    $.get('bots?type=json', function (d) {
      $('.card-table').unblock();
      
      d.data.forEach(bot => {
        $('#listBots').append(`<tr>
          <td>
            <div class="d-flex justify-content-left align-items-center">
              <i class="fis fi fi-${bot.countryCode.toLowerCase()} rounded-circle fs-1 me-3"></i>
              <div class="d-flex flex-column">
                <span class="fw-medium">${bot.ip}</span>
                <small class="text-muted">${bot.country}</small>
              </div>
            </div>
          </td>
          <td><span class="badge rounded-pill bg-label-${bot.status === 'Active' ? 'success' : 'danger'} me-1">${bot.status}</span></td>
          <td><span class="badge rounded-pill bg-label-info me-1">${bot.platform}</span></td>
          <td>${bot.totalHitsPerDay}</td>
          <td>${bot.totalViewAdsPerDay}</td>
          <td>${bot.totalClickAdsPerDay}</td>
          <td>${bot.totalErrorPerDay}</td>
          <td>${bot.uptime}</td>
          <td>${moment(bot.lastActivity).fromNow()}</td>
          <td>
            <button type="button" data-id="${bot._id}" class="btn p-0 bot-delete">
              <i class="ti ti-trash"></i>
            </button>
          </td>
        </tr>`);
      });
    });
  }

  function deleteBot(id) {
    $.blockUI({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: 'bots?id=' + id,
      type: 'DELETE',
      success: function (d) {
        $.unblockUI();
        loadBots();
        Swal.fire({ title: 'Good job!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      error: function (e) {
        $.unblockUI();
        let msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      }
    });
  }
});
