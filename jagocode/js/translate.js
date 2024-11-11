function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: 'ar,bn,en,fr,de,id,jw,es',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
    },
    'google_translate_element'
  );
}

function setCookie(name, value, days, domain) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = '; expires=' + date.toUTCString();

  document.cookie = name + '=' + value + expires + '; path=/' + (domain ? '; domain=' + domain : '') + ';';
}

function getCookie(name) {
  const nameEQ = name + '=';
  const cookiesArray = document.cookie.split(';');
  for (let i = 0; i < cookiesArray.length; i++) {
    let cookie = cookiesArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

function deleteCookies() {
  const domains = [window.location.hostname, '.' + window.location.hostname.split('.').slice(-2).join('.')];

  domains.forEach((domain) => {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
  });
}

$(document).ready(function () {
  const preferredLanguage = getCookie('googtrans');

  if (preferredLanguage) {
    const getLang = preferredLanguage.split('/');
    const selectedLang = getLang ? getLang[2] : 'en';

    if (selectedLang !== 'en') {
      loadGoogleTranslateScript();
    }

    $('.dropdown-item[data-language="' + selectedLang + '"]').addClass('active');
  } else {
    $('.dropdown-item[data-language="en"]').addClass('active');
  }

  function loadGoogleTranslateScript() {
    var translateScript = document.createElement('script');
    translateScript.type = 'text/javascript';
    translateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(translateScript);
  }

  function directionChange(textDirection) {
    if (textDirection === 'rtl') {
      if (localStorage.getItem('templateCustomizer-' + templateName + '--Rtl') !== 'true')
        window.templateCustomizer ? window.templateCustomizer.setRtl(true) : '';
    } else {
      if (localStorage.getItem('templateCustomizer-' + templateName + '--Rtl') === 'true')
        window.templateCustomizer ? window.templateCustomizer.setRtl(false) : '';
    }
  }

  $('.dropdown-language .dropdown-item').on('click', function () {
    const selectedLang = $(this).data('language');
    const textDirection = $(this).data('text-direction');
    const cookiesLang = '/en/' + selectedLang;

    setCookie('googtrans', cookiesLang, 360);
    setCookie('googtrans', cookiesLang, 360, '.jagocode.id');

    directionChange(textDirection);

    if (selectedLang === 'en') {
      deleteCookies();
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', selectedLang);

    window.location.href = currentUrl.toString();
  });
});
