const express = require("express");
const { Storage } = require("megajs");

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a tu cuenta MEGA usando variables de entorno
const storage = new Storage({
  email: process.env.MEGA_EMAIL,
  password: process.env.MEGA_PASSWORD
});

app.get("/", (req, res) => {
  // Verificar que las variables existen
  if (!process.env.MEGA_EMAIL || !process.env.MEGA_PASSWORD) {
    return res.send("<h1>🎀 Galería pastel 🎀</h1><p>No se configuraron credenciales MEGA.</p>");
  }

  storage.login((err) => {
    if (err) {
      console.error("Error al conectar con MEGA:", err);
      return res.send("<h1>🎀 Galería pastel 🎀</h1><p>Error al conectar con MEGA.</p>");
    }

    storage.mount((err) => {
      if (err) {
        console.error("Error al montar MEGA:", err);
        return res.send("<h1>Error al montar MEGA.</h1>");
      }

      const videos = Object.values(storage.files).filter(f => f.name.endsWith(".mp4"));

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
});

// Render necesita escuchar en 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});

