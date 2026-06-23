import os
import anthropic
from supabase import create_client
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
claude   = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

def run():
    today = datetime.now(timezone.utc).date()
    day_start = f"{today}T00:00:00+00:00"
    day_end   = f"{today}T23:59:59+00:00"

    print(f"Running agent for {today}...")

    # 1. Fetch today's messages with staff name
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

        # Build prompt
        updates_text = "\n".join(f"- {m}" for m in msg_list)
        date_str     = today.strftime("%B %d, %Y")

        prompt = f"""You are updating a staff member's profile markdown file.

Current profile:
{current_bio if current_bio.strip() else "(empty — no profile yet)"}

Today's updates from {name} on {date_str}:
{updates_text}

Task: Append a new daily log section at the bottom of the profile summarizing what {name} worked on today. 
Keep all existing content exactly as is. 
Only add the new section at the bottom.
Use this format:

## {date_str}
[2-3 sentence summary of what they worked on today based on their updates]

Return the full updated markdown content only. No explanation, no code fences."""

        # Call Claude
        response = claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        updated_bio = response.content[0].text.strip()

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