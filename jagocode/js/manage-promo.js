$(function () {
  let dataPromoTable = $('.datatables-basic'),
    formPromo = $('#formPromo'),
    dataPromo,
    idPromo = '0',
    mode = 'new';

  /** Inisialisasi Firebase */
  const firebaseConfig = {
    apiKey: 'AIzaSyClXd1AAB_Nzlm52X4GB7V9TR0Rv8YCu1w',
    authDomain: 'jago-code.firebaseapp.com',
    projectId: 'jago-code',
    storageBucket: 'jago-code.appspot.com',
    messagingSenderId: '733341114140',
    appId: '1:733341114140:web:aee7d8fd24e979e9bba4d9',
    measurementId: 'G-4CDRVEBPJD',
  };

  firebase.initializeApp(firebaseConfig);

  /** Referensi ke Firebase Storage */
  const storage = firebase.storage();

  const validFrom = $('#validFrom').flatpickr({
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
  });

  const validUntil = $('#validUntil').flatpickr({
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
  });

  $('#inputBanner').change(function (event) {
    const file = event.target.files[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      const storageRef = storage.ref().child('banners/' + file.name);
      const uploadTask = storageRef.put(file);

      reader.onload = function (e) {
        $('#previewBanner').attr('src', e.target.result).show();
      };
      reader.readAsDataURL(file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress: ' + progress + '%');
        },
        (error) => {
          console.error('Error uploading file: ', error);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            $('#banner').val(downloadURL);
          });
        }
      );
    } else {
      $('#previewBanner').hide();
    }
  });

  if (dataPromoTable.length) {
    let statusObj = {
      Ongoing: 'bg-label-warning',
      Completed: 'bg-label-success',
      Paused: 'bg-label-danger',
    };

    dataPromo = dataPromoTable.DataTable({
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
        { data: 'title' },
        { data: 'description' },
        { data: 'code' },
        { data: 'isActive' },
        { data: 'validFrom' },
        { data: 'validUntil' },
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
              full.banner +
              '" alt="' +
              full.title +
              '" class="rounded me-2 w-px-100">' +
              '<div class="d-flex flex-column">' +
              '<h6 class="text-nowrap mb-0">' +
              full.title +
              '</h6>' +
              '<small class="text-truncate d-none d-sm-block">Discount <strong>' +
              full.discountPercentage +
              '%</strong>';
            '</small>' + '</div>' + '</div>';

            return $row_output;
          },
        },
        {
          targets: 4,
          render: function (data, type, full, meta) {
            return (
              '<span class="badge ' +
              (full.isActive ? 'bg-label-success' : 'bg-label-danger') +
              '" text-capitalized>' +
              (full.isActive ? 'Active' : 'Non Active') +
              '</span>'
            );
          },
        },
        {
          targets: -3,
          render: function (data, type, full, meta) {
            const validFrom = new Date(full.validFrom).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return validFrom;
          },
        },
        {
          targets: -2,
          render: function (data, type, full, meta) {
            const validUntil = new Date(full.validUntil).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return validUntil;
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
              '<button class="btn btn-sm btn-edit btn-icon btn-text-secondary rounded-pill waves-effect waves-light" data-id="' +
              full._id +
              '"><i class="ti ti-edit ti-md"></i></button>' +
              '<button class="btn btn-sm btn-delete btn-icon btn-text-secondary rounded-pill waves-effect waves-light" data-id="' +
              full._id +
              '"><i class="ti ti-trash ti-md"></i></button>' +
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
          text: '<i class="ti ti-plus me-sm-1"></i> <span class="d-none d-sm-inline-block">New Promo</span>',
          className: 'create-new btn btn-primary waves-effect waves-light',
          action: function () {
            idPromo = '0';
            mode = 'new';

            $('#modalPromo').modal('show');
          },
        },
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Promo Details';
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
    $('div.head-label').html('<h5 class="card-title mb-0">Manage Promo</h5>');
  }

  formPromo.submit(function (e) {
    e.preventDefault();

    formPromo.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: formPromo.serialize(),
      url: '?id=' + idPromo,
      type: mode === 'new' ? 'POST' : 'PUT',
      success: function (d) {
        formPromo.unblock();
        formPromo[0].reset();
        dataPromo.ajax.reload();
        $('#modalPromo').modal('hide');

        Swal.fire({
          title: 'Good job!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false,
        });
      },
      error: function (e) {
        formPromo.unblock();
        const msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false,
        });
      },
    });
  });

  $('.datatables-basic tbody').on('click', '.btn-edit', function () {
    const id = $(this).data('id');

    idPromo = id;
    mode = 'edit';

    $.get('?type=detail&id=' + id, function (res) {
      $('#previewBanner').attr('src', res.banner);
      $('#banner').val(res.banner);
      $('#title').val(res.title);
      $('#description').val(res.description);
      $('#code').val(res.code);
      $('#discountPercentage').val(res.discountPercentage);
      $('#maxUsage').val(res.maxUsage);

      validFrom.setDate(res.validFrom);
      validUntil.setDate(res.validUntil);

      if (res.isActive) {
        $('#isActive').prop('checked', true);
      } else {
        $('#isActive').prop('checked', false);
      }

      $('#modalPromo').modal('show');
    });
  });

  $('.datatables-basic tbody').on('click', '.btn-delete', function () {
    const $this = $(this);
    const id = $this.data('id');

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this promo!',
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
            dataPromo.row($this.parents('tr')).remove().draw();
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
