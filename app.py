from flask import Flask, render_template, request, jsonify, send_file
from yt_dlp import YoutubeDL
import os
import uuid

app = Flask(__name__)
DOWNLOAD_FOLDER = 'downloads'
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

# Route to serve index.html
@app.route("/")
def index():
    return render_template("index.html")

# Route to extract video information
@app.route("/extract", methods=["POST"])
def extract():
    url = request.json.get("url")
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'forcejson': True,
    }
    formats = []
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        for f in info.get('formats', []):
            if f.get('filesize') is None:
                continue
            label = f"{f.get('format_note', '')} | {f.get('ext')} | {f.get('format_id')} | {round(f['filesize'] / 1024 / 1024, 2)}MB"
            formats.append({
                'format_id': f['format_id'],
                'label': label,
                'ext': f['ext']
            })
    return jsonify(formats=formats)

# Route to fetch video info (title and thumbnail)
@app.route("/info", methods=["POST"])
def video_info():
    url = request.json.get("url")
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'forcejson': True,
    }
    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return jsonify({
                'title': info.get('title', 'Unknown Title'),
                'thumbnail': info.get('thumbnail', ''),
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to handle video download (merge and send file)
@app.route("/download", methods=["POST"])
def download():
    url = request.json["url"]
    format_id = request.json["format_id"]
    unique_id = str(uuid.uuid4())
    temp_path = os.path.join(DOWNLOAD_FOLDER, unique_id)
    os.makedirs(temp_path, exist_ok=True)

    ydl_opts = {
        'format': f'{format_id}+bestaudio/best',  # Download selected video format + best audio
        'outtmpl': os.path.join(temp_path, '%(title)s.%(ext)s'),
        'merge_output_format': 'mp4',
        'postprocessors': [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',
        }],
        'ffmpeg_location': os.path.abspath('C:/ffmpeg/bin'),  # Update this to actual ffmpeg.exe path
        'noplaylist': True,
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filepath = ydl.prepare_filename(info)

        if not filepath.endswith('.mp4'):
            filepath = filepath.rsplit('.', 1)[0] + '.mp4'

        return send_file(filepath, as_attachment=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route for MP3 download
@app.route("/download_mp3", methods=["POST"])
def download_mp3():
    url = request.json["url"]
    unique_id = str(uuid.uuid4())
    temp_path = os.path.join(DOWNLOAD_FOLDER, unique_id)
    os.makedirs(temp_path, exist_ok=True)

    ydl_opts = {
        'format': 'bestaudio/best',  # Only best audio needed
        'outtmpl': os.path.join(temp_path, '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'ffmpeg_location': os.path.abspath('C:/ffmpeg/bin'),
        'noplaylist': True,
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filepath = ydl.prepare_filename(info)

        if not filepath.endswith('.mp3'):
            filepath = filepath.rsplit('.', 1)[0] + '.mp3'

        return send_file(filepath, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=8080)
