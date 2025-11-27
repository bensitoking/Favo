from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from supabase import create_client, Client
import uvicorn
import os
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://favo-iy6h.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Debug CORS (opcional) -----
@app.middleware("http")
async def debug_middleware(request, call_next):
    if request.method == "OPTIONS":
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
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# ----- Supabase -----
url: str = "https://wsdtyhtzshwtjnbizglr.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZHR5aHR6c2h3dGpuYml6Z2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTM1NjgsImV4cCI6MjA2NTM4OTU2OH0.6_LLtuM_bgjGNBKjLA9eh64USjTjA75TeQ1Lj8U9kLA"
supabase: Client = create_client(url, key)

# ----- Auth / Users -----
SECRET_KEY = "guivi"
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

class UserProfile(BaseModel):
    id_usuario: int
    mail: str
    nombre: Optional[str] = None
    verificado: Optional[bool] = None
    fecha_registro: Optional[str] = None
    esProvedor: Optional[bool] = None
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
            return UserInDB(**response.data[0])
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
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    creds_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise creds_exc
    except JWTError:
        raise creds_exc
    user = await get_user(email)
    if user is None:
        raise creds_exc
    return user

# ----- Notificaciones -----
class NotificacionServicioBase(BaseModel):
    titulo: str
    desc: str
    precio: float
    ubicacion: str
    id_usuario: int

class NotificacionServicio(NotificacionServicioBase):
    id: int

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

@app.get("/notificaciones_servicios")
async def get_notificaciones_servicios(current_user: UserInDB = Depends(get_current_user)):
    response = supabase.from_("notificaciones_servicios").select("*").eq("id_usuario", current_user.id_usuario).execute()
    return response.data or []

@app.post("/notificaciones_servicios", response_model=NotificacionServicio)
async def create_notificacion_servicio(notificacion: NotificacionServicioBase, current_user: UserInDB = Depends(get_current_user)):
    try:
        response = supabase.from_("notificaciones_servicios").insert(notificacion.dict()).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/notificaciones_servicios/{id}", response_model=NotificacionServicio)
async def get_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
    if not notif.data:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    if notif.data["id_usuario"] != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No autorizado")
    return notif.data

@app.delete("/notificaciones_servicios/{id}")
async def delete_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
    if not notif.data:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    if notif.data["id_usuario"] != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No autorizado")
    supabase.from_("notificaciones_servicios").delete().eq("id", id).execute()
    return {"message": "Notificación eliminada"}

@app.post("/notificaciones_servicios/{id}/aceptar")
async def aceptar_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
    if not notif.data or notif.data["id_usuario"] != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No autorizado para aceptar esta notificación")
    supabase.from_("notificaciones_servicios").delete().eq("id", id).execute()
    return {"message": "Notificación aceptada"}

@app.post("/notificaciones_servicios/{id}/rechazar")
async def rechazar_notificacion_servicio(id: int, current_user: UserInDB = Depends(get_current_user)):
    notif = supabase.from_("notificaciones_servicios").select("*").eq("id", id).single().execute()
    if not notif.data or notif.data["id_usuario"] != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No autorizado para rechazar esta notificación")
    supabase.from_("notificaciones_servicios").delete().eq("id", id).execute()
    return {"message": "Notificación rechazada"}

@app.get("/notificaciones_pedidos")
async def get_notificaciones_pedidos(current_user: UserInDB = Depends(get_current_user)):
    response = supabase.from_("notificaciones_pedidos").select("*").eq("id_usuario", current_user.id_usuario).order("id", desc=True).execute()
    return response.data or []

@app.post("/notificaciones_pedidos", response_model=NotificacionPedido)
async def create_notificacion_pedido(notificacion: NotificacionPedidoBase, current_user: UserInDB = Depends(get_current_user)):
    data = notificacion.dict()
    allowed = {"titulo", "desc", "precio", "ubicacion", "id_usuario", "accepted_by"}
    insert_data = {k: v for k, v in data.items() if k in allowed}
    response = supabase.from_("notificaciones_pedidos").insert(insert_data).execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=400, detail=str(response.error))
    return response.data[0]

