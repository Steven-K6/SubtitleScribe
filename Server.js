const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Set up file storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Serve uploaded videos
app.use('/video', express.static('uploads'));

// Handle video upload
app.post('/upload', upload.single('video'), (req, res) => {
    // Check if a video was uploaded
    if (!req.file) {
        res.status(400).send('No video file uploaded.');
        return;
    }

    // Provide a link to the uploaded video
    res.send(`<a href="/video/${req.file.filename}">View uploaded video</a>`);
;});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/upload.html');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});