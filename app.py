import os
import streamlit as st
import easyocr
from PIL import Image
import numpy as np
import fitz  # PyMuPDF
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

# ==============================
# Load API Key
# ==============================
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    st.error("❌ GOOGLE_API_KEY not found. Add it to your .env file or environment variables.")
    st.stop()

# ==============================
# Initialize OCR
# ==============================
@st.cache_resource
def load_ocr():
    return easyocr.Reader(['en'])

reader = load_ocr()

# ==============================
# Initialize Gemini LLM
# ==============================
try:
    model = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.0
    )
except Exception as e:
    st.error(f"❌ Failed to initialize Gemini model: {e}")
    st.stop()

# ==============================
# Prompt Template
# ==============================
extraction_prompt = ChatPromptTemplate.from_template("""
Extract lab test names, values, and units from this medical report text:

{report_text}

Return JSON with this exact format:
{{
  "extracted_markers": {{
    "TestName": {{ "value": "number/string", "unit": "string", "status": "Low|Normal|High|Borderline", "reference_range": "string" }}
  }}
}}
Only output valid JSON. Do not include conversational text.
""")

# ==============================
# Streamlit App
# ==============================
st.set_page_config(page_title="Medical Report Analyzer", page_icon="🩺")
st.title("🩺 Medical Report Analyzer")

uploaded_file = st.file_uploader("Upload a medical report", type=["jpg", "jpeg", "png", "pdf"])

if uploaded_file:
    file_type = uploaded_file.type
    report_text = ""

    # --- Process Images ---
    if "image" in file_type:
        image = Image.open(uploaded_file).convert("RGB")
        st.image(image, caption="Uploaded Medical Report", use_container_width=True)

        with st.spinner("🔍 Extracting text from image..."):
            image_array = np.array(image)
            result = reader.readtext(image_array, detail=0)
            report_text = " ".join(result)

    # --- Process PDFs ---
    elif file_type == "application/pdf":
        pdf = fitz.open(stream=uploaded_file.read(), filetype="pdf")
        text_pages = []

        with st.spinner("🔍 Extracting text from PDF..."):
            for page_num in range(len(pdf)):
                text = pdf[page_num].get_text()
                if text.strip():
                    text_pages.append(text)
                else:
                    pix = pdf[page_num].get_pixmap()
                    pil_img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    image_array = np.array(pil_img)
                    result = reader.readtext(image_array, detail=0)
                    text_pages.append(" ".join(result))

        report_text = "\n".join(text_pages)

    if not report_text.strip():
        st.warning("⚠️ No text extracted from the file. Try another file.")
    else:
        with st.expander("📄 View Extracted Raw Text"):
            st.text(report_text)

        # ==============================
        # LLM Analysis (FIXED)
        # ==============================
        if st.button("Analyze with AI"):
            with st.spinner("🤖 AI is analyzing health markers..."):
                try:
                    # Use .invoke() to get the proper response object
                    response = model.invoke(extraction_prompt.format(report_text=report_text))
                    
                    # Extract the string content
                    raw_content = response.content
                    
                    # CLEANING: Remove markdown formatting if the AI added it
                    clean_json = raw_content.replace("```json", "").replace("```", "").strip()

                    # Parse and display
                    markers = json.loads(clean_json)
                    st.success("✅ Analysis Complete")
                    st.subheader("Results")
                    st.json(markers)

                except json.JSONDecodeError:
                    st.error("⚠️ AI returned an invalid format. Raw Output:")
                    st.code(raw_content)
                except Exception as e:
                    st.error(f"❌ Error while processing: {str(e)}")