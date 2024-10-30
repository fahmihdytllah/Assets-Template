$(function () {
  let formTools = $('#formTools'),
    dt_basic_table = $('.datatables-basic'),
    dt_basic,
    isLoaded = false

  formTools.submit(function (e) {
    e.preventDefault()

    formTools.block({ message: elementLoader, css: { backgroundColor: 'transparent', color: '#fff', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } })

    $.ajax({
      data: $(this).serialize(),
      url: '?',
      type: 'POST',
      success: function (res) {
        formTools.unblock()
        loadDataTable(res.data)
        $('#result').show()
        Swal.fire({ title: 'Good job!', text: 'Successfully retrieved Backlink data', icon: 'success', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
      },
      error: function (e) {
        formTools.unblock()
        const msg = e.responseJSON.msg
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
      }
    })
  })

  function loadDataTable(data) {
    if (dt_basic_table.length) {
      dt_basic = dt_basic_table.DataTable({
        data,
        columns: [{ data: '' }, { data: 'anchor' }, { data: 'source.da' }, { data: 'source.pa' }, { data: 'nofollow' }, { data: 'source.url' }, { data: 'date' }],
        columnDefs: [
          {
            // For Responsive
            className: 'control',
            orderable: false,
            searchable: false,
            responsivePriority: 2,
            targets: 0,
            render: function (data, type, full, meta) {
              return ''
            }
          },
          { responsivePriority: 1, targets: 1 },
          {
            targets: 2,
            render: function (data, type, full, meta) {
              return `<span class='badge bg-label-info me-1'>${full.source.da}</span>`
            }
          },
          {
            targets: 3,
            render: function (data, type, full, meta) {
              return `<span class='badge bg-label-info me-1'>${full.source.pa}</span>`
            }
          },
          {
            targets: 4,
            render: function (data, type, full, meta) {
              return `<span class='badge bg-label-${full.nofollow ? 'secondary' : 'primary'} me-1'>${full.nofollow ? 'NoFollow' : 'DoFollow'}</span>`
            }
          },
          {
            targets: -2,
            orderable: false,
            searchable: false,
            render: function (data, type, full, meta) {
              return `${full.source.title} \n<a href='http://${full.source.url}' target='_blank'>${full.source.url}</a>`
            }
          }
        ],
        order: [[2, 'desc']],
        dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
        displayLength: 7,
        lengthMenu: [7, 10, 25, 50, 75, 100],
        buttons: [
          {
            extend: 'collection',
            className: 'btn btn-label-primary dropdown-toggle me-2 waves-effect waves-light',
            text: '<i class="ti ti-file-export me-sm-1"></i> <span class="d-none d-sm-inline-block">Export</span>',
            buttons: [
              {
                extend: 'print',
                text: '<i class="ti ti-printer me-1" ></i>Print',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [3, 4, 5, 6, 7]
                },
                customize: function (win) {
                  //customize print view for dark
                  $(win.document.body).css('color', config.colors.headingColor).css('border-color', config.colors.borderColor).css('background-color', config.colors.bodyBg)
                  $(win.document.body).find('table').addClass('compact').css('color', 'inherit').css('border-color', 'inherit').css('background-color', 'inherit')
                }
              },
              {
                extend: 'csv',
                text: '<i class="ti ti-file-text me-1" ></i>Csv',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [3, 4, 5, 6, 7]
                }
              },
              {
                extend: 'excel',
                text: '<i class="ti ti-file-spreadsheet me-1"></i>Excel',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [3, 4, 5, 6, 7]
                }
              },
              {
                extend: 'pdf',
                text: '<i class="ti ti-file-description me-1"></i>Pdf',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [3, 4, 5, 6, 7]
                }
              },
              {
                extend: 'copy',
                text: '<i class="ti ti-copy me-1" ></i>Copy',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [3, 4, 5, 6, 7]
                }
              }
            ]
          }
        ],
        responsive: {
          details: {
            display: $.fn.dataTable.Responsive.display.modal({
              header: function (row) {
                var data = row.data()
                return 'Details Backlink'
              }
            }),
            type: 'column',
            renderer: function (api, rowIdx, columns) {
              var data = $.map(columns, function (col, i) {
                return col.title !== '' // ? Do not show row in modal popup if title is blank (for check box)
                  ? '<tr data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' + '<td>' + col.title + ':' + '</td> ' + '<td>' + col.data + '</td>' + '</tr>'
                  : ''
              }).join('')

              return data ? $('<table class="table"/><tbody />').append(data) : false
            }
          }
        }
      })
      $('div.head-label').html('<h5 class="card-title mb-0">Result list Backlink</h5>')
    }

    // Filter form control to default size
    // ? setTimeout used for multilingual table initialization
    setTimeout(() => {
      $('.dataTables_filter .form-control').removeClass('form-control-sm')
      $('.dataTables_length .form-select').removeClass('form-select-sm')
    }, 300)
  }
})
