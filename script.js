document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 2. Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust scroll position for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 3. Scroll Reveal Animation (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.hidden');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            // Add visible class to trigger transition
            entry.target.classList.add('visible');
            // Stop observing once revealed
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // --- 4. Mobile Menu Toggle ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Very basic toggle logic
    mobileBtn.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'var(--glass-bg)';
            navLinks.style.padding = '1rem 0';
            navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';

            // Quick style fix for links in mobile
            const links = navLinks.querySelectorAll('li');
            links.forEach(li => {
                li.style.margin = '1rem 0';
                li.style.textAlign = 'center';
            });
        }
    });

    // --- 5. Gallery Auto Slider (Hiển thị nhiều mục) ---
    const track = document.querySelector('.gallery-track');
    const cards = Array.from(track.children);
    const dotsContainer = document.querySelector('.slider-dots');

    if (cards.length > 0) {
        let currentIndex = 0;
        let visibleCards = getVisibleCards();
        let maxIndex = Math.max(0, cards.length - visibleCards);

        // Lấy số card hiển thị dựa trên màn hình (theo CSS)
        function getVisibleCards() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 992) return 2;
            return 3;
        }
        
        // Tạo dấu chấm
        function renderDots() {
            dotsContainer.innerHTML = '';
            for (let i = 0; i <= maxIndex; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        renderDots();

        // Theo dõi thay đổi màn hình để cập nhật số biến
        window.addEventListener('resize', () => {
            const newVisible = getVisibleCards();
            if (newVisible !== visibleCards) {
                visibleCards = newVisible;
                maxIndex = Math.max(0, cards.length - visibleCards);
                if (currentIndex > maxIndex) currentIndex = maxIndex;
                renderDots();
                updateSlider();
            }
        });

        function updateSlider() {
            // Gap đang setup trong CSS là 30px
            const gap = 30;
            const cardWidth = cards[0].offsetWidth;
            const moveAmount = cardWidth + gap;

            track.style.transform = `translateX(-${currentIndex * moveAmount}px)`;

            // Xóa và thêm class active
            const dots = Array.from(dotsContainer.children);
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[currentIndex]) {
                dots[currentIndex].classList.add('active');
            }
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
            resetInterval();
        }

        function nextSlide() {
            currentIndex++;
            if (currentIndex > maxIndex) {
                currentIndex = 0; // Quay về đầu nếu tới cuối
            }
            updateSlider();
        }

        // Chạy tự động mỗi 5 giây
        let slideInterval = setInterval(nextSlide, 5000);

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        }
    }
});

// === E-COMMERCE LOGIC ===

// 1. Cart State Management
let cart = JSON.parse(localStorage.getItem('hueRacingCart')) || [];

function saveCart() {
    localStorage.setItem('hueRacingCart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge-count');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        // Simple pop animation
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
}

// 2. Toast Notification
function showToast(title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <div class="toast-message">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 3. Add to Cart Logic
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    // Filter Logic for products.html
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Add to cart buttons (both small and large)
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn, .add-to-cart-large');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            const img = this.getAttribute('data-img');

            // For detail page, might have a quantity input
            const qtyInput = document.getElementById('qtyInput');
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

            addToCart(id, name, price, img, quantity);
        });
    });
});

function addToCart(id, name, price, imgClass, quantity = 1) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, name, price, imgClass, quantity });
    }

    saveCart();
    showToast('Thành công', `Đã thêm ${name} vào giỏ hàng.`);
}

// 4. Cart Page Rendering
function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('cart-empty-message');
    const content = document.getElementById('cart-content');

    if (!container) return;

    if (cart.length === 0) {
        emptyMsg.style.display = 'block';
        content.style.display = 'none';
        return;
    }

    emptyMsg.style.display = 'none';
    content.style.display = 'flex';
    container.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <div class="cart-product-info">
                <div class="cart-product-img ${item.imgClass}"></div>
                <div class="cart-product-title">${item.name}</div>
            </div>
            <div class="cart-price">${formatPrice(item.price)}</div>
            <div class="cart-qty">
                <div class="quantity-selector">
                    <button type="button" class="qty-btn" onclick="updateCartItemQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                    <input type="text" value="${item.quantity}" readonly>
                    <button type="button" class="qty-btn" onclick="updateCartItemQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
            <div class="cart-total-price">${formatPrice(itemTotal)}</div>
            <div class="cart-action">
                <button class="remove-btn" onclick="removeFromCart('${item.id}')"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
        container.appendChild(row);
    });

    document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('summary-total').textContent = formatPrice(subtotal);
}

function updateCartItemQty(id, change) {
    const itemInfo = cart.find(i => i.id === id);
    if (itemInfo) {
        itemInfo.quantity += change;
        if (itemInfo.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            renderCartPage();
        }
    }
}

function removeFromCart(id) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCartPage();
    }
}

// 5. Checkout Page Rendering
function renderCheckoutPage() {
    const container = document.getElementById('checkout-order-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p style="color:#666; text-align:center;">Giỏ hàng trống.</p>';
        document.getElementById('place-order-btn').disabled = true;
        return;
    }

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'checkout-item-small';
        itemEl.innerHTML = `
            <div class="checkout-item-img ${item.imgClass}"></div>
            <div class="checkout-item-info">
                <div class="checkout-item-name">${item.name}</div>
                <div class="checkout-item-qty">Số lượng: ${item.quantity}</div>
            </div>
            <div class="checkout-item-price">${formatPrice(item.price * item.quantity)}</div>
        `;
        container.appendChild(itemEl);
    });

    document.getElementById('checkout-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('checkout-total').textContent = formatPrice(subtotal);
}

// Utility
function formatPrice(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}
