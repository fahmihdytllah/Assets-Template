'use strict';

const socket = io('/third-party');
const elUserId = $('#userId');
const elPhoneCode = $('#phoneCode');
const elPhoneNumber = $('#phoneNumber');

let ps = null;
let method = 'number';

document.addEventListener('DOMContentLoaded', function () {
  (function () {
    const scrollbBar = document.querySelector('#list-logs');

    if (scrollbBar) {
      ps = new PerfectScrollbar(scrollbBar, {
        wheelPropagation: false,
      });
    }

    socket.on('connect', () => {
      setTimeout(() => {
        socket.emit('joinRoom', {
          userId: elUserId.val(),
          phoneCode: elPhoneCode.val(),
          phoneNumber: elPhoneNumber.val(),
        });
      }, 1000);
    });
  })();
});

$(function () {
  const alertLogged = $('#alertLogged');
  const alertSync = $('#alertSync');
  const btnSubmit = $('.btn-submit');
  const canvasPairingCode = $('#canvasPairingCode');
  const canvasSyncProgress = $('#canvasSyncProgress');
  const canvasEventLog = $('#canvasEventLog');
  const elCountdown = $('#countdown');
  const eventLogs = $('#list-logs');
  const formAccess = $('#formAccess');
  const inputPairingCode = $('#pairingCode');
  const syncProgress = $('#syncProgress');

  $('#grantMethod button[data-bs-toggle="tab"]').on('shown.bs.tab', function (event) {
    method = $(event.target).data('method');

    if (method === 'number') {
      canvasEventLog.hide();
    } else {
      eventLogs.empty();
      canvasEventLog.show();
    }
  });

  socket.on('responseQRCode', (data) => {
    const canvasQRCode = document.getElementById('canvasQRCode');

    if (data?.QRCode) {
      $('#preloadQRCode').hide();

      canvasQRCode.innerHTML = '';

      new QRCode(canvasQRCode, {
        text: data.QRCode,
        width: 260,
        height: 260,
        logo: 'https://assets.jagocode.my.id/jagocode/img/brand-logo/whatsapp.svg',
        logoWidth: 60,
        logoHeight: 60,
        logoBackgroundTransparent: true,
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
  });

  socket.on('responsePairingCode', ({ statusCode, pairingCode, messsage }) => {
    formAccess.unblock();

    if (statusCode === 200) {
      btnSubmit.prop('disabled', true);

      startCountdown(3, elCountdown, () => {
        btnSubmit.prop('disabled', false);
        elCountdown.hide();
      });

      inputPairingCode.val(pairingCode);

      eventLogs.empty();
      canvasEventLog.show();

      btnSubmit.hide();
      canvasPairingCode.show();
    } else if (statusCode === 500) {
      toastr.error(messsage, 'Bad News!');
      btnSubmit.show();
      canvasPairingCode.hide();
      canvasEventLog.hide();
    }
  });

  socket.on('connectedWhatsapp', ({ status }) => {
    if (status) {
      alertLogged.show();
      canvasEventLog.show();
      formAccess.hide();
      toastr.success('Successfully Connected...', 'Good News!');
    }
  });

  socket.on('responseAuthorizationCode', ({ code }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');

    setTimeout(() => {
      window.opener.postMessage({ code }, state);
      window.close();
    }, 1000);
  });

  socket.on('syncProgress', ({ progress }) => {
    alertSync.show();
    canvasSyncProgress.show();

    if (progress) {
      syncProgress.css('width', progress + '%');
    }

    if (progress === 100) {
      alertSync.hide();
    }
  });

  socket.on('eventLogs', (data) => {
    const { statusCode } = data;

    if (statusCode === 500) {
      setTimeout(() => {
        alertLogged.hide();
        btnSubmit.show();
        canvasEventLog.hide();
        eventLogs.empty();
        formAccess.show();
      }, 3000);
    }

    if (
      statusCode === 500 ||
      statusCode === 400 ||
      statusCode === 200 ||
      statusCode === 202 ||
      (statusCode === 201 && method === 'qr')
    ) {
      displayLog(data);
    }
  });

  $(document).on('click', '#copyCode', function () {
    const pairingCode = inputPairingCode.val();
    copyText(pairingCode);
  });

  formAccess.on('submit', function (e) {
    e.preventDefault();

    formAccess.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    socket.emit('requestPairingCode', {
      userId: elUserId.val(),
      phoneCode: elPhoneCode.val(),
      phoneNumber: elPhoneNumber.val(),
    });
  });

  function displayLog({ statusCode, message }) {
    const colorsStatus = {
      200: 'text-success',
      201: 'text-info',
      202: 'text-info',
      400: 'text-warning',
      500: 'text-danger',
    };

    const newLog = $(
      '<li class="list-group-item">' + '<strong>' + getFormattedLocalTime() + ': </strong>' + message + '</li>'
    );

    const newLog2 = $(
      '<li class="list-group-item">' +
        '<strong>' +
        getFormattedLocalTime() +
        ': </strong><span class="' +
        colorsStatus[statusCode] +
        '">' +
        message +
        '</span></li>'
    );

    eventLogs.append(newLog);
    const scrollHeight = eventLogs.scrollHeight;
    $(eventLogs).scrollTop(scrollHeight);
    ps?.update();
  }

  const copyText = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toastr.success('Code was copied successfully ', 'Good News!'))
      .catch(() => console.log('Gagal mengcopy!'));
  };

  function getFormattedLocalTime() {
    const now = new Date();

    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${month}/${day}/${year} ${hours}:${minutes}`;
  }

  function startCountdown(durationInMinutes, displayElement, callback) {
    displayElement.show();
    let seconds = durationInMinutes * 60;
    const countdown = setInterval(() => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      displayElement.text(`${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`);

      seconds--;

      if (seconds < 0) {
        clearInterval(countdown);
        if (typeof callback === 'function') {
          callback();
        }
      }
    }, 1000);
  }
});
