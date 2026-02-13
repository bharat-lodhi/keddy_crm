import re
from .skills import SKILL_KEYWORDS


# skills jo bahut short hain (false positive risk)
STRICT_SKILLS = {"c", "r", "go", "ui"}


def extract_skills_from_text(text: str) -> str:
    found_skills = set()

    # normalize text
    text = text.lower()

    for skill in SKILL_KEYWORDS:
        skill_lc = skill.lower()

        # ---------- STRICT SKILLS ----------
        if skill_lc in STRICT_SKILLS:
            # match only if standalone or comma separated
            pattern = rf"(?<!\w){re.escape(skill_lc)}(?!\w)"
            if re.search(pattern, text):
                found_skills.add(skill.title())
            continue

        # ---------- NORMAL SKILLS ----------
        # word boundary match
        pattern = rf"\b{re.escape(skill_lc)}\b"
        if re.search(pattern, text):
            found_skills.add(skill.title())

    # return comma separated string
    return ", ".join(sorted(found_skills))
