const express = require("express");
const { google } = require("googleapis");

const app = express();
const port = process.env.PORT || 3000;

// Leer las credenciales desde la variable de entorno
// En Render → Settings → Environment → agrega una variable:
// Key: GOOGLE_SERVICE_ACCOUNT
// Value: pega el contenido completo del JSON de tu Service Account
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

// Ruta principal redirige a /videos
app.get("/", (req, res) => {
  res.redirect("/videos");
});

// Ruta que lista los videos
app.get("/videos", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: "mimeType='video/mp4' and 'TU_FOLDER_ID' in parents",
      fields: "files(id, name, webViewLink, createdTime)",
      orderBy: "createdTime desc",
    });

    const files = response.data.files;

    if (files.length === 0) {
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