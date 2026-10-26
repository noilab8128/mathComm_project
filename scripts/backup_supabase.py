#!/usr/bin/env python3
"""
Back up the Supabase database tables to local JSON and CSV files, through the REST API with the service key.

- Read only: the script sends GET requests only. It never writes to the database.
- No database password and no extra packages: Python 3.9+ standard library only.
- Finds every table and view in the `public` schema by itself, so new tables are included without editing this file.
- `next_auth` (emails and password hashes) is left out unless you pass --include-auth.

Run from the repository root:
  python3 scripts/backup_supabase.py                    # back up public -> ~/mathquest-backups/<date-time>/
  python3 scripts/backup_supabase.py --tables problems,solutions,problem_hierarchies
  python3 scripts/backup_supabase.py --include-auth     # also next_auth.* (sensitive, keep the files private)
  python3 scripts/backup_supabase.py --list             # only list the tables and row counts

Credentials, read from the first file that has them (or from environment variables):
  .env.local      NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY   (web app)
  olympiad/.env   SUPABASE_URL + SUPABASE_SECRET_KEY                     (problem scripts)

Guide: "docs/Database Backup.md"
"""

import argparse
import csv
import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_FILES = [REPO_ROOT / ".env.local", REPO_ROOT / "olympiad" / ".env"]
URL_NAMES = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]
KEY_NAMES = ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"]
PAGE_SIZE = 1000  # Supabase returns at most 1000 rows per request by default
DEFAULT_OUT = Path.home() / "mathquest-backups"


def ssl_context():
    """Verified HTTPS. Uses certifi's certificate list when it is installed: python.org builds on macOS have no
    certificate file until "Install Certificates.command" is run, which fails with CERTIFICATE_VERIFY_FAILED."""
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


SSL_CONTEXT = ssl_context()


# ---- credentials -------------------------------------------------------------------------------------------------
def read_env_file(path):
    values = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        values[name.strip()] = value.strip().strip('"').strip("'")
    return values


def load_credentials(env_path=None):
    """(url, key, where). Environment variables win; then the given file; then .env.local, olympiad/.env."""
    sources = [("environment", dict(os.environ))]
    files = [Path(env_path)] if env_path else ENV_FILES
    for path in files:
        if path.is_file():
            sources.append((str(path.relative_to(REPO_ROOT) if path.is_relative_to(REPO_ROOT) else path),
                            read_env_file(path)))
    for where, values in sources:
        url = next((values[n] for n in URL_NAMES if values.get(n)), None)
        key = next((values[n] for n in KEY_NAMES if values.get(n)), None)
        if url and key:
            return url.rstrip("/"), key, where
    sys.exit("No Supabase URL and service key found. Put them in .env.local or olympiad/.env "
             "(see 'docs/Database Backup.md'), or set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")


# ---- REST helpers ------------------------------------------------------------------------------------------------
class Rest:
    def __init__(self, url, key):
        self.base = url + "/rest/v1"
        self.key = key

    def get(self, path, schema="public", extra_headers=None):
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Accept": "application/json",
            "Accept-Profile": schema,
        }
        headers.update(extra_headers or {})
        request = urllib.request.Request(self.base + path, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(request, timeout=60, context=SSL_CONTEXT) as response:
                return json.loads(response.read().decode("utf-8")), dict(response.headers)
        except urllib.error.HTTPError as err:
            body = err.read().decode("utf-8", "replace")[:300]
            raise RuntimeError(f"HTTP {err.code} for {path} ({schema}): {body}") from None
        except urllib.error.URLError as err:
            if isinstance(err.reason, ssl.SSLCertVerificationError):
                raise RuntimeError(
                    "Python cannot check Supabase's HTTPS certificate. On macOS run "
                    '"/Applications/Python 3.x/Install Certificates.command" once, '
                    "or install certifi: python3 -m pip install certifi") from None
            raise RuntimeError(f"Cannot reach Supabase ({err.reason}). Is the project paused?") from None

    def tables(self, schema):
        """{table or view: {"columns": [...], "pk": [...]}} from the API's own description (OpenAPI).
        Primary-key columns are marked with <pk/> in their description."""
        spec, _ = self.get("/", schema=schema, extra_headers={"Accept": "application/openapi+json"})
        out = {}
        for name, d in sorted((spec.get("definitions") or {}).items()):
            props = d.get("properties") or {}
            out[name] = {"columns": list(props),
                         "pk": [c for c, p in props.items() if "<pk/>" in (p.get("description") or "")]}
        return out

    def count(self, schema, table):
        _, headers = self.get(f"/{urllib.parse.quote(table)}?select=*&limit=1", schema=schema,
                              extra_headers={"Prefer": "count=exact", "Range-Unit": "items", "Range": "0-0"})
        content_range = headers.get("Content-Range") or headers.get("content-range") or "*/0"
        total = content_range.split("/")[-1]
        return int(total) if total.isdigit() else None

    def rows(self, schema, table, info):
        """All rows, a page at a time, sorted by the primary key (or id) so that pages do not overlap."""
        keys = info.get("pk") or (["id"] if "id" in info.get("columns", []) else [])
        order = "&order=" + ",".join(f"{k}.asc" for k in keys) if keys else ""
        out, start = [], 0
        while True:
            page, _ = self.get(f"/{urllib.parse.quote(table)}?select=*{order}", schema=schema,
                               extra_headers={"Range-Unit": "items", "Range": f"{start}-{start + PAGE_SIZE - 1}"})
            out.extend(page)
            if len(page) < PAGE_SIZE:
                return out
            start += PAGE_SIZE


# ---- writing -----------------------------------------------------------------------------------------------------
def write_json(path, rows):
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=1, default=str), encoding="utf-8")


