const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const app = express();
const port = 3001;

// Define the D drive folder path
let D_DRIVE_FOLDER = 'D:/Backup';   // Default folder path

// Ensure the D drive folder exists
if (!fs.existsSync(D_DRIVE_FOLDER)) {
    fs.mkdirSync(D_DRIVE_FOLDER, { recursive: true });
}

app.use(fileUpload());  // Use express-fileupload middleware
app.use(express.static(D_DRIVE_FOLDER));  // Serve static files from the D drive folder

// Serve the index.html when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));  // Serve index.html
});

// Endpoint to get current root folder path
app.get('/get-root-path', (req, res) => {
    res.json({ rootPath: D_DRIVE_FOLDER });
});

// Endpoint to set new root folder path
app.post('/set-root-path', (req, res) => {
    const newPath = req.body.path;
    
    // Validate the path
    if (!newPath || !fs.existsSync(newPath) || !fs.statSync(newPath).isDirectory()) {
        return res.status(400).json({ error: 'Invalid folder path' });
    }
    
    D_DRIVE_FOLDER = newPath;
    app.use(express.static(D_DRIVE_FOLDER));  // Update static file serving
    res.json({ message: 'Root path updated successfully', rootPath: D_DRIVE_FOLDER });
});

// Function to get file/folder details
function getItemDetails(itemPath) {
    const stats = fs.statSync(itemPath);
    return {
        name: path.basename(itemPath),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modifiedDate: stats.mtime,
        path: itemPath
    };
}

// Endpoint to list files and folders
app.get('/list-files', (req, res) => {
    const currentPath = req.query.path || D_DRIVE_FOLDER;
    
    try {
        const items = fs.readdirSync(currentPath);
        const itemsWithDetails = items.map(item => {
            const itemPath = path.join(currentPath, item);
            return getItemDetails(itemPath);
        });
        
        res.json({
            currentPath: currentPath,
            parentPath: path.dirname(currentPath),
            items: itemsWithDetails
        });
    } catch (err) {
        res.status(500).send('Unable to list files and folders.');
    }
});

// Endpoint to handle file upload
app.post('/upload', (req, res) => {
    const file = req.files.file;
    const uploadPath = path.join(D_DRIVE_FOLDER, file.name);

    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send({ message: 'File uploaded!', file: file.name });
    });
});

// Endpoint to download a file
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(D_DRIVE_FOLDER, req.params.filename);
    res.download(filePath);  // Send the file to the client for download
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

