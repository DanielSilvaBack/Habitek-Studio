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
                showToast(`¡Pago exitoso! Gracias ${details.payer.name.given_name}.`);
                
                // Vaciar carrito y actualizar stock
                cart = [];
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartUI();
                updateStockBadges();

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
        panel.className = 'fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm opacity-0 transition-opacity duration-300';
        document.body.appendChild(panel);
    }

    // Generar lista de productos
    let stockItemsHTML = '';
    const sortedProducts = Object.keys(productStock).sort();
    
    sortedProducts.forEach(name => {
        const stock = productStock[name];
        const safeId = name.replace(/[^a-zA-Z0-9]/g, '_');
        stockItemsHTML += `
            <div class="flex justify-between items-center py-3 border-b border-gray-200">
                <span class="text-sm font-medium text-[#333] flex-1 pr-4">${name}</span>
                <div class="flex items-center gap-3">
                    <button onclick="updateAdminStock('${name.replace(/'/g, "\\'")}', -1)" class="w-8 h-8 rounded bg-gray-200 hover:bg-red-200 text-[#333] flex items-center justify-center transition font-bold">−</button>
                    <span id="adminStock_${safeId}" class="w-8 text-center font-semibold">${stock}</span>
                    <button onclick="updateAdminStock('${name.replace(/'/g, "\\'")}', 1)" class="w-8 h-8 rounded bg-gray-200 hover:bg-green-200 text-[#333] flex items-center justify-center transition font-bold">+</button>
                </div>
            </div>
        `;
    });

    panel.innerHTML = `
        <div class="bg-[#F8F5F2] p-6 md:p-8 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col transform scale-95 transition-transform duration-300">
            <div class="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 class="text-2xl font-semibold text-[#2F4C45]">Gestión de Stock</h2>
                    <p class="text-sm text-gray-500 mt-1">Aumenta o disminuye el stock disponible</p>
                </div>
                <div class="flex items-center gap-4">
                    <button id="logoutAdminBtn" class="text-sm text-[#856146] hover:underline">Cerrar sesión</button>
                    <button id="closeAdminPanelBtn" class="text-gray-500 hover:text-red-500 text-2xl leading-none">✕</button>
                </div>
            </div>
            
            <div class="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                ${stockItemsHTML}
            </div>
        </div>
    `;

    document.getElementById('closeAdminPanelBtn').onclick = () => closeAdminModal('adminPanelModal');
    document.getElementById('logoutAdminBtn').onclick = () => {
        sessionStorage.removeItem('habitekAdmin');
        closeAdminModal('adminPanelModal');
        showToast('Sesión cerrada');
    };

    panel.classList.remove('hidden');
    // Animate in
    requestAnimationFrame(() => {
        panel.classList.remove('opacity-0');
        panel.firstElementChild.classList.remove('scale-95');
    });
}

