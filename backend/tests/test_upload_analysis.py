from pathlib import Path
import unittest

import cv2
import numpy as np
from fastapi.testclient import TestClient

from database import init_db
from main import app


EXPECTED_STATUSES = {
    "1": "VALID",
    "2": "INVALID",
    "5": "INVALID",
    "M": "INVALID",
    "E": "INVALID",
    "D": "INVALID",
    "S": "VALID",
    "6": "INVALID",
    "A": "INVALID",
}


def _create_character_image(character: str, path: Path) -> None:
    canvas = np.full((220, 220, 3), 255, dtype=np.uint8)
    font = cv2.FONT_HERSHEY_DUPLEX
    scale = 4.2 if character.isdigit() else 3.8
    thickness = 8
    (width, height), baseline = cv2.getTextSize(character, font, scale, thickness)
    x = (canvas.shape[1] - width) // 2
    y = (canvas.shape[0] + height) // 2 - baseline
    cv2.putText(canvas, character, (x, y), font, scale, (0, 0, 0), thickness, cv2.LINE_AA)
    assert cv2.imwrite(str(path), canvas)


class UploadAnalysisTest(unittest.TestCase):
    def setUp(self):
        init_db()
        self.client = TestClient(app)
        self.tmp_dir = Path(__file__).resolve().parent / "_generated"
        self.tmp_dir.mkdir(exist_ok=True)

    def test_upload_endpoint_analyzes_required_characters(self):
        for character, expected_status in EXPECTED_STATUSES.items():
            with self.subTest(character=character):
                image_path = self.tmp_dir / f"{character}.png"
                _create_character_image(character, image_path)

                with image_path.open("rb") as image_file:
                    response = self.client.post(
                        "/api/upload",
                        files={"file": (image_path.name, image_file, "image/png")},
                    )

                self.assertEqual(response.status_code, 200, response.text)
                payload = response.json()
                self.assertEqual(payload["detected_character"], character)
                self.assertEqual(payload["status"], expected_status)
                self.assertTrue(payload["message"])
                self.assertIn("confidence", payload)

    def test_registered_routes_include_upload_history_stats_and_allowed(self):
        routes = {route.path for route in app.routes}
        self.assertIn("/api/upload", routes)
        self.assertIn("/api/history", routes)
        self.assertIn("/api/stats", routes)
        self.assertIn("/api/allowed", routes)


if __name__ == "__main__":
    unittest.main()
