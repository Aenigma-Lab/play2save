 # ![Project Icon](https://img.icons8.com/ios/50/000000/download.png) Play2Save


A simple public website for downloading video and audio content from multiple platforms (e.g., YouTube, Instagram) in MP3 and MP4 formats. This tool supports various video and audio qualities and provides a seamless download experience with detailed information on available formats.

## Features ✨
- **Support for multiple formats**: MP3 (all bitrates) and MP4 (audio-only in all qualities).
- **Fetch available formats**: Simply paste the video link, and the available formats will be automatically displayed.
- **Download progress bar**: Track the download progress in real-time.
- **Direct browser downloads**: Downloads start directly in the browser without additional software.
- **Mobile responsive**: Optimized UI for mobile devices.
- **Video title and thumbnail**: Fetches and displays the video thumbnail and title.

## Screenshots 📸
![Screenshot](https://github.com/Aenigma-Lab/play2save/blob/main/screenshort.png)

## Installation ⚙️

### Prerequisites 🛠️
This project requires [FFmpeg](https://phoenixnap.com/kb/ffmpeg-windows) to convert video and audio formats. Here's how to install FFmpeg locally on Windows:

### Install FFmpeg Locally 🖥️

1. Download the FFmpeg Windows executable from [here](https://phoenixnap.com/kb/ffmpeg-windows).
2. Extract the contents of the downloaded ZIP file.
3. Add the `bin` folder to your system's PATH variable:
   - Right-click on **This PC** and select **Properties**.
   - Click **Advanced system settings** on the left panel.
   - Click the **Environment Variables** button.
   - Under **System variables**, select **Path** and click **Edit**.
   - Click **New** and add the full path to the `bin` folder inside your extracted FFmpeg folder (e.g., `C:\ffmpeg\bin`).
   - Click **OK** to save and exit all windows.

4. To verify the installation, open a command prompt and type `ffmpeg`. You should see FFmpeg's version information.

### Cloning the Repository 💻
1. Clone the repository:
   ```bash
   git clone https://github.com/aenigma-lab/play2save.git
   cd play2save

### Install dependencies 🛠️
```bash
npm install

### Running the Project Locally 🚀
Run the following command to start the server locally:
```bash
npm start

