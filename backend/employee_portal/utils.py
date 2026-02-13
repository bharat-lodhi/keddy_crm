import re
import os

# SKILLS_FILE = os.path.join(os.path.dirname(__file__), "skills_keywords.txt")


# def load_skills_keywords():
#     with open(SKILLS_FILE, "r", encoding="utf-8") as f:
#         return [line.strip() for line in f if line.strip()]


# SKILL_KEYWORDS = load_skills_keywords()


from .skills import SKILL_KEYWORDS

def extract_skills(text):
    found_skills = []

    for skill in SKILL_KEYWORDS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            found_skills.append(skill)

    return ", ".join(found_skills)


def calculate_experience(text):
    matches = re.findall(r'(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)', text, re.IGNORECASE)
    if matches:
        return max(float(m) for m in matches)
    return None


def parse_resume_text(text):
    # ===== Name =====
    name = text.split("\n")[0].strip() if text else ""

    # ===== Email =====
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    email = email_match.group(0) if email_match else None

    # ===== Phone =====
    phone_match = re.search(r'\+?\d[\d\s\-]{8,15}', text)
    phone = phone_match.group(0) if phone_match else None

    # ===== Skills =====
    skills = extract_skills(text)

    # ===== Experience =====
    experience = calculate_experience(text)

    return {
        "candidate_name": name,
        "candidate_email": email,
        "candidate_number": phone,
        "years_of_experience_calculated": experience,
        "skills": skills
    }





# import re

# def parse_resume_text(text):
#     # ===== Name (basic guess) =====
#     name = text.split("\n")[0] if text else ""

#     # ===== Email =====
#     email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
#     email = email_match.group(0) if email_match else None

#     # ===== Phone =====
#     phone_match = re.search(r'\+?\d[\d\s\-]{8,15}', text)
#     phone = phone_match.group(0) if phone_match else None

#     # ===== Skills (basic placeholder logic) =====
#     skill_keywords = [
#         "Python", "Java", "React", "Django", "Node", "SQL",
#         "AWS", "Docker", "JavaScript"
#     ]
#     skills_found = [s for s in skill_keywords if s.lower() in text.lower()]

#     return {
#         "candidate_name": name,
#         "candidate_email": email,
#         "candidate_number": phone,
#         "years_of_experience_calculated": None,  # later improve
#         "skills": ", ".join(skills_found)
#     }
