$(document).ready(function () {
  const formUpdateKey = $('#formUpdateKey');

  loadKeys();

  $(document).on('click', '.key-delete', function () {
    let idkey = $(this).data('id');
    Swal.fire({ text: 'Apakah anda yakin ingin menghapus key ini?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light', cancelButton: 'btn btn-outline-danger ms-2 waves-effect waves-light' }, buttonsStyling: false }).then(function (result) {
      if (result.value) {
        deletekey(idkey);
      }
    });
  });

  formUpdateKey.submit(function (e) {
    e.preventDefault();
    formUpdateKey.block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: $(this).attr('action'),
      type: 'PUT',
      data: $(this).serialize(),
      success: function (d) {
        formUpdateKey.unblock();
        loadKeys();
        $('#modalUpdateKey').modal('hide');
        Swal.fire({ title: 'Good job!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      },
      error: function (e) {
        formUpdateKey.unblock();
        let msg = e.responseJSON.msg;
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' }, buttonsStyling: !1 });
      }
    });
  });

  function loadKeys() {
    $('#listKeys').html('');
    $('.card-table').block({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });

    $.get('keys?type=json', function (d) {
      $('.card-table').unblock();

      d.data.forEach(key => {
        $('#listKeys').append(`<tr>
          <td>${key.key}</td>
          <td><span class="badge bg-label-${key.status === 'Active' ? 'success' : 'danger'} me-1">${key.status.toUpperCase()}</span></td>
          <td><span class="badge bg-label-info me-1">${key.type.toUpperCase()}</span></td>
          <td>${moment(key.expiredAt).calendar()}</td>
          <td>
            <button type="button" data-id="${key._id}" class="btn p-0 key-delete">
              <i class="ti ti-trash"></i>
            </button>
          </td>
        </tr>`);
      });
    });
  }

  function deletekey(id) {
    $.blockUI({ message: itemLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } });
    $.ajax({
      url: 'keys?id=' + id,
      type: 'DELETE',
      success: function (d) {
        $.unblockUI();
        loadKeys();
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
