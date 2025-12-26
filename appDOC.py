import streamlit as st
import easyocr
from PIL import Image
import numpy as np
import fitz  # PyMuPDF

# Initialize EasyOCR Reader
reader = easyocr.Reader(['en'])

st.title("📄 Medical Report Uploader with OCR")

# File uploader
uploaded_file = st.file_uploader("Upload Medical Report", type=["jpg", "jpeg", "png", "pdf"])

if uploaded_file is not None:
    file_type = uploaded_file.type

    # =====================
    # Case 1: Image Files
    # =====================
    if file_type in ["image/jpeg", "image/png", "image/jpg"]:
        st.image(uploaded_file, caption="Uploaded Image", use_column_width=True)

        # Open as PIL and convert to NumPy array
        pil_image = Image.open(uploaded_file).convert("RGB")
        image = np.array(pil_image)

        # OCR
        result = reader.readtext(image, detail=0)
        st.subheader("📌 Extracted Text:")
        st.write(result)

    # =====================
    # Case 2: PDF Files
    # =====================
    elif file_type == "application/pdf":
        doc = fitz.open(stream=uploaded_file.read(), filetype="pdf")
        page = doc.load_page(0)  # First page only
        pix = page.get_pixmap()

        pil_image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        image = np.array(pil_image)  # <-- Convert to numpy array

        st.image(pil_image, caption="First Page of PDF", use_column_width=True)

        # OCR
        result = reader.readtext(image, detail=0)
        st.subheader("📌 Extracted Text:")
        st.write(result)
