$(function () {
  const formTools = $('#formTools'),
    maxlengthInput = $('.text-maxlength'),
    select2 = $('.select2'),
    clipboardList = [].slice.call(document.querySelectorAll('.clipboard-btn'))

  if (maxlengthInput.length) {
    maxlengthInput.each(function () {
      $(this).maxlength({
        warningClass: 'label label-success bg-success text-white',
        limitReachedClass: 'label label-danger',
        separator: ' out of ',
        preText: 'You typed ',
        postText: ' chars available.',
        validate: true,
        threshold: +this.getAttribute('maxlength')
      })
    })
  }

  if (select2.length) {
    select2.each(function () {
      var $this = $(this)
      $this.wrap('<div class="position-relative"></div>').select2({
        placeholder: 'Select language',
        dropdownParent: $this.parent()
      })
    })
  }

  if (ClipboardJS) {
    clipboardList.map(function (clipboardEl) {
      const clipboard = new ClipboardJS(clipboardEl)
      clipboard.on('success', function (e) {
        if (e.action == 'copy') {
          Swal.fire({ text: 'Copied to Clipboard!!', icon: 'success', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
        }
      })
    })
  } else {
    clipboardList.map(function (clipboardEl) {
      clipboardEl.setAttribute('disabled', true)
    })
  }

  formTools.submit(function (e) {
    e.preventDefault()

    formTools.block({ message: elementLoader, css: { backgroundColor: 'transparent', color: '#fff', border: '0' }, overlayCSS: { backgroundColor: '#fff', opacity: 0.8 } })

    $.ajax({
      data: $(this).serialize(),
      url: '?',
      type: 'POST',
      success: function (res) {
        formTools.unblock()
        $('#myResult').val('')
        $('#myResult').val(res.content)
        $('#result').show()
        Swal.fire({ title: 'Good job!', text: 'Successfully translated content', icon: 'success', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
      },
      error: function (e) {
        formTools.unblock()
        const msg = e.responseJSON?.msg
        Swal.fire({ title: 'Upss!', text: msg ? msg : 'There is an error!', icon: 'error', customClass: { confirmButton: 'btn btn-primary' }, buttonsStyling: !1 })
      }
    })
  })
})
