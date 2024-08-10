$(document).ready(function () {
  const formAddNotification = $('.formAddNotification');
  const formEditNotification = $('.formEditNotification');
  const formSendNotification = $('.formSendNotification');
  let idNotification;

  loadNotifications();

  $(document).on('click', '.Notification-delete', function () {
    let idNotification = $(this).data('id');
    Swal.fire({
      text: 'Apakah anda yakin ingin menghapus Notification ini?',
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
        deleteNotification(idNotification);
      }
    });
  });

  $(document).on('click', '.Notification-edit', function () {
    let idNotification = $(this).data('id');
    showModalEditNotification(idNotification);
  });

  formAddNotification.submit(function (e) {
    e.preventDefault();
    formAddNotification.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: '/admin/notifications',
      type: 'POST',
      data: $(this).serialize(),
      success: function (d) {
        loadNotifications();
        formAddNotification.unblock();
        formAddNotification[0].reset();
        $('#modalAddNotification').modal('hide');
        Swal.fire({
          title: 'Good job!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formAddNotification.unblock();
        let msg = e.responseJSON.msg;
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

  formEditNotification.submit(function (e) {
    e.preventDefault();
    formEditNotification.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: '/admin/notifications/' + idNotification,
      type: 'PUT',
      data: $(this).serialize(),
      success: function (d) {
        loadNotifications();
        formEditNotification.unblock();
        formEditNotification[0].reset();
        $('#modalEditNotification').modal('hide');
        Swal.fire({
          title: 'Good job!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formEditNotification.unblock();
        let msg = e.responseJSON.msg;
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

  formSendNotification.submit(function (e) {
    e.preventDefault();
    formSendNotification.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: '/admin/notifications/',
      type: 'PATCH',
      data: $(this).serialize(),
      success: function (d) {
        formSendNotification.unblock();
        formSendNotification[0].reset();
        $('#modalSendNotification').modal('hide');
        Swal.fire({
          title: 'Good job!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formSendNotification.unblock();
        let msg = e.responseJSON.msg;
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

  function loadNotifications() {
    $('#listNotifications').html('');
    $('.card-table').block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.get('/admin/notifications?type=json', function (data) {
      $('.card-table').unblock();

      data.forEach((notif) => {
        const icons = {
          info: 'info-circle',
          success: 'check',
          warning: 'alert-circle',
          danger: 'alert-triangle',
        };
        $('#listNotifications').append(`<tr>
          <td><i class="ti ti-${icons[notif.icon]} ti-lg text-${notif.icon} me-3"></i> <span class="fw-medium">${
          notif.title
        }</span></td>
          <td>${notif.message}</td>
          <td>${moment(notif.createdAt).format('llll')}</td>
          <td>
            <div class="dropdown">
              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical"></i></button>
              <div class="dropdown-menu">
                <a class="dropdown-item Notification-edit" data-id="${
                  notif._id
                }" ><i class="ti ti-pencil me-1"></i> Edit</a>
                <a class="dropdown-item Notification-delete" data-id="${
                  notif._id
                }" ><i class="ti ti-trash me-1"></i> Delete</a>
              </div>
            </div>
          </td>
        </tr>`);
      });
    });
  }

  function showModalEditNotification(id) {
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: '/admin/notifications/' + id,
      type: 'GET',
      success: function (d) {
        $.unblockUI();
        idNotification = id;
        $('#editTitle').val(d.title);
        $('#editIcon').val(d.icon);
        $('#editMessage').val(d.message);
        $('#modalEditNotification').modal('show');
      },
      error: function (e) {
        $.unblockUI();
        let msg = e.responseJSON.msg;
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

  function deleteNotification(id) {
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: '/admin/notifications/' + id,
      type: 'DELETE',
      success: function (d) {
        $.unblockUI();
        loadNotifications();
        Swal.fire({
          title: 'Good job!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        $.unblockUI();
        let msg = e.responseJSON.msg;
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
