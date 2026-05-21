let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Migrar carrito antiguo (items sin qty) al nuevo formato
cart = cart.reduce((acc, item) => {
    if (!item.qty) item.qty = 1;
    const existing = acc.find(i => i.name === item.name);
    if (existing) {
        existing.qty += item.qty;
    } else {
        acc.push({ name: item.name, price: item.price, qty: item.qty });
    }
    return acc;
}, []);
localStorage.setItem("cart", JSON.stringify(cart));

// Historial de ventas (con datos de prueba por defecto si no existe)
const defaultCompletedOrders = [
    {
        id: "PAYID-DEMO98273",
        customerName: "Camila Restrepo",
        customerEmail: "camila@example.com",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
            { name: "Cocina Integral Nova", price: 1200000, qty: 1 },
            { name: "Mesa de Noche Ébano", price: 280000, qty: 2 }
        ],
        total: 1760000,
        gateway: "PayPal"
    },
    {
        id: "PAYID-DEMO48102",
        customerName: "Juan Fernando Hoyos",
        customerEmail: "juan.hoyos@example.com",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
            { name: "Closet Walk-In", price: 850000, qty: 1 },
            { name: "Escritorio Ejecutivo Aura", price: 550000, qty: 1 }
        ],
        total: 1400000,
        gateway: "PayPal"
    },
    {
        id: "PAYID-DEMO33918",
        customerName: "Mariana Velez",
        customerEmail: "mariana.v@example.com",
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        items: [
            { name: "Mueble Lavamanos Onix", price: 850000, qty: 1 }
        ],
        total: 850000,
        gateway: "Simulador"
    }
];

let completedOrders = JSON.parse(localStorage.getItem("completedOrders"));
if (!completedOrders) {
    completedOrders = defaultCompletedOrders;
    localStorage.setItem("completedOrders", JSON.stringify(completedOrders));
}

// Procesar una orden completada (deducir stock, registrar orden, mostrar recibo, actualizar UI)
function processCompletedOrder(customerName, customerEmail, itemsList, totalPaid, gateway) {
    const randomId = "PAYID-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Deducir stock para cada artículo de la orden
    itemsList.forEach(item => {
        if (productStock[item.name] !== undefined) {
            productStock[item.name] = Math.max(0, productStock[item.name] - item.qty);
        }
    });
    localStorage.setItem('productStock', JSON.stringify(productStock));
    
    const newOrder = {
        id: randomId,
        customerName: customerName,
        customerEmail: customerEmail,
        date: new Date().toISOString(),
        items: itemsList,
        total: totalPaid,
        gateway: gateway
    };
    
    completedOrders.unshift(newOrder);
    localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
    
    // Mostrar recibo visual de éxito
    showSuccessReceipt(newOrder);
    
    // Actualizar badges de stock en el catálogo y UI del carrito
    updateStockBadges();
    updateCartUI();
    
    // Actualizar estadísticas del dashboard si la pestaña está activa
    const activeTab = document.querySelector('.active-admin-tab');
    if (activeTab && activeTab.id === 'tabBtn_estadisticas') {
        updateKPIs();
        renderChartsLogic();
    }
}

// Stock inicial por defecto
const defaultStock = {
    'Cocina Integral Nova': 5,
    'Closet Walk-In': 8,
    'Escritorio Ejecutivo Aura': 10,
    'Mesa de noche Ébano': 15,
    'Escritorio Personal Altis': 10,
    'Closet Corredizo Vetra': 6,
    'Cocina Moderna Lúmina': 4,
    'Mueble Lavamanos Onix': 7,
    'Closet Prisma': 6,
    'Mesa de noche Zenit': 12,
    'Closet Aureo': 5,
    'Cocina Integral Velaris': 4,
    'Escritorio Gamer Calix': 8,
    'Closet Eterna': 6,
    'Mesa de Noche Arlet': 14,
    'Mesa de Noche Zafiro': 14,
    'Mueble Lavamanos Kael': 7,
    'Mueble Lavamanos Vion': 10,
    'Centro Entretenimiento Narel': 3,
    'Centro Entretenimiento Isen': 5,
    'Centro Entretenimiento Kaia': 5,
    'Centro Entretenimiento Umbra': 4,
    'Centro Entretenimiento Nero': 4,
    'Centro de Entretenimiento Titan': 3,
    'Tocador Eclipse': 6,
    // Productos del index.html
    'Cocina Moderna': 5,
    'Escritorio Ejecutivo': 10,
    'Mesa de noche Moderna': 15,
    'Escritorio Personal': 10,
    'Closet Corredizo': 6,
};

// Cargar stock desde localStorage o usar el por defecto
let productStock = JSON.parse(localStorage.getItem('productStock'));
if (!productStock) {
    productStock = defaultStock;
    localStorage.setItem('productStock', JSON.stringify(productStock));
}

// Obtener stock de un producto
function getStock(productName) {
    return productStock[productName] || 99;
}

// Obtener cantidad actual en carrito de un producto
function getCartQty(productName) {
    const item = cart.find(i => i.name === productName);
    return item ? item.qty : 0;
}

// Agregar producto (agrupa por nombre, respeta stock)
function addToCart(productName, price = 0) {
    const stock = getStock(productName);
    const currentQty = getCartQty(productName);

    if (currentQty >= stock) {
        showToast(`⚠️ Stock máximo alcanzado para "${productName}" (${stock} unidades)`);
        return;
    }

    const existing = cart.find(item => item.name === productName);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name: productName, price: price, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    updateStockBadges();
    showToast(`✅ "${productName}" agregado al carrito`);
}

// Incrementar cantidad
function incrementQty(productName) {
    const stock = getStock(productName);
    const item = cart.find(i => i.name === productName);

    if (!item) return;

    if (item.qty >= stock) {
        showToast(`⚠️ Stock máximo alcanzado (${stock} unidades)`);
        return;
    }

    item.qty += 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    updateStockBadges();
}

