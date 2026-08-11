# Restricted Character Recognition and Validation System !!


A complete web application for validating uploaded character images against a fixed allowed dataset:

- Numbers: `1`
- Letters: `S`

The backend preprocesses uploaded images, runs OCR with EasyOCR, validates the detected character, stores each result in SQLite, and exposes history/statistics APIs. The frontend provides a clean React interface for upload, validation, history search, pagination, and allowed dataset viewing.

## Technology Stack

Backend:

- Python 3.12+
- FastAPI
- EasyOCR
- OpenCV
- SQLAlchemy
- SQLite

Frontend:

- React
- Vite
- Tailwind CSS
- Axios

## Project Structure

```text
backend/
  main.py
  database.py
  models.py
  routers/
    upload.py
    history.py
    stats.py
    allowed.py
  services/
    ocr_service.py
    validation_service.py
  uploads/

frontend/
  src/
    pages/
      Dashboard.jsx
      Validator.jsx
      History.jsx
      AllowedDataset.jsx
    components/
      Navbar.jsx
      StatCard.jsx
      UploadBox.jsx
      ResultCard.jsx
    services/
      api.js
```

## Backend Installation

From the project root:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

On macOS or Linux, activate the virtual environment with:

```bash
source venv/bin/activate
```

The backend runs at:

```text
http://127.0.0.1:8000
```

API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Frontend Installation

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://127.0.0.1:5173
```

## API Endpoints

### POST `/api/upload`

Accepts an image upload, performs preprocessing and OCR, validates the detected character, stores the result, and returns the analysis.

### GET `/api/history`

Returns upload history sorted newest first.

### GET `/api/stats`

Returns total uploads, valid count, invalid count, and OCR error count.

### GET `/api/allowed`

Returns the allowed character dataset.

## OCR Workflow

Each uploaded image is processed with:

1. Grayscale conversion
2. Noise reduction
3. Resize to a stable OCR input size
4. Adaptive thresholding
5. EasyOCR detection using an allowlist of `0-9` and `A-Z`
6. Normalization to uppercase alphanumeric character
7. Validation against `["1", "S"]`

## Notes

EasyOCR may download model files on first use. The first upload can take longer while the OCR model initializes.
