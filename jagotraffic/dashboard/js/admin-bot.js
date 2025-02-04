$(document).ready(function () {
  let dataBotsTable = $('.datatables-basic'),
    dataBots;

  $(document).on('click', '.bot-delete', function () {
    let $this = $(this);
    let idBot = $this.data('id');

    Swal.fire({
      text: 'Are you sure you want to remove this bot?',
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
        deleteBot($this, idBot);
      }
    });
  });

  if (dataBotsTable.length) {
    dataBots = dataBotsTable.DataTable({
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
        { data: 'ip' },
        { data: 'isActive' },
        { data: 'userId' },
        { data: 'keyId' },
        { data: 'network' },
        { data: 'totalHitsPerDay' },
        { data: 'totalViewAdsPerDay' },
        { data: 'totalClickAdsPerDay' },
        { data: 'totalErrorPerDay' },
        { data: 'uptime' },
        { data: 'lastActivity' },
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
            return `<div class="d-flex justify-content-left align-items-center">
              <i class="fis fi fi-${full.countryCode.toLowerCase()} rounded-circle fs-1 me-3"></i>
              <div class="d-flex flex-column">
                <span class="fw-medium">${full.ip}</span>
                <small class="text-muted">${full.country}</small>
              </div>
            </div>`;
          },
        },
        {
          responsivePriority: 3,
          targets: 2,
          render: function (data, type, full, meta) {
            return `<span class="badge rounded-pill bg-label-${full?.isActive ? 'success' : 'danger'} me-1">${
              full?.isActive ? 'Active' : 'Non Active'
            }</span>`;
          },
        },
        {
          targets: 3,
          render: function (data, type, full, meta) {
            return `<span class="badge rounded-pill bg-label-primary me-1">${full.userId?.name}</span>`;
          },
        },
        {
          targets: 4,
          render: function (data, type, full, meta) {
            return `<span class="badge rounded-pill bg-label-info me-1">${full.keyId?.name}</span>`;
          },
        },
        {
          targets: -3,
          render: function (data, type, full, meta) {
            return formatTime(full.uptime);
          },
        },
        {
          targets: -2,
          render: function (data, type, full, meta) {
            return moment(full.lastActivity).fromNow();
          },
        },
        {
          targets: -1,
          title: 'Action',
          orderable: false,
          searchable: false,
          render: function (data, type, full, meta) {
            return `
            <button type="button" class="btn rounded-pill btn-icon btn-outline-danger bot-delete" data-id="${full._id}">
              <span class="ti ti-trash"></span>
            </button>`;
          },
        },
      ],
      order: [[3, 'asc']],
      dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-primary dropdown-toggle me-2 waves-effect waves-light',
          text: '<i class="ti ti-tool me-sm-1"></i> <span class="d-none d-sm-inline-block">Action Bot</span>',
          buttons: [
            {
              text: '<i class="ti ti-device-floppy me-1" ></i>Save',
              className: 'dropdown-item',
              action: function () {
                actionBot('save');
              },
            },
            {
              text: '<i class="ti ti-player-pause me-1" ></i>Stop',
              className: 'dropdown-item',
              action: function () {
                actionBot('stop');
              },
            },
            {
              text: '<i class="ti ti-robot me-1" ></i>Restart',
              className: 'dropdown-item',
              action: function () {
                actionBot('restart');
              },
            },
            {
              text: '<i class="ti ti-server-2 me-1" ></i>Reboot',
              className: 'dropdown-item',
              action: function () {
                actionBot('reboot');
              },
            },
          ],
        },
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'My Bot Details';
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
    $('div.head-label').html('<h5 class="card-title mb-0">My list Bots</h5>');
  }

  function deleteBot($this, id) {
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
        dataBots.row($this.parents('tr')).remove().draw();
        Swal.fire({
          title: 'Good News!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        $.unblockUI();
        let msg = e.responseJSON.msg;
        Swal.fire({
          title: 'Bad News!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
  }

  function actionBot(type) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to ' + type + ' all bots!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, ' + type + ' it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        $.blockUI({
          message: itemLoader,
          css: { backgroundColor: 'transparent', border: '0' },
          overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
        });

        $.ajax({
          url: '?type=' + type,
          type: 'PUT',
          success: function (d) {
            $.unblockUI();
            Swal.fire({
              title: 'Good News!',
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
              title: 'Bad News!',
              text: msg ? msg : 'There is an error!',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
              buttonsStyling: !1,
            });
          },
        });
      }
    });
  }

  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  }

  // Filter form control to default size
  // ? setTimeout used for multilingual table initialization
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