@app.get("/notificaciones_pedidos/{id}", response_model=NotificacionPedido)
async def get_notificacion_pedido(id: int, current_user: UserInDB = Depends(get_current_user)):
    response = supabase.from_("notificaciones_pedidos").select("*").eq("id", id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return response.data

@app.delete("/notificaciones_pedidos/{id}")
async def delete_notificacion_pedido(id: int, current_user: UserInDB = Depends(get_current_user)):
    supabase.from_("notificaciones_pedidos").delete().eq("id", id).execute()
    return {"status": "ok"}

# ----- Ubicacion -----
@app.get("/ubicaciones")
async def list_ubicaciones():
    response = supabase.from_("Ubicacion").select("*").execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=400, detail=str(response.error))
    return response.data or []

@app.get("/ubicaciones/{id}")
async def get_ubicacion(id: int):
    response = supabase.from_("Ubicacion").select("*").eq("id_ubicacion", id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Ubicación no encontrada")
    return response.data

# ----- Perfil (update) -----
class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    id_ubicacion: Optional[int] = None
    foto_perfil_base64: Optional[str] = None

@app.put("/users/me/", response_model=UserProfile)
async def update_users_me(update: UserUpdate, current_user: UserInDB = Depends(get_current_user)):
    update_data = {}
    if update.nombre is not None:
        update_data["nombre"] = update.nombre
    if update.descripcion is not None:
        update_data["descripcion"] = update.descripcion
    if update.id_ubicacion is not None:
        update_data["id_ubicacion"] = update.id_ubicacion
    if update.foto_perfil_base64 is not None:
        update_data["foto_perfil"] = update.foto_perfil_base64

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    response = supabase.from_("Usuario").update(update_data).eq("id_usuario", current_user.id_usuario).execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=400, detail=str(response.error))

    user_row = supabase.from_("Usuario").select(
        "id_usuario,nombre,verificado,fecha_registro,esProvedor,esDemanda,id_ubicacion,foto_perfil,mail,descripcion"
    ).eq("id_usuario", current_user.id_usuario).single().execute()

    if not user_row.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user_row.data

# ----- Ratings -----
class RatingBase(BaseModel):
    id_usuario_rated: int
    rating: int
    comment: Optional[str] = None

class Rating(RatingBase):
    id: int
    rater_id: int
    created_at: str

@app.post("/ratings", response_model=Rating)
async def create_or_update_rating(data: RatingBase, current_user: UserInDB = Depends(get_current_user)):
    """Crear o actualizar un rating de un usuario a otro"""
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating debe estar entre 1 y 5")
    
    if data.id_usuario_rated == current_user.id_usuario:
        raise HTTPException(status_code=400, detail="No puedes calificarte a ti mismo")
    
    try:
        # Verificar que el usuario rated existe
        user_exists = supabase.from_("Usuario").select("id_usuario").eq("id_usuario", data.id_usuario_rated).execute()
        if not user_exists.data or len(user_exists.data) == 0:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Intentar actualizar si existe, si no, crear
        existing = supabase.from_("rating").select("id").eq("rated_id", data.id_usuario_rated).eq("rater_id", current_user.id_usuario).execute()
        
        if existing.data and len(existing.data) > 0:
            # Actualizar
            upd = supabase.from_("rating").update({
                "score": data.rating,
                "comment": data.comment
            }).eq("id", existing.data[0]["id"]).execute()
            return upd.data[0]
        else:
            # Crear
            insert_data = {
                "rated_id": data.id_usuario_rated,
                "rater_id": current_user.id_usuario,
                "score": data.rating,
                "comment": data.comment
            }
            res = supabase.from_("rating").insert(insert_data).execute()
            if hasattr(res, 'error') and res.error:
                raise HTTPException(status_code=400, detail=str(res.error))
            return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en POST /ratings: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al crear rating: {str(e)}")

