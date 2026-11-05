"""Configure a local review account interactively; never publish its password."""
import getpass
import secrets
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def write_account(path, username, password):
    if not username.strip() or not password or any(c in username + password for c in "\r\n\"'"):
        raise ValueError("Use a non-empty username/password without quotes or line breaks.")
    lines = path.read_text(encoding="utf-8-sig").splitlines() if path.exists() else []
    updates = {"BONEAGE_USERNAME": username.strip(), "BONEAGE_PASSWORD": password,
               "BONEAGE_SESSION_SECRET": secrets.token_hex(32), "BONEAGE_DEMO_ENABLED": "0"}
    kept = [line for line in lines if line.split("=", 1)[0].strip() not in updates]
    kept.extend(f'{key}="{value}"' for key, value in updates.items())
    path.write_text("\n".join(kept) + "\n", encoding="utf-8")

def main():
    username = input("Local review username [Admin_up]: ").strip() or "Admin_up"
    password = getpass.getpass("Password (not displayed): ")
    if password != getpass.getpass("Repeat password: "):
        raise SystemExit("Passwords do not match; no changes saved.")
    write_account(ROOT / ".env", username, password)
    print("Account saved locally in .env. Restart the server. Share credentials privately.")
    print("Remember session is enabled by default; sign-in expires after 12 hours.")

if __name__ == "__main__":
    main()
