import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Simple in-memory session store
const sessions = new Map();

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Coding Agent Skills - Demo App</title>
      <style>
        body { font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        .nav { margin: 20px 0; }
        .nav a { margin-right: 15px; color: #0066cc; text-decoration: none; }
        .nav a:hover { text-decoration: underline; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
      </style>
    </head>
    <body>
      <h1 data-testid="main-heading">AI Coding Agent Skills</h1>
      <p data-testid="welcome-message">Welcome to the demo web application for testing Playwright E2E skills.</p>

      <div class="nav">
        <a href="/" data-testid="nav-home">Home</a>
        <a href="/login" data-testid="nav-login">Login</a>
        <a href="/dashboard" data-testid="nav-dashboard">Dashboard</a>
        <a href="/about" data-testid="nav-about">About</a>
      </div>

      <div class="card">
        <h2>Features</h2>
        <ul>
          <li>Simple authentication flow</li>
          <li>Dashboard with user info</li>
          <li>Stable test selectors with data-testid</li>
          <li>Playwright MCP integration ready</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - AI Coding Agent Skills</title>
      <style>
        body { font-family: sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
        form { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        input { width: 100%; padding: 8px; margin: 10px 0; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0052a3; }
        .error { color: red; margin: 10px 0; display: none; }
      </style>
    </head>
    <body>
      <h1 data-testid="login-heading">Login</h1>
      <form action="/api/login" method="POST">
        <div>
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" data-testid="username-input" required>
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" data-testid="password-input" required>
        </div>
        <div class="error" data-testid="error-message"></div>
        <button type="submit" data-testid="login-button">Login</button>
      </form>
      <p><a href="/">Back to Home</a></p>
      <p><small>Test credentials: demo / password123</small></p>
    </body>
    </html>
  `);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Simple auth check (for demo purposes only)
  if (username === process.env.E2E_USER || username === 'demo') {
    if (password === process.env.E2E_PASS || password === 'password123') {
      const sessionId = Math.random().toString(36).substring(7);
      sessions.set(sessionId, { username, loginTime: new Date() });

      res.redirect(`/dashboard?session=${sessionId}`);
      return;
    }
  }

  res.status(401).send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login Failed</title></head>
    <body>
      <h1>Login Failed</h1>
      <p data-testid="error-message">Invalid credentials</p>
      <a href="/login">Try again</a>
    </body>
    </html>
  `);
});

app.get('/dashboard', (req, res) => {
  const sessionId = req.query.session;
  const session = sessions.get(sessionId);

  if (!session) {
    res.redirect('/login');
    return;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard - AI Coding Agent Skills</title>
      <style>
        body { font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .logout { color: #cc0000; text-decoration: none; }
      </style>
    </head>
    <body>
      <h1 data-testid="dashboard-heading">Dashboard</h1>
      <div class="card">
        <h2>Welcome, <span data-testid="user-name">${session.username}</span>!</h2>
        <p>Login time: <span data-testid="login-time">${session.loginTime.toLocaleString()}</span></p>
        <p><a href="/logout?session=${sessionId}" class="logout" data-testid="logout-link">Logout</a></p>
      </div>
      <p><a href="/">Back to Home</a></p>
    </body>
    </html>
  `);
});

app.get('/logout', (req, res) => {
  const sessionId = req.query.session;
  sessions.delete(sessionId);
  res.redirect('/');
});

app.get('/about', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>About - AI Coding Agent Skills</title>
      <style>
        body { font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
      </style>
    </head>
    <body>
      <h1 data-testid="about-heading">About</h1>
      <p data-testid="about-description">
        This is a demo application for testing the Playwright E2E skill integration
        with Claude Code and Playwright MCP.
      </p>
      <p><a href="/">Back to Home</a></p>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Demo app listening on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
