ALLOWED_CHARACTERS = ["1", "S"]
ALLOWED_NUMBERS = ["1"]
ALLOWED_LETTERS = ["S"]


def validate_character(character: str | None) -> dict:
    if not character:
        return {
            "status": "ERROR",
            "message": "No recognizable character found.",
        }

    normalized = character.strip().upper()
    if normalized in ALLOWED_CHARACTERS:
        return {
            "status": "VALID",
            "message": "Character exists in allowed dataset.",
        }

    return {
        "status": "INVALID",
        "message": "Character does not exist in allowed dataset.",
    }
