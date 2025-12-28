const express = require("express");
const { Storage } = require("megajs");

const app = express();
const PORT = process.env.PORT || 3000;

const storage = new Storage({
  email: process.env.MEGA_EMAIL,
  password: process.env.MEGA_PASSWORD
});

app.get("/", (req, res) => {
  storage.login((err) => {
    if (err) {
      console.error("Error al conectar con MEGA:", err);
      return res.send(`
        <html><body style="background:#fff0f5;font-family:sans-serif;">
          <h1 style="color:#d81b60;text-align:center;">🎀 Galería pastel 🎀</h1>
          <p style="text-align:center;color:#333;">No se pudo conectar a MEGA. Verifica tus credenciales.</p>
        </body></html>
      `);
    }

    const videos = storage.files.filter(f => f.name.endsWith(".mp4"));

    let html = `
      <html>
      <head><meta charset="utf-8"><title>Galería pastel</title></head>
      <body style="background:#fff0f5;font-family:sans-serif;">
        <h1 style="color:#d81b60;text-align:center;">🎀 Galería pastel 🎀</h1>
    `;

    videos.forEach(v => {
      html += `
        <div style="margin:20px;padding:10px;background:#fff;border-radius:10px;">
          <h3>${v.name}</h3>
          <video controls width="640">
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

