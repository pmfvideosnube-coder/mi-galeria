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

app.get("/", (req, res) => {
  res.redirect("/videos");
});

app.get("/videos", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: "'1t2m1x_lLasgoeSpb7yzS7bF7a51VXjC29Udju7Z_8byyJcyPLG_-NILBQ39sEeGAfSI0QBDk' in parents",
      fields: "files(id, name, createdTime, webContentLink)",
      orderBy: "createdTime desc",
    });

    const files = response.data.files;

    if (!files || files.length === 0) {
      return res.send("<h2>No se encontraron archivos en la carpeta</h2>");
    }

    let html = `
      <html>
      <head>
        <title>Galería</title>
        <style>
          :root {
            --pastel-bg: #f6f9fb;
            --pastel-card: #ffffff;
            --pastel-border: #d1d9e6;
            --pastel-title: #6a4c93;
            --pastel-subtitle: #4a6fa5;
            --pastel-text: #777777;
          }

          body {
            font-family: 'Segoe UI', sans-serif;
            background: var(--pastel-bg);
            color: var(--pastel-text);
            margin: 0;
            padding: 20px;
          }

          .search-bar {
            text-align: center;
            margin-bottom: 20px;
          }

          input[type="text"] {
            width: 60%;
            padding: 10px;
            border: 2px solid var(--pastel-border);
            border-radius: 8px;
            font-size: 16px;
          }

          .gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
          }

          .video-card {
            background: var(--pastel-card);
            border: 2px solid var(--pastel-border);
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            width: 320px;
            text-align: center;
            transition: transform 0.2s ease;
          }

          .video-card:hover {
            transform: scale(1.03);
          }

          .video-card h3 {
            color: var(--pastel-subtitle);
            font-size: 18px;
            margin-bottom: 10px;
          }

          video {
            width: 100%;
            border-radius: 8px;
          }

          p {
            font-size: 14px;
            color: var(--pastel-text);
          }
        </style>
      </head>
      <body>
        <div class="search-bar">
          <input type="text" id="searchInput" placeholder="Buscar videos...">
        </div>
        <div class="gallery" id="gallery">
    `;

    files.forEach((file) => {
      const videoUrl = file.webContentLink; // ✅ enlace correcto para reproducir
      html += `
        <div class="video-card" data-name="${file.name.toLowerCase()}">
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
        <script>
          const searchInput = document.getElementById('searchInput');
          const cards = document.querySelectorAll('.video-card');

          searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            cards.forEach(card => {
              const name = card.getAttribute('data-name');
              if (name.includes(query)) {
                card.style.display = 'block';
              } else {
                card.style.display = 'none';
              }
            });
          });
        </script>
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