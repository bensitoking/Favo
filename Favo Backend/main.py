from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
import uvicorn

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

# Endpoint for recent requests
@app.get("/recent-requests", response_model=list[RecentRequest])
async def get_recent_requests():
    try:
        response = supabase.from_("Servicio").select(
            """
            id_servicios,
            titulo,
            descripcion,
            Usuario (
                nombre,
                Ubicacion (
                    barrio_zona
                )
            )
            """
        ).limit(10).execute()

        if response.error:
            raise HTTPException(status_code=400, detail=response.error.message)

        formatted = []
        for item in response.data:
            formatted.append({
                "id": item["id_servicios"],
                "name": item["Usuario"].get("nombre", "Desconocido"),
                "location": item["Usuario"].get("Ubicacion", {}).get("barrio_zona", "Sin ubicación"),
                "title": item["titulo"],
                "description": item["descripcion"],
                "status": "Disponible"
            })

        return formatted

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Pydantic models
class ServicioBase(BaseModel):
    titulo: str
    descripcion: str
    id_usuario: int = 1  # Default value
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

@app.post("/servicios", response_model=Servicio)
async def create_servicio(servicio: ServicioBase):
    try:
        response = supabase.from_("Servicio").insert(servicio.dict()).execute()
        
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        
        if not response.data:
            raise HTTPException(status_code=400, detail="No data returned from insert")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        if response.error:
            raise HTTPException(status_code=400, detail=str(response.error))
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)