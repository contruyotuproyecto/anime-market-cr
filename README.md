# Anime Market CR

Landing demo para explorar un escaparate de coleccionismo anime en Costa Rica, con referencias a Dragon Ball, Demon Slayer, Jujutsu Kaisen, One Piece y Mobile Suit Gundam.

**Estado:** demo conceptual. Las imágenes son mockups generados para esta experiencia y no representan fotos de productos oficiales. No hay inventario real, pagos, compras, pedidos ni contacto por WhatsApp. Los precios son ilustrativos; no representan una oferta ni un ranking de ventas.

## Vista local

Es un sitio estático en HTML, CSS y JavaScript nativos, sin paquetes de terceros. Para probarlo, desde esta carpeta ejecutá:

```powershell
python -m http.server 8000
```

Luego abrí `http://localhost:8000`.

## Contenido

- `index.html`: estructura, navegación y diálogos de la demo.
- `styles.css`: identidad visual, responsive, foco de teclado y movimiento reducido.
- `app.js`: filtros, favoritos y bolsa de muestra.
- `productos.json`: mockups de artículos inspirados en personajes y series de anime.
- `assets/anime/`: imágenes conceptuales generadas para la demo, optimizadas en WebP.
- `assets/`: recursos vectoriales de identidad y versiones anteriores de ilustraciones.
- `robots.txt`, `sitemap.xml` y `CNAME`: archivos para el despliegue previsto en `anime.labweb.top`.

## Editar una pieza

Agregá un objeto a `productos.json` con un `id` único, `nombre`, `categoria`, `descripcion`, `precio` de muestra, ruta a `imagen` y una `etiqueta`. Dejá claro si una pieza es conceptual o si es un producto oficial verificado; no presentes mockups como inventario real. Si se añade una categoría, agregá también su filtro en `index.html`.

## Publicación prevista

Repositorio independiente `contruyotuproyecto/anime-market-cr` y GitHub Pages con dominio personalizado `anime.labweb.top`, publicado directamente desde la raíz de `main`. El dominio está configurado en Pages y en el proveedor DNS; HTTPS se activa cuando GitHub emite el certificado. La propiedad y el sitemap de este nuevo sitio se gestionarán por separado en Google Search Console.
