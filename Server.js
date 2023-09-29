const express = require('express');
// imports express.js framework which is used for web applications

const multer = require('multer');
//imports the Multer middleware which handles file uploads

const path = require('path');
/* imports the Node.js module 'path' which allows you to work 
with file and directory paths */
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

app.use(express.static('public'));
/* serves static files from the 'public' directory. (html,css javascript)
Allows web browsers to access these files directly */

app.use('/video', express.static('uploads'));
//serves uploaded videos from the 'uploads' directory

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
    res.send(`/video/${req.file.filename}`);
;});
 /*checks if the video was uploaded. If successful, sends an HTML
    response containing a link to the uploaded video*/

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
