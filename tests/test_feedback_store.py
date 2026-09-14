from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

import persistence


class FeedbackStoreTest(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.original_path = persistence.DB_PATH
        persistence.DB_PATH = Path(self.temp.name) / "feedback.sqlite3"

    def tearDown(self):
        persistence.DB_PATH = self.original_path
        self.temp.cleanup()

    def test_feedback_is_revisioned_and_requires_approval(self):
        first = persistence.save_feedback("CASE-1", "doctor1", {
            "training_eligible": False, "locked_test": False,
        })
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
        result = persistence.update_feedback_status(item["id"], "approved", "doctor2")
        self.assertEqual(result["status"], "blocked_locked_test")
        stored = persistence.list_feedback("blocked_locked_test")
        self.assertFalse(stored[0]["payload"]["training_eligible"])


if __name__ == "__main__":
    unittest.main()
