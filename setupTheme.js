function setupTheme() {
    let button = document.querySelector('.theme-toggle');
    let headerRight = document.querySelector('.header-right');

    if (!button && headerRight) {
        button = document.createElement('button');
        button.innerHTML = '<i class="fa-solid fa-moon"></i>';
        button.className = 'theme-toggle';
        headerRight.appendChild(button);
    }

    if (!button) {
        setTimeout(setupTheme, 100);
        return;
    }

    let theme = localStorage.getItem('theme');
    if (!theme) {
        theme = 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);
    let icon = button.querySelector('i');
    if (theme === 'light') {
        icon.className = 'fa-solid fa-moon';
    } else {
        icon.className = 'fa-solid fa-sun';
    }

    button.onclick = function() {
        let currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = 'light';
        if (currentTheme === 'light') {
            newTheme = 'dark';
        }

        button.classList.add('changing');
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        setTimeout(function() {
            if (newTheme === 'light') {
                icon.className = 'fa-solid fa-moon';
            } else {
                icon.className = 'fa-solid fa-sun';
            }
            button.classList.remove('changing');
        }, 300);
    };
}

document.addEventListener('DOMContentLoaded', function() {
    setupTheme();
});