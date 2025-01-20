'use strict';

/**
 * Third Party Access
 */

/**
thirdPartyAccess(provider, {
  onSuccess: () => {},
  onError: () => {},
});
 **/

const isBlockUI = typeof $.blockUI !== 'undefined' ? true : false;
const isToastr = typeof toastr !== 'undefined' ? true : false;
const BASE_URL = window.location.hostname?.includes('localhost')
  ? 'http://localhost:3005'
  : 'https://account.jagocode.id';

let LOCAL_PROVIDER = null;
let CALLBACK_FUNCTION = null;

window.addEventListener('message', function (event) {
  const origin = event.origin;

  if (origin === BASE_URL) {
    const { code } = event.data;

    if (code) {
      exchangeCode(code);
    }
  }
});

/**
 * Grant Access
 */
window.thirdPartyAccess = (provider, { onSuccess, onError }) => {
  if (!provider) {
    throw new Error('Provider is missing!');
  }

  if (typeof onSuccess !== 'function' || typeof onError !== 'function') {
    throw new Error('Callback not function!');
  }

  LOCAL_PROVIDER = provider;

  CALLBACK_FUNCTION = {
    onSuccess,
    onError,
  };

  grantAccess(provider);
};

/**
 * Remove Access
 */
window.thirdPartyRemoveAccess = (provider, { onSuccess, onError }) => {
  if (!provider) {
    throw new Error('Provider is missing!');
  }

  if (typeof onSuccess !== 'function' || typeof onError !== 'function') {
    throw new Error('Callback not function!');
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', BASE_URL + '/third-party/remove-access/' + provider);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.withCredentials = true;

  xhr.onload = () => {
    isBlockUI && $.unblockUI();

    if (xhr.status >= 200 && xhr.status < 300) {
      const result = JSON.parse(xhr.responseText);
      onSuccess(result);
    } else {
      const err = JSON.parse(xhr.responseText);
      onError(err);
    }
  };

  xhr.onerror = () => {
    isBlockUI && $.unblockUI();
    onError({ msg: 'Network error occurred!' });
  };

  xhr.send(JSON.stringify({ state: 'jagocode' }));
};

const grantAccess = (provider) => {
  const width = 500;
  const height = 600;

  const screenWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
  const screenHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;

  const left = (screenWidth - width) / 2 + window.screenX;
  const top = (screenHeight - height) / 2 + window.screenY;

  const popupWindow = window.open(
    BASE_URL + '/third-party/redirect/' + provider + '?origin=' + window.location.origin,
    'Third Party Access',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  );

  if (popupWindow) {
    popupWindow.focus();
  } else {
    alert('Popup blocked. Please allow popups for this website.');
  }
};

const exchangeCode = (code) => {
  isBlockUI &&
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

  const xhr = new XMLHttpRequest();
  xhr.open('POST', BASE_URL + '/third-party/exchange/' + LOCAL_PROVIDER);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.withCredentials = true;

  xhr.onload = () => {
    isBlockUI && $.unblockUI();

    if (xhr.status >= 200 && xhr.status < 300) {
      const result = JSON.parse(xhr.responseText);
      CALLBACK_FUNCTION.onSuccess(result);
    } else {
      const err = JSON.parse(xhr.responseText);
      CALLBACK_FUNCTION.onError(err);
    }
  };

  xhr.onerror = () => {
    isBlockUI && $.unblockUI();
    CALLBACK_FUNCTION.onError({ msg: 'Network error occurred!' });
  };

  xhr.send(JSON.stringify({ code }));
};

// const exchangeCode2 = (code) => {
//   $.blockUI({
//     message: elementLoader,
//     css: { backgroundColor: 'transparent', border: '0' },
//     overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
//   });

//   $.ajax({
//     url: BASE_URL + '/third-party/exchange/' + LOCAL_PROVIDER,
//     type: 'POST',
//     contentType: 'application/json',
//     data: JSON.stringify({ code }),
//     xhrFields: {
//       withCredentials: true,
//     },
//     success: function (res) {
//       $.unblockUI();
//       toastr.success(res.msg, 'Kabar baik!');
//       checkAccess(LOCAL_PROVIDER);
//     },
//     error: function (err) {
//       $.unblockUI();
//       const responseError = err.responseJSON?.msg;
//       const textError = responseError ? responseError : 'There is an error!';
//       toastr.error(textError, 'Kabar buruk!');
//     },
//   });
// };
