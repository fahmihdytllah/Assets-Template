$(function () {
  const dataPostsTable = $('.datatables-basic'),
    formAddPost = $('#formAddPost');

  let dataPosts = null;

  $('.btn-login').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to connect to your <strong>X (Twitter)</strong> account',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, connect it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        thirdPartyAccess('x', {
          onSuccess: (res) => {
            Swal.fire({
              title: 'Good News!',
              text: res.msg,
              icon: 'success',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            }).then(() => location.reload());
          },
          onError: (err) => {
            Swal.fire({
              title: 'Bad News!',
              text: err.msg,
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            });
          },
        });
      }
    });
  });

  $('.btn-logout').click(function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to remove the connection to your <strong>X (Twitter)</strong> account',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        thirdPartyRemoveAccess('x', {
          onSuccess: (res) => {
            Swal.fire({
              title: 'Good News!',
              text: res.msg,
              icon: 'success',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            }).then(() => location.reload());
          },
          onError: (err) => {
            Swal.fire({
              title: 'Bad News!',
              text: err.msg,
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            });
          },
        });
      }
    });
  });

  formAddPost.submit(function (e) {
    e.preventDefault();

    formAddPost.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: $(this).serialize(),
      url: $(this).attr('action'),
      type: 'POST',
      success: function (res) {
        formAddPost.unblock();
        formAddPost[0].reset();
        $('#addPost').modal('hide');

        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        }).then(() => dataPosts.ajax.reload());
      },
      error: function (e) {
        formAddPost.unblock();
        const msg = e.responseJSON?.msg || 'There is an error!';

        Swal.fire({
          title: 'Bad News!',
          text: msg,
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
  });

  if (dataPostsTable.length) {
    dataPosts = dataPostsTable.DataTable({
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
      columns: [{ data: '' }, { data: 'fullText' }, { data: 'createdAt' }, { data: 'id' }],
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
            return full?.fullText ? full.fullText : '-';
          },
        },
        {
          targets: 2,
          render: function (data, type, full, meta) {
            return `<span class="badge bg-label-primary me-1">${toLocalDateString(full.createdAt)}</span>`;
          },
        },
        {
          targets: -1,
          title: 'Action',
          orderable: false,
          searchable: false,
          render: function (data, type, full, meta) {
            return `
            <button type="button" class="btn rounded-pill btn-icon btn-outline-danger btn-delete" data-id="${full.id}">
              <span class="ti ti-trash"></span>
            </button>`;
          },
        },
      ],
      // order: [[2, 'desc']],
      dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text: '<i class="ti ti-plus me-sm-1"></i> <span class="d-none d-sm-inline-block">Add Post</span>',
          className: 'btn btn-primary waves-effect waves-light',
          action: function () {
            $('#addPost').modal('show');
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
    $('div.head-label').html('<h5 class="card-title mb-0">My list Posts</h5>');
  }

  $(document).on('click', '.btn-delete', function () {
    const $this = $(this);

    Swal.fire({
      title: 'Are you sure?',
      html: "Want to delete this post, can't be recovered",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (e) {
      if (e.value) {
        $.blockUI({
          message: elementLoader,
          css: { backgroundColor: 'transparent', border: '0' },
          overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
        });

        $.ajax({
          url: 'twitter/' + $this.data('id'),
          type: 'DELETE',
          success: function (res) {
            $.unblockUI();
            Swal.fire({
              title: 'Good News!',
              text: res.msg,
              icon: 'success',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            }).then(() => {
              dataPosts.row($this.parents('tr')).remove().draw();
            });
          },
          error: function (e) {
            $.unblockUI();
            const msg = e.responseJSON?.msg || 'There is an error!';

            Swal.fire({
              title: 'Bad News!',
              text: msg,
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
            });
          },
        });
      }
    });
  });

  function toLocalDateString(isoDateString, locale = 'default') {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(isoDateString);
    return date.toLocaleDateString(locale, options);
  }

  // Filter form control to default size
  // ? setTimeout used for multilingual table initialization
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
