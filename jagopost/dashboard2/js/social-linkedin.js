$(function () {
  let dataPostsTable = $('.datatables-basic'),
    dataPosts,
    formSetting = $('#formSetting'),
    formAddPost = $('#formAddPost')

  $('.btn-login').click(function () {
    window.location.href = '/oauth/linkedin_grant_access'
  })

  $('.btn-logout').click(function () {
    Swal.fire({ text: 'Are you sure you want to log out of your Facebook account?', icon: 'warning', showCancelButton: !0, confirmButtonText: 'Yes', customClass: { confirmButton: 'btn btn-primary me-2', cancelButton: 'btn btn-label-secondary' }, buttonsStyling: !1 }).then(function (e) {
      if (e.value) {
        window.location.href = '/oauth/logout/linkedin'
      }
    })
  })

  formSetting.submit(function (e) {
    e.preventDefault()
    formSetting.block({ message: elementLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } })
    $.ajax({
      data: $(this).serialize(),
      url: $(this).attr('action'),
      type: 'PUT',
      success: function (d) {
        formSetting.unblock()
        $('#modalSetting').modal('hide')
        Swal.fire({ title: 'Good job!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
      },
      error: function (e) {
        formSetting.unblock()
        const msg = e.responseJSON?.msg
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
      }
    })
  })

  formAddPost.submit(function (e) {
    e.preventDefault()
    formAddPost.block({ message: elementLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } })
    $.ajax({
      data: $(this).serialize(),
      url: $(this).attr('action'),
      type: 'POST',
      success: function (d) {
        formAddPost.unblock()
        formAddPost[0].reset()
        $('#addPost').modal('hide')
        Swal.fire({ title: 'Good job!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 }).then(() => dataPosts.ajax.reload())
      },
      error: function (e) {
        formAddPost.unblock()
        const msg = e.responseJSON?.msg
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
      }
    })
  })

  $(document).on('click', '.btn-delete', function () {
    const $this = $(this)

    Swal.fire({ text: 'Do you want to delete this post?', icon: 'warning', showCancelButton: !0, confirmButtonText: 'Yes', customClass: { confirmButton: 'btn btn-primary me-2', cancelButton: 'btn btn-label-secondary' }, buttonsStyling: !1 }).then(function (e) {
      if (e.value) {
        $.blockUI({ message: elementLoader, css: { backgroundColor: 'transparent', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } })
        $.ajax({
          url: 'linkedin/' + $this.data('id'),
          type: 'DELETE',
          success: function (d) {
            $.unblockUI()
            Swal.fire({ title: 'Good job!', text: d.msg, icon: 'success', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 }).then(() => {
              dataPosts.row($this.parents('tr')).remove().draw()
            })
          },
          error: function (e) {
            $.unblockUI()
            const msg = e.responseJSON?.msg
            Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
          }
        })
      }
    })
  })
})
