from pydantic import BaseModel


class FieldItem(BaseModel):
    key_name: str
    key_value: str
    key_type: str


class SaveFieldsRequest(BaseModel):
    fields: list[FieldItem]


class ViewField(BaseModel):
    id: int
    key_name: str
    key_value: str
    key_type: str
    created_at: str
    updated_at: str
