require('dotenv').config();
/* loads configuration settings from an .env file. This is used to store sensitive
information seperately from the code*/

const express = require('express'); 
// imports express.js framework which is used for web applications

const multer = require('multer');
//imports the Multer middleware which handles file uploads

const { Storage } = require('@google-cloud/storage');
// the Google Cloud Storage module for Node.js

const { SpeechClient } = require('@google-cloud/speech');
// the Google Cloud Speech-to-Text module for Node.js

const ffmpeg = require('fluent-ffmpeg');
/* imports the ffmpeg libary which works with audio and video files */

const fs = require('fs');
// the Node.js filesystem module for interacting with the file system

const app = express();
/* Creates an instance of the Express.js application by invoking
the express() function. The app 'object' is used to define routes, 
and middleware */

const port = 3000;
/* Defines a constant 'port' and assigns it the value of 3000. 
When you start the server is will listen on port 3000 and any incoming 
requests will be directed to the application on this port */

const storageClient = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
/* creates a new instance of the Storage class.
The keyFilename is set to refer to an environment variable that should
contain the path to the JSON file containing the Google Cloud service
account key. */

const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
/* creates a new instance of the SpeechClient class.
The keyFilename is set to refer to an environment variable that should
contain the path to the JSON file containing the Google Cloud service
account key. */

const bucketName = 'subtitlescribebucket'; 
const bucket = storageClient.bucket(bucketName);
// sets the bucketName variable to the name of the Google Cloud storage bucket

 const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Multer is set to use 'memoryStorage' which stores files in memory

app.use(express.static('public'));
/* serves static files from the 'public' directory. (html,css javascript)
Allows web browsers to access these files directly */

app.post('/upload', upload.single('video'), async (req, res) => {
    /* defines a route that handles HTTP post requests
    upload.single('video') is a middleware provided by Multer, 
  it expects a single file upload with the name 'video' in the request */
  try {
    if (!req.file) {
      res.status(400).send('No video file uploaded.');
      return;
    }
      /* checks if there is a file upload in the request.
        If no file was uploaded the message will be displayed */
    

    const videoFilename = req.file.originalname;
    // retrieves the originalname of the uploaded video file

    const videoPath = `uploads/${videoFilename}`;
    // creates a path for saving the video file in the 'uploads' directory

    const audioFilename = `${videoFilename.replace(/\.[^/.]+$/, '')}.mp3`;
    //replaces the the extension of the audio file with 'mp3'

    const audioPath = `audio/${audioFilename}`;
    // creates a path for saving the audio file in the 'audio' directory

    const videoFile = bucket.file(videoPath);
    await videoFile.save(req.file.buffer);
    // saves the video file to Google Cloud Storage bucket

    ffmpeg()
      .input(videoFile.createReadStream()) //specifies the input for FFmpeg
      .audioCodec('libmp3lame') // specifies the audio codec
      .toFormat('mp3') // sets the output to mp3
      .on('end', async () => {
        console.log('Audio extraction and conversion complete.');
        // extracts the audio from the video using FFmpeg

        const audioFile = bucket.file(audioPath);
        await audioFile.save(req.file.buffer, {
        metadata: {
            contentType: 'audio/mpeg',
            // this saves the extracted audio to the Google Cloud Storage bucket
        },
    });

        const publicURL = `https://storage.googleapis.com/${bucketName}/${videoPath}`;
        res.send(publicURL);
        // provides the public URL of the uploaded audio in Google Cloud Storage
      })
      .on('error', (err) => {
        console.error('Error extracting audio:', err);
        res.status(500).send('Error extracting audio: ' + err.message);
      })
      .save(audioPath);
      // saves the extracted audio in Google Cloud Storage
  } catch (error) {
    console.error('Error uploading and processing file:', error);
    res.status(500).send('Error uploading and processing file: ' + error.message);
  }
});

app.post('/transcribe-audio', upload.single('audio'), async (req, res) => {
    /* creates a route at the path '/transcribe-audio'. it expects 
    a single file with the name 'audio'. */
    try {
      if (!req.file) {
        res.status(400).send('No audio file uploaded.');
        return;
      }
      // checks if the audio file has been uploaded
  
      const audioPath = `audio/${req.file.originalname}`;
      const audioFile = bucket.file(audioPath);
      // creates the path and file object for storing audio files in Google Cloud Storage
  
      const writeStream = audioFile.createWriteStream();
      writeStream.end(req.file.buffer);
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
      // saves the audio file in Google Cloud Storage
  
      const audioDurationInSeconds = await getAudioDuration(audioFile);
      // calls the 'getAudioDuration' function to get the duration of the uploaded audio file
  
      let transcription;
      if (audioDurationInSeconds > 60) {
        const storageUri = `gs://${bucketName}/${audioPath}`;
        const longRunningRequest = {
          audio: {
            uri: storageUri,
          },
          config: {
            encoding: 'MP3',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
          },
        };

        const [operation] = await speechClient.longRunningRecognize(longRunningRequest);
        const [response] = await operation.promise();
        transcription = response.results.map(result => result.alternatives[0].transcript).join(' ... ');
         // use LongRunningRecognize for audio longer than 1 minute

      } else {
        const audio = {
          content: req.file.buffer.toString('base64'),
        };
  
        const request = {
          audio: audio,
          config: {
            encoding: 'MP3',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
          },
        };
  
        const [response] = await speechClient.recognize(request);
        transcription = response.results.map(result => result.alternatives[0].transcript).join(' ... ');
      }
      /* use recognize for audio shorter than 1 minute.
       Performs the transcription using the Google Cloud Speech-to-Text
       API and formats the transcription with '...' between segements. */
      
      res.status(200).json({ transcription });
    } catch (error) {
      console.error('Error transcribing audio:', error);
      res.status(500).json('Error transcribing audio.');
    }
  });

  async function getAudioDuration(audioFile) {
    // declares an asynchronous function names 'getAudioDuration'

    return new Promise((resolve, reject) => {
      const tmpFilePath = 'temp_audio.mp3';
      // creates a temporary file to store the audio buffer
  
      audioFile.createReadStream()
        .pipe(fs.createWriteStream(tmpFilePath))
        // downloads the audio file from Google Cloud Storage

        .on('finish', () => {
          ffmpeg.ffprobe(tmpFilePath, (err, metadata) => {
            if (err) {
              reject(err);
            } else {
            /* uses 'ffprobe' from the 'fluent-ffmpeg' library to get the 
            duration of the audio file */
              resolve(metadata.format.duration);
              // resolves with the duration in seconds
            }
  
            fs.unlinkSync(tmpFilePath);
            // removes the temporary file
          });
        })
        .on('error', reject);
    });
  }
  
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/Home.html');
});
/*when the user selects the root URL of the application, the Home.html
file will be sent as a response. Shows the HTML file in the browser*/

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
/*starts the express server on port 3000 and logs a message
indicating that the server is running */