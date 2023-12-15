# SubtitleScribe
 Web application that adds subtitles to your videos. Upload a video, and the system will transcribe the audio to generate subtitles.

## Features

- **Upload Video**: Upload your video in MP4 format.
- **Upload Audio**: Upload the extracted audio in MP3 format


## System Overview
- Upon entering the website, you will be presented with the title and a button that reads 'Get Started'. After selecting it, you will be directed  to a page where you can upload a video. After uploading a video, the audio will be extracted and the subtitles will be displayed under the video.

## Project Architecture
- The application uses Google Cloud services. Google Cloud Storage is used for storage, while the Speech-to-Text API handles transcription.

## Screenshots

![Home Page](https://github.com/Steven-K6/SubtitleScribe/assets/145084847/f65aeadd-5bb4-4211-aaaa-844db65b8f36)
*Home page where, upon pressing 'Get Started,' you will be taken to the upload page.*

![Upload Page](https://github.com/Steven-K6/SubtitleScribe/assets/145084847/fcd1057b-7135-4c0b-a6b4-cc40320bec0e)
*Upload an MP4 video in the upload section. Once it is uploaded, the audio will be extracted, and the video will be displayed. Then, upload the extracted audio in MP3 format in the transcribe section, where you can display the subtitles under the video.*


## Project Management 
- **Project Board**: You can track the project's progress and tasks on the [Project Management Board] (https://github.com/users/Steven-K6/projects/11/views/1)

## Prerequisites
- To use this code, follow these steps:
  1. **Google Cloud Account:** Create an account on [Google Cloud Platform](https://console.cloud.google.com/) if you don't have one.

  2. **Google Cloud Storage Bucket:**
     - Create a new Google Cloud Storage bucket.
     - Update the 'bucketName' variable in 'server.js' with your bucket name.

  3. **Speech-to-Text API:**
     - Enable the Speech-to-Text API on Google Cloud Platform.
     - Create and download a JSON key file for your service account.
     - Set the path to your key file in the `GOOGLE_APPLICATION_CREDENTIALS` environment variable '.env'.
       
## Future Releases 
- **Subtitle Language**: Adding an option to select the preferred subtitle language.
- **Subtitle Styling**: Allowing users to customize the format, size and color of the subtitles.
- **Subtitle Editing**: Enabling the user to preview and edit the subtitles.
- **Synchronized Video Player**: Implementing a video player that synchs with generated subtitles
