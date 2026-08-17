(function () {
  var COPY = {
    en: {
      subject: 'Waitlist signup',
      body: function (email) {
        return 'Please add ' + email + ' to the DescubR waitlist.';
      },
    },
    es: {
      subject: 'Alta en la lista de espera',
      body: function (email) {
        return 'Por favor, añade ' + email + ' a la lista de espera de DescubR.';
      },
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('[data-waitlist-form]');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]').value.trim();
      if (!email) return;

      var lang = document.documentElement.getAttribute('lang') === 'es' ? 'es' : 'en';
      var copy = COPY[lang];
      var mailto =
        'mailto:hello@descubr.com' +
        '?subject=' + encodeURIComponent(copy.subject) +
        '&body=' + encodeURIComponent(copy.body(email));
      window.location.href = mailto;
    });
  });
})();
