from pydantic import BaseModel


class ShareProjectRequest(BaseModel):
    email: str
