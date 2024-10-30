/** Token generate from server */
const token = 'NWZjM2Q0NWItZGIxMi00NGEwLTk3ZGMtN2Q3YWRmMjcyZDAwOjY3MjIyMDYzMzg3ZTliMzAyY2VhMWI3Mg==';
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