@app.get("/ratings/usuario/{id_usuario}")
async def get_ratings_usuario(id_usuario: int):
    """Obtener todos los ratings de un usuario"""
    try:
        # Obtener ratings sin intentar join (puede fallar si la relación no está bien)
        response = supabase.from_("rating").select(
            "id,score,comment,created_at,rater_id"
        ).eq("rated_id", id_usuario).order("created_at", desc=True).execute()
        
        if not response.data:
            return []
        
        # Para cada rating, obtener el usuario que hizo el rating
        ratings_with_users = []
        for rating in response.data:
            rater_id = rating.get("rater_id")
            usuario = None
            if rater_id:
                try:
                    user_res = supabase.from_("Usuario").select("id_usuario,nombre").eq("id_usuario", rater_id).single().execute()
                    if user_res.data:
                        usuario = user_res.data
                except:
                    pass
            
            # Construir el objeto rating con usuario incluido
            rating_obj = {
                "id": rating.get("id"),
                "score": rating.get("score"),
                "comment": rating.get("comment"),
                "created_at": rating.get("created_at"),
                "Usuario": usuario
            }
            ratings_with_users.append(rating_obj)
        
        return ratings_with_users
    except Exception as e:
        print(f"Error en GET /ratings/usuario/{{id}}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener ratings: {str(e)}")

@app.get("/ratings/promedio/{id_usuario}")
async def get_promedio_rating(id_usuario: int):
    """Obtener promedio de ratings de un usuario"""
    try:
        response = supabase.from_("rating").select("score").eq("rated_id", id_usuario).execute()
        if not response.data or len(response.data) == 0:
            return {"promedio": 0, "cantidad": 0}
        
        ratings = [r["score"] for r in response.data]
        promedio = sum(ratings) / len(ratings)
        return {"promedio": round(promedio, 2), "cantidad": len(ratings)}
    except Exception as e:
        print(f"Error en GET /ratings/promedio/{{id}}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener promedio: {str(e)}")

@app.get("/ratings/mi-rating/{id_usuario_rated}")
async def get_mi_rating(id_usuario_rated: int, current_user: UserInDB = Depends(get_current_user)):
    """Obtener mi rating a un usuario específico (si existe)"""
    try:
        response = supabase.from_("rating").select("*").eq("rated_id", id_usuario_rated).eq("rater_id", current_user.id_usuario).execute()
        if not response.data or len(response.data) == 0:
            return None
        return response.data[0]
    except Exception as e:
        print(f"Error en GET /ratings/mi-rating: {e}")
        import traceback
        traceback.print_exc()
        return None

# ----- Servicios -----
class ServicioBase(BaseModel):
    titulo: str
    descripcion: str
    id_categoria: int = 1

class Servicio(ServicioBase):
    id_servicio: int
    created_at: Optional[str] = None
    activo: bool = True

class Categoria(BaseModel):
    id_categoria: int
    nombre: str
    count: Optional[int] = 0

@app.get("/servicios")
async def get_servicios(q: str = Query(None)):
    query = supabase.from_("Servicio").select("id_servicio,titulo,descripcion,id_usuario,activo,Usuario(nombre)").order("id_servicio", desc=True)
    if q and q.strip():
        query = query.or_(f"titulo.ilike.%{q}%,descripcion.ilike.%{q}%")
    response = query.execute()
    return response.data or []

@app.post("/servicios", response_model=Servicio)
async def create_servicio(servicio: ServicioBase, current_user: UserInDB = Depends(get_current_user)):
    data = servicio.dict()
    data["id_usuario"] = current_user.id_usuario
    response = supabase.from_("Servicio").insert(data).execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=400, detail=str(response.error))
    return response.data[0]

# NUEVO: mis servicios (del usuario autenticado)
@app.get("/users/me/servicios", response_model=List[Servicio])
async def get_my_servicios(only_active: bool = Query(False), current_user: UserInDB = Depends(get_current_user)):
    try:
        query = supabase.from_("Servicio").select("id_servicio,titulo,descripcion,id_usuario,activo,id_categoria").eq("id_usuario", current_user.id_usuario)
        if only_active:
            query = query.eq("activo", True)
        response = query.order("id_servicio", desc=True).execute()
        return response.data or []
    except Exception as e:
        print(f"Error en GET /users/me/servicios: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener servicios: {str(e)}")

# ----- Pedidos -----
class PedidoBase(BaseModel):
    titulo: str
    descripcion: str
    precio: Optional[float] = None
    id_categoria: int = 1

class Pedido(PedidoBase):
    id_pedidos: int
    status: str = "pendiente"
    accepted_by: Optional[int] = None
    accepted_at: Optional[str] = None