def write_csv(path, rows, columns):
    """CSV for the dashboard's Table Editor import. Lists and objects (json columns) are written as JSON text."""
    names = list(columns) or sorted({k for row in rows for k in row})
    names += sorted({k for row in rows for k in row} - set(names))
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=names, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({k: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
                             for k, v in row.items()})


def main():
    parser = argparse.ArgumentParser(description="Read-only backup of Supabase tables to JSON and CSV.")
    parser.add_argument("--out", default=str(DEFAULT_OUT), help=f"folder for backups (default {DEFAULT_OUT})")
    parser.add_argument("--tables", help="comma-separated public tables to back up (default: all)")
    parser.add_argument("--include-auth", action="store_true",
                        help="also back up next_auth.* (emails, password hashes): keep those files private")
    parser.add_argument("--env", help="read credentials from this file instead of .env.local / olympiad/.env")
    parser.add_argument("--list", action="store_true", help="only list tables and row counts")
    args = parser.parse_args()

    url, key, where = load_credentials(args.env)
    rest = Rest(url, key)
    print(f"Project: {urllib.parse.urlparse(url).hostname}  (credentials from {where})")

    plan = []  # (schema, table, {"columns", "pk"})
    public = rest.tables("public")
    wanted = [t.strip() for t in args.tables.split(",") if t.strip()] if args.tables else list(public)
    if not wanted:
        sys.exit("The API did not list any tables (its description may be turned off for this project). "
                 "Name them with --tables, e.g. --tables problems,solutions,problem_hierarchies")
    unknown = [t for t in wanted if public and t not in public]
    if unknown:
        sys.exit(f"Not found in public: {', '.join(unknown)}")
    plan += [("public", t, public.get(t, {})) for t in wanted]
    if args.include_auth:
        plan += [("next_auth", t, info) for t, info in rest.tables("next_auth").items()]

    if args.list:
        for schema, table, _ in plan:
            print(f"  {schema}.{table:<40} {rest.count(schema, table)}")
        return

    out_root = Path(args.out).expanduser().resolve()
    if out_root == REPO_ROOT or REPO_ROOT in out_root.parents:
        sys.exit("Choose a folder outside the repository (the files contain user data and the repository is public).")
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%SZ")
    folder = out_root / stamp
    folder.mkdir(parents=True, exist_ok=False)
    os.chmod(folder, 0o700)

    manifest = {"project": urllib.parse.urlparse(url).hostname, "started_utc": stamp, "tables": [], "failed": []}
    for schema, table, info in plan:
        try:
            expected = rest.count(schema, table)
            data = rest.rows(schema, table, info)
        except RuntimeError as err:
            print(f"  FAIL {schema}.{table}: {err}")
            manifest["failed"].append({"table": f"{schema}.{table}", "error": str(err)})
            continue
        write_json(folder / f"{schema}.{table}.json", data)
        write_csv(folder / f"{schema}.{table}.csv", data, info.get("columns", []))
        ok = expected is None or expected == len(data)
        manifest["tables"].append({"table": f"{schema}.{table}", "rows": len(data), "expected": expected, "ok": ok})
        print(f"  {'ok  ' if ok else 'DIFF'} {schema}.{table:<40} {len(data)} rows"
              + ("" if ok else f" (count said {expected}; rows changed during the backup?)"))

    manifest["finished_utc"] = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%SZ")
    (folder / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    for path in folder.iterdir():
        os.chmod(path, 0o600)

    total = sum(t["rows"] for t in manifest["tables"])
    print(f"\nSaved {len(manifest['tables'])} tables, {total} rows to {folder}")
    if manifest["failed"]:
        print(f"{len(manifest['failed'])} table(s) failed; see manifest.json")
        sys.exit(1)


if __name__ == "__main__":
    main()
