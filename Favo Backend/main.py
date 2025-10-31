from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from supabase import create_client, Client
import uvicorn
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "https://favo-iy6h.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para debug
@app.middleware("http")
async def debug_middleware(request, call_next):
    if request.method == "OPTIONS":
        # Para requests OPTIONS, responder inmediatamente
        from fastapi.responses import JSONResponse
        return JSONResponse(
            content={"message": "OK"},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
            }
        )
    
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    # Añadir headers CORS a todas las respuestas
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Initialize Supabase client
url: str = "https://wsdtyhtzshwtjnbizglr.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZHR5aHR6c2h3dGpuYml6Z2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTM1NjgsImV4cCI6MjA2NTM4OTU2OH0.6_LLtuM_bgjGNBKjLA9eh64USjTjA75TeQ1Lj8U9kLA"
supabase: Client = create_client(url, key)

# Pydantic models

# --- Definiciones de usuario y autenticación ---
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


# Public profile model (no password)
class UserProfile(BaseModel):
    id_usuario: int
    mail: str
    nombre: Optional[str] = None
    verificado: Optional[bool] = None
    fecha_registro: Optional[str] = None
    esProveedor: Optional[bool] = None
    esDemanda: Optional[bool] = None
    id_ubicacion: Optional[int] = None
    foto_perfil: Optional[str] = None
    descripcion: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

async def get_user(email: str):
    try:
        response = supabase.from_("Usuario").select("*").eq("mail", email).execute()
        if response.data and len(response.data) > 0:
            user_dict = response.data[0]
            return UserInDB(**user_dict)
        return None
    except Exception as e:
        print(f"Error getting user: {e}")
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
    id_usuario: int  # Este será el destinatario, no el que crea la notificación

class NotificacionServicio(NotificacionServicioBase):
    id: int

# Notificaciones para Pedidos (nueva tabla)
class NotificacionPedidoBase(BaseModel):
    titulo: str
    desc: str
    precio: float
    ubicacion: Optional[str] = ""
    id_usuario: int
    id_categoria: Optional[int] = None
    accepted_by: Optional[int] = None

class NotificacionPedido(NotificacionPedidoBase):
    id: int

# Endpoint para obtener todas las notificaciones de servicios del usuario autenticado
@app.get("/notificaciones_servicios")
async def get_notificaciones_servicios(current_user: UserInDB = Depends(get_current_user)):
    response = supabase.from_("notificaciones_servicios").select("*").eq("id_usuario", current_user.id_usuario).execute()
    return response.data


@app.get("/notificaciones_pedidos")
async def get_notificaciones_pedidos(current_user: UserInDB = Depends(get_current_user)):
    try:
        response = supabase.from_("notificaciones_pedidos").select("*").eq("id_usuario", current_user.id_usuario).order("id", desc=True).execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/notificaciones_pedidos", response_model=NotificacionPedido)
async def create_notificacion_pedido(notificacion: NotificacionPedidoBase, current_user: UserInDB = Depends(get_current_user)):
    try:
        data = notificacion.dict()
        # Some DB schemas may not include optional fields like id_categoria - only send keys that exist in table
        allowed = {"titulo", "desc", "precio", "ubicacion", "id_usuario", "accepted_by"}
        insert_data = {k: v for k, v in data.items() if k in allowed}
        response = supabase.from_("notificaciones_pedidos").insert(insert_data).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        if not response.data:
            raise HTTPException(status_code=400, detail="No data returned from insert")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/notificaciones_pedidos/{id}", response_model=NotificacionPedido)
