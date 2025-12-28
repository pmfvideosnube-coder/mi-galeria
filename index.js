const express = require("express");
const { google } = require("googleapis");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Autenticación con Google Drive usando el archivo secreto
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "service-account.json"), // Render lo guarda aquí
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
      q: "mimeType='video/mp4' and 'TU_FOLDER_ID' in parents",
      fields: "files(id, name, webViewLink, createdTime)",
      orderBy: "createdTime desc",
    });

    const files = response.data.files;

    if (!files || files.length === 0) {
      return res.send("<h2>No se encontraron videos en la carpeta</h2>");
    }

    let html = "<h1>Galería de Videos</h1><ul>";
    files.forEach((file) => {
      html += `<li>
        <strong>${file.name}</strong><br>
        <a href="${file.webViewLink}" target="_blank">Ver video</a><br>
        Subido: ${new Date(file.createdTime).toLocaleString()}
      </li><br>`;
    });
    html += "</ul>";

    res.send(html);
  } catch (err) {
    console.error("Error al listar videos:", err);
    res.status(500).send("Error al obtener videos");
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});