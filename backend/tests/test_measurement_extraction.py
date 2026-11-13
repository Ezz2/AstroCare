import unittest

from app.services.measurement_extraction import extract_measurements


class MeasurementExtractionTests(unittest.TestCase):
    def test_extracts_multiple_measurements(self):
        result = extract_measurements(
            "My heart rate is 90 and my blood pressure is 120 over 80."
        )
        self.assertEqual(result.measurements.heart_rate, 90)
        self.assertEqual(result.measurements.systolic_bp, 120)
        self.assertEqual(result.measurements.diastolic_bp, 80)

    def test_extracts_supported_units(self):
        result = extract_measurements(
            "My oxygen saturation is 98 percent, temperature is 37 degrees Celsius, "
            "blood glucose is 95 milligrams per deciliter, and I slept for 7 hours."
        )
        self.assertEqual(result.measurements.spo2, 98)
        self.assertEqual(result.measurements.body_temperature, 37)
        self.assertEqual(result.measurements.blood_glucose, 95)
        self.assertEqual(result.measurements.sleep_duration, 7)

    def test_extracts_spoken_numbers(self):
        result = extract_measurements(
            "My heart rate is ninety eight and my blood pressure is one hundred twenty over eighty."
        )
        self.assertEqual(result.measurements.heart_rate, 98)
        self.assertEqual(result.measurements.systolic_bp, 120)
        self.assertEqual(result.measurements.diastolic_bp, 80)

    def test_temperature_without_unit_is_not_extracted(self):
        result = extract_measurements("My temperature is 37.")
        self.assertIsNone(result.measurements.body_temperature)
        self.assertTrue(result.warnings)

    def test_unrelated_numbers_are_not_extracted(self):
        result = extract_measurements("The mission has 90 days remaining.")
        self.assertFalse(result.has_measurements)


if __name__ == "__main__":
    unittest.main()
