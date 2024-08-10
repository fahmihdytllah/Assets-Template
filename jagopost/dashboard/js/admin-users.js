$(function () {
  let dataUsersTable = $('.datatables-basic'),
    formUpdate = $('#formEditUser'),
    dataUsers;

  formUpdate.submit(function (e) {
    e.preventDefault();
    formUpdate.block({
      message: '<div class="spinner-border text-primary" role="status"></div>',
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      data: formUpdate.serialize(),
      url: formUpdate.attr('action'),
      type: 'POST',
      success: function (d) {
        formUpdate.unblock();
        formUpdate[0].reset();
        dataUsers.ajax.reload();
        $('#modalEdit').modal('hide');
        Swal.fire({
          title: 'Good job!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formUpdate.unblock();
        const msg = e.responseJSON.msg;
        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: !1,
        });
      },
    });
  });

  if (dataUsersTable.length) {
    dataUsers = dataUsersTable.DataTable({
      ajax: {
        url: '?type=json',
        type: 'GET',
        beforeSend: function () {
          $('.card').block({
            message: elementLoader,
            css: { backgroundColor: 'transparent', border: '0' },
            overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
          });
        },
        complete: function () {
          $('.card').unblock();
        },
      },
      columns: [
        { data: '_id' },
        { data: 'username' },
        { data: 'number' },
        { data: 'type' },
        { data: 'expiredAt' },
        { data: 'createdAt' },
        { data: '' },
      ],
      columnDefs: [
        {
          className: 'control',
          orderable: false,
          searchable: false,
          responsivePriority: 2,
          targets: 0,
          render: function (data, type, full, meta) {
            return '';
          },
        },
        {
          responsivePriority: 1,
          targets: 1,
        },
        {
          targets: 2,
          render: function (data, type, full, meta) {
            const myNumber =
              typeof full['number'] != 'undefined' ? full['number'] : full['email'] ? full['email'] : '-';
            return myNumber;
          },
        },
        {
          targets: 3,
          render: function (data, type, full, meta) {
            return `<span class="badge bg-label-${full['type'] == 'Free' ? 'secondary' : 'primary'}">${
              full['type']
            }</span>`;
          },
        },
        {
          targets: -3,
          render: function (data, type, full, meta) {
            return moment(full['expiredAt']).diff(moment(), 'days') + ' days left';
          },
        },
        {
          targets: -2,
          render: function (data, type, full, meta) {
            return moment(full['createdAt']).format('LLL');
          },
        },
        {
          targets: -1,
          title: 'Actions',
          orderable: false,
          searchable: false,
          render: function (data, type, full, meta) {
            return `
              <button class="btn btn-sm btn-icon btn-edit" data-username="${full['username']}"><i class="ti ti-edit me-2"></i></button>
              <button class="btn btn-sm btn-icon text-danger btn-delete" data-id="${full['_id']}"><i class="ti ti-trash me-2"></i</button>`;
          },
        },
      ],
      dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text: '<i class="ti ti-plus me-sm-1"></i> <span class="d-none d-sm-inline-block">Update User</span>',
          className: 'create-new btn btn-primary waves-effect waves-light',
          action: function () {
            $('#modalEdit').modal('show');
          },
        },
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'My post details';
            },
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col, i) {
              return col.title !== '' // ? Do not show row in modal popup if title is blank (for check box)
                ? '<tr data-dt-row="' +
                    col.rowIndex +
                    '" data-dt-column="' +
                    col.columnIndex +
                    '">' +
                    '<td>' +
                    col.title +
                    ':' +
                    '</td> ' +
                    '<td>' +
                    col.data +
                    '</td>' +
                    '</tr>'
                : '';
            }).join('');

            return data ? $('<table class="table"/><tbody />').append(data) : false;
          },
        },
      },
    });
    $('div.head-label').html('<h5 class="card-title mb-0">Manage Users</h5>');
  }

  $('.datatables-basic tbody').on('click', '.btn-edit', function () {
    const username = $(this).data('username');
    $('#username').val(username);
    $('#modalEdit').modal('show');
  });

  $('.datatables-basic tbody').on('click', '.btn-delete', function () {
    const $this = $(this);
    const userId = $this.data('id');

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        $.blockUI({
          message: elementLoader,
          css: { backgroundColor: 'transparent', border: '0' },
          overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
        });
        $.ajax({
          url: '?id=' + userId,
          type: 'DELETE',
          success: function (d) {
            $.unblockUI();
            dataPosts.row($this.parents('tr')).remove().draw();
            Swal.fire({
              title: 'Good job!',
              text: d.msg,
              icon: 'success',
              customClass: { confirmButton: 'btn btn-success waves-effect waves-light' },
            });
          },
          error: function (e) {
            $.unblockUI();
            const msg = e.responseJSON.msg;
            Swal.fire({
              title: 'Upss!',
              text: msg ? msg : 'There is an error!',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary' },
            });
          },
        });
      }
    });
  });

  // Filter form control to default size
  // ? setTimeout used for multilingual table initialization
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
