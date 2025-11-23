// Vercel serverless function entry point
export default async function handler(req, res) {
  try {
    // Import and run the server
    const { app, server } = await import('../dist/index.js');
    
    // Let Express handle the request
    app(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
