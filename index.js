const express = require("express");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Autenticación con Google Drive usando el archivo secreto
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "service-account.json"),
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

// Redirigir la raíz hacia /videos
app.get("/", (req, res) => {
  res.redirect("/videos");
});

// Ruta que lista los videos de tu carpeta en Drive
app.get("/videos", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: "'1t2m1x_lLasgoeSpb7yzS7bF7a51VXjC29Udju7Z_8byyJcyPLG_-NILBQ39sEeGAfSI0QBDk' in parents",
      fields: "files(id, name, createdTime, mimeType)",
      orderBy: "createdTime desc",
    });

    const files = response.data.files;

    if (!files || files.length === 0) {
      return res.send("<h2>No se encontraron archivos en la carpeta</h2>");
    }

    let html = `
      <html>
      <head>
        <title>Galería de Videos</title>
        <style>
          body { font-family: Arial, sans-serif; background:#f9f9f9; color:#333; }
          h1 { color:#444; }
          .gallery { display:flex; flex-wrap:wrap; gap:20px; }
          .video-card { background:#fff; padding:15px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); width:300px; }
          video { width:100%; border-radius:6px; }
        </style>
      </head>
      <body>
        <h1>🎬 Galería de Videos</h1>
        <div class="gallery">
    `;

    files.forEach((file) => {
      const videoUrl = `https://drive.google.com/uc?id=${file.id}&export=download`;
      html += `
        <div class="video-card">
          <h3>${file.name}</h3>
          <video controls>
            <source src="${videoUrl}" type="video/mp4">
            Tu navegador no soporta video.
          </video>
          <p>Subido: ${new Date(file.createdTime).toLocaleString()}</p>
        </div>
      `;
    });

    html += `
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error("Error al listar videos:", err);
    res.status(500).send("Error al obtener videos");
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});