// Decrementar cantidad
function decrementQty(productName) {
    const item = cart.find(i => i.name === productName);
    if (!item) return;

    if (item.qty <= 1) {
        // Eliminar del carrito
        cart = cart.filter(i => i.name !== productName);
    } else {
        item.qty -= 1;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    updateStockBadges();
}

// Actualizar UI carrito
function updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    // Protección: si no existen los elementos, salir
    if (!cartCount || !cartItems || !cartTotal) return;

    // Contar total de artículos
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p class='text-gray-500'>Tu carrito está vacío</p>";
    } else {
        cart.forEach((item, index) => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            const stock = getStock(item.name);
            const isMaxStock = item.qty >= stock;

            cartItems.innerHTML += `
                <div class="cart-item-card border-b pb-3 mb-3">
                    <div class="flex justify-between items-start">
                        <div class="flex-1 pr-2">
                            <p class="font-semibold text-sm text-[#333]">${item.name}</p>
                            <p class="text-xs text-gray-500">$${item.price.toLocaleString()} c/u</p>
                        </div>
                        <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600 transition text-sm" title="Eliminar">
                            ✕
                        </button>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <div class="flex items-center gap-2">
                            <button onclick="decrementQty('${item.name.replace(/'/g, "\\'")}')" 
                                class="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold transition">
                                −
                            </button>
                            <span class="font-semibold text-sm w-6 text-center">${item.qty}</span>
                            <button onclick="incrementQty('${item.name.replace(/'/g, "\\'")}')" 
                                class="w-7 h-7 rounded-full ${isMaxStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#856146] text-white hover:bg-[#6b4e38]'} flex items-center justify-center text-sm font-bold transition"
                                ${isMaxStock ? 'disabled' : ''}>
                                +
                            </button>
                        </div>
                        <span class="font-bold text-[#2F4C45] text-sm">$${subtotal.toLocaleString()}</span>
                    </div>
                    ${isMaxStock ? '<p class="text-xs text-orange-500 mt-1">⚠️ Stock máximo</p>' : `<p class="text-xs text-gray-400 mt-1">${stock - item.qty} disponible(s)</p>`}
                </div>
            `;
        });
    }

    cartTotal.textContent = "$" + total.toLocaleString();
}

// Eliminar producto completo del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    updateStockBadges();
}

// Vaciar carrito
function clearCart() {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    updateStockBadges();
}

// =========================
// PASARELA DE PAGOS (PAYPAL)
// =========================

// Tasa de cambio aproximada COP -> USD (PayPal no acepta COP)
const TASA_CAMBIO = 4000; 

function initPayPalButtons() {
    if (!document.getElementById('paypal-button-container')) return;
    if (window.paypalButtonsRendered) return;

    paypal.Buttons({
        style: {
            layout: 'vertical',
            color:  'gold',
            shape:  'rect',
            label:  'paypal'
        },

        // Se ejecuta cuando el usuario hace clic en el botón
        createOrder: function(data, actions) {
            if (cart.length === 0) {
                showToast("El carrito está vacío");
                return;
            }

            // Calcular total en COP
            const totalCOP = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            // Convertir a USD y redondear a 2 decimales
            const totalUSD = (totalCOP / TASA_CAMBIO).toFixed(2);

            return actions.order.create({
                purchase_units: [{
                    description: "Compra Habitek Studio",
                    amount: {
                        currency_code: "USD",
                        value: totalUSD
                    }
                }]
            });
        },

        // Se ejecuta cuando se completa el pago
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                const customerName = ((details.payer.name.given_name || "") + " " + (details.payer.name.surname || "")).trim() || "Cliente PayPal";
                const customerEmail = details.payer.email_address || "cliente@paypal.com";
                const itemsList = cart.map(item => ({ name: item.name, price: item.price, qty: item.qty }));
                const totalPaid = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

                // Procesar la orden completada
                processCompletedOrder(customerName, customerEmail, itemsList, totalPaid, "PayPal");
                
                // Vaciar carrito y actualizar UI
                cart = [];
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartUI();

                // Cerrar panel del carrito
                const panel = document.getElementById("cartPanel");
                if (panel) panel.classList.add("translate-x-full");
            });
        },

        onError: function(err) {
            console.error('PayPal Error:', err);
            showToast("Hubo un error con el pago. Inténtalo de nuevo.");
        }
    }).render('#paypal-button-container');

    window.paypalButtonsRendered = true;
}

// Llamar a la inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // ... (existing code handles this, but I'll add the call at the end of the existing listener)
});

// Mostrar toast de notificación
function showToast(message) {
    // Eliminar toast anterior si existe
    const existingToast = document.getElementById('cart-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #333;
        color: #F7F5F2;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-family: 'Jost', sans-serif;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        max-width: 90vw;
        text-align: center;
    `;
    document.body.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Animar salida
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Actualizar badges de stock en las tarjetas de galería
function updateStockBadges() {
    document.querySelectorAll('.stock-badge').forEach(badge => {
        const productName = badge.getAttribute('data-product');
        const stock = getStock(productName);
        const inCart = getCartQty(productName);
        const available = stock - inCart;

        badge.textContent = `Stock: ${available}`;

        if (available <= 0) {
            badge.className = 'stock-badge text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-600';
            badge.textContent = 'Agotado';
        } else if (available <= 3) {
            badge.className = 'stock-badge text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-600';
            badge.textContent = `¡Últimas ${available}!`;
        } else {
            badge.className = 'stock-badge text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700';
            badge.textContent = `Stock: ${available}`;
        }
    });

    // Actualizar botones de agregar
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        const productName = btn.getAttribute('data-product');
        if (!productName) return; // Skip si no hay data-product
        
        const stock = getStock(productName);
        const inCart = getCartQty(productName);

        if (inCart >= stock) {
            btn.disabled = true;
            btn.textContent = 'Sin stock disponible';
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            btn.classList.remove('hover:bg-[#222222]');
        } else {
            btn.disabled = false;
            btn.textContent = 'Agregar al carrito';
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            btn.classList.add('hover:bg-[#222222]');
        }
    });

    // Si el modal de detalle de producto está abierto, actualizar su stock
    const modalBadge = document.getElementById("modalStockBadge");
    if (modalBadge) {
        const currentModalProduct = modalBadge.getAttribute('data-product');
        if (currentModalProduct && typeof updateModalStock === 'function') {
            updateModalStock(currentModalProduct);
        }
    }

    // Si estamos en la página de producto antigua, actualizar también su badge
    if (typeof window.updateProductStock === 'function') {
        window.updateProductStock();
    }
}

// =============================================
// INICIALIZACIÓN - Esperar a que el DOM esté listo
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Abrir carrito
    const cartBtn = document.getElementById("cartBtn");
    if (cartBtn) {
        cartBtn.addEventListener("click", () => {
            const panel = document.getElementById("cartPanel");
            if (panel) panel.classList.remove("translate-x-full");
        });

        // Inyectar botón de administración de stock justo antes del carrito
        const adminBtn = document.createElement('div');
        adminBtn.className = 'relative cursor-pointer';
        adminBtn.id = 'adminBtn';
        adminBtn.innerHTML = '<i class="fas fa-user-cog text-xl hover:text-[#856146] transition" title="Administrar Stock"></i>';
        cartBtn.parentElement.insertBefore(adminBtn, cartBtn);

        adminBtn.addEventListener('click', () => {
            if (sessionStorage.getItem('habitekAdmin') === 'true') {
                renderAdminPanel();
            } else {
                renderLoginModal();
            }
        });
    }

    // Cerrar carrito
    const closeCart = document.getElementById("closeCart");
    if (closeCart) {
        closeCart.addEventListener("click", () => {
            const panel = document.getElementById("cartPanel");
            if (panel) panel.classList.add("translate-x-full");
        });
    }

    // Actualizar UI del carrito
    updateCartUI();

    // Actualizar badges de stock
    updateStockBadges();

    // Inicializar botones de PayPal
    initPayPalButtons();
});

// =============================================
// PANEL DE ADMINISTRACIÓN DE STOCK
// =============================================

function renderLoginModal() {
    let modal = document.getElementById('adminLoginModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'adminLoginModal';
        modal.className = 'fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm opacity-0 transition-opacity duration-300';
        modal.innerHTML = `
            <div class="bg-[#F8F5F2] p-8 rounded-lg shadow-2xl max-w-md w-full mx-4 transform scale-95 transition-transform duration-300">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-[#2F4C45]">Acceso Administrativo</h2>
                    <button id="closeLoginBtn" class="text-gray-500 hover:text-red-500 text-xl">✕</button>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-[#333] mb-2">Contraseña</label>
                    <input type="password" id="adminPassword" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#856146]" placeholder="Ingresa la contraseña">
                    <p id="loginError" class="text-red-500 text-xs mt-2 hidden">Contraseña incorrecta</p>
                </div>
                <button id="submitLoginBtn" class="w-full bg-[#856146] text-white py-2 rounded-md hover:bg-[#6b4e38] transition">Ingresar</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('closeLoginBtn').onclick = () => closeAdminModal('adminLoginModal');
        
        document.getElementById('submitLoginBtn').onclick = () => {
            const pass = document.getElementById('adminPassword').value;
            if (pass === 'habitek2024') { // Contraseña sencilla por defecto
                sessionStorage.setItem('habitekAdmin', 'true');
                closeAdminModal('adminLoginModal');
                renderAdminPanel();
            } else {
                document.getElementById('loginError').classList.remove('hidden');
            }
        };

        // Enter key to submit
        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('submitLoginBtn').click();
        });
    }

    modal.classList.remove('hidden');
    // Animate in
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.firstElementChild.classList.remove('scale-95');
    });
}