function updateAdminStock(productName, change) {
    if (productStock[productName] !== undefined) {
        let newStock = productStock[productName] + change;
        if (newStock < 0) newStock = 0;
        
        productStock[productName] = newStock;
        localStorage.setItem('productStock', JSON.stringify(productStock));
        
        // Actualizar el DOM directamente sin re-renderizar todo el panel
        const safeId = productName.replace(/[^a-zA-Z0-9]/g, '_');
        const spanValue = document.getElementById('adminStock_' + safeId);
        if (spanValue) {
            spanValue.textContent = newStock;
        }
        
        // Update the public UI
        updateStockBadges();
        updateCartUI(); // In case cart needs adjusting
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

// =============================================
// MODAL DE DETALLE DE PRODUCTO
// =============================================

// Base de datos de productos global
const productData = {
    cocinaIntegralA: { nombre: "Cocina Integral Nova", precio: 1200000, descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralA2.webp"] },
    ClosetWalkIn: { nombre: "Closet Walk-In", precio: 850000, descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu vestidor.", medidas: "2.5m x 1.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA2.webp"] },
    escritorioAura: { nombre: "Escritorio Ejecutivo Aura", precio: 550000, descripcion: "Diseño ergonómico con espacios para computador, impresora y archivo de documentos.", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioA2.webp"] },
    mesaNocheEbano: { nombre: "Mesa de Noche Ébano", precio: 280000, descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "0.8m x 0.4m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A2.webp"] },
    escritorioAltis: { nombre: "Escritorio Personal Altis", precio: 350000, descripcion: "Diseño ergonómico con espacios para computador e impresora.", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioB1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioB2.webp"] },
    closetVetra: { nombre: "Closet Corredizo Vetra", precio: 550000, descripcion: "Puertas corredizas que ahorran espacio, con interiores organizados y prácticos.", medidas: "2m x 1.6m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetB1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetB2.webp"] },
    cocinaLumina: { nombre: "Cocina Moderna Lúmina", precio: 1200000, descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralB1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/CocinaIntegralB2.webp"] },
    lavamanosOnix: { nombre: "Mueble Lavamanos Onix", precio: 850000, descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu baño.", medidas: "2.5m x 1.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/MuebleLavamanosC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavamanosC2.webp"] },
    closetPrisma: { nombre: "Closet Prisma", precio: 750000, descripcion: "Diseño ergonómico con espacios para zapatero, cajones y ropero.", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetC2.webp"] },
    mesaNocheZenit: { nombre: "Mesa de noche Zenit", precio: 280000, descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "0.8m x 0.4m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A2.webp"] },
    closetAureo: { nombre: "Closet Aureo", precio: 980000, descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "0.8m x 0.4m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetD1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetD2.webp"] },
    cocinaVelaris: { nombre: "Cocina Integral Velaris", precio: 1250000, descripcion: "Diseño novedoso con espacios para todos los accesorios", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralC2.webp"] },
    escritorioCalix: { nombre: "Escritorio Gamer Calix", precio: 750000, descripcion: "Diseño ergonómico y adecuado para uso gamer.", medidas: "2m x 1.6m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioC2.webp"] },
    closetEterna: { nombre: "Closet Eterna", precio: 850000, descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu vestidor.", medidas: "2.5m x 1.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA2.webp"] },
    mesaNocheArlet: { nombre: "Mesa de Noche Arlet", precio: 300000, descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_B1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_B2.webp"] },
    mesaNocheZafiro: { nombre: "Mesa de Noche Zafiro", precio: 300000, descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu habitación.", medidas: "0.5m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_C1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_C2.webp"] },
    lavamanosKael: { nombre: "Mueble Lavamanos Kael", precio: 650000, descripcion: "Diseño premium con espacios para secador y jabonera.", medidas: "0.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavaManosA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavaManosA2.webp"] },
    lavamanosVion: { nombre: "Mueble Lavamanos Vion", precio: 280000, descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "0.8m x 0.4m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavamanosB1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavamanosB2.webp"] },
    entretenimientoNarel: { nombre: "Centro Entretenimiento Narel", precio: 950000, descripcion: "Diseño ELEGANTE con espacios para consolas y almacenamiento.", medidas: "1.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvA1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvA1.webp"] },
    entretenimientoIsen: { nombre: "Centro Entretenimiento Isen", precio: 850000, descripcion: "Centro Entretenimiento familiar con cajones.", medidas: "2m x 1.6m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvB2.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvB1.webp"] },
    entretenimientoKaia: { nombre: "Centro Entretenimiento Kaia", precio: 850000, descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvC1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvC2.webp"] },
    entretenimientoUmbra: { nombre: "Centro Entretenimiento Umbra", precio: 850000, descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu hogar.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvD1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvD2.webp"] },
    entretenimientoNero: { nombre: "Centro Entretenimiento Nero", precio: 850000, descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu hogar.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvE1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvE2.webp"] },
    entretenimientoTitan: { nombre: "Centro Entretenimiento Titan", precio: 1280000, descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.", medidas: "3m x 2m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvF1.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvF2.webp"] },
    tocadorEclipse: { nombre: "Tocador Eclipse", precio: 850000, descripcion: "Diseño ergonómico con espacios para computadore impresora", medidas: "2.6m x 0.8m", imagenes: ["https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/tocadorA2.webp", "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/tocadorA1.webp"] }
};

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