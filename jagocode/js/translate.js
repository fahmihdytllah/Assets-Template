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

$(document).ready(function () {
  const lang = getCookie('googtrans')?.split('/');
  const selectedLang = lang ? lang[2] : 'en';

  if (selectedLang !== 'en') {
    loadGoogleTranslateScript();
  }

  $('.dropdown-item[data-language="' + selectedLang + '"]').addClass('active');

  function loadGoogleTranslateScript() {
    var translateScript = document.createElement('script');
    translateScript.type = 'text/javascript';
    translateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(translateScript);
  }

  function setCookie(name, value, days) {
    let expires = '';
    let domain = window.location.hostname === 'localhost' ? '' : '; domain=.jagocode.id';

    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }

    document.cookie = name + '=' + value + expires + '; path=/' + domain;
  }

  function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
  }

  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
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
    let selectedLang = $(this).data('language');
    let textDirection = $(this).data('text-direction');

    directionChange(textDirection);
    setCookie('googtrans', '/en/' + selectedLang, 365);
    window.location.reload();
  });
});
