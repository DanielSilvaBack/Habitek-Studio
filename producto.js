document.addEventListener("DOMContentLoaded", () => {
    // 📦 DATA DE PRODUCTOS
    const data = {
        cocinaIntegralA: {
            nombre: "Cocina Integral Nova",
            precio: 1200000,
            descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.",
            medidas: "3m x 2m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralA1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralA2.webp"
            ]
        },

        ClosetWalkIn: {
            nombre: "Closet Walk-In",
            precio: 850000,
            descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu vestidor.",
            medidas: "2.5m x 1.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA2.webp"
            ]
        },

        escritorioAura: {
            nombre: "Escritorio Ejecutivo Aura",
            precio: 550000,
            descripcion: "Diseño ergonómico con espacios para computador, impresora y archivo de documentos.",
            medidas: "1.6m x 0.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioA1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioA2.webp"
            ]
        },

        mesaNocheEbano: {
            nombre: "Mesa de Noche Ébano",
            precio: 280000,
            descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.",
            medidas: "0.8m x 0.4m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A2.webp"
            ]
        },

        escritorioAltis: {
            nombre: "Escritorio Personal Altis",
            precio: 350000,
            descripcion: "Diseño ergonómico con espacios para computador e impresora.",
            medidas: "1.6m x 0.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioB1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioB2.webp"
            ]
        },

        closetVetra: {
            nombre: "Closet Corredizo Vetra",
            precio: 550000,
            descripcion: "Puertas corredizas que ahorran espacio, con interiores organizados y prácticos.",
            medidas: "2m x 1.6m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetB1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetB2.webp"
            ]
        },

        cocinaLumina: {
            nombre: "Cocina Moderna Lúmina",
            precio: 1200000,
            descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.",
            medidas: "3m x 2m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralB1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/CocinaIntegralB2.webp"
            ]
        },

        lavamanosOnix: {
            nombre: "Mueble Lavamanos Onix",
            precio: 850000,
            descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu baño.",
            medidas: "2.5m x 1.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/MuebleLavamanosC1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavamanosC2.webp"
            ]
        },

        closetPrisma: {
            nombre: "Closet Prisma",
            precio: 750000,
            descripcion: "Diseño ergonómico con espacios para zapatero, cajones y ropero.",
            medidas: "1.6m x 0.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetC1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetC2.webp"
            ]
        },

        mesaNocheZenit: {
            nombre: "Mesa de noche Zenit",
            precio: 280000,
            descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.",
            medidas: "0.8m x 0.4m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_A2.webp"
            ]
        },

        closetAureo: {
            nombre: "Closet Aureo",
            precio: 980000,
            descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.",
            medidas: "0.8m x 0.4m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetD1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetD2.webp"
            ]
        },

        cocinaVelaris: {
            nombre: "Cocina Integral Velaris",
            precio: 1250000,
            descripcion: "Diseño novedoso con espacios para todos los accesorios",
            medidas: "1.6m x 0.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralC1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/cocinaIntegralC2.webp"
            ]
        },

        escritorioCalix: {
            nombre: "Escritorio Gamer Calix",
            precio: 750000,
            descripcion: "Diseño ergonómico y adecuado para uso gamer.",
            medidas: "2m x 1.6m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioC1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/escritorioC2.webp"
            ]
        },

        closetEterna: {
            nombre: "Closet Eterna",
            precio: 850000,
            descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu vestidor.",
            medidas: "2.5m x 1.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/closetA2.webp"
            ]
        },

        mesaNocheArlet: {
            nombre: "Mesa de Noche Arlet",
            precio: 300000,
            descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.",
            medidas: "3m x 2m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_B1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_B2.webp"
            ]
        },

        mesaNocheZafiro: {
            nombre: "Mesa de Noche Zafiro",
            precio: 300000,
            descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu habitación.",
            medidas: "0.5m x 0.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_C1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/mesaN_C2.webp"
            ]
        },

        lavamanosKael: {
            nombre: "Mueble Lavamanos Kael",
            precio: 650000,
            descripcion: "Diseño premium con espacios para secador y jabonera.",
            medidas: "0.6m x 0.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavaManosA1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavaManosA2.webp"
            ]
        },

        lavamanosVion: {
            nombre: "Mueble Lavamanos Vion",
            precio: 280000,
            descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.",
            medidas: "0.8m x 0.4m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavamanosB1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebleLavamanosB2.webp"
            ]
        },

        entretenimientoNarel: {
            nombre: "Centro Entretenimiento Narel",
            precio: 950000,
            descripcion: "Diseño ELEGANTE con espacios para consolas y almacenamiento.",
            medidas: "1.6m x 0.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvA1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvA1.webp"
            ]
        },

        entretenimientoIsen: {
            nombre: "Centro Entretenimiento Isen",
            precio: 850000,
            descripcion: "Centro Entretenimiento familiar con cajones.",
            medidas: "2m x 1.6m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvB2.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvB1.webp"
            ]
        },

        entretenimientoKaia: {
            nombre: "Centro Entretenimiento Kaia",
            precio: 850000,
            descripcion: "Diseño contemporáneo con acabados en melamina de alta resistencia y durabilidad.",
            medidas: "3m x 2m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvC1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvC2.webp"
            ]
        },

        entretenimientoUmbra: {
            nombre: "Centro Entretenimiento Umbra",
            precio: 850000,
            descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu hogar.",
            medidas: "3m x 2m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvD1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvD2.webp"
            ]
        },

        entretenimientoNero: {
            nombre: "Centro Entretenimiento Nero",
            precio: 850000,
            descripcion: "Sistema modular con divisiones inteligentes para optimizar el espacio de tu hogar.",
            medidas: "3m x 2m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvE1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvE2.webp"
            ]
        },

        entretenimientoTitan: {
            nombre: "Centro Entretenimiento Titan",
            precio: 1280000,
            descripcion: "Sistema de módulos para crear el mueble perfecto para tu espacio.",
            medidas: "3m x 2m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvF1.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/muebletvF2.webp"
            ]
        },

        tocadorEclipse: {
            nombre: "Tocador Eclipse",
            precio: 850000,
            descripcion: "Diseño ergonómico con espacios para computadore impresora",
            medidas: "2.6m x 0.8m",
            imagenes: [
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/tocadorA2.webp",
                "https://raw.githubusercontent.com/DanielSilvaBack/imagenes-Habitek/refs/heads/master/img/ImgHabitek/ImgHabitekStudio/catalogo/tocadorA1.webp"
            ]
        },




    };

    // 🔍 OBTENER ID DESDE URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const producto = data[id];

    // 🚨 VALIDACIÓN
    if (!producto) {
        document.body.innerHTML = "<h1>Producto no encontrado</h1>";
        return;
    }

    // 🧾 PINTAR DATOS
    document.getElementById("nombre").textContent = producto.nombre;
    document.getElementById("descripcion").textContent = producto.descripcion;
    document.getElementById("medidas").textContent = producto.medidas;
    document.getElementById("precio").textContent = "$ " + producto.precio.toLocaleString();

    let current = 0;
    const slides = document.querySelectorAll(".slide");

    producto.imagenes.forEach((img, index) => {
        if (slides[index]) {
            slides[index].src = img;
        }
    });


    // Función para mostrar slide
    function showSlide(index) {
        slides.forEach(s => s.classList.add("hidden"));
        slides[index].classList.remove("hidden");
    }

    // Inicializar slider
    showSlide(0);

    // Botón siguiente
    window.nextSlide = function () {
        current = (current + 1) % slides.length;
        showSlide(current);
    };

    // Botón anterior
    window.prevSlide = function () {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
    };

    // 🛒 BOTÓN CARRITO
    document.getElementById("btnCarrito").onclick = () => {
        addToCart(producto.nombre, producto.precio);
    };

});