function renderAdminPanel() {
    let panel = document.getElementById('adminPanelModal');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'adminPanelModal';
        panel.className = 'fixed inset-0 bg-black/70 z-[100] flex items-center justify-center backdrop-blur-sm opacity-0 transition-all duration-300 p-4 md:p-6';
        document.body.appendChild(panel);
    }

    panel.innerHTML = `
        <div class="bg-[#F8F5F2] rounded-2xl shadow-2xl max-w-6xl w-full mx-auto transform scale-95 transition-all duration-300 max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
            <!-- Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-[#2F4C45] text-[#F8F5F2] border-b border-[#3b5f56] gap-4">
                <div class="flex items-center gap-3">
                    <div class="bg-[#856146] text-[#F8F5F2] p-2.5 rounded-xl shadow-md">
                        <i class="fas fa-chart-line text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-semibold tracking-wide">Habitek Studio</h2>
                        <p class="text-xs text-gray-300 mt-0.5 font-light">Panel Administrativo de Stock y Estadísticas</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
                    <span class="bg-[#856146]/20 text-[#D1A784] border border-[#856146]/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Admin
                    </span>
                    <div class="flex items-center gap-2">
                        <button id="logoutAdminBtn" class="text-xs px-3 py-1.5 bg-red-950/40 border border-red-800/30 text-red-200 rounded-lg hover:bg-red-900/40 hover:text-white transition">
                            Cerrar sesión
                        </button>
                        <button id="closeAdminPanelBtn" class="w-8 h-8 flex items-center justify-center bg-[#3b5f56]/55 text-white hover:bg-red-500 hover:text-white rounded-lg transition text-lg">✕</button>
                    </div>
                </div>
            </div>

            <!-- Tab Navigation Bar -->
            <div class="flex border-b border-gray-200 bg-white px-6">
                <button onclick="switchAdminTab('inventario')" id="tabBtn_inventario" class="admin-tab-btn active-admin-tab flex items-center gap-2 py-4 px-4 border-b-2 border-[#856146] text-[#856146] font-semibold text-sm transition focus:outline-none">
                    <i class="fas fa-boxes text-base"></i>
                    <span>Inventario</span>
                </button>
                <button onclick="switchAdminTab('estadisticas')" id="tabBtn_estadisticas" class="admin-tab-btn flex items-center gap-2 py-4 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition focus:outline-none">
                    <i class="fas fa-chart-bar text-base"></i>
                    <span>Estadísticas & KPI</span>
                </button>
                <button onclick="switchAdminTab('ventas')" id="tabBtn_ventas" class="admin-tab-btn flex items-center gap-2 py-4 px-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition focus:outline-none">
                    <i class="fas fa-history text-base"></i>
                    <span>Historial de Ventas</span>
                </button>
            </div>

            <!-- Tabs Content -->
            <div class="flex-1 overflow-y-auto p-6 bg-[#F8F5F2] custom-scrollbar">
                
                <!-- Tab: Inventario -->
                <div id="tabContent_inventario" class="admin-tab-content space-y-4">
                    <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="relative flex-1">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <i class="fas fa-search"></i>
                            </span>
                            <input type="text" id="adminSearchInput" oninput="filterAdminInventory()" class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#333] focus:outline-none focus:border-[#856146] focus:bg-white transition" placeholder="Buscar producto por nombre...">
                        </div>
                        <button onclick="resetAdminStock()" class="px-4 py-2 bg-[#856146]/10 text-[#856146] border border-[#856146]/20 hover:bg-[#856146] hover:text-white rounded-lg text-sm transition font-medium flex items-center justify-center gap-1.5">
                            <i class="fas fa-redo-alt text-xs"></i> Restablecer Stock Inicial
                        </button>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                                        <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio COP</th>
                                        <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th scope="col" class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Disponible</th>
                                    </tr>
                                </thead>
                                <tbody id="adminInventoryTableBody" class="bg-white divide-y divide-gray-200">
                                    <!-- Rendered dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Tab: Estadísticas -->
                <div id="tabContent_estadisticas" class="admin-tab-content hidden space-y-6">
                    <!-- KPI Cards Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Productos</p>
                                <h3 id="kpi_total_products" class="text-2xl font-bold text-[#2F4C45] mt-1">-</h3>
                            </div>
                            <div class="p-3 bg-[#2F4C45]/10 text-[#2F4C45] rounded-xl"><i class="fas fa-tags text-lg"></i></div>
                        </div>
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Valor Inventario</p>
                                <h3 id="kpi_total_value" class="text-2xl font-bold text-[#856146] mt-1">-</h3>
                            </div>
                            <div class="p-3 bg-[#856146]/10 text-[#856146] rounded-xl"><i class="fas fa-dollar-sign text-lg"></i></div>
                        </div>
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Stock Total</p>
                                <h3 id="kpi_total_units" class="text-2xl font-bold text-gray-700 mt-1">-</h3>
                            </div>
                            <div class="p-3 bg-gray-100 text-gray-500 rounded-xl"><i class="fas fa-boxes text-lg"></i></div>
                        </div>
                        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Alertas Críticas</p>
                                <h3 id="kpi_critical_alerts" class="text-2xl font-bold text-red-600 mt-1">-</h3>
                            </div>
                            <div class="p-3 bg-red-50 text-red-600 rounded-xl"><i class="fas fa-exclamation-triangle text-lg"></i></div>
                        </div>
                    </div>

                    <!-- Charts Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-semibold text-gray-700 text-sm">Niveles de Stock por Producto</h4>
                                <span class="text-xs text-gray-400">Gráfico de Barras</span>
                            </div>
                            <div class="relative flex-1 min-h-[320px]">
                                <canvas id="adminStockChart"></canvas>
                            </div>
                        </div>
                        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="font-semibold text-gray-700 text-sm">Distribución de Stock por Categoría</h4>
                                <span class="text-xs text-gray-400">Gráfico de Dona</span>
                            </div>
                            <div class="relative flex-1 min-h-[320px] flex items-center justify-center">
                                <canvas id="adminCategoryChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Ventas -->
                <div id="tabContent_ventas" class="admin-tab-content hidden space-y-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Left Panel: Simulación -->
                        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <div class="border-b pb-3">
                                <h4 class="font-semibold text-gray-800 text-sm">Simulador de Compras</h4>
                                <p class="text-xs text-gray-400 mt-1">Genera ventas ficticias para probar la actualización en tiempo real del panel y los gráficos.</p>
                            </div>
                            
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Nombre del Cliente</label>
                                    <input type="text" id="simCustomerName" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#333]" placeholder="Ej. Daniel Silva">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Producto</label>
                                    <select id="simProductSelect" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#333]">
                                        <!-- Will populate dynamically -->
                                    </select>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                                        <input type="number" id="simProductQty" min="1" max="10" value="1" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#333]">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-gray-500 mb-1">Pasarela</label>
                                        <select id="simGateway" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#333]">
                                            <option value="PayPal">PayPal</option>
                                            <option value="Simulador">Simulador</option>
                                        </select>
                                    </div>
                                </div>
                                <button onclick="executeSimulatedPurchase()" class="w-full py-2.5 bg-[#2F4C45] text-white hover:bg-[#20342f] rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5">
                                    <i class="fas fa-shopping-cart text-xs"></i> Procesar Compra
                                </button>
                                
                                <div class="relative flex items-center justify-center my-3">
                                    <div class="border-t border-gray-200 w-full"></div>
                                    <span class="absolute bg-white px-2 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">O</span>
                                </div>
                                
                                <button onclick="executeRandomPurchase()" class="w-full py-2 bg-[#856146]/10 text-[#856146] border border-[#856146]/20 hover:bg-[#856146] hover:text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5">
                                    <i class="fas fa-random text-xs"></i> Compra Aleatoria Rápida
                                </button>
                            </div>
                        </div>

                        <!-- Right Panel: Historial -->
                        <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4 flex flex-col justify-between">
                            <div>
                                <div class="flex justify-between items-center border-b pb-3 mb-3">
                                    <h4 class="font-semibold text-gray-800 text-sm">Historial de Transacciones</h4>
                                    <button onclick="clearCompletedOrders()" class="text-xs text-red-500 hover:underline">Limpiar historial</button>
                                </div>
                                
                                <div class="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                <th scope="col" class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Orden ID</th>
                                                <th scope="col" class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                                                <th scope="col" class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                                                <th scope="col" class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Detalle</th>
                                                <th scope="col" class="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody id="adminVentasTableBody" class="bg-white divide-y divide-gray-200 text-xs">
                                            <!-- Rendered dynamically -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    document.getElementById('closeAdminPanelBtn').onclick = () => closeAdminModal('adminPanelModal');
    document.getElementById('logoutAdminBtn').onclick = () => {
        sessionStorage.removeItem('habitekAdmin');
        closeAdminModal('adminPanelModal');
        showToast('Sesión cerrada');
    };

    renderAdminInventoryTable();
    populateSimProductSelect();
    renderVentasHistoryTable();

    panel.classList.remove('hidden');
    requestAnimationFrame(() => {
        panel.classList.remove('opacity-0');
        panel.firstElementChild.classList.remove('scale-95');
    });
}

function updateAdminStockDirect(productName, change) {
    if (productStock[productName] !== undefined) {
        let newStock = productStock[productName] + change;
        if (newStock < 0) newStock = 0;
        productStock[productName] = newStock;
        localStorage.setItem('productStock', JSON.stringify(productStock));
        
        const safeId = productName.replace(/[^a-zA-Z0-9]/g, '_');
        const inputField = document.getElementById('adminStockInput_' + safeId);
        if (inputField) {
            inputField.value = newStock;
        }
        
        const badgeSpan = document.getElementById('adminStockBadge_' + safeId);
        if (badgeSpan) {
            updateRowBadge(badgeSpan, newStock);
        }
        
        updateStockBadges();
        updateCartUI();
        
        const activeTab = document.querySelector('.active-admin-tab');
        if (activeTab && activeTab.id === 'tabBtn_estadisticas') {
            updateKPIs();
            renderChartsLogic();
        }
        
        // Refresh product selector in simulated checkout tab
        populateSimProductSelect();
    }
}

function updateAdminStockManual(productName, value) {
    let newStock = parseInt(value);
    if (isNaN(newStock) || newStock < 0) newStock = 0;
    
    productStock[productName] = newStock;
    localStorage.setItem('productStock', JSON.stringify(productStock));
    
    const safeId = productName.replace(/[^a-zA-Z0-9]/g, '_');
    const inputField = document.getElementById('adminStockInput_' + safeId);
    if (inputField) {
        inputField.value = newStock;
    }
    
    const badgeSpan = document.getElementById('adminStockBadge_' + safeId);
    if (badgeSpan) {
        updateRowBadge(badgeSpan, newStock);
    }
    
    updateStockBadges();
    updateCartUI();
    
    const activeTab = document.querySelector('.active-admin-tab');
    if (activeTab && activeTab.id === 'tabBtn_estadisticas') {
        updateKPIs();
        renderChartsLogic();
    }
    
    populateSimProductSelect();
}

function updateRowBadge(badgeSpan, stock) {
    if (stock <= 0) {
        badgeSpan.className = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 text-center';
        badgeSpan.textContent = 'Agotado';
    } else if (stock <= 3) {
        badgeSpan.className = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 text-center';
        badgeSpan.textContent = 'Crítico';
    } else {
        badgeSpan.className = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 text-center';
        badgeSpan.textContent = 'Óptimo';
    }
}

function closeAdminModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        if (btn.id === `tabBtn_${tabName}`) {
            btn.classList.add('active-admin-tab', 'border-[#856146]', 'text-[#856146]');
            btn.classList.remove('border-transparent', 'text-gray-500');
        } else {
            btn.classList.remove('active-admin-tab', 'border-[#856146]', 'text-[#856146]');
            btn.classList.add('border-transparent', 'text-gray-500');
        }
    });

    document.querySelectorAll('.admin-tab-content').forEach(content => {
        if (content.id === `tabContent_${tabName}`) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });

    if (tabName === 'estadisticas') {
        updateKPIs();
        setTimeout(() => {
            renderChartsLogic();
        }, 50);
    }
}

function filterAdminInventory() {
    const query = document.getElementById('adminSearchInput').value.toLowerCase().trim();
    const rows = document.querySelectorAll('#adminInventoryTableBody tr');
    
    rows.forEach(row => {
        const productName = row.getAttribute('data-product-name').toLowerCase();
        if (productName.includes(query)) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
}

function resetAdminStock() {
    if (confirm("¿Estás seguro de que deseas restablecer el stock de todos los productos a sus valores iniciales por defecto?")) {
        productStock = { ...defaultStock };
        localStorage.setItem('productStock', JSON.stringify(productStock));
        
        renderAdminInventoryTable();
        populateSimProductSelect();
        updateStockBadges();
        updateCartUI();
        
        const activeTab = document.querySelector('.active-admin-tab');
        if (activeTab && activeTab.id === 'tabBtn_estadisticas') {
            updateKPIs();
            renderChartsLogic();
        }
        
        showToast("Stock restablecido por defecto");
    }
}

function renderAdminInventoryTable() {
    const tableBody = document.getElementById('adminInventoryTableBody');
    if (!tableBody) return;
    
    let html = '';
    const sortedProducts = Object.keys(productStock).sort();
    
    sortedProducts.forEach(name => {
        const stock = productStock[name];
        const price = getProductPrice(name);
        const category = getProductCategory(name);
        const safeId = name.replace(/[^a-zA-Z0-9]/g, '_');
        
        let badgeHTML = '';
        if (stock <= 0) {
            badgeHTML = `<span id="adminStockBadge_${safeId}" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 text-center">Agotado</span>`;
        } else if (stock <= 3) {
            badgeHTML = `<span id="adminStockBadge_${safeId}" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 text-center">Crítico</span>`;
        } else {
            badgeHTML = `<span id="adminStockBadge_${safeId}" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 text-center">Óptimo</span>`;
        }
        
        html += `
            <tr data-product-name="${name}">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#333]">${name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${category}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">$${price.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">${badgeHTML}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="updateAdminStockDirect('${name.replace(/'/g, "\\'")}', -1)" class="w-7 h-7 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded flex items-center justify-center transition border border-gray-200 font-bold text-xs">−</button>
                        <input type="number" id="adminStockInput_${safeId}" min="0" value="${stock}" onchange="updateAdminStockManual('${name.replace(/'/g, "\\'")}', this.value)" class="w-12 h-7 text-center bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#856146] font-semibold">
                        <button onclick="updateAdminStockDirect('${name.replace(/'/g, "\\'")}', 1)" class="w-7 h-7 bg-gray-100 hover:bg-green-50 text-gray-700 hover:text-green-600 rounded flex items-center justify-center transition border border-gray-200 font-bold text-xs">+</button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function updateKPIs() {
    const products = Object.keys(productStock);
    const totalProducts = products.length;
    
    let totalValue = 0;
    let totalStockUnits = 0;
    let criticalAlerts = 0;
    
    products.forEach(p => {
        const stock = productStock[p];
        const price = getProductPrice(p);
        totalValue += price * stock;
        totalStockUnits += stock;
        if (stock <= 3) {
            criticalAlerts++;
        }
    });
    
    const kpiProducts = document.getElementById('kpi_total_products');
    const kpiValue = document.getElementById('kpi_total_value');
    const kpiUnits = document.getElementById('kpi_total_units');
    const kpiAlerts = document.getElementById('kpi_critical_alerts');
    
    if (kpiProducts) kpiProducts.textContent = totalProducts;
    if (kpiValue) kpiValue.textContent = `$${totalValue.toLocaleString()}`;
    if (kpiUnits) kpiUnits.textContent = totalStockUnits;
    if (kpiAlerts) kpiAlerts.textContent = criticalAlerts;
}

function renderChartsLogic() {
    const ctxStock = document.getElementById('adminStockChart');
    const ctxCategory = document.getElementById('adminCategoryChart');
    
    if (!ctxStock || !ctxCategory) return;
    
    const products = Object.keys(productStock).sort();
    const stocks = products.map(p => productStock[p]);
    
    const categoriesMap = { 'Cocinas': 0, 'Closets': 0, 'Oficina': 0, 'Modulares': 0 };
    products.forEach(p => {
        const cat = getProductCategory(p);
        if (categoriesMap[cat] !== undefined) {
            categoriesMap[cat] += productStock[p];
        }
    });
    
    if (window.adminStockChartInstance) window.adminStockChartInstance.destroy();
    if (window.adminCategoryChartInstance) window.adminCategoryChartInstance.destroy();
    
    window.adminStockChartInstance = new Chart(ctxStock, {
        type: 'bar',
        data: {
            labels: products,
            datasets: [{
                label: 'Unidades en Stock',
                data: stocks,
                backgroundColor: '#856146',
                hoverBackgroundColor: '#2F4C45',
                borderRadius: 4,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, precision: 0 }
                },
                x: {
                    ticks: {
                        font: { size: 9 },
                        maxRotation: 90,
                        minRotation: 45
                    }
                }
            }
        }
    });
    
    window.adminCategoryChartInstance = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoriesMap),
            datasets: [{
                data: Object.values(categoriesMap),
                backgroundColor: ['#2F4C45', '#856146', '#D1A784', '#4C7A70'],
                borderWidth: 2,
                borderColor: '#F8F5F2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, font: { size: 10 } }
                }
            },
            cutout: '60%'
        }
    });
}

function populateSimProductSelect() {
    const select = document.getElementById('simProductSelect');
    if (!select) return;
    
    let html = '';
    const sortedProducts = Object.keys(productStock).sort();
    sortedProducts.forEach(name => {
        const stock = productStock[name];
        html += `<option value="${name}">${name} (Stock: ${stock})</option>`;
    });
    select.innerHTML = html;
}

function executeSimulatedPurchase() {
    const customerInput = document.getElementById('simCustomerName');
    const productSelect = document.getElementById('simProductSelect');
    const qtyInput = document.getElementById('simProductQty');
    const gatewaySelect = document.getElementById('simGateway');
    
    if (!customerInput || !productSelect || !qtyInput || !gatewaySelect) return;
    
    const customerName = customerInput.value.trim() || "Cliente Simulación";
    const productName = productSelect.value;
    const qty = parseInt(qtyInput.value);
    const gateway = gatewaySelect.value;
    
    if (!productName) {
        showToast("Selecciona un producto");
        return;
    }
    if (isNaN(qty) || qty <= 0) {
        showToast("Ingresa una cantidad válida");
        return;
    }
    
    const stockAvailable = getStock(productName);
    if (qty > stockAvailable) {
        showToast(`⚠️ Stock insuficiente. Solo hay ${stockAvailable} unidades.`);
        return;
    }
    
    const price = getProductPrice(productName);
    const itemTotal = price * qty;
    const itemsList = [{ name: productName, price: price, qty: qty }];
    
    processCompletedOrder(customerName, `${customerName.toLowerCase().replace(/ /g, '.')}@sim.com`, itemsList, itemTotal, gateway);
    
    customerInput.value = '';
    qtyInput.value = '1';
    
    renderAdminInventoryTable();
    populateSimProductSelect();
    renderVentasHistoryTable();
}

function executeRandomPurchase() {
    const names = ["Andrés Mendoza", "Laura Giraldo", "Alejandro Restrepo", "Sofía Beltrán", "Mateo Gómez", "Valentina Ortiz", "Esteban Muñoz"];
    const gateways = ["PayPal", "Simulador"];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomGateway = gateways[Math.floor(Math.random() * gateways.length)];
    
    const availableProducts = Object.keys(productStock).filter(p => productStock[p] > 0);
    if (availableProducts.length === 0) {
        showToast("⚠️ Todos los productos están agotados. Restablece el stock primero.");
        return;
    }
    
    const numberOfItems = Math.min(availableProducts.length, Math.floor(Math.random() * 2) + 1);
    const chosenProducts = [];
    
    const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numberOfItems; i++) {
        chosenProducts.push(shuffled[i]);
    }
    
    const itemsList = [];
    let grandTotal = 0;
    
    chosenProducts.forEach(prodName => {
        const maxQty = Math.min(3, productStock[prodName]);
        const qty = Math.floor(Math.random() * maxQty) + 1;
        const price = getProductPrice(prodName);
        
        itemsList.push({ name: prodName, price: price, qty: qty });
        grandTotal += price * qty;
    });
    
    processCompletedOrder(randomName, `${randomName.toLowerCase().replace(/ /g, '.')}@sim.com`, itemsList, grandTotal, randomGateway);
    
    renderAdminInventoryTable();
    populateSimProductSelect();
    renderVentasHistoryTable();
}

function renderVentasHistoryTable() {
    const tableBody = document.getElementById('adminVentasTableBody');
    if (!tableBody) return;
    
    if (completedOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-4 py-8 text-center text-gray-400 italic">No hay registros de ventas.</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    completedOrders.forEach(order => {
        const formattedDate = new Date(order.date).toLocaleDateString('es-CO', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        let detailsHTML = '';
        order.items.forEach(item => {
            detailsHTML += `<div class="font-normal text-[10px] text-gray-500">${item.qty}x ${item.name}</div>`;
        });
        
        html += `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap font-mono text-gray-500 font-semibold">${order.id}</td>
                <td class="px-4 py-3 whitespace-nowrap font-medium text-[#333]">${order.customerName}</td>
                <td class="px-4 py-3 whitespace-nowrap text-gray-500">${formattedDate}</td>
                <td class="px-4 py-3">${detailsHTML}</td>
                <td class="px-4 py-3 whitespace-nowrap text-right font-semibold text-[#856146]">$${order.total.toLocaleString()}</td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

