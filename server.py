from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import jwt
import hashlib
import os
import shutil
from datetime import datetime, timedelta
import json
import uuid

app = FastAPI(title="inHOUSE 52 API", version="1.0.0")

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración
SECRET_KEY = "your-secret-key-change-in-production"
UPLOADS_DIR = "uploads"
DATA_FILE = "data.json"

os.makedirs(UPLOADS_DIR, exist_ok=True)

# Esquemas Pydantic
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# Seguridad
security = HTTPBearer()

# Base de datos JSON
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "users": [
            {
                "id": 1,
                "username": "admin",
                "email": "admin@inhouse52.com",
                "password": hashlib.sha256("admin123".encode()).hexdigest(),
                "role": "admin",
                "created_at": datetime.now().isoformat(),
            }
        ],
        "content": [],
        "next_user_id": 2,
        "next_content_id": 1,
    }

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Utilidades
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

def get_current_user(user_id: int = Depends(verify_token)):
    data = load_data()
    user = next((u for u in data["users"] if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

# Rutas de autenticación
@app.post("/auth/register")
async def register(user_data: UserCreate):
    data = load_data()

    if any(u["username"] == user_data.username for u in data["users"]):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    if any(u["email"] == user_data.email for u in data["users"]):
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    new_user = {
        "id": data["next_user_id"],
        "username": user_data.username,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": "collaborator",
        "created_at": datetime.now().isoformat(),
    }

    data["users"].append(new_user)
    data["next_user_id"] += 1
    save_data(data)

    return {"message": "Usuario registrado exitosamente"}

@app.post("/auth/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    grant_type: str = Form("password"),
):
    data = load_data()
    user = next(
        (u for u in data["users"] if u["username"] == username and u["password"] == hash_password(password)),
        None,
    )
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = create_token(user["id"])
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
    }

# Rutas de contenido
@app.post("/content/upload")
async def upload_content(
    title: str = Form(...),
    description: str = Form(""),
    type: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    data = load_data()

    # Guardar archivo único
    file_ext = os.path.splitext(file.filename)[1]
    unique_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOADS_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    content_item = {
        "id": data["next_content_id"],
        "title": title,
        "description": description,
        "type": type,
        "path": f"/uploads/{unique_name}",
        "original_filename": file.filename,
        "owner_id": current_user["id"],
        "created_at": datetime.now().isoformat(),
    }

    data["content"].append(content_item)
    data["next_content_id"] += 1
    save_data(data)

    return {"message": "Archivo subido exitosamente", "id": content_item["id"]}

@app.get("/content/me")
async def get_my_content(current_user: dict = Depends(get_current_user)):
    data = load_data()
    return [c for c in data["content"] if c["owner_id"] == current_user["id"]]

@app.get("/content/all")
async def get_all_content(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    data = load_data()
    return data["content"]

@app.delete("/content/{content_id}")
async def delete_content(content_id: int, current_user: dict = Depends(get_current_user)):
    data = load_data()
    content_item = next((c for c in data["content"] if c["id"] == content_id), None)
    if not content_item:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")

    if content_item["owner_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos")

    file_path = content_item["path"].replace("/uploads/", "uploads/")
    if os.path.exists(file_path):
        os.remove(file_path)

    data["content"] = [c for c in data["content"] if c["id"] != content_id]
    save_data(data)

    return {"message": "Contenido eliminado exitosamente"}

# Servir archivos estáticos
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API funcionando correctamente"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8001)
