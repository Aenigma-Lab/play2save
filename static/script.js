  const form = document.getElementById('urlForm');
  const videoUrl = document.getElementById('videoUrl');
  const result = document.getElementById('resultContainer');
  const loading = document.getElementById('loading');
  const videoTitleEl = document.getElementById('videoTitle');
  const videoThumbnailEl = document.getElementById('videoThumbnail');
  const videoHeaderEl = document.getElementById('videoHeader');

  // Auto-fetch thumbnail + title
  videoUrl.addEventListener('input', async () => {
    const url = videoUrl.value.trim();
    if (!url.startsWith("http")) return;

    try {
      const res = await fetch('/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();

      if (data.title && data.thumbnail) {
        videoHeaderEl.style.display = 'flex';
        videoTitleEl.textContent = data.title;
        videoThumbnailEl.src = data.thumbnail;
      }
    } catch (err) {
      console.error("Error fetching video info:", err);
    }
  });

  // On submit, show only MP4 w/ audio and MP3, else offer conversion
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    result.innerHTML = '';
    loading.style.display = 'block';

    try {
      const res = await fetch('/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl.value.trim() })
      });

      const data = await res.json();
      loading.style.display = 'none';

      if (data.error) {
        result.innerHTML = `<p class="error">${data.error}</p>`;
        return;
      }

      const formats = data.formats || [];
      const url = videoUrl.value.trim();

      // Filter for MP3 and MP4 WITH audio
      const filtered = formats.filter(f =>
        (f.ext === 'mp3') ||
        (f.ext === 'mp4' && f.audio_codec !== 'none')
      );

      result.innerHTML = `<h2>Available Formats:</h2><div class="formats">`;

      if (filtered.length === 0) {
        result.innerHTML += `
          <div class="format-entry" style="border: 1px solid white;">
            <p>⚠️ No direct .mp3 or .mp4 with audio found.</p>
            <button class="download-btn">
              <a href="#" onclick="convertAndDownload('${url}', 'mp4')" target="_blank">
                <img src="/static/download.svg" alt="Download Icon">
                <span>Convert to MP4</span>
              </a>
            </button>
            <button class="download-btn">
              <a href="#" onclick="convertAndDownload('${url}', 'mp3')" target="_blank">
                <img src="/static/download.svg" alt="Download Icon">
                <span>Convert to MP3</span>
              </a>
            </button>
          </div>`;
      } else {
        filtered.forEach(f => {
          const resolution = f.resolution || f.label || 'N/A';
          const ext = f.ext || 'mp4';
          const fileSizeMB = f.filesize ? Math.round(f.filesize / 1024 / 1024) + 'MB' : 'unknown';

          let label = '';
          let icon = '';

          if (ext === 'mp3') {
            icon = '🎵';
            label = `MP3 Audio (${fileSizeMB})`;
          } else {
            icon = '📹';
            label = `MP4 Video + Audio (${resolution}, ${fileSizeMB})`;
          }

          result.innerHTML += `
            <div class="format-entry" style="border: 1px solid white;">
              <p>${icon} ${label}</p>
              <button class="download-btn">
                <a href="#" onclick="startDownload('${f.format_id}', '${url}', '${ext}')" target="_blank">
                  <img src="/static/download.svg" alt="Download Icon">
                  <span>Download</span>
                </a>
              </button>
            </div>`;
        });
      }

      result.innerHTML += '</div>';
    } catch (err) {
      loading.style.display = 'none';
      console.error("Error fetching formats:", err);
      result.innerHTML = `<p class="error">Failed to fetch formats.</p>`;
    }
  });

  // Standard download
  async function startDownload(formatId, url, ext) {
    try {
      const res = await fetch('/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format_id: formatId, url, ext }) // <-- ADD ext here
      });
  
      if (!res.ok) {
        throw new Error('Failed to fetch the file');
      }
  
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = `download.${ext}`; // <-- use ext dynamically
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Error during download: " + err.message);
    }
  }
  



  // Convert to mp3 or mp4 and download
  async function convertAndDownload(url, toFormat) {
    try {
      const res = await fetch('/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, to_format: toFormat })
      });

      if (!res.ok) throw new Error('Conversion failed');

      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = `converted.${toFormat}`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Conversion failed: " + err.message);
    }
  }
