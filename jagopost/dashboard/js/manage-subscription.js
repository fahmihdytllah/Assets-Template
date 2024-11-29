$(function () {
  let dataSubscriptionsTable = $('.datatables-basic'),
    formUpdate = $('#formEditSubscription'),
    dataSubscriptions,
    idSubscription;

  if (dataSubscriptionsTable.length) {
    dataSubscriptions = dataSubscriptionsTable.DataTable({
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
        { data: '' },
        { data: 'userId' },
        { data: 'plan' },
        { data: 'platform' },
        { data: 'startDate' },
        { data: 'endDate' },
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
          // User
          targets: 1,
          responsivePriority: 1,
          render: function (data, type, full, meta) {
            var $name = full.userId.name,
              $number = full.userId.phoneNumber || full.userId.email,
              $avatar = full.userId.avatar || null;

            if ($avatar) {
              // For Avatar image
              var $output = '<img src="' + $avatar + '" alt="Avatar" class="rounded-circle">';
            } else {
              // For Avatar badge
              var stateNum = Math.floor(Math.random() * 6);
              var states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
              var $state = states[stateNum],
                $initials = $name.match(/\b\w/g) || [];
              $initials = (($initials.shift() || '') + ($initials.pop() || '')).toUpperCase();
              $output = '<span class="avatar-initial rounded-circle bg-label-' + $state + '">' + $initials + '</span>';
            }

            // Creates full output for row
            var $row_output =
              '<div class="d-flex justify-content-start align-items-center customer-name">' +
              '<div class="avatar-wrapper">' +
              '<div class="avatar me-2">' +
              $output +
              '</div>' +
              '</div>' +
              '<div class="d-flex flex-column">' +
              '<a href="#"><span class="fw-medium">' +
              $name +
              '</span></a>' +
              '<small class="text-muted text-nowrap">' +
              $number +
              '</small>' +
              '</div>' +
              '</div>';
            return $row_output;
          },
        },
        {
          targets: 2,
          render: function (data, type, full, meta) {
            return (
              '<span class="badge bg-label-' +
              (full.plan == 'free' ? 'secondary' : 'primary') +
              '">' +
              full.plan.toUpperCase() +
              '</span>'
            );
          },
        },
        {
          targets: -3,
          render: function (data, type, full, meta) {
            return moment(full.startDate).format('LLL');
          },
        },
        {
          targets: -2,
          render: function (data, type, full, meta) {
            return moment(full.endDate).diff(moment(), 'days') + ' days left';
          },
        },
        {
          targets: -1,
          title: 'Actions',
          orderable: false,
          searchable: false,
          render: function (data, type, full, meta) {
            return `
              <button class="btn btn-sm btn-icon btn-edit" data-id="${full._id}"><i class="ti ti-edit me-2"></i></button>
              <button class="btn btn-sm btn-icon text-danger btn-delete" data-id="${full._id}"><i class="ti ti-trash me-2"></i</button>`;
          },
        },
      ],
      dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text: '<i class="ti ti-plus me-sm-1"></i> <span class="d-none d-sm-inline-block">Update Subscription</span>',
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
              return 'Details';
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
    $('div.head-label').html('<h5 class="card-title mb-0">Manage Subscriptions</h5>');
  }

  $('.datatables-basic tbody').on('click', '.btn-edit', function () {
    const id = $(this).data('id');
    loadDetails(id);
  });

  function loadDetails(id) {
    $.get('?type=detail&id=' + id, function (res) {
      idSubscription = id;
      $('#name').val(res.data.userId.name);
      $('#plan').val(res.data.plan);
      $('#modalEdit').modal('show');
    });
  }

  formUpdate.submit(function (e) {
    e.preventDefault();

    formUpdate.block({
      message: '<div class="spinner-border text-primary" role="status"></div>',
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: formUpdate.serialize(),
      url: '?id=' + idSubscription,
      type: 'POST',
      success: function (res) {
        formUpdate.unblock();
        formUpdate[0].reset();
        dataSubscriptions.ajax.reload();
        $('#modalEdit').modal('hide');

        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formUpdate.unblock();
        const msg = e.responseJSON?.msg;

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

  $('.datatables-basic tbody').on('click', '.btn-delete', function () {
    const $this = $(this);
    const id = $this.data('id');

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
          url: '?id=' + id,
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
