from pydantic import BaseModel, Field


class CompanyCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    year: int

    source_type: str


class CompanyUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    year: int | None = None

    source_type: str | None = None

    is_active: bool | None = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    year: int | None = None
    source_type: str | None = None
    is_active: bool

    model_config = {
        "from_attributes": True,
    }