from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
import uvicorn
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
url: str = "https://wsdtyhtzshwtjnbizglr.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZHR5aHR6c2h3dGpuYml6Z2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTM1NjgsImV4cCI6MjA2NTM4OTU2OH0.6_LLtuM_bgjGNBKjLA9eh64USjTjA75TeQ1Lj8U9kLA"
supabase: Client = create_client(url, key)




# Pydantic models
class RecentRequest(BaseModel):
    id: int
    name: str
    location: str
    title: str
    description: str
    status: str

# --- Mover definición de UserInDB y get_current_user aquí ---
SECRET_KEY = "guivi"  # Change this to a strong secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserCreate(BaseModel):
    email: str
    password: str
    nombre: Optional[str] = None

class UserInDB(BaseModel):
    id_usuario: int
    mail: str
    password: str
    nombre: Optional[str] = None
    disabled: Optional[bool] = None

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

async def get_user(email: str):
    response = supabase.from_("Usuario").select("*").eq("mail", email).execute()
    if response.data:
        user_dict = response.data[0]
        return UserInDB(**user_dict)
    return None

async def authenticate_user(email: str, password: str):
    user = await get_user(email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user(email)
    if user is None:
        raise credentials_exception
    return user

# Modelo para notificaciones_servicios
class NotificacionServicioBase(BaseModel):
    titulo: str
    desc: str
    precio: float
    ubicacion: str
    id_usuario: int

class NotificacionServicio(NotificacionServicioBase):
    id: int



# Endpoint para obtener todas las notificaciones de servicios del usuario autenticado


@app.get("/notificaciones_servicios", response_model=list[NotificacionServicio])
async def get_notificaciones_servicios(current_user: UserInDB = Depends(get_current_user)):
    try:
        response = supabase.from_("notificaciones_servicios").select("*").eq("id_usuario", current_user.id_usuario).execute()
        if getattr(response, "error", None):
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para crear una nueva notificación de servicio
@app.post("/notificaciones_servicios", response_model=NotificacionServicio)
async def create_notificacion_servicio(notificacion: NotificacionServicioBase):
    try:
        response = supabase.from_("notificaciones_servicios").insert(notificacion.dict()).execute()
        if getattr(response, "error", None):
            raise HTTPException(status_code=400, detail=str(response.error))
        if not response.data:
            raise HTTPException(status_code=400, detail="No data returned from insert")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para obtener una notificación por ID
@app.get("/notificaciones_servicios/{id}", response_model=NotificacionServicio)
async def get_notificacion_servicio(id: int):
    try:
        response = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
        if getattr(response, "error", None):
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint para eliminar una notificación por ID (solo si pertenece al usuario)
@app.delete("/notificaciones_servicios/{id}")
async def delete_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        # Verificar que la notificación pertenece al usuario
        notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
        if not notif.data or notif.data["id_usuario"] != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="No autorizado para eliminar esta notificación")
        response = supabase.from_("notificaciones_servicios").delete().eq("id", id).execute()
        if getattr(response, "error", None):
            raise HTTPException(status_code=400, detail=str(response.error))
        return {"message": "Notificación eliminada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para aceptar una notificación (puedes modificar el estado o eliminarla)
@app.post("/notificaciones_servicios/{id}/aceptar")
async def aceptar_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
        if not notif.data or notif.data["id_usuario"] != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="No autorizado para aceptar esta notificación")
        # Aquí podrías actualizar un campo de estado, pero por ahora la eliminamos
        supabase.from_("notificaciones_servicios").delete().eq("id", id).execute()
        return {"message": "Notificación aceptada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para rechazar una notificación (puedes modificar el estado o eliminarla)
@app.post("/notificaciones_servicios/{id}/rechazar")
async def rechazar_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
        if not notif.data or notif.data["id_usuario"] != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="No autorizado para rechazar esta notificación")
        # Aquí podrías actualizar un campo de estado, pero por ahora la eliminamos
        supabase.from_("notificaciones_servicios").delete().eq("id", id).execute()
        return {"message": "Notificación rechazada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Pydantic models
class ServicioBase(BaseModel):
    titulo: str
    descripcion: str
    id_categoria: int = 1  # Default value

class Servicio(ServicioBase):
    id_servicio: int
    created_at: Optional[str] = None

class Categoria(BaseModel):
    id_categoria: int
    nombre: str
    count: Optional[int] = 0

# Routes for Servicios
@app.get("/servicios")
async def get_servicios(q: str = Query(None)):
    try:
        query = supabase.from_("Servicio").select("*").order("id_servicio", desc=True)
        
        if q and q.strip():
            query = query.or_(f"titulo.ilike.%{q}%,descripcion.ilike.%{q}%")
        
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# --- El endpoint se mueve después de la definición de UserInDB y get_current_user ---

# Routes for Categories
@app.get("/categorias", response_model=list[Categoria])
async def get_categorias():
    try:
        # Get all categories
        categories_response = supabase.from_("Categoria").select("id_categoria, nombre").execute()

        
        # Get counts of pedidos per category
        counts_response = supabase.from_("Pedido").select("id_categoria").execute()
        
        # Create count mapping
        count_map = {}
        for item in counts_response.data:
            count_map[item['id_categoria']] = count_map.get(item['id_categoria'], 0) + 1
        
        # Enrich categories with counts
        enriched_categories = []
        for category in categories_response.data:
            enriched_categories.append({
                "id_categoria": category["id_categoria"],
                "nombre": category["nombre"],
                "count": count_map.get(category["id_categoria"], 0)
            })
        
        return enriched_categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Additional endpoint to get simple category list (for dropdowns)
@app.get("/categorias/simple", response_model=list[Categoria])
async def get_simple_categorias():
    try:
        response = supabase.from_("Categoria").select("id_categoria, nombre").execute()
        if getattr(response, "error", None):
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Add these to your existing imports
SECRET_KEY = "guivi"  # Change this to a strong secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserCreate(BaseModel):
    email: str
    password: str
    nombre: Optional[str] = None

class UserInDB(BaseModel):
    id_usuario: int
    mail: str
    password: str
    nombre: Optional[str] = None
    disabled: Optional[bool] = None

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

async def get_user(email: str):
    response = supabase.from_("Usuario").select("*").eq("mail", email).execute()
    if response.data:
        user_dict = response.data[0]
        return UserInDB(**user_dict)
    return None

async def authenticate_user(email: str, password: str):
    user = await get_user(email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user(email)
    if user is None:
        raise credentials_exception
    return user

@app.post("/register", response_model=UserInDB)
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = await get_user(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create new user in Supabase
    new_user = {
        "mail": user.email,
        "password": hashed_password,
        "nombre": user.nombre
    }
    
    response = supabase.from_("Usuario").insert(new_user).execute()
    
    return response.data[0]

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.mail}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=UserInDB)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@app.post("/servicios", response_model=Servicio)
async def create_servicio(
    servicio: ServicioBase,
    current_user: UserInDB = Depends(get_current_user)
):
    try:
        data = servicio.dict()
        data["id_usuario"] = current_user.id_usuario
        response = supabase.from_("Servicio").insert(data).execute()
        if getattr(response, "error", None):
            raise HTTPException(status_code=400, detail=str(response.error))
        if not response.data:
            raise HTTPException(status_code=400, detail="No data returned from insert")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)