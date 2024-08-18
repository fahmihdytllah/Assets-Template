$(document).ready(function () {
  let dataPostsTable = $('.datatables-basic'),
    dataPosts;

  $(document).on('click', '.bot-delete', function () {
    let idBot = $(this).data('id');
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
        deleteBot(idBot);
      }
    });
  });

  if (dataPostsTable.length) {
    dataPosts = dataPostsTable.DataTable({
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
        { data: 'status' },
        { data: 'keyId' },
        { data: 'platform' },
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
          targets: 2,
          render: function (data, type, full, meta) {
            return `<span class="badge rounded-pill bg-label-${full.status === 'Active' ? 'success' : 'danger'} me-1">${
              full.status
            }</span>`;
          },
        },
        {
          targets: 3,
          render: function (data, type, full, meta) {
            return `<span class="badge rounded-pill bg-label-info me-1">${full.keyId?.name}</span>`;
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
            <button type="button" class="btn rounded-pill btn-icon btn-outline-danger bot-delete" data-id="${full.id}">
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
          text: '<i class="ti ti-help-hexagon me-sm-1"></i> <span class="d-none d-sm-inline-block">Installation Guide</span>',
          className: 'btn btn-primary waves-effect waves-light',
          action: function () {
            window.location.href = '/u/installation';
          },
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

  function deleteBot(id) {
    $.blockUI({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: 'bots?id=' + id,
      type: 'DELETE',
      success: function (d) {
        $.unblockUI();
        loadBots();
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
