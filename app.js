const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const isProduction = process.env.NODE_ENV === 'production';

const staticOptions = {
  fallthrough: true,
  setHeaders(res) {
    if (!isProduction) {
      res.setHeader('Cache-Control', 'no-store');
    }
  },
};

// Health check endpoint for ALB
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root path with fallback for when index.html doesn't exist
app.get('/', (req, res) => {
  const indexPath = path.join(ROOT_DIR, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Fallback: Return simple HTML if index.html doesn't exist
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>KTB Community</title></head>
          <body>
            <h1>KTB Community Frontend</h1>
            <p>Server is running!</p>
            <p>Health Check: <a href="/health">/health</a></p>
          </body>
        </html>
      `);
    }
  });
});

app.use('/api', express.static(path.join(ROOT_DIR, 'api'), staticOptions));
app.use('/utils', express.static(path.join(ROOT_DIR, 'utils'), staticOptions));
app.use(
  express.static(path.join(ROOT_DIR, 'public'), {
    ...staticOptions,
    index: false, // Root path is handled above
  }),
);

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀  Server running at http://0.0.0.0:${PORT}`);
  console.log(`📡 Health check available at http://0.0.0.0:${PORT}/health`);
});
