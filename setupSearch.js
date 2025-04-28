let currentSearch = '';

function searchProducts() {
    let searchInput = document.getElementById('search-input');
    if (!searchInput) {
        return;
    }
    let searchText = searchInput.value.toLowerCase().trim();
    currentSearch = searchText;
    applyFilters();
    showPage(1);
}

function setupSearch() {
    let searchIcon = document.getElementById('search-toggle');
    let searchInput = document.getElementById('search-input');
    let dealsButton = document.getElementById('deals-button');

    if (!searchIcon || !searchInput || !dealsButton) {
        setTimeout(setupSearch, 100);
        return;
    }

    searchIcon.onclick = function(event) {
        event.preventDefault();
        let isActive = searchInput.classList.contains('active');
        if (isActive) {
            searchInput.classList.remove('active');
            dealsButton.classList.remove('shrink');
            searchInput.value = '';
            currentSearch = '';
            applyFilters();
            showPage(1);
        } else {
            searchInput.classList.add('active');
            dealsButton.classList.add('shrink');
            searchInput.focus();
        }
    };

    searchInput.oninput = function() {
        searchProducts();
    };

    searchInput.onkeydown = function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchProducts();
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    setupSearch();
});