function clearCompletedOrders() {
    if (confirm("¿Estás seguro de que deseas limpiar todo el historial de ventas?")) {
        completedOrders = [];
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        renderVentasHistoryTable();
        showToast("Historial de ventas limpiado");
        
        const activeTab = document.querySelector('.active-admin-tab');
        if (activeTab && activeTab.id === 'tabBtn_estadisticas') {
            updateKPIs();
            renderChartsLogic();
        }
    }
}

function showSuccessReceipt(order) {
    let receiptModal = document.getElementById('receiptModal');
    if (!receiptModal) {
        receiptModal = document.createElement('div');
        receiptModal.id = 'receiptModal';
        receiptModal.className = 'fixed inset-0 bg-black/75 z-[200] flex items-center justify-center backdrop-blur-sm opacity-0 transition-all duration-300 p-4';
        document.body.appendChild(receiptModal);
    }
    
    const formattedTotal = order.total.toLocaleString();
    const formattedDate = new Date(order.date).toLocaleString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    
    let itemsHTML = '';
    order.items.forEach(item => {
        const itemTotal = item.price * item.qty;
        itemsHTML += `
            <div class="flex justify-between items-start text-xs border-b border-dashed border-gray-200 pb-2 mb-2">
                <div class="pr-3">
                    <p class="font-medium text-gray-800">${item.name}</p>
                    <p class="text-gray-400 font-light">${item.qty} x $${item.price.toLocaleString()}</p>
                </div>
                <span class="font-semibold text-gray-800">$${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });
    
    receiptModal.innerHTML = `
        <div class="bg-[#F8F5F2] rounded-2xl shadow-2xl max-w-md w-full mx-auto transform scale-95 transition-all duration-300 overflow-hidden border border-white/20 relative">
            <div class="h-2 bg-[#2F4C45] w-full"></div>
            
            <div class="p-6 md:p-8 space-y-6">
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 bg-[#2F4C45]/10 text-[#2F4C45] rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
                        <i class="fas fa-check-circle text-[#2F4C45]"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-[#2F4C45]">¡Transacción Exitosa!</h3>
                    <p class="text-xs text-gray-500 mt-1 font-light">Gracias por elegir Habitek Studio</p>
                </div>
                
                <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 font-mono text-gray-700 relative">
                    <div class="text-center border-b pb-3 border-dashed border-gray-200">
                        <p class="text-sm font-bold tracking-widest text-[#2F4C45]">HABITEK STUDIO</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">MUEBLES PREMIUM & DISEÑO</p>
                    </div>
                    
                    <div class="text-[10px] space-y-1 text-gray-500">
                        <div class="flex justify-between"><span>FACTURA ID:</span><span class="font-bold text-gray-700">${order.id}</span></div>
                        <div class="flex justify-between"><span>FECHA:</span><span>${formattedDate}</span></div>
                        <div class="flex justify-between"><span>CLIENTE:</span><span class="text-gray-700 font-semibold uppercase">${order.customerName}</span></div>
                        <div class="flex justify-between"><span>MÉTODO:</span><span class="text-[#856146] font-semibold">${order.gateway}</span></div>
                    </div>
                    
                    <div class="border-t border-dashed border-gray-300 my-3"></div>
                    
                    <div class="max-h-40 overflow-y-auto pr-1">
                        ${itemsHTML}
                    </div>
                    
                    <div class="border-t border-dashed border-gray-300 pt-3">
                        <div class="flex justify-between items-center text-sm">
                            <span class="font-bold text-gray-800">TOTAL:</span>
                            <span class="font-extrabold text-base text-[#856146]">$${formattedTotal} COP</span>
                        </div>
                    </div>
                </div>
                
                <button onclick="closeReceiptModal()" class="w-full py-3 bg-[#2F4C45] hover:bg-[#20342f] text-white font-semibold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2">
                    <i class="fas fa-file-invoice"></i> Entendido
                </button>
            </div>
            
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-gray-200 to-transparent"></div>
        </div>
    `;
    
    receiptModal.classList.remove('hidden');
    requestAnimationFrame(() => {
        receiptModal.classList.remove('opacity-0');
        receiptModal.firstElementChild.classList.remove('scale-95');
    });
}

function closeReceiptModal() {
    const modal = document.getElementById('receiptModal');
    if (modal) {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

// =============================================
// MODAL DE DETALLE DE PRODUCTO
// =============================================

// Base de datos de productos global
const productData = {
    cocinaIntegralA: { nombre: "Cocina Integral Nova", precio: 1200000, categoria: "Cocinas", descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralA2.webp"] },
    ClosetWalkIn: { nombre: "Closet Walk-In", precio: 850000, categoria: "Closets", descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu vestidor.", medidas: "2.5m x 1.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA2.webp"] },
    escritorioAura: { nombre: "Escritorio Ejecutivo Aura", precio: 550000, categoria: "Oficina", descripcion: "Diseño ergonómico con espacios para computador, impresora y archivo de documentos.", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioA2.webp"] },
    mesaNocheEbano: { nombre: "Mesa de Noche Ébano", precio: 280000, categoria: "Modulares", descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "0.8m x 0.4m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A2.webp"] },
    escritorioAltis: { nombre: "Escritorio Personal Altis", precio: 350000, categoria: "Oficina", descripcion: "Diseño ergonómico con espacios para computador e impresora.", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioB1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioB2.webp"] },
    closetVetra: { nombre: "Closet Corredizo Vetra", precio: 550000, categoria: "Closets", descripcion: "Puertas corredizas que ahorran espacio, con interiores organizados y prácticos.", medidas: "2m x 1.6m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetB1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetB2.webp"] },
    cocinaLumina: { nombre: "Cocina Moderna Lúmina", precio: 1200000, categoria: "Cocinas", descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralB1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/CocinaIntegralB2.webp"] },
    lavamanosOnix: { nombre: "Mueble Lavamanos Onix", precio: 850000, categoria: "Modulares", descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu baño.", medidas: "2.5m x 1.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/MuebleLavamanosC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavamanosC2.webp"] },
    closetPrisma: { nombre: "Closet Prisma", precio: 750000, categoria: "Closets", descripcion: "Diseño ergonómico con espacios para zapatero, cajones y ropero.", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetC2.webp"] },
    mesaNocheZenit: { nombre: "Mesa de noche Zenit", precio: 280000, categoria: "Modulares", descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "0.8m x 0.4m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A2.webp"] },
    closetAureo: { nombre: "Closet Aureo", precio: 980000, categoria: "Closets", descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "0.8m x 0.4m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetD1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetD2.webp"] },
    cocinaVelaris: { nombre: "Cocina Integral Velaris", precio: 1250000, categoria: "Cocinas", descripcion: "Diseño novedoso con espacios para todos los accesorios", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralC2.webp"] },
    escritorioCalix: { nombre: "Escritorio Gamer Calix", precio: 750000, categoria: "Oficina", descripcion: "Diseño ergonómico y adecuado para uso gamer.", medidas: "2m x 1.6m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioC2.webp"] },
    closetEterna: { nombre: "Closet Eterna", precio: 850000, categoria: "Closets", descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu vestidor.", medidas: "2.5m x 1.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA2.webp"] },
    mesaNocheArlet: { nombre: "Mesa de Noche Arlet", precio: 300000, categoria: "Modulares", descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_B1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_B2.webp"] },
    mesaNocheZafiro: { nombre: "Mesa de Noche Zafiro", precio: 300000, categoria: "Modulares", descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu habitación.", medidas: "0.5m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_C1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_C2.webp"] },
    lavamanosKael: { nombre: "Mueble Lavamanos Kael", precio: 650000, categoria: "Modulares", descripcion: "Diseño premium con espacios para secador y jabonera.", medidas: "0.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavaManosA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavaManosA2.webp"] },
    lavamanosVion: { nombre: "Mueble Lavamanos Vion", precio: 280000, categoria: "Modulares", descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "0.8m x 0.4m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavamanosB1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavamanosB2.webp"] },
    entretenimientoNarel: { nombre: "Centro Entretenimiento Narel", precio: 950000, categoria: "Modulares", descripcion: "Diseño ELEGANTE con espacios para consolas y almacenamiento.", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvA1.webp"] },
    entretenimientoIsen: { nombre: "Centro Entretenimiento Isen", precio: 850000, categoria: "Modulares", descripcion: "Centro Entretenimiento familiar con cajones.", medidas: "2m x 1.6m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvB2.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvB1.webp"] },
    entretenimientoKaia: { nombre: "Centro Entretenimiento Kaia", precio: 850000, categoria: "Modulares", descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvC2.webp"] },
    entretenimientoUmbra: { nombre: "Centro Entretenimiento Umbra", precio: 850000, categoria: "Modulares", descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu hogar.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvD1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvD2.webp"] },
    entretenimientoNero: { nombre: "Centro Entretenimiento Nero", precio: 850000, categoria: "Modulares", descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu hogar.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvE1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvE2.webp"] },
    entretenimientoTitan: { nombre: "Centro Entretenimiento Titan", precio: 1280000, categoria: "Modulares", descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvF1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvF2.webp"] },
    tocadorEclipse: { nombre: "Tocador Eclipse", precio: 850000, categoria: "Modulares", descripcion: "Diseño ergonómico con espacios para computadore impresora", medidas: "2.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/tocadorA2.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/tocadorA1.webp"] }
};

// =============================================
// HELPERS PARA CATEGORÍAS Y PRECIOS
// =============================================
function getProductCategory(productName) {
    if (!productName) return 'Modulares';
    const found = Object.values(productData).find(p => p.nombre.toLowerCase() === productName.toLowerCase());
    if (found && found.categoria) return found.categoria;
    
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('cocina')) return 'Cocinas';
    if (lowerName.includes('closet')) return 'Closets';
    if (lowerName.includes('escritorio')) return 'Oficina';
    if (lowerName.includes('mesa') || lowerName.includes('lavamanos') || lowerName.includes('entretenimiento') || lowerName.includes('tocador')) return 'Modulares';
    
    return 'Modulares';
}

function getProductPrice(productName) {
    if (!productName) return 500000;
    const found = Object.values(productData).find(p => p.nombre.toLowerCase() === productName.toLowerCase());
    if (found) return found.precio;
    
    const lowerName = productName.toLowerCase();
    if (lowerName === 'cocina moderna') return 1200000;
    if (lowerName === 'escritorio ejecutivo') return 550000;
    if (lowerName === 'mesa de noche moderna') return 280000;
    if (lowerName === 'escritorio personal') return 350000;
    if (lowerName === 'closet corredizo') return 550000;
    
    if (lowerName.includes('cocina')) return 1200000;
    if (lowerName.includes('closet')) return 850000;
    if (lowerName.includes('escritorio')) return 550000;
    if (lowerName.includes('mesa')) return 280000;
    return 500000;
}

// Interceptar clics en enlaces a producto.html
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && link.href.includes('producto.html?id=')) {
        e.preventDefault();
        const url = new URL(link.href);
        const id = url.searchParams.get('id');
        openProductModal(id);
    }
});

function openProductModal(id) {
    const producto = productData[id];
    if (!producto) return;

    let modal = document.getElementById('productDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productDetailModal';
        modal.className = 'fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm opacity-0 transition-opacity duration-300 p-4 overflow-y-auto';
        document.body.appendChild(modal);
    }

    const stock = getStock(producto.nombre);
    const inCart = getCartQty(producto.nombre);
    const available = stock - inCart;

    let badgeClass = 'bg-green-100 text-green-700';
    let badgeText = `Stock: ${available}`;
    let subText = `${available} disponible(s)`;
    let btnDisabled = '';
    let btnText = 'Agregar al carrito';
    let btnClass = 'hover:bg-[#222222]';

    if (available <= 0) {
        badgeClass = 'bg-red-100 text-red-600';
        badgeText = 'Agotado';
        subText = '';
        btnDisabled = 'disabled';
        btnText = 'Sin stock disponible';
        btnClass = 'opacity-50 cursor-not-allowed';
    } else if (available <= 3) {
        badgeClass = 'bg-orange-100 text-orange-600';
        badgeText = `¡Últimas ${available}!`;
    }

    modal.innerHTML = `
        <div class="bg-[#F8F5F2] rounded-lg shadow-2xl max-w-4xl w-full m-auto relative transform scale-95 transition-transform duration-300 overflow-hidden">
            <button onclick="closeAdminModal('productDetailModal')" class="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl z-10 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full shadow-sm">✕</button>
            
            <div class="grid md:grid-cols-2 gap-0">
                <div class="relative w-full aspect-square bg-gray-100">
                    <img id="modalImg0" class="modal-slide w-full h-full object-cover" src="${producto.imagenes[0]}">
                    <img id="modalImg1" class="modal-slide w-full h-full object-cover hidden" src="${producto.imagenes[1] || producto.imagenes[0]}">
                    
                    <button onclick="toggleModalSlide()" class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 text-black hover:bg-white rounded-full shadow-md transition">❮</button>
                    <button onclick="toggleModalSlide()" class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 text-black hover:bg-white rounded-full shadow-md transition">❯</button>
                </div>

                <div class="p-8 flex flex-col justify-center bg-white">
                    <h2 class="text-3xl font-bold mb-4 text-[#2F4C45]">${producto.nombre}</h2>
                    <p class="mb-6 text-gray-600 text-lg leading-relaxed">${producto.descripcion}</p>
                    
                    <div class="mb-6 bg-[#F8F5F2] p-4 rounded-lg">
                        <p class="text-[#333]"><strong>Medidas:</strong> ${producto.medidas}</p>
                    </div>

                    <p class="text-3xl font-bold text-[#856146] mb-6">$ ${producto.precio.toLocaleString()}</p>
                    
                    <div class="mb-8 flex items-center gap-3">
                        <span id="modalStockBadge" class="text-sm font-semibold px-3 py-1 rounded-full ${badgeClass}" data-product="${producto.nombre}">${badgeText}</span>
                        <span id="modalStockText" class="text-sm text-gray-500">${subText}</span>
                    </div>

                    <button onclick="addToCart('${producto.nombre.replace(/'/g, "\\'")}', ${producto.precio}); updateModalStock('${producto.nombre.replace(/'/g, "\\'")}')" 
                            id="modalAddBtn"
                            class="bg-[#856146] text-white w-full text-center block py-4 rounded-lg text-lg font-semibold transition ${btnClass}" ${btnDisabled}>
                        ${btnText}
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.firstElementChild.classList.remove('scale-95');
    });
}

