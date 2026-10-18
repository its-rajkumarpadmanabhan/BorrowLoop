import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .seed_data import seed_database_if_empty
from .routers import tools, rentals, geo

# Create SQLite database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BorrowLoop",
    description="Hyperlocal Tool Sharing & Handover Protocol with Geospatial Proximity and Escrow Handover",
    version="1.0.0"
)

# Enable CORS for universal client (Web desktop, mobile web, and Capacitor Android WebView)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial database
@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed_database_if_empty(db)
    finally:
        db.close()

# Include REST API Routers
app.include_router(tools.router)
app.include_router(rentals.router)
app.include_router(geo.router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BorrowLoop Single-Process Server",
        "architecture": "FastAPI + Embedded SQLite + Haversine Engine"
    }


# APK Download & Status Endpoints
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
APK_PATH = os.path.join(BASE_DIR, "frontend", "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk")
ROOT_APK_PATH = os.path.join(BASE_DIR, "apk", "BorrowLoop-v1.0.apk")


def get_active_apk_path():
    if os.path.exists(ROOT_APK_PATH):
        return ROOT_APK_PATH
    if os.path.exists(APK_PATH):
        return APK_PATH
    return None


@app.get("/api/app/apk-status")
def get_apk_status():
    active_path = get_active_apk_path()
    exists = active_path is not None
    file_size_mb = 0.0
    if exists:
        file_size_mb = round(os.path.getsize(active_path) / (1024 * 1024), 2)
    return {
        "is_compiled": exists,
        "apk_path": active_path if exists else None,
        "file_size_mb": file_size_mb,
        "download_url": "/download/BorrowLoop-v1.0.apk" if exists else None,
        "instructions": "Transfer BorrowLoop APK to Android phone, enable 'Install from unknown sources', install, and launch."
    }


@app.get("/download/BorrowLoop-v1.0.apk")
@app.get("/download/app-debug.apk")
def download_apk():
    active_path = get_active_apk_path()
    if active_path and os.path.exists(active_path):
        filename = os.path.basename(active_path)
        return FileResponse(
            path=active_path,
            filename=filename,
            media_type="application/vnd.android.package-archive"
        )
    return JSONResponse(
        status_code=404,
        content={"error": "APK is currently compiling or not generated yet. Run gradle assembleDebug."}
    )


# Static React Bundle Serving (Single-Process Architecture & Website Delivery)
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    # Mount assets directory if available
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Explicit root route for SPA website
    @app.get("/")
    def serve_react_root():
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return HTMLResponse("<h1>BorrowLoop: Frontend compiling...</h1>")

    # Catch-all route to serve React index.html for SPA client-side routing
    @app.get("/{full_path:path}")
    def serve_react_app(full_path: str):
        # Exclude API and download endpoints
        if full_path.startswith("api/") or full_path.startswith("download/"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
            
        # Specific static file request in dist root (like favicon, robots, manifest)
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
            
        return HTMLResponse("<h1>BorrowLoop: Frontend compiling...</h1>")
