const { google } = require("googleapis");
const express = require("express");
const path = require("path");

const app = express();

// Ruta segura al archivo JSON (ajústalo si lo renombraste)
const KEY_FILE = path.join(__dirname, "service-account.json");

// Autenticación con Service Account
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

// Tu carpeta de videos (ID que compartiste con la service account)
const FOLDER_ID = "1t2m1x_lLasgoeSpb7yzS7bF7a51VXjC29Udju7Z_8byyJcyPLG_-NILBQ39sEeGAfSI0QBDk";

// Ruta que renderiza la galería
app.get("/videos", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType contains 'video' and trashed = false`,
      fields: "files(id, name, mimeType, createdTime)",
      orderBy: "createdTime desc",
      pageSize: 1000, // ajusta si tienes más
    });

    const files = (response.data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      url: `https://drive.google.com/file/d/${f.id}/preview`,
      createdTime: f.createdTime,
    }));

    res.send(`
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Galería de Videos</title>
        <style>
          :root {
            --bg: #f9fafb;
            --card: #ffffff;
            --text: #111827;
            --muted: #6b7280;
            --primary: #8b5cf6; /* pastel morado */
          }
          body { font-family: Inter, Arial, sans-serif; margin: 24px; background: var(--bg); color: var(--text); }
          h1 { font-size: 22px; margin: 0 0 12px; }
          .top { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
          #search { flex: 1; min-width: 240px; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px; }
          .count { color: var(--muted); font-size: 14px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }
          .card { background: var(--card); border: 1px solid #f1f5f9; border-radius: 14px; box-shadow: 0 6px 20px rgba(17,24,39,0.06); overflow: hidden; }
          .iframe { width: 100%; aspect-ratio: 16/9; border: 0; display: block; }
          .meta { padding: 12px; }
          .title { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
          .date { font-size: 12px; color: var(--muted); }
          .empty { color: var(--muted); font-size: 14px; margin-top: 16px; }
          .badge { background: #ede9fe; color: var(--primary); font-weight: 600; border-radius: 999px; padding: 6px 10px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="top">
          <h1>🎥 Galería de videos</h1>
          <span class="badge">${files.length} videos</span>
        </div>
        <input id="search" type="text" placeholder="Buscar por título..." />
        <div id="list" class="grid"></div>
        <div id="empty" class="empty" style="display:none;">Sin resultados</div>

        <script>
          const items = ${JSON.stringify(files)};
          const list = document.getElementById('list');
          const search = document.getElementById('search');
          const empty = document.getElementById('empty');

          function formatDate(iso) {
            const d = new Date(iso);
            return d.toLocaleString();
          }

          function render(data) {
            list.innerHTML = '';
            if (!data.length) {
              empty.style.display = 'block';
              return;
            }
            empty.style.display = 'none';
            data.forEach(v => {
              const card = document.createElement('div');
              card.className = 'card';
              card.innerHTML = \`
                <iframe class="iframe" src="\${v.url}" allowfullscreen></iframe>
                <div class="meta">
                  <div class="title">\${v.name}</div>
                  <div class="date">Subido: \${formatDate(v.createdTime)}</div>
                </div>
              \`;
              list.appendChild(card);
            });
          }

          render(items);

          search.addEventListener('input', () => {
            const q = search.value.toLowerCase().trim();
            const filtered = items.filter(v => v.name.toLowerCase().includes(q));
            render(filtered);
          });
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor en http://localhost:" + PORT + "/videos"));