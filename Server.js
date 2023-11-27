require('dotenv').config();
/* loads configuration settings from an .env file. This is used to store sensitive
information seperately from the code*/

const express = require('express');
// imports express.js framework which is used for web applications

const multer = require('multer');
//imports the Multer middleware which handles file uploads

const path = require('path');
/* imports the Node.js module 'path' which allows you to work 
with file and directory paths */

const ffmpeg = require('fluent-ffmpeg');
/* imports the ffmpeg libary which works with audio and video files */

const app = express();
/* Creates an instance of the Express.js application by invoking
the express() function. The app 'object' is used to define routes, 
and middleware */
const port = 3000;
/* Defines a constant 'port' and assigns it the value of 3000. 
When you start the server is will listen on port 3000 and any incoming 
requests will be directed to the application on this port */

const storage = multer.diskStorage({
/*assigns a variable named storage to an instance of Multers diskstorage 
engine. diskstorage is used to specify how uploaded files should be stored
on the server's disk */
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
        //defines the directory where the uploaded files will be saved
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
        //defines how the uploaded file should be named on the server
    },
});
/*Uploaded videos will be saved to the 'uploads' directory with their
orignal filenames*/

const upload = multer({ storage: storage });
/* configures Multer for handling file uploads. The storage object
defines how uploaded files should be stored, which was previously
explained */

const { SpeechClient } = require('@google-cloud/speech');
//imports SpeechClient class from the google-cloud/speach package
// the SpeechClient class provides methods for interacting with the Speech to text API

const speechClient = new SpeechClient({
keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
/* creates a new instance of the SpeechClient class.
The keyFilename is set to refer to an environment variable that should
contain the path to the JSON file containing the Google Cloud service
account key. */

app.use(express.static('public'));
/* serves static files from the 'public' directory. (html,css javascript)
Allows web browsers to access these files directly */

app.use('/video', express.static('uploads'));
//serves uploaded videos from the 'uploads' directory

app.use('/audio', express.static('audio'));
//serves static files from the 'audio' directory

app.post('/upload', upload.single('video'), (req, res) => {
  /* defines a route that handles HTTP post requests.
  upload.single('video') is a middleware provided by Multer, 
  it expects a single file upload with the name 'video' in the request */
    
    if (!req.file) {
        res.status(400).send('No video file uploaded.');
        return;
        /* checks if there is a file upload in the request.
        If no file was uploaded the message will be displayed */
    }

const inputVideoFilePath = `uploads/${req.file.filename}`;
/* constructs the path to the uploaded video file. Path to the input */

const outputAudioFilePath = `audio/${req.file.filename.replace(/\.[^/.]+$/, '')}.mp3`; // Output audio format is MP3
/* constructs the path to the output audio file. Its a path to the mp3 
audio file in the 'audio' directory */

ffmpeg() //uses `fluent-ffmpeg` library to perform audio extraction
    .input(inputVideoFilePath) //specifies that the input video will be processed
    .audioCodec('libmp3lame') // specifies the audio codec
    .toFormat('mp3') // sets the output to mp3
    .on('end', () => {
        console.log('Audio extraction and conversion complete.');
    })
    .on('error', (err) => {
        console.error('Error extracting audio:', err);
    })
    //registers an event handler that is triggered when the process is complete

    .save(outputAudioFilePath);
//specifies the path where the output audio files should be saved

    res.send(`/video/${req.file.filename}`);
});

app.post('/transcribe-audio', upload.single('audio'), async (req, res) => {
    //Checks if an audio file was uploaded
    if (!req.file) {
      res.status(400).send('No audio file uploaded.');
      return;
    }
  
    const inputFilePath = `uploads/${req.file.filename}`;
    // Creates a path to the uploaded audio file
  
    const audioContent = await readFile(inputFilePath);
    // reads the uploaded audio file
  
    const audio = {
      content: audioContent.toString('base64'),
    };
    //prepares the audio content to be sent to the Speech-to-Text API
  
    const request = {
      audio: audio,
      config: {
        encoding: 'MP3', 
        sampleRateHertz: 16000, 
        languageCode: 'en-US', 
      },
    };
    // configures the transcription request
  
    try {
      const [response] = await speechClient.recognize(request);
      // sends the transcription request to the API
      
      const transcription = response.results[0].alternatives[0].transcript;
    // logs the transcription response

      res.status(200).json({ transcription });
    } catch (error) {
      console.error('Error transcribing audio:', error);
      res.status(500).json('Error transcribing audio.');
    }
  });
  
  function readFile(filePath) {
    const fs = require('fs');
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
// Function to read the file content asynchronously

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/upload.html');
}); 
/*when the user selects the root URL of the application, the upload.html
file will be sent as a response. Shows the HTML file in the browser*/


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
/*starts the express server on port 3000 and logs a message
indicating that the server is running */