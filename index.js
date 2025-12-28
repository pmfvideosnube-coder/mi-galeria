const express = require("express");
const { Storage } = require("megajs");

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a tu cuenta MEGA usando variables de entorno
const storage = new Storage({
  email: process.env.MEGA_EMAIL,     // aquí Render pondrá tu correo
  password: process.env.MEGA_PASSWORD // aquí Render pondrá tu contraseña
});

app.get("/", (req, res) => {
  storage.login((err) => {
    if (err) {
      console.error("Error al conectar con MEGA:", err);
      return res.status(500).send("No se pudo acceder a MEGA.");
    }

    // Filtrar solo archivos de video
    const videos = storage.files.filter(f => f.name.endsWith(".mp4"));

    // Construir galería pastel
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
          </video>
        </div>
      `;
    });

    html += "</body></html>";
    res.send(html);
  });
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
