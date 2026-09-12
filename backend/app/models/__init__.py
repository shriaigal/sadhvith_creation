# This project stores MongoDB documents as plain dicts and validates
# input/output shape with Pydantic schemas (see app/schemas/), so there
# are no separate ODM model classes. The package is kept so the project
# structure matches a conventional FastAPI layout and is easy to extend
# (e.g. with Beanie/ODMantic models) later if desired.
