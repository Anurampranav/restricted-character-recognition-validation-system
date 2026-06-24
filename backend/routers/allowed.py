from fastapi import APIRouter

from services.validation_service import ALLOWED_CHARACTERS, ALLOWED_LETTERS, ALLOWED_NUMBERS

router = APIRouter()


@router.get("/allowed")
def get_allowed_dataset():
    return {
        "allowed_characters": ALLOWED_CHARACTERS,
        "allowed_numbers": ALLOWED_NUMBERS,
        "allowed_letters": ALLOWED_LETTERS,
    }