function toggleModalSlide() {
    const img0 = document.getElementById('modalImg0');
    const img1 = document.getElementById('modalImg1');
    if (img0 && img1) {
        img0.classList.toggle('hidden');
        img1.classList.toggle('hidden');
    }
}

function updateModalStock(productName) {
    const stock = getStock(productName);
    const inCart = getCartQty(productName);
    const available = stock - inCart;

    const badge = document.getElementById("modalStockBadge");
    const text = document.getElementById("modalStockText");
    const btn = document.getElementById("modalAddBtn");

    if (!badge || !text || !btn) return;

    if (available <= 0) {
        badge.className = "text-sm font-semibold px-3 py-1 rounded-full bg-red-100 text-red-600";
        badge.textContent = "Agotado";
        text.textContent = "";
        btn.disabled = true;
        btn.textContent = "Sin stock disponible";
        btn.className = "bg-[#856146] text-white w-full text-center block py-4 rounded-lg text-lg font-semibold transition opacity-50 cursor-not-allowed";
    } else if (available <= 3) {
        badge.className = "text-sm font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-600";
        badge.textContent = `¡Últimas ${available}!`;
        text.textContent = `${available} disponible(s)`;
        btn.disabled = false;
        btn.textContent = "Agregar al carrito";
        btn.className = "bg-[#856146] text-white w-full text-center block py-4 rounded-lg text-lg font-semibold transition hover:bg-[#222222]";
    } else {
        badge.className = "text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700";
        badge.textContent = `Stock: ${available}`;
        text.textContent = `${available} disponible(s)`;
        btn.disabled = false;
        btn.textContent = "Agregar al carrito";
        btn.className = "bg-[#856146] text-white w-full text-center block py-4 rounded-lg text-lg font-semibold transition hover:bg-[#222222]";
    }
}