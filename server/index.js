const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Only allow React app to connect
const corsOptions = {
  origin: 'http://localhost:5173', // Your React app URL
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`📥 Incoming: ${req.method} ${req.path}`);
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes - Wrap in try-catch to catch module loading errors
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/projects', require('./routes/projects'));
  app.use('/api/research', require('./routes/research'));
  app.use('/api/documents', require('./routes/documents'));
  app.use('/api/reports', require('./routes/reports'));
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  process.exit(1);
}

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
let server;
try {
  server = app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log('✅ Server process is alive and listening...');
    console.log('✅ Press Ctrl+C to stop the server');
    
    // Keep-alive ping every 30 seconds (only in dev)
    if (process.env.NODE_ENV !== 'production') {
      setInterval(() => {
        console.log(`[${new Date().toLocaleTimeString()}] Server is still running...`);
      }, 30000);
    }
  });

  // Keep process alive
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use!`);
      process.exit(1);
    } else {
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections (but don't exit in dev)
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Don't exit - just log the error
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

  // Keep process alive
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    if (server) {
      server.close(() => {
        process.exit(0);
      });
    }
  });

  process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    if (server) {
      server.close(() => {
        process.exit(0);
      });
    }
  });

} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}