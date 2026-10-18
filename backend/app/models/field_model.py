from typing import Literal
from pydantic import BaseModel

FieldType = Literal['text', 'image', 'link', 'color', 'number', 'richtext', 'separator']


class FieldItem(BaseModel):
    key_name: str
    key_value: str
    key_type: FieldType


class SaveFieldsRequest(BaseModel):
    fields: list[FieldItem]


class ViewField(BaseModel):
    id: int
    key_name: str
    key_value: str
    key_type: str
    created_at: str
    updated_at: str
