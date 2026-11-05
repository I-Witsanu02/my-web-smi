"""Synthetic safety tests. These numbers are not experimental model results."""
import unittest
from feedback_learning import paired_comparison,approved_training_feedback
class FeedbackLearningTests(unittest.TestCase):
    def test_reference_does_not_mutate_prediction(self):
        b=[{'patient_id':str(i),'reference_months':100,'predicted_months':110} for i in range(4)]
        c=[dict(r,predicted_months=105) for r in b]
        r=paired_comparison(b,c);self.assertEqual(r['delta_mae'],-5);self.assertFalse(r['automatic_release']);self.assertEqual(b[0]['predicted_months'],110)
    def test_pairs_must_match(self):
        with self.assertRaises(ValueError):paired_comparison([],[])
    def test_simulation_and_protected_are_excluded(self):
        item={'id':'synthetic','status':'approved','payload':{'patient_id':'protected','simulation':True,'expert_bone_age_months':100}}
        result=approved_training_feedback([item],{'protected'});self.assertFalse(result['accepted']);self.assertTrue(result['excluded']);self.assertFalse(result['automatic_training'])
if __name__=='__main__':unittest.main()
