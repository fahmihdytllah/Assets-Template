$(function () {
  const dataCampaignTable = $('.datatables-basic');
  const formCampaign = $('#formCampaign');

  let idCampaign = false;
  let dataCampaign;

  let colors = {
    free: 'label-secondary',
    elite: 'label-warning',
    premium: 'label-info',
    advanced: 'label-primary',
  };

  $(document).on('click', '.method-edit', function () {
    idCampaign = $(this).data('id');
    campaignDetail(idCampaign);
  });

  if (dataCampaignTable.length) {
    dataCampaign = dataCampaignTable.DataTable({
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
        { data: 'userId' },
        { data: 'subscription' },
        { data: 'isActive' },
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
          targets: 3,
          render: function (data, type, full, meta) {
            return (
              '<span class="badge bg-' +
              colors[full.subscription.plan] +
              ' rounded-pill text-capitalize">' +
              full.subscription.plan +
              '</span>'
            );
          },
        },
        {
          targets: 4,
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
          text: '<i class="ti ti-plus me-sm-1"></i> <span class="d-none d-sm-inline-block">Update Campaign</span>',
          className: 'btn btn-primary waves-effect waves-light',
          action: function () {
            mode = 'edit';
            $('#modalCampaign').modal('show');
          },
        },
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Detail Camapign';
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
    $('div.head-label').html('<h5 class="card-title mb-0">Manage Campaign</h5>');
  }

  formCampaign.submit(function (e) {
    e.preventDefault();

    formCampaign.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?id=' + idCampaign,
      type: 'POST',
      data: formCampaign.serialize(),
      success: function (res) {
        formCampaign.unblock();
        formCampaign[0].reset();
        $('#modalCampaign').modal('hide');
        dataCampaign.ajax.reload();

        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formCampaign.unblock();
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

  function campaignDetail(id) {
    $.get('?type=detail&id=' + id, function (res) {
      mode = 'edit';

      $('#name').val(res.name);
      $('#campaignId').val(res._id);

      if (res.isActive) {
        $('#isActive').prop('checked', true);
      } else {
        $('#isActive').prop('checked', false);
      }

      $('#modalCampaign').modal('show');
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
            dataCampaign.row($this.parents('tr')).remove().draw();
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
