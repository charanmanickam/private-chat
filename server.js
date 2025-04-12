const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve public folder
app.use(express.static('public'));

// Set storage engine for uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Handle file upload POST
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileUrl = `/uploads/${file.filename}`;
  io.emit('chat message', { type: 'file', url: fileUrl });
  res.sendStatus(200);
});

// Handle normal chat
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', { type: 'text', text: msg });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
