from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth_route, user_route
from app.utils.auth_util import verify_access_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "200 Ok"}

@app.head("/health")
async def health_check():
    return {"message": "200 Ok"}



app.include_router(auth_route.router, prefix="/api/v1/auth", tags=["auth"])

app.include_router(user_route.router, prefix="/api/v1/user", tags=["user"], dependencies=[Depends(verify_access_token)])