async def get_notificacion_pedido(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        response = supabase.from_("notificaciones_pedidos").select("*").eq("id", id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Notificacion no encontrada")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/notificaciones_pedidos/{id}")
async def delete_notificacion_pedido(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        response = supabase.from_("notificaciones_pedidos").delete().eq("id", id).execute()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Ubicaciones endpoints
@app.get("/ubicaciones")
async def list_ubicaciones():
    try:
        response = supabase.from_("Ubicacion").select("*").execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ubicaciones/{id}")
async def get_ubicacion(id: int):
    try:
        response = supabase.from_("Ubicacion").select("*").eq("id_ubicacion", id).single().execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=404, detail=str(response.error))
        if not response.data:
            raise HTTPException(status_code=404, detail="Ubicación no encontrada")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Allow user profile updates (nombre, descripcion, id_ubicacion, foto_perfil as base64 string)
class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    id_ubicacion: Optional[int] = None
    foto_perfil_base64: Optional[str] = None


@app.put("/users/me/", response_model=UserProfile)
async def update_users_me(update: UserUpdate, current_user: UserInDB = Depends(get_current_user)):
    try:
        update_data = {}
        if update.nombre is not None:
            update_data["nombre"] = update.nombre
        if update.descripcion is not None:
            update_data["descripcion"] = update.descripcion
        if update.id_ubicacion is not None:
            update_data["id_ubicacion"] = update.id_ubicacion
        if update.foto_perfil_base64 is not None:
            # store as text base64; frontend should send base64 string without data: prefix
            update_data["foto_perfil"] = update.foto_perfil_base64

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = supabase.from_("Usuario").update(update_data).eq("id_usuario", current_user.id_usuario).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))

        # fetch updated user (without password)
        user_row = supabase.from_("Usuario").select("id_usuario,nombre,verificado,fecha_registro,esProveedor,esDemanda,id_ubicacion,foto_perfil,mail,descripcion").eq("id_usuario", current_user.id_usuario).single().execute()
        if not user_row.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado después de la actualización")

        # convert to public profile model
        user_public = user_row.data
        # if foto_perfil is stored as base64 in DB, expose it as foto_perfil
        return user_public
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/notificaciones_servicios", response_model=NotificacionServicio)
async def create_notificacion_servicio(notificacion: NotificacionServicioBase, current_user: UserInDB = Depends(get_current_user)):
    try:
        notificacion_data = notificacion.dict()

        response = supabase.from_("notificaciones_servicios").insert(notificacion_data).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        if not response.data:
            raise HTTPException(status_code=400, detail="No data returned from insert")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para obtener una notificación por ID
