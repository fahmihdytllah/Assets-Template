$(function () {
  let dataPostsTable = $('.datatables-basic'),
    blogID = $('#blogID').val(),
    select2 = $('.select2'),
    formSelectLanguage = $('#formSelectLanguage'),
    formSelectIndexer = $('#formSelectIndexer'),
    formSelectSocial = $('#formSelectSocial'),
    isModalSocialShow = false,
    dataPosts;

  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>').select2({
        placeholder: 'Select value',
        dropdownParent: $this.parent(),
      });
    });
  }

  $('#myBlog').on('change', function (e) {
    blogID = $(this).val();
    dataPosts.ajax.url(`?type=json&id=${blogID}`).load();
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
      columns: [
        { data: 'id' },
        { data: 'blogId' },
        { data: 'title' },
        { data: 'author' },
        { data: 'labels' },
        { data: 'comments' },
        { data: 'updated' },
        { data: 'url' },
      ],
      columnDefs: [
        {
          // For Responsive
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
          orderable: false,
          searchable: false,
          responsivePriority: 3,
          checkboxes: true,
          checkboxes: { selectAllRender: '<input type="checkbox" class="form-check-input">' },
          render: function (data, type, full, meta) {
            return `<input type="checkbox" class="dt-checkboxes form-check-input" data-id="${full['id']}" data-url="${full['url']}">`;
          },
        },
        {
          targets: 2,
          responsivePriority: 1,
          render: function (data, type, full, meta) {
            return `<div class="d-flex justify-content-start align-items-center">
              <img src="${full.thumbnail}" alt="${full.title}" class="rounded me-2 w-px-50" />
              ${full.title}
            </div>`;
          },
        },
        {
          // Label
          targets: -4,
          render: function (data, type, full, meta) {
            const labels = typeof full['labels'] != 'undefined' ? full['labels'].join(', ') : '-';
            // return '<span class="badge rounded-pills bg-label-primary">' + labelPost + '</span>'
            return labels;
          },
        },
        {
          targets: -3,
          render: function (data, type, full, meta) {
            return '<span class="badge bg-label-info">' + full.comments + '</span>';
          },
        },
        {
          targets: -1,
          title: 'Actions',
          orderable: false,
          searchable: false,
          render: function (data, type, full, meta) {
            const url =
              full.blogId === 'wp' ? '/u/w/posts/' + full['id'] : '/u/b/posts/' + full.blogId + '/' + full['id'];

            return (
              '<div class="d-inline-block">' +
              '<a href="javascript:;" class="btn btn-sm btn-text-secondary rounded-pill btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical ti-md"></i></a>' +
              '<ul class="dropdown-menu dropdown-menu-end m-0">' +
              '<li><a href="' +
              full['url'] +
              '" class="dropdown-item"><i class="ti-xs ti ti-eye me-1"></i>Show</a></a></li>' +
              '<div class="dropdown-divider"></div>' +
              '<li><button data-blog="' +
              full.blogId +
              '" data-id="' +
              full['id'] +
              '" class="dropdown-item text-danger delete-post"><i class="ti-xs ti ti-trash me-1"></i>Delete</button></li>' +
              '</ul>' +
              '</div>' +
              '<a href="' +
              url +
              '" class="btn btn-sm btn-text-secondary rounded-pill btn-icon item-edit"><i class="ti ti-pencil ti-md"></i></a>'
            );

            return `<div class="d-inline-block">
              <a href="javascript:;" class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                <i class="text-primary ti ti-dots-vertical"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end m-0">
                <li><a href="${full['url']}" target="_blank" class="dropdown-item"><i class="ti-xs ti ti-eye me-1"></i>Show</a></li>
                <div class="dropdown-divider"></div>
                <li><button data-blog="${full.blogId}" data-id="${full['id']}" class="dropdown-item text-danger delete-post"><i class="ti-xs ti ti-trash me-1"></i>Delete</button></li>
              </ul>
            </div>
            <a href="${url}" target="_blank" class="btn btn-sm btn-icon item-edit"><i class="text-primary ti ti-pencil"></i></a>`;
          },
        },
      ],
      dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-6 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end mt-n6 mt-md-0"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 10,
      lengthMenu: [10, 25, 50, 75, 100],
      language: {
        paginate: {
          next: '<i class="ti ti-chevron-right ti-sm"></i>',
          previous: '<i class="ti ti-chevron-left ti-sm"></i>',
        },
      },
      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-primary dropdown-toggle me-4 waves-effect waves-light border-none',
          text: '<i class="ti ti-tools ti-xs me-sm-1"></i> <span class="d-none d-sm-inline-block">Smart Tools</span>',

          buttons: [
            {
              text: '<i class="ti ti-sparkles me-1" ></i>AI Content',
              className: 'dropdown-item',
              action: function () {
                Swal.fire({
                  title: 'Are you sure?',
                  text: 'Would you like to rewrite this post with AI Content!',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, rewrite it!',
                  customClass: {
                    confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
                    cancelButton: 'btn btn-label-secondary waves-effect waves-light',
                  },
                  buttonsStyling: false,
                }).then(function (result) {
                  if (result.value) {
                    $('#modalSelectLanguage').modal('show');
                  }
                });
              },
            },
            {
              text: '<i class="ti ti-share me-1" ></i>Share Post',
              className: 'dropdown-item',
              action: function () {
                Swal.fire({
                  title: 'Are you sure?',
                  text: 'Do you want to share this post on social media!',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, share it!',
                  customClass: {
                    confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
                    cancelButton: 'btn btn-label-secondary waves-effect waves-light',
                  },
                  buttonsStyling: false,
                }).then(function (result) {
                  if (result.value) {
                    if (isModalSocialShow) {
                      $('#modalSelectSocial').modal('show');
                    } else {
                      isModalSocialShow = true;
                      loadDataSocial();
                    }
                  }
                });
              },
            },
            {
              text: '<i class="ti ti-world-search me-1" ></i>Index Post',
              className: 'dropdown-item',
              action: function () {
                Swal.fire({
                  title: 'Are you sure?',
                  text: 'Would you like to index this post!',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Yes, index it!',
                  customClass: {
                    confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
                    cancelButton: 'btn btn-label-secondary waves-effect waves-light',
                  },
                  buttonsStyling: false,
                }).then(function (result) {
                  if (result.value) {
                    $('#modalSelectIndexer').modal('show');
                  }
                });
              },
            },
            {
              text: '<i class="ti ti-trash me-1"></i>Delete Post',
              className: 'dropdown-item text-danger',
              action: function () {
                Swal.fire({
                  title: 'Are you sure?',
                  text: 'Do you want to delete this post!',
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
                    bulkActionPost('delete');
                  }
                });
              },
            },
          ],
        },
        {
          text: '<i class="ti ti-plus me-sm-1"></i> <span class="d-none d-sm-inline-block">Add New Post</span>',
          className: 'create-new btn btn-primary waves-effect waves-light',
          action: function () {
            const url = blogID === 'wp' ? '/u/w/posts/new' : '/u/b/posts/new?id=' + blogID;
            window.location = url;
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
      initComplete: function (settings, json) {
        $('.card-header').after('<hr class="my-0">');
      },
    });
    $('div.head-label').html('<h5 class="card-title mb-0">My Posts</h5>');
  }

  formSelectLanguage.submit(function (e) {
    e.preventDefault();
    bulkActionPost('ai', {
      lang: $('#lang').val(),
    });
  });

  formSelectIndexer.submit(function (e) {
    e.preventDefault();
    bulkActionPost('index', {
      bingIndexer: $('.bingIndexer').is(':checked') ? true : false,
      googleIndexer: $('.googleIndexer').is(':checked') ? true : false,
      yandexIndexer: $('.yandexIndexer').is(':checked') ? true : false,
    });
  });

  formSelectSocial.submit(function (e) {
    e.preventDefault();
    let FBPage = $('#selectPage').val().split('[]');
    bulkActionPost('share', {
      pinterestShare: $('.pinterestShare').is(':checked') ? true : false,
      facebookShare: $('.facebookShare').is(':checked') ? true : false,
      twitterShare: $('.twitterShare').is(':checked') ? true : false,
      linkedinShare: $('.linkedinShare').is(':checked') ? true : false,
      boardId: $('#selectBoard').val(),
      pageId: FBPage[0],
      pageToken: FBPage[1],
    });
  });

  // Delete Post
  $('.datatables-basic tbody').on('click', '.delete-post', function () {
    const $this = $(this);
    const postID = $this.data('id');

    const url = blogID === 'wp' ? '/u/w/posts/' + postID : '/u/b/posts/' + blogID + '/' + postID;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this post!',
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
          url,
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

  $('.pinterestShare').change(function () {
    if ($(this).is(':checked')) {
      $('#displaySelectBoard').show();
    } else {
      $('#displaySelectBoard').hide();
    }
  });

  $('.facebookShare').change(function () {
    if ($(this).is(':checked')) {
      $('#displaySelectPage').show();
    } else {
      $('#displaySelectPage').hide();
    }
  });

  function loadDataSocial() {
    $.get('/api/graphql?use=social', function (res) {
      if (res.isLoggedPinterest) {
        $('#selectBoard').html('');
        res.listBoards.forEach((board) => {
          $('#selectBoard').append(`<option value="${board.id}">${board.name}</option>`);
        });

        $('.pinterestShare').prop('disabled', false);
      } else {
        $('.pinterestShare').prop('disabled', true);
        $('#displaySelectBoard').hide();
      }

      if (res.isLoggedFacebook) {
        $('#selectPage').html('');
        res.listPages.forEach((page) => {
          $('#selectPage').append(`<option value="${page.id}[]${page.access_token}">${page.name}</option>`);
        });

        $('.facebookShare').prop('disabled', false);
      } else {
        $('.facebookShare').prop('disabled', true);
        $('#displaySelectPage').hide();
      }

      if (res.isLoggedTwitter) {
        $('.twitterShare').prop('disabled', false);
      } else {
        $('.twitterShare').prop('disabled', true);
      }

      if (res.isLoggedLinkedin) {
        $('.linkedinShare').prop('disabled', false);
      } else {
        $('.linkedinShare').prop('disabled', true);
      }

      $('#modalSelectSocial').modal('show');
    });
  }

  function bulkActionPost(selectedType, data = {}) {
    let listPost = $('input.dt-checkboxes[type=checkbox]:checkbox:checked'),
      _dataPosts = [];

    listPost.each(function () {
      _dataPosts.push({ postID: $(this).data('id'), url: $(this).data('url') });
    });

    if (_dataPosts.length <= 0) {
      Swal.fire({
        title: 'Upss!',
        text: 'Please select a post first!',
        icon: 'error',
        customClass: { confirmButton: 'btn btn-primary' },
        buttonsStyling: !1,
      });
    } else {
      $.blockUI({
        message: elementLoader,
        css: { backgroundColor: 'transparent', border: '0' },
        overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
      });

      $.ajax({
        type: 'POST',
        url: '/u/tool/bulk-action',
        contentType: 'application/json',
        data: JSON.stringify({
          ...{ blogID, type: selectedType, dataPosts: _dataPosts },
          ...data,
        }),
        success: function (d) {
          $.unblockUI();
          $('#modalSelectLanguage').modal('hide');

          Swal.fire({
            title: 'Good job!',
            text: d.msg,
            icon: 'success',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: !1,
          }).then(() => {
            if (selectedType === 'delete' || selectedType === 'ai') {
              dataPosts.ajax.reload();
            }
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
            buttonsStyling: !1,
          });
        },
      });
    }
  }

  // Filter form control to default size
  // ? setTimeout used for multilingual table initialization
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
