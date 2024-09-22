$(document).ready(function () {
  let dataKeysTable = $('.datatables-basic'),
    dataKeys,
    formUpdateKey = $('#formUpdateKey');

  $(document).on('click', '.key-update', function () {
    $('#key').val($(this).data('key'));
    $('#modalUpdateKey').modal('show');
  });

  $(document).on('click', '.key-delete', function () {
    let $this = $(this);
    let idkey = $this.data('id');

    Swal.fire({
      text: 'Apakah anda yakin ingin menghapus key ini?',
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
        deletekey($this, idkey);
      }
    });
  });

  formUpdateKey.submit(function (e) {
    e.preventDefault();
    formUpdateKey.block({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: $(this).attr('action'),
      type: 'PUT',
      data: $(this).serialize(),
      success: function (d) {
        formUpdateKey.unblock();
        dataKeys?.ajax.reload();
        $('#modalUpdateKey').modal('hide');
        Swal.fire({
          title: 'Good job!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formUpdateKey.unblock();
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

  if (dataKeysTable.length) {
    dataKeys = dataKeysTable.DataTable({
      ajax: {
        url: '?type=json',
        type: 'GET',
        beforeSend: function () {
          $('.card').block({
            message: itemLoader,
            css: { backgroundColor: 'transparent', border: '0' },
            overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
          });
        },
        complete: function () {
          $('.card').unblock();
        },
      },
      columns: [
        { data: '' },
        { data: 'userId' },
        { data: 'userId' },
        { data: 'name' },
        { data: 'status' },
        { data: 'type' },
        { data: 'expiredAt' },
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
          targets: 1,
          responsivePriority: 1,
          render: function (data, type, full, meta) {
            return full.userId?.name;
          },
        },
        {
          targets: 2,
          render: function (data, type, full, meta) {
            return full.userId?.countryPhone + full.userId?.number;
          },
        },
        {
          responsivePriority: 3,
          targets: 4,
          render: function (data, type, full, meta) {
            return `<span class="badge rounded-pill bg-label-${
              full.status === 'Active' ? 'success' : 'danger'
            } me-1">${full.status.toUpperCase()}</span>`;
          },
        },
        {
          targets: 5,
          render: function (data, type, full, meta) {
            return `<span class="badge bg-label-info me-1">${full.type.toUpperCase()}</span>`;
          },
        },
        {
          targets: -2,
          render: function (data, type, full, meta) {
            return moment(full.expiredAt).calendar();
          },
        },
        {
          targets: -1,
          title: 'Action',
          orderable: false,
          searchable: false,
          render: function (data, type, full, meta) {
            return `
            <div class="dropdown">
              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                <i class="ti ti-dots-vertical"></i>
              </button>
              <div class="dropdown-menu">
                <button class="dropdown-item key-update" data-key="${full.key}"><i class="ti ti-pencil me-1"></i> Edit</bu>
                <button class="dropdown-item text-danger key-delete" data-id="${full._id}"><i class="ti ti-trash me-1"></i> Delete</button>
              </div>
            </div>`;
          },
        },
      ],
      dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text: '<i class="ti ti-key me-sm-1"></i> <span class="d-none d-sm-inline-block">Update Key</span>',
          className: 'btn rounded-pill btn-label-primary waves-effect waves-light',
          action: function () {
            $('#modalUpdateKey').modal('show');
          },
        },
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'User Key Details';
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
    $('div.head-label').html('<h5 class="card-title mb-0">User list Keys</h5>');
  }

  function deletekey($this, id) {
    $.blockUI({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: '?id=' + id,
      type: 'DELETE',
      success: function (d) {
        $.unblockUI();
        dataKeys.row($this.parents('tr')).remove().draw();
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

  // Filter form control to default size
  // ? setTimeout used for multilingual table initialization
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
