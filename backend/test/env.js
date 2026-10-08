// Prépare les variables d'environnement des tests isolés du backend.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-never-use-in-production-123456789';
