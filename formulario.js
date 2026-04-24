document.getElementById("quote-form").addEventListener("submit", function (e) {
    e.preventDefault(); // ❌ evita recargar la página

    // 📥 Obtener valores
    const nombre = document.getElementById("quote-name").value;
    const email = document.getElementById("quote-email").value;
    const telefono = document.getElementById("quote-phone").value;
    const tipo = document.getElementById("quote-type").value;
    const dimensiones = document.getElementById("quote-dimensions").value;
    const descripcion = document.getElementById("quote-description").value;

    // 🧾 Construir mensaje
    let mensaje = "📩 *Nueva solicitud de cotización*%0A%0A";

    mensaje += `👤 Nombre: ${nombre}%0A`;
    mensaje += `📧 Email: ${email}%0A`;
    mensaje += `📱 Teléfono: ${telefono}%0A`;
    mensaje += `🪑 Tipo de mueble: ${tipo}%0A`;

    if (dimensiones) {
        mensaje += `📏 Dimensiones: ${dimensiones}%0A`;
    }

    mensaje += `%0A📝 Descripción:%0A${descripcion}%0A`;

    // 📲 Número 
    const numero = "573115120652";

    // 🔗 URL WhatsApp
    const url = `https://wa.me/${numero}?text=${mensaje}`;

    // 🚀 Abrir WhatsApp
    window.open(url, "_blank");
});