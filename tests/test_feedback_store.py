from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

import persistence


class FeedbackStoreTest(unittest.TestCase):
    def approved_payload(self):
        return {'training_eligible': False, 'locked_test': False,
                'inference_id': 'test-inference', 'review_status': 'reviewed',
                'curation_evidence': 'test evidence',
                'curation_checks': {key: True for key in ('provenance_approved', 'anatomy_qc_approved', 'consent_approved', 'split_clearance_approved')}}
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.original_path = persistence.DB_PATH
        persistence.DB_PATH = Path(self.temp.name) / "feedback.sqlite3"

    def tearDown(self):
        persistence.DB_PATH = self.original_path
        self.temp.cleanup()

    def test_feedback_is_revisioned_and_requires_approval(self):
        first = persistence.save_feedback("CASE-1", "doctor1", self.approved_payload())
        second = persistence.save_feedback("CASE-1", "doctor1", {
            "training_eligible": False, "locked_test": False,
        })
        self.assertEqual((first["revision"], second["revision"]), (1, 2))
        persistence.update_feedback_status(first["id"], "approved", "doctor2")
        approved = persistence.list_feedback("approved")
        self.assertEqual(len(approved), 1)
        self.assertTrue(approved[0]["payload"]["training_eligible"])

    def test_locked_test_cannot_be_approved(self):
        item = persistence.save_feedback("LOCKED-1", "doctor1", {
            "training_eligible": False, "locked_test": True,
        }, "blocked_locked_test")
        with self.assertRaises(ValueError):
            persistence.update_feedback_status(item["id"], "approved", "doctor2")
        stored = persistence.list_feedback("blocked_locked_test")
        self.assertFalse(stored[0]["payload"]["training_eligible"])

    def test_stale_approved_revision_not_exported(self):
        first = persistence.save_feedback('CASE-2', 'a', self.approved_payload())
        persistence.update_feedback_status(first['id'], 'approved', 'b')
        self.assertEqual(len(persistence.exportable_feedback()), 1)
        persistence.save_feedback('CASE-2', 'a', self.approved_payload())
        self.assertEqual(persistence.exportable_feedback(), [])

    def test_unknown_provenance_cannot_be_approved(self):
        item = persistence.save_feedback('CASE-3', 'a', {'locked_test': False})
        with self.assertRaises(ValueError):
            persistence.update_feedback_status(item['id'], 'approved', 'b')


if __name__ == "__main__":
    unittest.main()
