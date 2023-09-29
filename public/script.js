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

        const formData = new FormData(uploadForm);
        /* object formData is created to send the uploaded file
        via AJAX to the server */

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });
            /* sends a POST request to the server at the /upload
            endpoint using fetch. It sends the uploaded file in the 
            formData object. Using await makes sure that the response 
            is recieved before the function executes */

            if (response.ok) {
                const videoURL = await response.text();
                /* extracts the url of the uploaded video from the 
                server response */
                videoElement.src = videoURL;
                /* sets the src attribute of the HTML videoElement 
                to the videos URL, which will load and display the video */
                videoElement.style.display = 'block';
                /* if the file upload request is successful. The
                uploaded video will be displayed*/
            } else {
                console.error('Upload failed:', response.statusText);
                /* if there is an error. It will log the error
                message to the console */
            }
        } catch (error) {
            console.error('Error:', error);
            /* catches any unexpected errors like network issues and is 
            logged to the console */
        }
    });
});
