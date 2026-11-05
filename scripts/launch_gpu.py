"""Local-only GPU server. Creates local credentials on first launch; never prints secrets."""
import json
import os
from pathlib import Path
import secrets
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

def configure():
    credentials = ROOT / 'runtime' / 'gpu_login.json'
    credentials.parent.mkdir(parents=True, exist_ok=True)
    if not credentials.exists():
        credentials.write_text(json.dumps({'username': 'local-research', 'password': secrets.token_urlsafe(18), 'secret': secrets.token_hex(32)}, indent=2), encoding='utf-8')
    login = json.loads(credentials.read_text(encoding='utf-8'))
    os.environ['BONEAGE_USERNAME'] = login['username']
    os.environ['BONEAGE_PASSWORD'] = login['password']
    os.environ['BONEAGE_SESSION_SECRET'] = login['secret']
    os.environ['BONEAGE_DEVICE'] = 'cuda'
    # Anonymous uploads remain disabled. Local sign-in uses the randomly
    # generated credentials above; no shared fallback account is created.
    os.environ['BONEAGE_DEMO_ENABLED'] = '0'
    return credentials

if __name__ == '__main__':
    configure()
    import uvicorn
    uvicorn.run('app:app', host='127.0.0.1', port=8770, workers=1)