@app.get("/pedidos")
async def get_pedidos(id_categoria: Optional[int] = None, status: Optional[str] = None):
    try:
        query = supabase.from_("Pedido").select("id_pedidos,titulo,descripcion,precio,id_usuario,id_categoria,status,accepted_by,accepted_at,Usuario!Pedido_id_usuario_fkey(id_usuario,nombre)")
        
        if id_categoria and id_categoria > 0:
            query = query.eq("id_categoria", id_categoria)
        
        if status and status.strip():
            query = query.eq("status", status)
        
        response = query.order("id_pedidos", desc=True).execute()
        return response.data or []
    except Exception as e:
        print(f"Error en GET /pedidos: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener pedidos: {str(e)}")

@app.post("/pedidos", response_model=Pedido)
async def create_pedido(pedido: PedidoBase, current_user: UserInDB = Depends(get_current_user)):
    data = pedido.dict()
    data["id_usuario"] = current_user.id_usuario
    data["status"] = "pendiente"
    response = supabase.from_("Pedido").insert(data).execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=400, detail=str(response.error))
    return response.data[0]

@app.get("/pedidos/{id}")
async def get_pedido(id: int):
    try:
        response = supabase.from_("Pedido").select(
            "id_pedidos,titulo,descripcion,precio,id_usuario,id_categoria,status,accepted_by,accepted_at,Usuario!Pedido_id_usuario_fkey(id_usuario,nombre)"
        ).eq("id_pedidos", id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en GET /pedidos/{{id}}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener pedido: {str(e)}")

# NUEVO: aceptar pedido (proveedor distinto del dueño)
@app.post("/pedidos/{id}/aceptar", response_model=Pedido)
async def aceptar_pedido(id: int, current_user: UserInDB = Depends(get_current_user)):
    # traer pedido
    row = supabase.from_("Pedido").select("*").eq("id_pedidos", id).single().execute()
    pedido = row.data
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if pedido.get("id_usuario") == current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No puedes aceptar tu propio pedido")
    if pedido.get("status") != "pendiente":
        raise HTTPException(status_code=400, detail="El pedido ya no está pendiente")

    now = datetime.utcnow().isoformat()
    upd = supabase.from_("Pedido").update({
        "accepted_by": current_user.id_usuario,
        "accepted_at": now,
        "status": "en_proceso"
    }).eq("id_pedidos", id).execute()

    # notificación al dueño
    notif = {
        "titulo": f"Tu pedido '{pedido.get('titulo')}' fue aceptado",
        "desc": f"Un proveedor aceptó tu pedido. Descripción: {pedido.get('descripcion')}",
        "precio": pedido.get("precio") or 0,
        "ubicacion": "",
        "id_usuario": pedido.get("id_usuario"),
        "accepted_by": current_user.id_usuario
    }
    supabase.from_("notificaciones_pedidos").insert(notif).execute()
    return upd.data[0]

# NUEVO: completar pedido (dueño o proveedor)
@app.post("/pedidos/{id}/completar", response_model=Pedido)
async def completar_pedido(id: int, current_user: UserInDB = Depends(get_current_user)):
    row = supabase.from_("Pedido").select("*").eq("id_pedidos", id).single().execute()
    pedido = row.data
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if current_user.id_usuario not in (pedido.get("id_usuario"), pedido.get("accepted_by")):
        raise HTTPException(status_code=403, detail="No autorizado para completar este pedido")

    if pedido.get("status") == "completado":
        return pedido

    upd = supabase.from_("Pedido").update({"status": "completado"}).eq("id_pedidos", id).execute()
    return upd.data[0]

# NUEVO: mis pedidos (del usuario autenticado)
@app.get("/users/me/pedidos", response_model=List[Pedido])
async def get_my_pedidos(
    scope: str = Query("owner", regex="^(owner|accepted)$"),
    status: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    scope=owner     -> pedidos que YO creé (id_usuario = me)
    scope=accepted  -> pedidos que YO acepté (accepted_by = me)
    """
    try:
        if scope == "owner":
            query = supabase.from_("Pedido").select("id_pedidos,titulo,descripcion,precio,id_usuario,id_categoria,status,accepted_by,accepted_at").eq("id_usuario", current_user.id_usuario)
        else:
            query = supabase.from_("Pedido").select("id_pedidos,titulo,descripcion,precio,id_usuario,id_categoria,status,accepted_by,accepted_at").eq("accepted_by", current_user.id_usuario)

        if status and status.strip():
            query = query.eq("status", status)

        response = query.order("id_pedidos", desc=True).execute()
        return response.data or []
    except Exception as e:
        print(f"Error en GET /users/me/pedidos: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener pedidos: {str(e)}")

# BORRAR pedido (solo dueño)
@app.delete("/pedidos/{id}")
async def delete_pedido(id: int, current_user: UserInDB = Depends(get_current_user)):
    pedido_row = supabase.from_("Pedido").select("*").eq("id_pedidos", id).single().execute()
    if not pedido_row.data:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if pedido_row.data.get("id_usuario") != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="Solo el dueño puede borrar el pedido")
    supabase.from_("Pedido").delete().eq("id_pedidos", id).execute()
    return {"status": "ok"}

# ----- Búsqueda de Usuarios -----
class UsuarioPublico(BaseModel):
    id_usuario: int
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    foto_perfil: Optional[str] = None
    verificado: Optional[bool] = None

@app.get("/usuarios/buscar", response_model=List[UsuarioPublico])
async def buscar_usuarios(q: str = Query(...)):
    """Buscar usuarios por nombre o descripción"""
    try:
        if not q or not q.strip():
            return []
        
        # Supabase text search - usar or_ correctamente
        response = supabase.from_("Usuario").select(
            "id_usuario,nombre,descripcion,foto_perfil,verificado"
        ).or_(f"nombre.ilike.%{q}%,descripcion.ilike.%{q}%").limit(10).execute()
        
        if response.data:
            return response.data
        return []
    except Exception as e:
        print(f"Error en GET /usuarios/buscar: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al buscar usuarios: {str(e)}")

@app.get("/usuarios/{id_usuario}", response_model=UserProfile)
async def get_usuario_publico(id_usuario: int):
    """Obtener perfil público de un usuario"""
    try:
        response = supabase.from_("Usuario").select(
            "id_usuario,nombre,descripcion,foto_perfil,verificado,fecha_registro,esProvedor,esDemanda,id_ubicacion,mail"
        ).eq("id_usuario", id_usuario).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail=f"Usuario con ID {id_usuario} no encontrado")
        
        user_data = response.data[0]
        # Asegurar que los campos opcionales están presentes
        if not user_data.get('nombre'):
            user_data['nombre'] = 'Usuario'
        if not user_data.get('descripcion'):
            user_data['descripcion'] = None
        if not user_data.get('foto_perfil'):
            user_data['foto_perfil'] = None
        
        return user_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en GET /usuarios/{{id_usuario}} (ID: {id_usuario}): {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener usuario: {str(e)}")

# ----- Categorías -----
@app.get("/categorias", response_model=List[Categoria])
async def get_categorias():
    categories_response = supabase.from_("Categoria").select("id_categoria, nombre").execute()
    counts_response = supabase.from_("Pedido").select("id_categoria").eq("status", "pendiente").execute()
    count_map = {}
    if counts_response.data:
        for item in counts_response.data:
            count_map[item['id_categoria']] = count_map.get(item['id_categoria'], 0) + 1
    enriched = []
    if categories_response.data:
        for c in categories_response.data:
            enriched.append({
                "id_categoria": c["id_categoria"],
                "nombre": c["nombre"],
                "count": count_map.get(c["id_categoria"], 0)
            })
    return enriched

@app.get("/categorias/simple", response_model=List[Categoria])
async def get_simple_categorias():
    response = supabase.from_("Categoria").select("id_categoria, nombre").execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=400, detail=str(response.error))
    return response.data or []

# ----- Auth endpoints -----
@app.post("/register", response_model=UserInDB)
async def register_user(user: UserCreate):
    existing_user = await get_user(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = {"mail": user.email, "password": hashed_password, "nombre": user.nombre}
    response = supabase.from_("Usuario").insert(new_user).execute()
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=400, detail=str(response.error))
    return response.data[0]

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.mail}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=UserInDB)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user

# ----- Salud / CORS -----
@app.get("/health")
async def health_check():
    return {"status": "OK", "timestamp": datetime.now().isoformat(), "cors_enabled": True}

@app.options("/{path:path}")
async def options_handler(path: str):
    return {"message": "CORS preflight OK", "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
