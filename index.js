const express = require("express");
const { Storage } = require("megajs");

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a tu carpeta pública de MEGA
const storage = Storage.fromURL("https://mega.nz/folder/NQMngLCb#wn3HJYVEsrd_4kB-xQ9wCA");

// Galería pastel
app.get("/", (req, res) => {
  storage.load((err) => {
    if (err) {
      console.error("Error cargando carpeta MEGA:", err);
      return res.status(500).send("No se pudo acceder a la carpeta MEGA.");
    }

    // Filtrar solo archivos de video
    const videos = storage.files.filter(f => f.name.endsWith(".mp4"));

    // Construir HTML pastel
    let html = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>Galería pastel</title>
        <style>
          body { background:#fff0f5; font-family:sans-serif; }
          h1 { color:#d81b60; text-align:center; }
          .video { margin:20px; padding:10px; background:#ffffff; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1); }
          video { width:100%; border-radius:10px; }
        </style>
      </head>
      <body>
        <h1>🎀 Galería pastel 🎀</h1>
    `;

    videos.forEach(v => {
      html += `
        <div class="video">
          <h3>${v.name}</h3>
          <video controls>
            <source src="${v.link()}" type="video/mp4">
            Tu navegador no soporta video.
          </video>
        </div>
      `;
    });

    html += "</body></html>";
    res.send(html);
  });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
