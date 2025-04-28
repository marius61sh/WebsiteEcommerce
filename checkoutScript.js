let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCartItems() {
    const orderItemsContainer = document.querySelector('.order-items');
    orderItemsContainer.innerHTML = '';

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const summaryHeader = document.createElement('p');
    
    if (totalItems === 1) {
        summaryHeader.textContent = `${totalItems} items in Cart`;
    }
    
    orderItemsContainer.appendChild(summaryHeader);

    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <img src="${item.image || 'Images/placeholder.jpg'}" alt="${item.name}">
            <div class="item-details">
                <p>${item.name}</p>
                <p>Qty: ${item.quantity} <span class="summary-price"> $${(item.price * item.quantity).toFixed(2)}</span></p>
            </div>
        `;

        orderItemsContainer.appendChild(orderItem);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM încărcat pentru checkout.html');
    renderCartItems();
});