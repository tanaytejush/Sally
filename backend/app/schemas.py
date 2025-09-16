from pydantic import BaseModel, Field
from typing import Optional, Literal


class UserNamePreference(BaseModel):
    type: Literal['first', 'full', 'custom']
    name: Optional[str] = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message to send to the model")
    role: Literal['Brother','Sister','Husband','Wife','Girlfriend','Boyfriend']
    userNamePreference: Optional[UserNamePreference] = None


class ChatResponse(BaseModel):
    reply: str
    model: str


class ErrorResponse(BaseModel):
    detail: str
