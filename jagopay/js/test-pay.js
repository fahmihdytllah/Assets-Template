/** Token generate from server */
const token = 'ZTYyNWVjNzUtNGY4Zi00ZDQ1LWI3OTgtZDZkOWFiOWUwZWI4OjY3MjFhNmE1YjAyZTFhMWQ5ZTQwYTkxZQ==';
const btnTry = document.querySelector('.btn-try');

btnTry.addEventListener('click', function (e) {
  JagoPay(token, {
    onSuccess: function (data) {
      console.log(data);
      Swal.fire('Tanks!', 'Pembayaran anda berhasil, melalui ' + data.paymentMethod.name, 'success');
    },
    onPending: function (data) {
      console.log(data);
      Swal.fire('Info!', data.msg, 'info');
    },
    onError: function (data) {
      console.log(data);
      Swal.fire('Opss!', data.msg, 'error');
    },
    onClose: function (data) {
      console.log(data);
      Swal.fire('Warn!', `Popup payment di tutup!`, 'warning');
    },
  });
});
