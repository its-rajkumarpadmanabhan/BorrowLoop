import uvicorn
import socket
import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

# Configure stdout/stderr for UTF-8 on Windows
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    local_ip = get_local_ip()
    port = 8000
    print("=" * 70)
    print(" [*] BorrowLoop Single-Service Server Starting...")
    print(f" [>] Web Browser Access:       http://localhost:{port}")
    print(f" [>] Mobile / Wi-Fi Access:    http://{local_ip}:{port}")
    print(f" [>] Android APK Download:     http://{local_ip}:{port}/download/app-debug.apk")
    print(f" [>] REST API & Swagger Docs:  http://localhost:{port}/docs")
    print("=" * 70)
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
