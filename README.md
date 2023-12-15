# SubtitleScribe
 Web application that adds subtitles to your videos. Upload a video, and the system will transcribe the audio to generate subtitles.

## Features

- **Upload Video**: Upload your video in MP4 format.
- **Upload Audio**: Upload the extracted audio in MP3 format


## System Overview
- Upon entering the website, you will be presented with the title and a button that reads 'Get Started'. After selecting it, you will be directed  to a page where you can upload a video. After uploading a video, the audio will be extracted and the subtitles will be displayed under the video.

## Project Architecture
- The application uses Google Cloud services. Google Cloud Storage is used for efficient storage, while the Speech-toText API handles transcription.

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
     - Set the path to your key file in the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.
       
## Future Releases 
- **Subtitle Language**: Adding an option to select the preferred subtitle language.
- **Subtitle Styling**: Allowing users to customize the format, size and color of the subtitles.
- **Subtitle Editing**: Enabling the user to preview and edit the subtitles.
- **Synchronized Video Player**: Implementing a video player that synchs with generated subtitles
