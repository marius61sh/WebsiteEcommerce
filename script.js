let productsPerPage = 20;
const productsBox = document.querySelector('.products');
const paginationBox = document.querySelector('.pagination');
let allProducts = [];
let shownProducts = [];
let currentPage = 1;
let filters = { category: null, price: null, color: null };
let currentSort = 'relevance';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let reviews = JSON.parse(localStorage.getItem('reviews')) || [];

function saveReviews() {
    localStorage.setItem('reviews', JSON.stringify(reviews));
}

function loadProducts() {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            shownProducts = allProducts.slice();
            showPage(1);
            updateWishlistDisplay();
        });
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function addToCart(productId) {
    let product = null;
    for (let i = 0; i < allProducts.length; i++) {
        if (allProducts[i].id === productId) {
            product = allProducts[i];
            break;
        }
    }
    if (product === null) return;

    let cartItem = null;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id === productId) {
            cartItem = cart[i];
            break;
        }
    }

    if (cartItem !== null) {
        cartItem.quantity = cartItem.quantity + 1;
    } else {
        let price = product.discountedPrice;
        if (price === undefined) price = product.originalPrice;
        cart.push({
            id: product.id,
            name: product.name,
            image: product.image || 'Images/placeholder.jpg',
            price: price,
            quantity: 1,
            stock: product.stock
        });
    }
    saveCart();
}

function addToWishlist(productId) {
    let product = null;
    for (let i = 0; i < allProducts.length; i++) {
        if (allProducts[i].id === productId) {
            product = allProducts[i];
            break;
        }
    }
    if (product === null) return;

    for (let i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id === productId) return;
    }

    let price = product.discountedPrice;
    if (price === undefined) price = product.originalPrice;
    wishlist.push({
        id: product.id,
        name: product.name,
        image: product.image || 'Images/placeholder.jpg',
        price: price,
        stock: product.stock
    });
    saveWishlist();
    updateWishlistDisplay();
}

function removeFromWishlist(productId) {
    let newWishlist = [];
    for (let i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id !== productId) {
            newWishlist.push(wishlist[i]);
        }
    }
    wishlist = newWishlist;
    saveWishlist();
    updateWishlistDisplay();
}

function updateWishlistDisplay() {
    const wishlistContainer = document.querySelector('.wish-list');
    wishlistContainer.innerHTML = '<h3>My Wish List</h3>';

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML += '<p>Nu sunt produse in wishlist.</p>';
        return;
    }

    let ul = document.createElement('ul');
    ul.className = 'wishlist-items';
    for (let i = 0; i < wishlist.length; i++) {
        let item = wishlist[i];
        let li = document.createElement('li');
        li.className = 'wishlist-item';
        let name = item.name;
        if (name.length > 20) name = name.substring(0, 17) + '...';
        li.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 5px;">
            <span>${name}</span>
            <span style="margin-left: 10px">$${item.price.toFixed(2)}</span>
            <button class="remove-wishlist-item" data-id="${item.id}">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        ul.appendChild(li);

        li.onclick = function(e) {
            if (e.target.className !== 'remove-wishlist-item' && e.target.tagName !== 'I') {
                let product = null;
                for (let j = 0; j < allProducts.length; j++) {
                    if (allProducts[j].id === item.id) {
                        product = allProducts[j];
                        break;
                    }
                }
                if (product !== null) showProductPopup(product);
            }
        };
    }
    wishlistContainer.appendChild(ul);

    let buttons = document.querySelectorAll('.remove-wishlist-item');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function() {
            let productId = Number(buttons[i].getAttribute('data-id'));
            removeFromWishlist(productId);
        };
    }
}

