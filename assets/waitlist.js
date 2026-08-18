(function () {
  var API_URL = 'https://staging.descubr.com/waitlist';

  var COPY = {
    en: {
      success: "You're on the list! We'll email you the moment DescubR launches.",
      error: 'Something went wrong. Please try again in a moment.',
    },
    es: {
      success: '¡Ya estás en la lista! Te avisaremos en cuanto DescubR esté disponible.',
      error: 'Algo ha fallado. Inténtalo de nuevo en un momento.',
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('[data-waitlist-form]');
    if (!form) return;

    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button[type="submit"]');
    var note = document.querySelector('.waitlist-note');

    var lang = document.documentElement.getAttribute('lang') === 'es' ? 'es' : 'en';
    var copy = COPY[lang];

    var showNote = function (text) {
      if (!note) return;
      note.textContent = text;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim();
      if (!email) return;

      button.disabled = true;

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          showNote(copy.success);
        })
        .catch(function () {
          showNote(copy.error);
        })
        .finally(function () {
          button.disabled = false;
        });
    });
  });
})();
