$(function () {
  $('#selectPlatform').change(function () {
    if ($(this).val() === 'blogger') {
      $('.btn-login-blogger').show()
      $('.btn-login-wordpress').hide()
    } else {
      $('.btn-login-blogger').hide()
      $('.btn-login-wordpress').show()
    }
  })

  $.get('?type=json', function (res) {
    if (res.isLogged) {
      $('#selectPlatform').prop('disabled', true)
      if (res.platform === 'blogger') {
        $('.btn-logout-blogger').show()
      } else {
        $('.btn-logout-wordpress').show()
      }
    } else {
      $('.btn-login-blogger').show()
    }
  })
})