function showProductPopup(product) {
    let popup = document.createElement('div');
    popup.className = 'product-popup';
    let popupContent = document.createElement('div');
    popupContent.className = 'popup-content';

    let rating = product.rating || 0;
    let stars = '';
    for (let i = 0; i < Math.floor(rating); i++) stars += '★';
    for (let i = Math.floor(rating); i < 5; i++) stars += '☆';

    let stockText = 'In Stoc: ' + product.stock + ' bucati';
    let stockClass = '';
    if (product.stock === 0) {
        stockText = 'Stoc Indisponibil';
        stockClass = 'out-of-stock';
    }

    let image = product.image || 'Images/placeholder.jpg';
    let name = product.name || 'Produs';
    let productReviews = [];
    for (let i = 0; i < reviews.length; i++) {
        if (reviews[i].productId === product.id) productReviews.push(reviews[i]);
    }
    let reviewsCount = '(' + productReviews.length + ')';
    let price = product.discountedPrice || product.originalPrice;
    let priceHtml = '<span class="discounted-price">$' + price.toFixed(2) + '</span>';
    if (product.originalPrice && product.discountedPrice && product.originalPrice > product.discountedPrice) {
        priceHtml = '<span class="original-price">$' + product.originalPrice.toFixed(2) + '</span>' + priceHtml;
    }
    let description = product.description || 'No description available.';

    let isInWishlist = false;
    for (let i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id === product.id) {
            isInWishlist = true;
            break;
        }
    }
    let wishlistButtonText = '<i class="fa-solid fa-heart"></i> Add to Wishlist';
    if (isInWishlist) wishlistButtonText = '<i class="fa-solid fa-heart"></i> Remove from Wishlist';

    let reviewsHtml = '<p>No reviews yet.</p>';
    if (productReviews.length > 0) {
        reviewsHtml = '<ul class="reviews-list">';
        let maxReviews = productReviews.length > 3 ? 3 : productReviews.length;
        for (let i = 0; i < maxReviews; i++) {
            let review = productReviews[i];
            let reviewStars = '';
            for (let j = 0; j < review.rating; j++) reviewStars += '★';
            for (let j = review.rating; j < 5; j++) reviewStars += '☆';
            reviewsHtml += `
                <li class="review-item">
                    <span class="review-stars">${reviewStars}</span>
                    <p>${review.comment}</p>
                </li>
            `;
        }
        reviewsHtml += '</ul>';
        if (productReviews.length > 3) {
            reviewsHtml += '<button class="show-more-reviews" data-id="' + product.id + '">Show More</button>';
        }
    }

    popupContent.innerHTML = `
        <button class="popup-close"><i class="fa-solid fa-times"></i></button>
        <div class="popup-image">
            <img src="${image}" alt="${name}">
        </div>
        <div class="popup-details">
            <h2>${name}</h2>
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="reviews">${reviewsCount}</span>
            </div>
            <div class="product-price">${priceHtml}</div>
            <span class="stock-status ${stockClass}">${stockText}</span>
            <p class="popup-description">${description}</p>
            <div class="popup-buttons">
                <button class="btn-cart popup-btn-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn-wishlist popup-btn-wishlist" data-id="${product.id}">
                    ${wishlistButtonText}
                </button>
            </div>
            <div class="review-form">
                <h3>Add a Review</h3>
                <div class="rating-select">
                    <label>Rating:</label>
                    <select id="review-rating">
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                    </select>
                </div>
                <div class="comment-input">
                    <label>Comment:</label>
                    <textarea id="review-comment" rows="4"></textarea>
                </div>
                <button class="submit-review" data-id="${product.id}">Submit Review</button>
            </div>
            <div class="reviews-section">
                <h3>Reviews</h3>
                ${reviewsHtml}
            </div>
        </div>
    `;

    popup.appendChild(popupContent);
    document.body.appendChild(popup);

    popupContent.querySelector('.popup-close').onclick = function() {
        popup.remove();
    };
    popup.onclick = function(e) {
        if (e.target === popup) popup.remove();
    };
    document.addEventListener('keydown', function closeOnEscape(event) {
        if (event.key === 'Escape') {
            popup.remove();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });

    popupContent.querySelector('.popup-btn-cart').onclick = function() {
        let productId = Number(popupContent.querySelector('.popup-btn-cart').getAttribute('data-id'));
        addToCart(productId);
        popup.remove();
    };

    popupContent.querySelector('.popup-btn-wishlist').onclick = function() {
        let productId = Number(popupContent.querySelector('.popup-btn-wishlist').getAttribute('data-id'));
        if (isInWishlist) {
            removeFromWishlist(productId);
            popupContent.querySelector('.popup-btn-wishlist').innerHTML = '<i class="fa-solid fa-heart"></i> Add to Wishlist';
        } else {
            addToWishlist(productId);
            popupContent.querySelector('.popup-btn-wishlist').innerHTML = '<i class="fa-solid fa-heart"></i> Remove from Wishlist';
        }
    };

    popupContent.querySelector('.submit-review').onclick = function() {
        let productId = Number(popupContent.querySelector('.submit-review').getAttribute('data-id'));
        let rating = Number(document.getElementById('review-rating').value);
        let comment = document.getElementById('review-comment').value.trim();

        reviews.push({ productId: productId, rating: rating, comment: comment });
        saveReviews();
        updateProductRating(productId);
        let product = null;
        for (let i = 0; i < allProducts.length; i++) {
            if (allProducts[i].id === productId) {
                product = allProducts[i];
                break;
            }
        }
        if (product === null) return;
    
         rating = product.rating || 0;
        let stars = '';
        for (let i = 0; i < Math.floor(rating); i++) stars += '★';
        for (let i = Math.floor(rating); i < 5; i++) stars += '☆';
    
        let productReviews = [];
        for (let i = 0; i < reviews.length; i++) {
            if (reviews[i].productId === product.id) productReviews.push(reviews[i]);
        }
        let reviewsCount = '(' + productReviews.length + ')';
        let reviewsHtml = '<p>No reviews yet.</p>';
        if (productReviews.length > 0) {
            reviewsHtml = '<ul class="reviews-list">';
            let maxReviews = productReviews.length > 3 ? 3 : productReviews.length;
            for (let i = 0; i < maxReviews; i++) {
                let review = productReviews[i];
                let reviewStars = '';
                for (let j = 0; j < review.rating; j++) reviewStars += '★';
                for (let j = review.rating; j < 5; j++) reviewStars += '☆';
                reviewsHtml += `
                    <li class="review-item">
                        <span class="review-stars">${reviewStars}</span>
                        <p>${review.comment}</p>
                    </li>
                `;
            }
            reviewsHtml += '</ul>';
            if (productReviews.length > 3) {
                reviewsHtml += '<button class="show-more-reviews" data-id="' + product.id + '">Show More</button>';
            }
        }
    
        let ratingElement = popupContent.querySelector('.product-rating');
        ratingElement.innerHTML = `<span class="stars">${stars}</span><span class="reviews">${reviewsCount}</span>`;
        let reviewsSection = popupContent.querySelector('.reviews-section');
        reviewsSection.innerHTML = '<h3>Reviews</h3>' + reviewsHtml;
    
        document.getElementById('review-rating').value = '1';
        document.getElementById('review-comment').value = '';
    
        let showMoreButton = reviewsSection.querySelector('.show-more-reviews');
        if (showMoreButton) {
            showMoreButton.onclick = function() {
                let fullReviewsHtml = '<ul class="reviews-list">';
                for (let i = 0; i < productReviews.length; i++) {
                    let review = productReviews[i];
                    let reviewStars = '';
                    for (let j = 0; j < review.rating; j++) reviewStars += '★';
                    for (let j = review.rating; j < 5; j++) reviewStars += '☆';
                    fullReviewsHtml += `
                        <li class="review-item">
                            <span class="review-stars">${reviewStars}</span>
                            <p>${review.comment}</p>
                        </li>
                    `;
                }
                fullReviewsHtml += '</ul>';
                reviewsSection.innerHTML = '<h3>Reviews</h3>' + fullReviewsHtml;
            };
        }
    };

    let showMoreButton = popupContent.querySelector('.show-more-reviews');
    if (showMoreButton) {
        showMoreButton.onclick = function() {
            let reviewsHtml = '<ul class="reviews-list">';
            for (let i = 0; i < productReviews.length; i++) {
                let review = productReviews[i];
                let reviewStars = '';
                for (let j = 0; j < review.rating; j++) reviewStars += '★';
                for (let j = review.rating; j < 5; j++) reviewStars += '☆';
                reviewsHtml += `
                    <li class="review-item">
                        <span class="review-stars">${reviewStars}</span>
                        <p>${review.comment}</p>
                    </li>
                `;
            }
            reviewsHtml += '</ul>';
            popupContent.querySelector('.reviews-section').innerHTML = '<h3>Reviews</h3>' + reviewsHtml;
        };
    }
}

