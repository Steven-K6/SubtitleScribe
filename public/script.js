document.addEventListener('DOMContentLoaded', () => {
    /* makes sure that the code doesnt run before the document is ready.
    DOMContentLoaded allows you to modify the HTML elements */

    const videoElement = document.getElementById('uploadedVideo');
    const uploadForm = document.getElementById('uploadForm');
    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.querySelector('input[type="file"]');
    // References to HTML elements by their ID

    uploadButton.addEventListener('click', async () => {
        // adds a click event listener to the upload button
        await uploadVideo();
    });
});

async function transcribe() {
    // declares an asychronous function named 'transcribe'

    const audioInput = document.getElementById('audioInput');
    const transcriptionDiv = document.getElementById('transcription');
    // references HTML elements with their IDs

    const audioFile = audioInput.files[0];
    if (!audioFile) {
        alert('Please select an audio file.');
        return;
    }
    // retrieves the selected audio file from the file input 'audioInput'

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
        const response = await fetch('/transcribe-audio', {
            method: 'POST',
            body: formData,
        });
        // sends a POST request to the '/transcribe-audio' endpoint

        const { transcription } = await response.json();
        transcriptionDiv.textContent = transcription;
        // the transcription result is taken from the JSON file and displayed in the transcriptionDiv element

    } catch (error) {
        console.error('Unexpected error:', error);
        alert('Unexpected error during transcription.');
    }
}

async function uploadVideo() {
    // declares an asychronous function named 'uploadVideo()'

    const videoElement = document.getElementById('uploadedVideo');
    const uploadForm = document.getElementById('uploadForm');
     //references HTML elements by their IDs
    
    const formData = new FormData(uploadForm);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });
        // sends a POST request to the '/upload' endpoint

        if (response.ok) {
            const videoURL = await response.text();
            videoElement.src = videoURL;
            videoElement.style.display = 'block';
        } else {
            console.error('Upload failed:', response.statusText);
            // displays the video element if successful
        }
    } catch (error) {
        console.error('Error:', error);
    }
}