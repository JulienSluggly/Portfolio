const langSwitch = document.getElementById('lang-switch');
const darkModeToggle = document.getElementById('dark-mode-toggle');
let lang = localStorage.getItem('lang') || 'fr';
const langFile = `lang/${lang}.json`;

document.documentElement.lang = lang;
loadLanguage(langFile);

langSwitch.addEventListener('click', () => {
    lang = lang === 'en' ? 'fr' : 'en';
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    loadLanguage(`lang/${lang}.json`);
    langSwitch.textContent = lang === 'en' ? 'Français' : 'English';
});

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('dark-mode');
    });
    document.querySelectorAll('header, button, nav ul li').forEach(element => {
        element.classList.toggle('dark-mode');
    });
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    if (lang === 'en') { darkModeToggle.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode'; }
    else if (lang === 'fr') {  darkModeToggle.textContent = isDarkMode ? 'Mode Clair' : 'Mode Sombre'; }
   
});

function loadLanguage(file) {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            document.querySelectorAll('[data-key]').forEach(element => {
                const key = element.getAttribute('data-key');
                element.innerHTML = data[key];
            });
        })
        .catch(error => {
            console.error('Error loading language file:', error);
        });
}

var currentSection = 'about-me-page';

document.getElementById('about-me-li').addEventListener('click', () => {
    showSection('about-me-page');
});
document.getElementById('studies-li').addEventListener('click', () => {
    showSection('studies-page');
});
document.getElementById('academic-projects-li').addEventListener('click', () => {
    showSection('academic-projects-page');
});
document.getElementById('personal-projects-li').addEventListener('click', () => {
    showSection('personal-projects-page');
});

function showSection(section) {
    document.getElementById(currentSection).style.display = "none";
    document.getElementById(section).style.display = "block";
    currentSection = section;
    updateNavHighlight(section);
}

function updateNavHighlight(section) {
    document.querySelectorAll('nav ul li').forEach(li => {
        li.classList.remove('active');
    });
    document.getElementById(section.replace('-page', '-li')).classList.add('active');
}

// Initial call to display the first section and set active class
showSection(currentSection);

// Check localStorage for dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('dark-mode');
    });
    document.querySelectorAll('header, button, nav ul li').forEach(element => {
        element.classList.add('dark-mode');
    });
    if (lang === 'en') { darkModeToggle.textContent = 'Light Mode'; }
    else if (lang === 'fr') {  darkModeToggle.textContent = 'Mode Clair'; }
}
