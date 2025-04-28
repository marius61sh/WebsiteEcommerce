let cart = [];
let savedCart = localStorage.getItem('cart');
if (savedCart) {
    cart = JSON.parse(savedCart);
}
if (!cart) {
    cart = [];
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
    let cartItemsContainer = document.querySelector('.cart-items');
    let cartSummary = document.querySelector('.summary-details');

    if (!cartItemsContainer || !cartSummary) {
        return;
    }

    cartItemsContainer.innerHTML = `
        <div class="cart-header">
            <span class="header-image"></span>
            <span class="header-item">Item</span>
            <span class="header-price">Price</span>
            <span class="header-quantity">Qty</span>
            <span class="header-subtotal">Subtotal</span>
            <span class="header-actions"></span>
        </div>
    `;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML += '<p>Coșul este gol.</p>';
        updateSummary();
        return;
    }

    for (let i = 0; i < cart.length; i++) {
        let item = cart[i];
        if (!item || !item.id || !item.name || !item.price) {
            continue;
        }

        let subtotal = item.price * item.quantity;
        subtotal = subtotal.toFixed(2);

        let cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image || 'Images/placeholder.jpg'}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <input type="number" id="quantity${i}" min="1" max="${item.stock || 999}" value="${item.quantity}">
                </div>
                <p>$${subtotal}</p>
                <div class="cart-item-actions">
                    <button class="edit-item"><i class="fa-solid fa-pencil"></i></button>
                    <button class="remove-item" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    }

    let quantityInputs = document.querySelectorAll('.cart-item-quantity input');
    for (let i = 0; i < quantityInputs.length; i++) {
        quantityInputs[i].onchange = function() {
            let newQuantity = Number(quantityInputs[i].value);
            let maxStock = cart[i].stock || 999;

            if (newQuantity > maxStock) {
                alert('Stoc maxim disponibil: ' + maxStock);
                quantityInputs[i].value = maxStock;
                cart[i].quantity = maxStock;
            } else if (newQuantity < 1) {
                quantityInputs[i].value = 1;
                cart[i].quantity = 1;
            } else {
                cart[i].quantity = newQuantity;
            }

            saveCart();
            renderCart();
        };
    }

    let removeButtons = document.querySelectorAll('.remove-item');
    for (let i = 0; i < removeButtons.length; i++) {
        removeButtons[i].onclick = function() {
            let productId = Number(removeButtons[i].getAttribute('data-id'));
            let newCart = [];
            for (let j = 0; j < cart.length; j++) {
                if (cart[j].id !== productId) {
                    newCart.push(cart[j]);
                }
            }
            cart = newCart;
            saveCart();
            renderCart();
        };
    }

    updateSummary();
}

function updateSummary() {
    let cartSummary = document.querySelector('.summary-details');
    if (!cartSummary) {
        return;
    }

    let subtotal = 0;
    for (let i = 0; i < cart.length; i++) {
        subtotal = subtotal + (cart[i].price * cart[i].quantity);
    }
    let tax = subtotal * 0.08;
    let total = subtotal + tax;

    cartSummary.innerHTML = `
        <p>Subtotal: <span>$${subtotal.toFixed(2)}</span></p>
        <p>Shipping: <span>TBD</span></p>
        <p>Tax: <span>$${tax.toFixed(2)}</span></p>
        <p class="total">Total: <span>$${total.toFixed(2)}</span></p>
    `;
}

function setupCartActions() {
    let clearCartButton = document.querySelector('.clear-cart');
    let continueShoppingButton = document.querySelector('.continue-shopping');

    if (clearCartButton) {
        clearCartButton.onclick = function() {
            cart = [];
            saveCart();
            renderCart();
        };
    }


    if (continueShoppingButton) {
        continueShoppingButton.onclick = function() {
            window.location.href = 'index.html';
        };
    }
}

function setupSearch() {
    let searchIcon = document.getElementById('search-toggle');
    let searchInput = document.getElementById('search-input');
    let dealsButton = document.getElementById('deals-button');

    if (!searchIcon || !searchInput || !dealsButton) {
        return;
    }

    searchIcon.onclick = function(event) {
        event.preventDefault();
        let isActive = searchInput.classList.contains('active');
        if (isActive) {
            searchInput.classList.remove('active');
            dealsButton.classList.remove('shrink');
            searchInput.value = '';
        } else {
            searchInput.classList.add('active');
            dealsButton.classList.add('shrink');
            searchInput.focus();
        }
    };


    searchInput.onkeydown = function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    };
}

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

function setupBurgerMenu() {
    let burger = document.querySelector('.burger-menu');
    let nav = document.querySelector('.nav-container');

    if (!burger || !nav) {
        return;
    }

    burger.onclick = function() {
        let isActive = nav.classList.contains('active');
        if (isActive) {
            nav.classList.remove('active');
            let icon = burger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            nav.classList.add('active');
            let icon = burger.querySelector('i');
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    };
}

function setupHeaderAndFooter() {
    setupSearch();
    setupBurgerMenu();
    setupTheme();
}

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    setupCartActions();
    setupHeaderAndFooter();
});