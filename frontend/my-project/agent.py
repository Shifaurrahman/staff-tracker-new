import os
import anthropic
from openai import OpenAI
from supabase import create_client
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL    = os.environ["SUPABASE_URL"]
SUPABASE_KEY    = os.environ["SUPABASE_KEY"]
ANTHROPIC_KEY   = os.environ["ANTHROPIC_API_KEY"]

# ── LLM setup ─────────────────────────────────────────────────────────────
USE_LOCAL_LLM   = os.environ.get("USE_LOCAL_LLM", "false").lower() == "true"
LOCAL_BASE_URL  = os.environ.get("LOCAL_LLM_URL",   "http://localhost:1234/v1")
LOCAL_MODEL     = os.environ.get("LOCAL_LLM_MODEL", "llama-3.2-3b-instruct")
LOCAL_API_KEY   = os.environ.get("LOCAL_LLM_KEY",   "lm-studio")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
claude   = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

# LM Studio uses OpenAI-compatible API
lm_studio = OpenAI(
    base_url=LOCAL_BASE_URL,
    api_key=LOCAL_API_KEY
)

def call_llm(prompt):
    if USE_LOCAL_LLM:
        print("    Using LM Studio...")
        response = lm_studio.chat.completions.create(
            model=LOCAL_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    else:
        print("    Using Claude API...")
        response = claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text.strip()

def run():
    today     = datetime.now(timezone.utc).date()
    day_start = f"{today}T00:00:00+00:00"
    day_end   = f"{today}T23:59:59+00:00"
    date_str  = today.strftime("%B %d, %Y")

    print(f"Running agent for {today}...")
    print(f"LLM: {'LM Studio (' + LOCAL_MODEL + ')' if USE_LOCAL_LLM else 'Claude Sonnet 4.6'}")

    # 1. Fetch today's messages
    msgs_res = supabase.from_("messages_full") \
        .select("staff_id, staff_name, text, created_at") \
        .gte("created_at", day_start) \
        .lte("created_at", day_end) \
        .execute()

    messages = msgs_res.data
    if not messages:
        print("No messages today. Exiting.")
        return

    # 2. Group by staff member
    by_staff = {}
    for msg in messages:
        sid = msg["staff_id"]
        if sid not in by_staff:
            by_staff[sid] = {"name": msg["staff_name"], "messages": []}
        by_staff[sid]["messages"].append(msg["text"])

    # 3. Process each staff member
    for staff_id, data in by_staff.items():
        name     = data["name"]
        msg_list = data["messages"]

        if name == "Team Lead":
            continue

        print(f"  Processing {name} ({len(msg_list)} message(s))...")

        # Fetch current profile
        profile_res = supabase.from_("staff_profiles") \
            .select("bio_md") \
            .eq("staff_id", staff_id) \
            .maybe_single() \
            .execute()

        current_bio = profile_res.data["bio_md"] if profile_res.data else ""

        # Remove existing entry for today to prevent duplicates
        date_heading = f"## {date_str}"
        if date_heading in current_bio:
            current_bio = current_bio[:current_bio.index(date_heading)].rstrip()
            print(f"    Removed existing {date_str} entry to avoid duplicate.")

        updates_text = "\n".join(f"- {m}" for m in msg_list)

        prompt = f"""You are updating a staff member's profile markdown file.

Current profile (do not change any of this existing content):
{current_bio if current_bio.strip() else "(empty — no profile yet)"}

Today's raw updates from {name} on {date_str}:
{updates_text}

Task:
1. Keep ALL existing profile content exactly as is.
2. Update the "Current Tasks" section if the updates mention completing or starting tasks.
3. Append a daily log section at the very bottom using this exact format:

## {date_str}
**Today's Updates:**
{updates_text}

**Summary:**
[2-3 sentence summary of what {name} worked on today]

Return the full updated markdown only. No explanation, no code fences."""

        updated_bio = call_llm(prompt)

        # Upsert back to Supabase
        supabase.from_("staff_profiles").upsert({
            "staff_id":   staff_id,
            "bio_md":     updated_bio,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }, on_conflict="staff_id").execute()

        print(f"  ✓ {name} profile updated.")

    print("Done.")

if __name__ == "__main__":
    run()