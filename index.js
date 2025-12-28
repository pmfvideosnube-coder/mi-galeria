const express = require("express");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "service-account.json"),
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

app.get("/", (req, res) => {
  res.redirect("/videos");
});

app.get("/videos", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: "'1t2m1x_lLasgoeSpb7yzS7bF7a51VXjC29Udju7Z_8byyJcyPLG_-NILBQ39sEeGAfSI0QBDk' in parents",
      fields: "files(id, name, createdTime)",
      orderBy: "createdTime desc",
    });

    const files = response.data.files;

    if (!files || files.length === 0) {
      return res.send("<h2>No se encontraron archivos en la carpeta</h2>");
    }

    let html = `
      <html>
      <head>
        <title>Galería Pastel</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background:#f6f9fb; color:#444; margin:0; padding:20px; }
          h1 { color:#6a4c93; text-align:center; }
          .gallery { display:flex; flex-wrap:wrap; gap:20px; justify-content:center; }
          .video-card { background:#fff; border:2px solid #d1d9e6; padding:15px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1); width:320px; text-align:center; transition: transform 0.2s ease; }
          .video-card:hover { transform: scale(1.03); }
          .video-card h3 { color:#4a6fa5; font-size:18px; margin-bottom:10px; }
          video { width:100%; border-radius:8px; }
          p { font-size:14px; color:#777; }
        </style>
      </head>
      <body>
        <h1>🌸🎨 Galería de Videos Pastel 🌸🎨</h1>
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