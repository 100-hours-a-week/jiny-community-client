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

app.use('/api', express.static(path.join(ROOT_DIR, 'api'), staticOptions));
app.use('/utils', express.static(path.join(ROOT_DIR, 'utils'), staticOptions));
app.use(
  express.static(path.join(ROOT_DIR, 'public'), {
    ...staticOptions,
    index: ['index.html', 'index.htm'],
  }),
);

app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`🚀  Server running at http://localhost:${PORT}`);
});
