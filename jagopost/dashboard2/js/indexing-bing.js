$(function () {
  let formIndexing = $('#formIndexing'),
    select2 = $('.select2')

  if (select2) {
    select2.each(function () {
      var e = $(this)
      e.wrap('<div class="position-relative"></div>').select2({ placeholder: 'Select value', dropdownParent: e.parent() })
    })
  }

  $('.btn-login').click(function () {
    window.location.href = '/oauth/microsoft_grant_access'
  })

  $('.btn-logout').click(function () {
    Swal.fire({ text: 'Are you sure you want to log out of your Bing account?', icon: 'warning', showCancelButton: !0, confirmButtonText: 'Yes', customClass: { confirmButton: 'btn btn-primary me-2', cancelButton: 'btn btn-label-secondary' }, buttonsStyling: !1 }).then(function (e) {
      if (e.value) {
        window.location.href = '/oauth/logout/microsoft'
      }
    })
  })

  formIndexing.submit(function (e) {
    e.preventDefault()
    formIndexing.block({ message: elementLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } })
    $.ajax({
      data: $(this).serialize(),
      url: $(this).attr('action'),
      type: 'POST',
      success: function (d) {
        formIndexing.unblock()
        formIndexing[0].reset()
        Swal.fire({ title: 'Good job!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
      },
      error: function (e) {
        formIndexing.unblock()
        const msg = e.responseJSON?.msg
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
      }
    })
  })
})