function updateProductRating(productId) {
    let productReviews = [];
    for (let i = 0; i < reviews.length; i++) {
        if (reviews[i].productId === productId) productReviews.push(reviews[i]);
    }

    let totalRating = 0;
    for (let i = 0; i < productReviews.length; i++) {
        totalRating += productReviews[i].rating;
    }

    let averageRating = productReviews.length > 0 ? totalRating / productReviews.length : 0;
    for (let i = 0; i < allProducts.length; i++) {
        if (allProducts[i].id === productId) {
            allProducts[i].rating = averageRating;
            allProducts[i].reviews = productReviews.length;
            break;
        }
    }
    if (currentPage > 0) showPage(currentPage);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

function showProducts(page) {
    productsBox.innerHTML = '';
    let start = (page - 1) * productsPerPage;
    let end = start + productsPerPage;
    let productsToShow = shownProducts.slice(start, end);

    if (productsToShow.length === 0) {
        productsBox.innerHTML = '<p>Nu sunt produse.</p>';
        return;
    }

    for (let i = 0; i < productsToShow.length; i++) {
        let product = productsToShow[i];
        let card = document.createElement('div');
        card.className = 'product-card';

        let rating = product.rating || 0;
        let stars = '';
        for (let j = 0; j < Math.floor(rating); j++) stars += '★';
        for (let j = Math.floor(rating); j < 5; j++) stars += '☆';

        let reviews = '(' + (product.reviews || 0) + ')';
        let stockText = product.stock > 0 ? 'In Stoc' : 'Stoc Indisponibil';
        let stockClass = product.stock === 0 ? 'out-of-stock' : '';
        if (product.stock === 0) card.className += ' unavailable';

        let image = product.image || 'Images/placeholder.jpg';
        let name = product.name || 'Produs';
        let truncatedName = truncateText(name, 35);
        let price = product.discountedPrice || product.originalPrice;
        let priceHtml = '<span class="discounted-price">$' + price.toFixed(2) + '</span>';
        if (product.originalPrice && product.discountedPrice && product.originalPrice > product.discountedPrice) {
            priceHtml = '<span class="original-price">$' + product.originalPrice.toFixed(2) + '</span>' + priceHtml;
        }

        let isInWishlist = false;
        for (let j = 0; j < wishlist.length; j++) {
            if (wishlist[j].id === product.id) {
                isInWishlist = true;
                break;
            }
        }
        let wishlistButtonIcon = isInWishlist ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';

        card.innerHTML = `
            <span class="stock-status top ${stockClass}">${stockText}</span>
            <div class="img-background">
                <img src="${image}" alt="${name}">
            </div>
            <div class="product-rating">
                <span class="stars">${stars}</span>
                <span class="reviews">${reviews}</span>
            </div>
            <h3 class="product-name">${truncatedName}</h3>
            <div class="product-card-bottom">
                <div class="product-price">${priceHtml}</div>
                <div class="product-cart-container">
                    <button class="btn-wishlist" data-id="${product.id}">${wishlistButtonIcon}</button>
                    <button class="btn-cart" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        productsBox.appendChild(card);

        card.onclick = function(e) {
            if (e.target.closest('.btn-cart') || e.target.closest('.btn-wishlist')) return;
            showProductPopup(product);
        };
    }

    let wishlistButtons = document.querySelectorAll('.btn-wishlist');
    for (let i = 0; i < wishlistButtons.length; i++) {
        wishlistButtons[i].onclick = function(e) {
            e.stopPropagation();
            let productId = Number(wishlistButtons[i].getAttribute('data-id'));
            let isInWishlist = false;
            for (let j = 0; j < wishlist.length; j++) {
                if (wishlist[j].id === productId) {
                    isInWishlist = true;
                    break;
                }
            }
            if (isInWishlist) {
                removeFromWishlist(productId);
                wishlistButtons[i].innerHTML = '<i class="fa-regular fa-heart"></i>';
            } else {
                addToWishlist(productId);
                wishlistButtons[i].innerHTML = '<i class="fa-solid fa-heart"></i>';
            }
        };
    }

    let cartButtons = document.querySelectorAll('.btn-cart');
    for (let i = 0; i < cartButtons.length; i++) {
        cartButtons[i].onclick = function(e) {
            e.stopPropagation();
            let productId = Number(cartButtons[i].getAttribute('data-id'));
            addToCart(productId);
            let icon = cartButtons[i].querySelector('i');
            icon.classList.remove('fa-cart-plus');
            icon.classList.add('fa-check');
            cartButtons[i].classList.add('animate-cart');
            setTimeout(function() {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-cart-plus');
                cartButtons[i].classList.remove('animate-cart');
            }, 1000);
        };
    }
}

function showPagination(page) {
    paginationBox.innerHTML = '';
    let totalPages = Math.ceil(shownProducts.length / productsPerPage);

    let prev = document.createElement('a');
    prev.className = 'arrow prev';
    prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prev.href = '#';
    prev.onclick = function(e) {
        e.preventDefault();
        if (page > 1) showPage(page - 1);
    };
    paginationBox.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        let pageLink = document.createElement('a');
        pageLink.className = 'page-number';
        if (i === page) pageLink.className += ' active';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.onclick = function(e) {
            e.preventDefault();
            showPage(i);
        };
        paginationBox.appendChild(pageLink);
    }

    let next = document.createElement('a');
    next.className = 'arrow next';
    next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    next.href = '#';
    next.onclick = function(e) {
        e.preventDefault();
        if (page < totalPages) showPage(page + 1);
    };
    paginationBox.appendChild(next);
}

function showPage(page) {
    currentPage = page;
    showProducts(page);
    showPagination(page);
}

function setupFilters() {
    let categories = document.querySelectorAll('.category-list li');
    for (let i = 0; i < categories.length; i++) {
        categories[i].onclick = function() {
            let category = categories[i].getAttribute('data-category');
            if (filters.category === category) {
                filters.category = null;
                categories[i].classList.remove('active');
            } else {
                filters.category = category;
                for (let j = 0; j < categories.length; j++) categories[j].classList.remove('active');
                categories[i].classList.add('active');
            }
            showSelectedFilters();
            applyFilters();
            showPage(1);
        };
    }

    let prices = document.querySelectorAll('.price-list li');
    for (let i = 0; i < prices.length; i++) {
        prices[i].onclick = function() {
            let price = prices[i].getAttribute('data-price-range');
            if (filters.price === price) {
                filters.price = null;
                prices[i].classList.remove('active');
            } else {
                filters.price = price;
                for (let j = 0; j < prices.length; j++) prices[j].classList.remove('active');
                prices[i].classList.add('active');
            }
            showSelectedFilters();
            applyFilters();
            showPage(1);
        };
    }

    let colors = document.querySelectorAll('.color-circle');
    for (let i = 0; i < colors.length; i++) {
        colors[i].onclick = function() {
            let color = colors[i].style.backgroundColor;
            if (filters.color === color) {
                filters.color = null;
                colors[i].classList.remove('active');
            } else {
                filters.color = color;
                for (let j = 0; j < colors.length; j++) colors[j].classList.remove('active');
                colors[i].classList.add('active');
            }
            showSelectedFilters();
            applyFilters();
            showPage(1);
        };
    }

    document.querySelector('.btn-apply-filters').onclick = function() {
        applyFilters();
        showPage(1);
    };

    document.querySelector('.btn-clear-filter').onclick = function() {
        filters.category = null;
        filters.price = null;
        filters.color = null;
        showSelectedFilters();
        applyFilters();
        showPage(1);
        let allItems = document.querySelectorAll('.category-list li, .price-list li, .color-circle');
        for (let i = 0; i < allItems.length; i++) allItems[i].classList.remove('active');
    };
}

function applyFilters() {
    shownProducts = allProducts.slice();

    if (currentSearch !== '') {
        let newProducts = [];
        for (let i = 0; i < shownProducts.length; i++) {
            let productName = shownProducts[i].name || '';
            if (productName.toLowerCase().indexOf(currentSearch.toLowerCase()) !== -1) {
                newProducts.push(shownProducts[i]);
            }
        }
        shownProducts = newProducts;
    }

    if (filters.category !== null) {
        let newProducts = [];
        for (let i = 0; i < shownProducts.length; i++) {
            if (shownProducts[i].category && shownProducts[i].category.toLowerCase() === filters.category) {
                newProducts.push(shownProducts[i]);
            }
        }
        shownProducts = newProducts;
    }

    if (filters.price !== null) {
        let range = filters.price.split('-');
        let minPrice = Number(range[0]);
        let maxPrice = range[1] ? Number(range[1]) : 999999;
        let newProducts = [];
        for (let i = 0; i < shownProducts.length; i++) {
            let price = shownProducts[i].discountedPrice || shownProducts[i].originalPrice;
            if (price >= minPrice && price <= maxPrice) newProducts.push(shownProducts[i]);
        }
        shownProducts = newProducts;
    }

    if (filters.color !== null) {
        let newProducts = [];
        for (let i = 0; i < shownProducts.length; i++) {
            if (shownProducts[i].color && shownProducts[i].color === filters.color) {
                newProducts.push(shownProducts[i]);
            }
        }
        shownProducts = newProducts;
    }

    if (currentSort === 'price-asc') {
        for (let i = 0; i < shownProducts.length - 1; i++) {
            for (let j = i + 1; j < shownProducts.length; j++) {
                let price1 = shownProducts[i].discountedPrice || shownProducts[i].originalPrice;
                let price2 = shownProducts[j].discountedPrice || shownProducts[j].originalPrice;
                if (price1 > price2) {
                    let temp = shownProducts[i];
                    shownProducts[i] = shownProducts[j];
                    shownProducts[j] = temp;
                }
            }
        }
    } else if (currentSort === 'price-desc') {
        for (let i = 0; i < shownProducts.length - 1; i++) {
            for (let j = i + 1; j < shownProducts.length; j++) {
                let price1 = shownProducts[i].discountedPrice || shownProducts[i].originalPrice;
                let price2 = shownProducts[j].discountedPrice || shownProducts[j].originalPrice;
                if (price1 < price2) {
                    let temp = shownProducts[i];
                    shownProducts[i] = shownProducts[j];
                    shownProducts[j] = temp;
                }
            }
        }
    } else if (currentSort === 'name') {
        for (let i = 0; i < shownProducts.length - 1; i++) {
            for (let j = i + 1; j < shownProducts.length; j++) {
                let name1 = shownProducts[i].name || '';
                let name2 = shownProducts[j].name || '';
                if (name1.toLowerCase() > name2.toLowerCase()) {
                    let temp = shownProducts[i];
                    shownProducts[i] = shownProducts[j];
                    shownProducts[j] = temp;
                }
            }
        }
    }
}

function showSelectedFilters() {
    let filterList = document.getElementById('selected-filters-list');
    filterList.innerHTML = '';

    if (filters.category !== null) {
        let li = document.createElement('li');
        li.textContent = 'Categorie: ' + filters.category;
        let remove = document.createElement('span');
        remove.textContent = '×';
        remove.className = 'remove-filter';
        remove.onclick = function() {
            filters.category = null;
            let item = document.querySelector('.category-list li[data-category="' + filters.category + '"]');
            if (item) item.classList.remove('active');
            showSelectedFilters();
            applyFilters();
            showPage(1);
        };
        li.appendChild(remove);
        filterList.appendChild(li);
    }

    if (filters.price !== null) {
        let li = document.createElement('li');
        li.textContent = 'Preț: $' + filters.price.replace('-', ' - $');
        let remove = document.createElement('span');
        remove.textContent = '×';
        remove.className = 'remove-filter';
        remove.onclick = function() {
            filters.price = null;
            let item = document.querySelector('.price-list li[data-price-range="' + filters.price + '"]');
            if (item) item.classList.remove('active');
            showSelectedFilters();
            applyFilters();
            showPage(1);
        };
        li.appendChild(remove);
        filterList.appendChild(li);
    }

    if (filters.color !== null) {
        let li = document.createElement('li');
        li.textContent = 'Culoare: ' + filters.color;
        let remove = document.createElement('span');
        remove.textContent = '×';
        remove.className = 'remove-filter';
        remove.onclick = function() {
            filters.color = null;
            let circles = document.querySelectorAll('.color-circle');
            for (let i = 0; i < circles.length; i++) {
                if (circles[i].style.backgroundColor === filters.color) circles[i].classList.remove('active');
            }
            showSelectedFilters();
            applyFilters();
            showPage(1);
        };
        li.appendChild(remove);
        filterList.appendChild(li);
    }
}

function setupBurgerMenu() {
    function trySetup() {
        let burger = document.querySelector('.burger-menu');
        let nav = document.querySelector('.nav-container');
        
        if (!burger || !nav) {
            // Dacă elementele nu sunt găsite, reîncearcă după 100ms
            setTimeout(trySetup, 100);
            return;
        }

        burger.onclick = function() {
            nav.classList.toggle('active');
            let icon = burger.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        };
    }

    trySetup();
}
function setupSortDropdown() {
    let sortDropdown = document.querySelector('.sort-dropdown');
    sortDropdown.onchange = function() {
        currentSort = sortDropdown.value;
        applyFilters();
        showPage(1);
    };
}

function setupItemsPerPageDropdown() {
    let itemsDropdown = document.querySelector('.items-per-page-dropdown');
    itemsDropdown.onchange = function() {
        productsPerPage = Number(itemsDropdown.value);
        showPage(1);
    };
}

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupBurgerMenu();
    setupFilters();
    setupSortDropdown();
    setupItemsPerPageDropdown();
});