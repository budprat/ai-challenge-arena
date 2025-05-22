from pydantic import BaseModel, UUID4
from typing import Optional


class Token(BaseModel):
    """
    Token schema for authentication responses
    """
    access_token: str
    token_type: str
    expires_in: int


class TokenPayload(BaseModel):
    """
    Token payload schema for JWT decoding/encoding
    """
    sub: Optional[str] = None
    exp: Optional[int] = None
