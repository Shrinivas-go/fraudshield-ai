import os
import sys
import unittest
import json

# Add the backend directory to sys.path to import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        # Configure app for testing
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_health_endpoint(self):
        """Test the health check endpoint returns 200 OK."""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'ok')
        self.assertIn('model_features', data)

    def test_auth_signup_validation(self):
        """Test signup endpoint validation (missing email/password)."""
        response = self.client.post('/api/auth/signup', json={
            'name': 'Test User'
        })
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('Email and password are required', data.get('detail', ''))

    def test_predict_requires_auth(self):
        """Test predict endpoint requires authentication."""
        response = self.client.post('/api/demo/predict', json={
            'amount': 100
        })
        # Should return 401 Unauthorized
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn('Authentication token is missing or invalid', data.get('detail', ''))

if __name__ == '__main__':
    unittest.main()
