const express = require("express");
const { Storage } = require("megajs");

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ Aquí pones tu correo y contraseña directamente
const storage = new Storage({
  email: "lemusdelapuertams123a@gmail.com",
  password: "MSOS123a"
});

app.get("/", (req, res) => {
  storage.login((err) => {
    if (err) {
      console.error("Error al conectar con MEGA:", err);
      return res.send(`
        <html><body style="background:#fff0f5;font-family:sans-serif;">
          <h1 style="color:#d81b60;text-align:center;">🎀 Galería pastel 🎀</h1>
          <p style="text-align:center;color:#333;">No se pudo conectar a MEGA. Verifica tu correo y contraseña.</p>
        </body></html>
      `);
    }

    const videos = storage.files.filter(f => f.name.endsWith(".mp4"));

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

