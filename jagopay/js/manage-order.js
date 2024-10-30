$(function () {
  const formOrder = $('#formOrder');
  const dt_order_table = $('.datatables-order');

  let dataOrders, idOrder;
  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  // Variable declaration for table
  let statusObj = {
    pending: { title: 'Pending', class: 'bg-label-warning' },
    completed: { title: 'Completed', class: 'bg-label-success' },
    failed: { title: 'Failed', class: 'bg-label-danger' },
  };

  $(document).on('click', '.edit-order', function () {
    idOrder = $(this).data('id');
    orderDetail(idOrder);
  });

  if (dt_order_table.length) {
    dataOrders = dt_order_table.DataTable({
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
        { data: 'updatedAt' },
        { data: 'accessToken' },
        { data: 'amount' } /** amount */,
        { data: 'customerDetails' },
        { data: 'paymentMethod' } /** paymentMethod */,
        { data: 'status' },
        { data: '' },
      ],
      columnDefs: [
        {
          className: 'control',
          searchable: false,
          orderable: false,
          responsivePriority: 2,
          targets: 0,
          render: function (data, type, full, meta) {
            return '';
          },
        },
        {
          targets: 1,
          render: function (data, type, full, meta) {
            var date = new Date(full.updatedAt);
            var formattedDate = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              time: 'numeric',
            });
            return '<span class="text-nowrap">' + formattedDate + '</span>';
          },
        },
        {
          targets: 2,
          render: function (data, type, full, meta) {
            return full.accessToken.name;
          },
        },
        {
          targets: 3,
          render: function (data, type, full, meta) {
            const formattedAmount = full.amount.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });

            return formattedAmount;
          },
        },
        {
          targets: 4,
          responsivePriority: 1,
          render: function (data, type, full, meta) {
            var $name = full.isUser ? full.user.name : full?.customerDetails?.name || '-',
              $number = full.isUser
                ? full.user.phoneNumber
                : full?.customerDetails?.email || full?.customerDetails?.phoneNumber || 0;

            if (full.isUser) {
              // For Avatar image
              var $output = '<img src="' + full.user.avatar + '" alt="Avatar" class="rounded-circle">';
            } else {
              // For Avatar badge
              var stateNum = Math.floor(Math.random() * 6);
              var states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
              var $state = states[stateNum],
                $initials = $name.match(/\b\w/g) || [],
                $initials = (($initials.shift() || '') + ($initials.pop() || '')).toUpperCase(),
                $output =
                  '<span class="avatar-initial rounded-circle bg-label-' + $state + '">' + $initials + '</span>';
            }

            var $row_output =
              '<div class="d-flex justify-content-start align-items-center order-name text-nowrap">' +
              '<div class="avatar-wrapper">' +
              '<div class="avatar avatar-sm me-3">' +
              $output +
              '</div>' +
              '</div>' +
              '<div class="d-flex flex-column">' +
              '<h6 class="m-0"><a href="pages-profile-user.html" class="text-heading">' +
              $name +
              '</a></h6>' +
              '<small>' +
              $number +
              '</small>' +
              '</div>' +
              '</div>';
            return $row_output;
          },
        },
        {
          targets: 5,
          render: function (data, type, full, meta) {
            // const logo =
            //   '<img src="' + assetsPath + 'img/icons/payments/' + $method + '.png" alt="' + $method + '" width="29">';
            return full.paymentMethod?.name || 'Default';
          },
        },
        {
          // Status
          targets: -2,
          render: function (data, type, full, meta) {
            var $status = full['status'];

            return (
              '<span class="badge px-2 ' +
              statusObj[$status].class +
              '" text-capitalized>' +
              statusObj[$status].title +
              '</span>'
            );
          },
        },
        {
          // Actions
          targets: -1,
          title: 'Actions',
          searchable: false,
          orderable: false,
          render: function (data, type, full, meta) {
            return (
              '<div class="d-flex justify-content-sm-start align-items-sm-center">' +
              '<button class="btn btn-icon btn-text-secondary waves-effect waves-light rounded-pill dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical"></i></button>' +
              '<div class="dropdown-menu dropdown-menu-end m-0">' +
              '<button class="dropdown-item edit-order" data-id="' +
              full._id +
              '"><i class="ti ti-edit"></i>Edit</button>' +
              '<button class="dropdown-item delete-order text-danger" data-id="' +
              full._id +
              '"><i class="ti ti-trash"></i>Delete</button>' +
              '</div>' +
              '</div>'
            );
          },
        },
      ],
      order: [3, 'asc'], //set any columns order asc/desc
      dom:
        '<"card-header py-0 d-flex flex-column flex-md-row align-items-center"<f><"d-flex align-items-center justify-content-md-end gap-2 justify-content-center"l<"dt-action-buttons"B>>' +
        '>t' +
        '<"row mx-1"' +
        '<"col-sm-12 col-md-6"i>' +
        '<"col-sm-12 col-md-6"p>' +
        '>',
      lengthMenu: [10, 40, 60, 80, 100], //for length of menu
      language: {
        sLengthMenu: '_MENU_',
        search: '',
        searchPlaceholder: 'Search Order',
        info: 'Displaying _START_ to _END_ of _TOTAL_ entries',
        paginate: {
          next: '<i class="ti ti-chevron-right ti-sm"></i>',
          previous: '<i class="ti ti-chevron-left ti-sm"></i>',
        },
      },
      // Buttons with Dropdown
      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-secondary dropdown-toggle waves-effect waves-light',
          text: '<i class="ti ti-upload ti-xs me-2"></i>Export',
          buttons: [
            {
              extend: 'print',
              text: '<i class="ti ti-printer me-2"></i>Print',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('order-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
                    });
                    return result;
                  },
                },
              },
              customize: function (win) {
                // Customize print view for dark
                $(win.document.body)
                  .css('color', headingColor)
                  .css('border-color', borderColor)
                  .css('background-color', bodyBg);
                $(win.document.body)
                  .find('table')
                  .addClass('compact')
                  .css('color', 'inherit')
                  .css('border-color', 'inherit')
                  .css('background-color', 'inherit');
              },
            },
            {
              extend: 'csv',
              text: '<i class="ti ti-file me-2"></i>Csv',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('order-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
                    });
                    return result;
                  },
                },
              },
            },
            {
              extend: 'excel',
              text: '<i class="ti ti-file-export me-2"></i>Excel',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('order-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
                    });
                    return result;
                  },
                },
              },
            },
            {
              extend: 'pdf',
              text: '<i class="ti ti-file-text me-2"></i>Pdf',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('order-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
                    });
                    return result;
                  },
                },
              },
            },
            {
              extend: 'copy',
              text: '<i class="ti ti-copy me-2"></i>Copy',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('order-name')) {
                        result = result + item.lastChild.firstChild.textContent;
                      } else if (item.innerText === undefined) {
                        result = result + item.textContent;
                      } else result = result + item.innerText;
                    });
                    return result;
                  },
                },
              },
            },
          ],
        },
      ],
      // For responsive popup
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Details of ' + data['customer'];
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
    $('.dataTables_length').addClass('ms-n2');
    $('.dt-action-buttons').addClass('pt-0');
    $('.dataTables_filter').addClass('ms-n3 mb-0 mb-md-6');
  }

  formOrder.submit(function (e) {
    e.preventDefault();

    formOrder.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?id=' + idOrder,
      type: 'PUT',
      data: formOrder.serialize(),
      success: function (res) {
        formOrder.unblock();
        formOrder[0].reset();
        $('#modalOrder').modal('hide');
        dataOrders.ajax.reload();

        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formOrder.unblock();
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

  function orderDetail(id) {
    $.get('?type=detail&id=' + id, function (res) {
      $('#amount').val(res.amount);
      $('#status').val(res.status);
      $('#token').val(res.token);
      $('#customerName').val(res?.customerDetails?.name || res?.user?.name);
      $('#customerEmail').val(res?.customerDetails?.email);
      $('#customerNumber').val(res?.customerDetails?.phoneNumber || res?.user?.phoneNumber);
      $('#customerAddress').val(res?.customerDetails?.address);
      $('#modalOrder').modal('show');
    });
  }

  $('.datatables-basic tbody').on('click', '.delete-order', function () {
    const $this = $(this);
    const id = $this.data('id');

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this order!',
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
            dataOrders.row($this.parents('tr')).remove().draw();
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
