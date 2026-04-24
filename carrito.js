let cart = JSON.parse(localStorage.getItem("cart")) || [];

updateCartUI();

// Abrir carrito
document.getElementById("cartBtn").addEventListener("click", () => {
    document.getElementById("cartPanel").classList.remove("translate-x-full");
});

// Cerrar carrito
document.getElementById("closeCart").addEventListener("click", () => {
    document.getElementById("cartPanel").classList.add("translate-x-full");
});

// Agregar producto
function addToCart(productName, price = 0) {
    cart.push({ name: productName, price: price });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// Actualizar UI carrito
function updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    cartCount.textContent = cart.length;

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p class='text-gray-500'>Tu carrito está vacío</p>";
    } else {
        cart.forEach((item, index) => {
            total += item.price;

            cartItems.innerHTML += `
                <div class="flex justify-between items-center border-b pb-2">
                    <div>
                        <p class="font-semibold">${item.name}</p>
                        <p class="text-sm text-gray-500">$${item.price}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" class="text-red-500">
                        ✕
                    </button>
                </div>
            `;
        });
    }

    cartTotal.textContent = "$" + total;
}

// Eliminar producto
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// Vaciar carrito
function clearCart() {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// Finalizar compra
function finalizarCompra() {

    if (cart.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    let mensaje = "🛒 *Pedido Habitek Studio*%0A%0A";
    let total = 0;

    cart.forEach((item, index) => {

        mensaje += `*${index + 1}. ${item.name}*%0A`;
        mensaje += `Precio: $${item.price.toLocaleString()}%0A%0A`;

        total += item.price;
    });

    mensaje += `💰 *Total: $${total.toLocaleString()}*%0A%0A`;
    mensaje += "Hola, quiero realizar este pedido 👆";

    const numero = "573115120652"; // 🔥 

    const url = `https://wa.me/${numero}?text=${mensaje}`;

    window.open(url, "_blank");
}