$(function () {
  const dataPayMethodTable = $('.datatables-basic');
  const formPayMethod = $('#formPayMethod');

  let mode = 'new';
  let idMethod = false;
  let dataPayMethod;

  let categoryObj = {
    ewallet: 'E-Wallet',
    qris: 'Qris',
    bank: 'Bank Transfer',
    card: 'Card',
    retail: 'Retail (Toko)',
    paylater: 'Pay Later',
  };

  $(document).on('click', '.method-edit', function () {
    mode = 'edit';
    idMethod = $(this).data('id');

    payDetail(idMethod);
  });

  if (dataPayMethodTable.length) {
    dataPayMethod = dataPayMethodTable.DataTable({
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
        { data: 'name' },
        { data: 'partner' },
        { data: 'status' },
        { data: 'channelId' },
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
          render: function (data, type, full, meta) {
            var $row_output =
              '<div class="d-flex justify-content-start align-items-center ">' +
              '<img src="' +
              full.logoUrl +
              '" alt="' +
              full.name +
              '" class="rounded me-2 w-px-50">' +
              '<div class="d-flex flex-column">' +
              '<h6 class="text-nowrap mb-0">' +
              full.name +
              '</h6>' +
              '<small class="text-truncate d-none d-sm-block">' +
              categoryObj[full.category] +
              '</small>' +
              '</div>' +
              '</div>';

            return $row_output;
          },
        },
        {
          targets: 2,
          render: function (data, type, full, meta) {
            return '<span class="badge bg-label-info rounded-pill text-capitalize">' + full.partner + '</span>';
          },
        },
        {
          targets: 3,
          render: function (data, type, full, meta) {
            return (
              '<span class="badge ' +
              (full?.isActive ? 'bg-label-success' : 'bg-label-danger') +
              ' text-capitalize" >' +
              (full?.isActive ? 'active' : 'non active') +
              '</span>'
            );
          },
        },
        {
          targets: -2,
          render: function (data, type, full, meta) {
            const createdAt = new Date(full.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return createdAt;
          },
        },
        {
          targets: -1,
          title: 'Actions',
          orderable: false,
          searchable: false,
          render: function (data, type, full, meta) {
            return (
              '<div class="d-inline-block text-nowrap">' +
              '<button class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect waves-light method-edit" data-id="' +
              full._id +
              '"><i class="ti ti-edit ti-md"></i></button>' +
              '<button class="btn btn-sm btn-icon btn-text-secondary rounded-pill waves-effect waves-light dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical ti-md"></i></button>' +
              '<div class="dropdown-menu dropdown-menu-end m-0">' +
              // '<a href="' +
              // full.link +
              // '" target="_blank" class="dropdown-item">View</a>' +
              '<button class="dropdown-item text-danger btn-delete" data-id="' +
              full._id +
              '">Delete</button>' +
              '</div>' +
              '</div>'
            );
          },
        },
      ],
      dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text: '<i class="ti ti-plus me-sm-1"></i> <span class="d-none d-sm-inline-block">New Method</span>',
          className: 'btn btn-primary waves-effect waves-light',
          action: function () {
            mode = 'new';
            $('#modalPayMethod').modal('show');
          },
        },
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Detail Payment';
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
    $('div.head-label').html('<h5 class="card-title mb-0">Manage Payment Method</h5>');
  }

  formPayMethod.submit(function (e) {
    e.preventDefault();

    formPayMethod.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?id=' + idMethod,
      type: mode === 'new' ? 'POST' : 'PUT',
      data: formPayMethod.serialize(),
      success: function (res) {
        formPayMethod.unblock();
        formPayMethod[0].reset();
        $('#modalPayMethod').modal('hide');
        dataPayMethod.ajax.reload();

        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formPayMethod.unblock();
        let msg = e.responseJSON?.msg;
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

  function payDetail(id) {
    $.get('?type=detail&id=' + id, function (res) {
      mode = 'edit';

      $('#name').val(res.name);
      $('#channelId').val(res.channelId);
      $('#partner').val(res.partner);
      $('#category').val(res.category);
      $('#logoUrl').val(res.logoUrl);

      if (res.isActive) {
        $('#isActive').prop('checked', true);
      }

      $('#modalPayMethod').modal('show');
    });
  }

  $('.datatables-basic tbody').on('click', '.btn-delete', function () {
    const $this = $(this);
    const id = $this.data('id');

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this payment method!',
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
          url: '?id=' + id,
          type: 'DELETE',
          success: function (d) {
            $.unblockUI();
            dataPayMethod.row($this.parents('tr')).remove().draw();
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
