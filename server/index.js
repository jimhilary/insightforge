const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Allow React app to connect (both dev and production)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Alternative dev port
      process.env.FRONTEND_URL, // Production frontend URL from env
      process.env.VITE_FRONTEND_URL, // Alternative env var name
    ].filter(Boolean); // Remove undefined values
    
    // In development, allow any localhost
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Root health check (for Render and other health check services)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API health check (for application use)
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
  server = app.listen(PORT, '0.0.0.0', () => {
    const env = process.env.NODE_ENV || 'development';
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`✅ Environment: ${env}`);
    if (env === 'production') {
      console.log(`✅ Server is accessible at: ${process.env.RENDER_EXTERNAL_URL || `http://0.0.0.0:${PORT}`}`);
    } else {
      console.log(`✅ Server is accessible at: http://localhost:${PORT}`);
    }
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