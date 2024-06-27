const langSwitch = document.getElementById('lang-switch');
const lang = localStorage.getItem('lang') || 'en';
const langFile = `lang/${lang}.json`;

document.documentElement.lang = lang;
loadLanguage(langFile);

langSwitch.addEventListener('click', () => {
    const newLang = lang === 'en' ? 'fr' : 'en';
    localStorage.setItem('lang', newLang);
    document.documentElement.lang = newLang;
    loadLanguage(`lang/${newLang}.json`);
    langSwitch.textContent = newLang === 'en' ? 'Français' : 'English';
});

function loadLanguage(file) {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            document.querySelectorAll('[data-key]').forEach(element => {
                const key = element.getAttribute('data-key');
                element.textContent = data[key];
            });
        });
}
