import logging
from pathlib import Path
from threading import Lock

import cv2
import numpy as np

logger = logging.getLogger(__name__)

OCR_TARGETS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
_reader = None
_reader_error = None
_reader_lock = Lock()


def _get_reader():
    global _reader, _reader_error
    if _reader is not None:
        return _reader
    if _reader_error is not None:
        return None

    with _reader_lock:
        if _reader is not None:
            return _reader
        if _reader_error is not None:
            return None
        try:
            import easyocr

            logger.info("Initializing EasyOCR reader")
            _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
            return _reader
        except ModuleNotFoundError as exc:
            _reader_error = "EasyOCR not installed"
            logger.exception("EasyOCR import failed: %s", exc)
            return None
        except Exception as exc:
            _reader_error = "OCR processing failed"
            logger.exception("EasyOCR initialization failed: %s", exc)
            return None


def _normalize_detected_text(text: str) -> str | None:
    normalized = "".join(ch for ch in str(text).strip().upper() if ch.isalnum())
    for character in normalized:
        if character in OCR_TARGETS:
            return character
    return None


def _read_grayscale(image_path: str) -> tuple[np.ndarray | None, str | None]:
    try:
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            return None, "Invalid image"
        return image, None
    except Exception as exc:
        logger.exception("Image loading failed: %s", exc)
        return None, "Invalid image"


def _character_mask(gray: np.ndarray) -> tuple[np.ndarray | None, str | None]:
    try:
        if gray.size == 0:
            return None, "Invalid image"

        max_side = max(gray.shape[:2])
        scale = 320 / max_side if max_side else 1
        resized = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
        blurred = cv2.GaussianBlur(resized, (5, 5), 0)
        _, mask = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        if np.count_nonzero(mask) > mask.size * 0.55:
            mask = cv2.bitwise_not(mask)

        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

        coords = cv2.findNonZero(mask)
        if coords is None:
            return None, "No character detected"

        x, y, w, h = cv2.boundingRect(coords)
        if w < 8 or h < 8:
            return None, "No character detected"

        cropped = mask[y : y + h, x : x + w]
        return _center_on_canvas(cropped, 96), None
    except Exception as exc:
        logger.exception("Image preprocessing failed: %s", exc)
        return None, "OCR processing failed"


def preprocess_image(image_path: str) -> tuple[np.ndarray | None, str | None]:
    gray, error = _read_grayscale(image_path)
    if error:
        return None, error
    return _character_mask(gray)


def _center_on_canvas(mask: np.ndarray, size: int) -> np.ndarray:
    height, width = mask.shape[:2]
    if height == 0 or width == 0:
        return np.zeros((size, size), dtype=np.uint8)

    scale = min((size - 20) / width, (size - 20) / height)
    new_width = max(1, int(width * scale))
    new_height = max(1, int(height * scale))
    resized = cv2.resize(mask, (new_width, new_height), interpolation=cv2.INTER_AREA)
    _, resized = cv2.threshold(resized, 127, 255, cv2.THRESH_BINARY)

    canvas = np.zeros((size, size), dtype=np.uint8)
    x = (size - new_width) // 2
    y = (size - new_height) // 2
    canvas[y : y + new_height, x : x + new_width] = resized
    return canvas


def _template_variants(character: str) -> list[np.ndarray]:
    fonts = [
        cv2.FONT_HERSHEY_SIMPLEX,
        cv2.FONT_HERSHEY_DUPLEX,
        cv2.FONT_HERSHEY_COMPLEX,
        cv2.FONT_HERSHEY_TRIPLEX,
    ]
    variants = []
    for font in fonts:
        for scale in (2.0, 2.3, 2.6, 2.9):
            for thickness in (3, 5, 7):
                canvas = np.zeros((140, 140), dtype=np.uint8)
                (width, height), baseline = cv2.getTextSize(character, font, scale, thickness)
                x = max(1, (140 - width) // 2)
                y = max(height + 1, (140 + height) // 2 - baseline)
                cv2.putText(canvas, character, (x, y), font, scale, 255, thickness, cv2.LINE_AA)
                variants.append(_center_on_canvas(canvas, 96))
    return variants


def _fallback_detect(mask: np.ndarray) -> dict:
    try:
        best_character = None
        best_score = -1.0
        for character in OCR_TARGETS:
            for template in _template_variants(character):
                score = float(cv2.matchTemplate(mask, template, cv2.TM_CCOEFF_NORMED)[0][0])
                if score > best_score:
                    best_score = score
                    best_character = character

        if best_character is None or best_score < 0.18:
            return {
                "character": None,
                "confidence": None,
                "status": "ERROR",
                "message": "No character detected",
                "engine": "opencv-template",
            }

        confidence = max(0.0, min(1.0, (best_score + 1.0) / 2.0))
        return {
            "character": best_character,
            "confidence": confidence,
            "status": "OK",
            "message": "Character detected",
            "engine": "opencv-template",
        }
    except Exception as exc:
        logger.exception("Fallback OCR failed: %s", exc)
        return {
            "character": None,
            "confidence": None,
            "status": "ERROR",
            "message": "OCR processing failed",
            "engine": "opencv-template",
        }


def detect_character(image_path: str) -> dict:
    logger.info("OCR started for %s", image_path)
    if not Path(image_path).exists():
        logger.error("Uploaded file was not found: %s", image_path)
        return {
            "character": None,
            "confidence": None,
            "status": "ERROR",
            "message": "Uploaded file was not found",
            "engine": "none",
        }

    processed, preprocess_error = preprocess_image(image_path)
    if preprocess_error:
        return {
            "character": None,
            "confidence": None,
            "status": "ERROR",
            "message": preprocess_error,
            "engine": "preprocess",
        }

    reader = _get_reader()
    if reader is not None:
        try:
            results = reader.readtext(
                processed,
                allowlist=OCR_TARGETS,
                detail=1,
                paragraph=False,
            )
            candidates = []
            for result in results:
                if len(result) < 3:
                    continue
                character = _normalize_detected_text(result[1])
                if character:
                    candidates.append({"character": character, "confidence": float(result[2])})

            if candidates:
                best = max(candidates, key=lambda item: item["confidence"])
                logger.info("OCR result from EasyOCR: %s", best)
                return {
                    "character": best["character"],
                    "confidence": best["confidence"],
                    "status": "OK",
                    "message": "Character detected",
                    "engine": "easyocr",
                }
            logger.info("EasyOCR returned no usable text; using fallback detector")
        except Exception as exc:
            logger.exception("EasyOCR processing failed: %s", exc)

    fallback_result = _fallback_detect(processed)
    logger.info("OCR result from %s: %s", fallback_result["engine"], fallback_result)
    return fallback_result
