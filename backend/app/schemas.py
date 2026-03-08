from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=100)
    full_name: str | None = Field(default=None, max_length=100)


class UserLogin(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=100)


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TechStackCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=100)


class TechStackUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=100)


class TechStackResponse(BaseModel):
    id: int
    name: str
    category: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeveloperTechStackResponse(BaseModel):
    id: int
    developer_id: int
    tech_stack_id: int
    created_at: datetime
    tech_stack: TechStackResponse

    model_config = ConfigDict(from_attributes=True)
