# Favo Backend

## Requisitos

- Python 3.10 o superior
- pip

## Instalación

1. Clona el repositorio y navega a la carpeta del backend:

	```sh
	cd "Favo Backend"
	```

2. (Opcional) Crea un entorno virtual:

	```sh
	python -m venv .venv
	.venv\Scripts\activate  # En Windows
	# source .venv/bin/activate  # En Linux/Mac
	```

3. Instala las dependencias:

	```sh
	pip install -r requirements.txt
	```

4. Configura las variables de entorno en el archivo `.env` si es necesario.

## Ejecución

Para iniciar el servidor de desarrollo:

```sh
uvicorn main:app --reload
```

El backend estará disponible en [http://localhost:8000](http://localhost:8000).

## Endpoints principales

- `/servicios` — Listado y creación de servicios
- `/categorias` — Listado de categorías
- `/recent-requests` — Últimas solicitudes
- `/register` — Registro de usuario
- `/token` — Login (token JWT)
- `/users/me/` — Perfil del usuario autenticado

---
