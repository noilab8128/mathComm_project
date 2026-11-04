"""
Save a verification report into the stage-2 tables (supabase/sql/problem_verification.sql), with the service key.

Writes only `problem_verification_status` (one row per problem) and `problem_verifications` (history).
Never touches `problems`, `solutions` or `problem_reviews`; is_reviewed stays as it is.

Rules (plan §3.4): when a problem's content hash changes, its reviews no longer count: approvals go back to 0 and the
review status becomes `needs_recheck` (if it was approved) or `pending`. A history row is added only when the hash
or the result of a layer changed, so repeated runs do not grow the table.
"""

import json
import urllib.error
import urllib.request
from datetime import datetime, timezone

from backup_supabase import SSL_CONTEXT

STATUS_TABLE = "problem_verification_status"
HISTORY_TABLE = "problem_verifications"
L1_RULES = {"MD_ANSWER_DIFF", "NOT_IN_MD", "VERIFY_SCRIPT_FAIL"}
AUTO_STATUS = {"pass": "passed", "warn": "warning", "fail": "failed"}
CHUNK = 500


def required_approvals(result):
    """Plan §8 decision 4 (recommended): Challenges need 2 approvals, everything else 1."""
    return 2 if result.get("part") == "Challenge" else 1


def layer_status(issues):
    severities = {i["severity"] for i in issues}
    return "fail" if "fail" in severities else "warn" if "warn" in severities else "pass"


class Writer:
    def __init__(self, url, key):
        self.base = url + "/rest/v1"
        self.key = key

    def _send(self, method, path, body, prefer):
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(self.base + path, data=data, method=method, headers={
            "apikey": self.key, "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json", "Prefer": prefer,
        })
        try:
            with urllib.request.urlopen(request, timeout=60, context=SSL_CONTEXT) as response:
                response.read()
        except urllib.error.HTTPError as err:
            raise RuntimeError(f"HTTP {err.code} for {method} {path}: {err.read().decode('utf-8', 'replace')[:300]}") from None

    def upsert(self, table, rows, on_conflict):
        for i in range(0, len(rows), CHUNK):
            self._send("POST", f"/{table}?on_conflict={on_conflict}", rows[i:i + CHUNK],
                       "resolution=merge-duplicates,return=minimal")

    def insert(self, table, rows):
        for i in range(0, len(rows), CHUNK):
            self._send("POST", f"/{table}", rows[i:i + CHUNK], "return=minimal")


def load_status(rest):
    try:
        rows = rest.rows("public", STATUS_TABLE, {"columns": [], "pk": ["problem_id"]})
    except RuntimeError as err:
        raise SystemExit(f"Cannot read {STATUS_TABLE} ({err}). Run supabase/sql/problem_verification.sql first.")
    return {r["problem_id"]: r for r in rows}


def save(rest, writer, results, run_id, l1_ran):
    """results: the report's per-problem dicts (issues as dicts). Returns counts for the console."""
    existing = load_status(rest)
    now = datetime.now(timezone.utc).isoformat()
    new_rows, same_rows, changed_rows, history = [], [], [], []

    for r in results:
        l0 = [i for i in r["issues"] if i["rule"] not in L1_RULES]
        l1 = [i for i in r["issues"] if i["rule"] in L1_RULES]
        summary = {"L0": layer_status(l0)}
        if l1_ran and (r.get("source") or "").endswith("Ladders v2"):
            summary["L1"] = layer_status(l1)
        base = {"problem_id": r["id"], "content_hash": r["content_hash"], "auto_status": AUTO_STATUS[r["status"]],
                "auto_summary": summary, "last_checked_at": now, "updated_at": now}

        old = existing.get(r["id"])
        if old is None:
            new_rows.append({**base, "review_status": "pending", "approvals": 0,
                             "required_approvals": required_approvals(r)})
        elif old["content_hash"] != r["content_hash"]:
            changed_rows.append({**base, "approvals": 0,
                                 "review_status": "needs_recheck" if old["review_status"] == "approved" else "pending"})
        else:
            same_rows.append(base)

        old_summary = (old or {}).get("auto_summary") or {}
        hash_changed = old is None or old["content_hash"] != r["content_hash"]
        for layer, issues in (("L0", l0), ("L1", l1)):
            if layer not in summary:
                continue
            if hash_changed or old_summary.get(layer) != summary[layer]:
                history.append({"problem_id": r["id"], "content_hash": r["content_hash"], "layer": layer,
                                "status": summary[layer], "details": {"issues": issues}, "run_id": run_id})

    # Three groups because a bulk upsert needs the same keys in every row.
    for rows in (new_rows, changed_rows, same_rows):
        if rows:
            writer.upsert(STATUS_TABLE, rows, "problem_id")
    if history:
        writer.insert(HISTORY_TABLE, history)
    return {"new": len(new_rows), "changed": len(changed_rows), "unchanged": len(same_rows), "history": len(history)}
