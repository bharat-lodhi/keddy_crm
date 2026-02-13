import os
from PyPDF2 import PdfReader
from docx import Document


def extract_text_from_resume(file_path):
    ext = os.path.splitext(file_path)[1].lower()

    text = ""

    if ext == ".pdf":
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() or ""

    elif ext in [".doc", ".docx"]:
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"

    return text.lower()
