function loadComponents() {
    return Promise.all([
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('header-container').innerHTML = data;
            }),
        fetch('footer.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('footer-container').innerHTML = data;
            })
    ]);
}

loadComponents()
    .then(() => {
        setupHeaderAndFooter();
    })
    .catch(error => console.error('Eroare la încărcarea componentelor:', error));

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupFilters();
    setupSortDropdown();
    setupItemsPerPageDropdown();
});