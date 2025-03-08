const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const app = express();
const port = 3001;

app.use(fileUpload());  // Use express-fileupload middleware
app.use(express.static('uploads'));  // Serve static files from the 'uploads' folder

// Serve the index.html when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Serve index.html
});

// Endpoint to list uploaded files
app.get('/list-files', (req, res) => {
    fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
        if (err) {
            return res.status(500).send('Unable to list files.');
        }
        res.json({ files });  // Send the list of files in JSON format
    });
});

// Endpoint to handle file upload
app.post('/upload', (req, res) => {
    const file = req.files.file;
    const uploadPath = path.join(__dirname, 'uploads', file.name);

    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send({ message: 'File uploaded!', file: file.name });
    });
});

// Endpoint to download a file
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.download(filePath);  // Send the file to the client for download
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
