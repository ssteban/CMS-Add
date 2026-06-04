from pydantic import BaseModel


class CreateProyect(BaseModel):
    name: str
    url: str


class UpdateProyect(BaseModel):
    name: str
    url: str


class ViewProyect(BaseModel):
    id: int
    name: str
    url: str
    created_at: str
    updated_at: str


class CreateApiKeyRequest(BaseModel):
    key_name: str


class ViewApiKey(BaseModel):
    id: int
    key_name: str
    masked_key: str
    created_at: str
