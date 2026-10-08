// Configure environment variables for isolated backend tests.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-never-use-in-production-123456789';
