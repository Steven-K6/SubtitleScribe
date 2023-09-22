const express = require('express');
// imports express.js framework which is used for web applications

const multer = require('multer');
//imports the multer middleware which handles file uploads

const path = require('path');
const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
/*Uploaded videos will be saved to the 'uploads' directory with their
orignal filenames*/

const upload = multer({ storage: storage });

app.use(express.static('public'));
//serves static files from the 'public' directory. (html,css javascript)

app.use('/video', express.static('uploads'));
//serves uploaded videos from the 'uploads' directory

app.post('/upload', upload.single('video'), (req, res) => {
  //defines a route that handles HTTP post requests
    
    if (!req.file) {
        res.status(400).send('No video file uploaded.');
        return;
    }
    res.send(`<a href="/video/${req.file.filename}">View uploaded video</a>`);
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