@app.get("/notificaciones_servicios/{id}", response_model=NotificacionServicio)
async def get_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        response = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
        # Verificar que la notificación pertenece al usuario
        if response.data["id_usuario"] != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="No autorizado")
            
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para eliminar una notificación por ID
@app.delete("/notificaciones_servicios/{id}")
async def delete_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        # 1. Verificar que la notificación existe y pertenece al usuario
        notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
        if not notif.data:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        if notif.data["id_usuario"] != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="No autorizado para borrar esta notificación")

        # 2. Borrar la notificación
        response = supabase.from_("notificaciones_servicios").delete().eq("id", id).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return {"message": "Notificación eliminada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para aceptar una notificación
@app.post("/notificaciones_servicios/{id}/aceptar")
async def aceptar_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
        if not notif.data or notif.data["id_usuario"] != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="No autorizado para aceptar esta notificación")
        
        supabase.from_("notificaciones_servicios").delete().eq("id", id).execute()
        return {"message": "Notificación aceptada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para rechazar una notificación
@app.post("/notificaciones_servicios/{id}/rechazar")
async def rechazar_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
        if not notif.data or notif.data["id_usuario"] != current_user.id_usuario:
            raise HTTPException(status_code=403, detail="No autorizado para rechazar esta notificación")
        
        supabase.from_("notificaciones_servicios").delete().eq("id", id).execute()
        return {"message": "Notificación rechazada"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Pydantic models para servicios
class ServicioBase(BaseModel):
    titulo: str
    descripcion: str
    id_categoria: int = 1

class Servicio(ServicioBase):
    id_servicio: int
    created_at: Optional[str] = None

class Categoria(BaseModel):
    id_categoria: int
    nombre: str
    count: Optional[int] = 0

# Pydantic models para Pedido
class PedidoBase(BaseModel):
    titulo: str
    descripcion: str
    precio: Optional[float] = None
    id_categoria: int = 1

class Pedido(PedidoBase):
    id_pedidos: int

# Routes for Servicios
@app.get("/servicios")
async def get_servicios(q: str = Query(None)):
    try:
        # Seleccionamos los servicios junto con los datos del usuario
        query = supabase.from_("Servicio").select("id_servicio,titulo,descripcion,id_usuario,Usuario(nombre)").order("id_servicio", desc=True)
        
        if q and q.strip():
            query = query.or_(f"titulo.ilike.%{q}%,descripcion.ilike.%{q}%")
        
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Routes for Categories
@app.get("/categorias", response_model=List[Categoria])
async def get_categorias():
    try:
        categories_response = supabase.from_("Categoria").select("id_categoria, nombre").execute()
        
        # Get counts of pedidos per category
        counts_response = supabase.from_("Pedido").select("id_categoria").execute()
        
        # Create count mapping
        count_map = {}
        if counts_response.data:
            for item in counts_response.data:
                count_map[item['id_categoria']] = count_map.get(item['id_categoria'], 0) + 1
        
        # Enrich categories with counts
        enriched_categories = []
        if categories_response.data:
            for category in categories_response.data:
                enriched_categories.append({
                    "id_categoria": category["id_categoria"],
                    "nombre": category["nombre"],
                    "count": count_map.get(category["id_categoria"], 0)
                })
        
        return enriched_categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Additional endpoint to get simple category list
@app.get("/categorias/simple", response_model=List[Categoria])
async def get_simple_categorias():
    try:
        response = supabase.from_("Categoria").select("id_categoria, nombre").execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# Routes para Pedidos
@app.get("/pedidos")
async def get_pedidos(id_categoria: Optional[int] = None):
    try:
        query = supabase.from_("Pedido").select("id_pedidos,titulo,descripcion,precio,id_usuario,Usuario(nombre)")
        if id_categoria:
            query = query.eq("id_categoria", id_categoria)
        query = query.order("id_pedidos", desc=True)
        response = query.execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/pedidos", response_model=Pedido)
async def create_pedido(pedido: PedidoBase, current_user: UserInDB = Depends(get_current_user)):
    try:
        data = pedido.dict()
        data["id_usuario"] = current_user.id_usuario
        response = supabase.from_("Pedido").insert(data).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        if not response.data:
            raise HTTPException(status_code=400, detail="No data returned from insert")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


@app.get("/pedidos/{id}")
async def get_pedido(id: int):
    try:
        response = supabase.from_("Pedido").select("id_pedidos,titulo,descripcion,precio,id_usuario,id_categoria,Usuario(nombre)").eq("id_pedidos", id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/pedidos/{id}")
async def delete_pedido(id: int, current_user: UserInDB = Depends(get_current_user)):
    try:
        # obtener pedido
        pedido_row = supabase.from_("Pedido").select("*").eq("id_pedidos", id).single().execute()
        if not pedido_row.data:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        pedido = pedido_row.data

        # impedir que el dueño del pedido acepte su propio pedido
        if pedido.get('id_usuario') == current_user.id_usuario:
            raise HTTPException(status_code=403, detail="No puedes aceptar tu propio pedido")

        # crear notificación para el dueño del pedido
        notificacion = {
            "titulo": f"Tu pedido '{pedido.get('titulo')}' fue aceptado",
            "desc": f"El pedido fue aceptado. Descripción: {pedido.get('descripcion')}",
            "precio": pedido.get('precio') or 0,
            "ubicacion": "",
            "id_usuario": pedido.get('id_usuario'),
            "accepted_by": current_user.id_usuario
        }
        # Prevent duplicate notifications: check if a very similar notification already exists
        try:
            existing = supabase.from_("notificaciones_pedidos").select("id").eq("titulo", notificacion["titulo"]).eq("id_usuario", notificacion["id_usuario"]).eq("accepted_by", notificacion["accepted_by"]).execute()
            if not (existing.data and len(existing.data) > 0):
                # use the robust insertion that filters unsupported keys
                resp_notif = supabase.from_("notificaciones_pedidos").insert({k: v for k, v in notificacion.items()}).execute()
            else:
                resp_notif = existing
        except Exception as e:
            print("Error checking/creating notification:", e)
            # attempt insert anyway
            resp_notif = supabase.from_("notificaciones_pedidos").insert({k: v for k, v in notificacion.items()}).execute()

        # eliminar pedido
        resp_del = supabase.from_("Pedido").delete().eq("id_pedidos", id).execute()
        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# Auth endpoints
@app.post("/register", response_model=UserInDB)
async def register_user(user: UserCreate):
    existing_user = await get_user(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    
    new_user = {
        "mail": user.email,
        "password": hashed_password,
        "nombre": user.nombre
    }
    
    response = supabase.from_("Usuario").insert(new_user).execute()
    
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=400, detail=str(response.error))
    
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
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        if not response.data:
            raise HTTPException(status_code=400, detail="No data returned from insert")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint de salud para probar CORS
@app.get("/health")
async def health_check():
    return {
        "status": "OK",
        "timestamp": datetime.now().isoformat(),
        "cors_enabled": True
    }

# Endpoint para debug de CORS
@app.options("/{path:path}")
async def options_handler(path: str):
    return {
        "message": "CORS preflight OK",
        "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)