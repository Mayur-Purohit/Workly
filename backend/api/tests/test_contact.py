import json
from django.test import TestCase, Client
from django.core import mail

class ContactViewTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_contact_form_success(self):
        payload = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "message": "Hello, I am interested in your recruitment platform."
        }
        response = self.client.post(
            '/api/v1/public/contact',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get('success'))
        self.assertIn('sent successfully', data.get('data', {}).get('message', ''))
        
        # Verify email was queued/sent to admin
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn("Jane Doe", sent_email.subject)
        self.assertIn("Hello, I am interested", sent_email.body)

    def test_contact_form_missing_fields(self):
        payload = {
            "name": "Jane Doe",
            "email": "",
            "message": "Short msg"
        }
        response = self.client.post(
            '/api/v1/public/contact',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data.get('success'))
