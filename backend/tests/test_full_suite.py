import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import io

from app.main import app
from app.db.session import Base, get_db
from app.models.all_models import User, MedicalDocument, DocumentChunk, Doctor, Appointment
from app.services.rag_service import rag_service
from app.services.adherence_service import adherence_service
from app.services.doctor_service import doctor_service

from sqlalchemy.pool import StaticPool

# Use in-memory SQLite database with StaticPool for isolated shared test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as db:
        doctor_service.ensure_demo_doctors(db)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)


def test_auth_registration_and_login(client):
    # Register User A
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "doctor.alice@medinova.ai",
        "password": "SecurePassword123!",
        "full_name": "Alice Smith"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    assert token is not None

    # Verify /me endpoint
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "doctor.alice@medinova.ai"

    # Login User A
    login_res = client.post("/api/v1/auth/login", json={
        "email": "doctor.alice@medinova.ai",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Invalid password rejection
    bad_login = client.post("/api/v1/auth/login", json={
        "email": "doctor.alice@medinova.ai",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401


def test_document_upload_and_rag_indexing(client):
    # Register User
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "patient.bob@medinova.ai",
        "password": "SecurePassword123!",
        "full_name": "Bob Jones"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload sample lab report
    file_content = (
        b"PATIENT LAB REPORT\n"
        b"Fasting Blood Sugar: 128 mg/dL (Reference: 70-99)\n"
        b"HbA1c: 6.8% (Reference: 4.0-5.6)\n"
        b"Total Cholesterol: 215 mg/dL\n"
    )
    files = {"file": ("blood_test.pdf", io.BytesIO(file_content), "application/pdf")}
    data = {"document_type": "lab_report"}

    upload_res = client.post("/api/v1/documents/upload", headers=headers, files=files, data=data)
    assert upload_res.status_code == 200
    doc_data = upload_res.json()
    assert doc_data["processing_status"] == "completed"
    doc_id = doc_data["id"]

    # Verify RAG chat retrieves grounded answer and citation
    chat_res = client.post("/api/v1/ai/chat", headers=headers, json={
        "message": "What is my fasting blood sugar and is it high?",
        "use_rag": True
    })
    assert chat_res.status_code == 200
    chat_body = chat_res.json()
    assert chat_body["is_grounded"] is True
    assert len(chat_body["citations"]) > 0
    assert chat_body["citations"][0]["document_id"] == doc_id


def test_cross_user_rag_isolation(client):
    """
    CRITICAL SECURITY & HIPAA TEST:
    Proves that Patient Eve CANNOT retrieve Patient Bob's medical records or chunks.
    """
    # Register Eve
    reg_eve = client.post("/api/v1/auth/register", json={
        "email": "intruder.eve@medinova.ai",
        "password": "EveSecurePassword!",
        "full_name": "Eve Intruder"
    })
    eve_token = reg_eve.json()["access_token"]
    eve_headers = {"Authorization": f"Bearer {eve_token}"}

    # Eve asks about blood sugar when she has NO uploaded documents
    eve_chat = client.post("/api/v1/ai/chat", headers=eve_headers, json={
        "message": "What is my fasting blood sugar and HbA1c?",
        "use_rag": True
    })
    assert eve_chat.status_code == 200
    eve_data = eve_chat.json()
    # Must NOT be grounded with Bob's data
    assert eve_data["is_grounded"] is False
    assert len(eve_data["citations"]) == 0
    assert "insufficient" in eve_data["content"].lower()


def test_prescription_extraction_and_confirmation(client):
    # Register user
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "charlie@medinova.ai",
        "password": "CharliePassword123!",
        "full_name": "Charlie Day"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload prescription
    presc_content = (
        b"DOCTOR RX PRESCRIPTION\n"
        b"1. Metformin 500mg - Twice daily after food - 30 days\n"
        b"2. Atorvastatin 20mg - Once daily at bedtime - 30 days\n"
    )
    files = {"file": ("rx_cardiologist.pdf", io.BytesIO(presc_content), "application/pdf")}
    data = {"document_type": "prescription"}

    upload_res = client.post("/api/v1/documents/upload", headers=headers, files=files, data=data)
    assert upload_res.status_code == 200

    # Retrieve prescription
    presc_list = client.get("/api/v1/prescriptions/", headers=headers)
    assert presc_list.status_code == 200
    prescriptions = presc_list.json()
    assert len(prescriptions) > 0
    presc = prescriptions[0]
    assert len(presc["medicines"]) >= 1

    # Confirm prescription to convert into active medicines & schedules
    confirm_res = client.post("/api/v1/prescriptions/confirm", headers=headers, json={
        "prescription_id": presc["id"],
        "medicines": presc["medicines"]
    })
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == "success"

    # Verify medicines exist in My Medicines
    meds_res = client.get("/api/v1/medicines/", headers=headers)
    assert meds_res.status_code == 200
    assert len(meds_res.json()) >= 1


def test_medication_adherence_calculation(client):
    # Register user
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "david@medinova.ai",
        "password": "DavidPassword123!",
        "full_name": "David Miller"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add medicine
    med_res = client.post("/api/v1/medicines/", headers=headers, json={
        "name": "Lisinopril",
        "strength": "10mg",
        "dosage_form": "Tablet",
        "prescribed_dose": "1 tablet",
        "frequency": "Once daily",
        "time_slots": ["08:00"],
        "food_instructions": "after_food",
    })
    assert med_res.status_code == 200
    med_id = med_res.json()["id"]

    # Record taken dose event
    today_str = "2026-10-12"
    dose_res = client.post("/api/v1/adherence/dose", headers=headers, json={
        "medicine_id": med_id,
        "scheduled_date": today_str,
        "scheduled_time": "08:00",
        "status": "taken"
    })
    assert dose_res.status_code == 200
    assert dose_res.json()["status"] == "taken"

    # Fetch adherence statistics
    adh_res = client.get("/api/v1/adherence/", headers=headers)
    assert adh_res.status_code == 200
    stats = adh_res.json()
    assert stats["taken_count"] >= 1
    assert stats["today_percentage"] > 0


def test_doctor_appointment_booking_and_conflict(client):
    # Register user 1
    u1 = client.post("/api/v1/auth/register", json={
        "email": "user1@medinova.ai",
        "password": "Password123!",
        "full_name": "User One"
    }).json()["access_token"]

    # Register user 2
    u2 = client.post("/api/v1/auth/register", json={
        "email": "user2@medinova.ai",
        "password": "Password123!",
        "full_name": "User Two"
    }).json()["access_token"]

    # Get doctors
    docs = client.get("/api/v1/doctors/").json()
    assert len(docs) > 0
    doc_id = docs[0]["id"]

    # User 1 books slot 10:00 on 2026-10-20
    b1 = client.post("/api/v1/doctors/appointments", headers={"Authorization": f"Bearer {u1}"}, json={
        "doctor_id": doc_id,
        "appointment_date": "2026-10-20",
        "start_time": "10:00",
        "consultation_type": "video",
        "symptoms_notes": "Routine checkup"
    })
    assert b1.status_code == 200
    assert b1.json()["status"] == "confirmed"

    # User 2 attempts to double-book the exact same doctor and slot
    b2 = client.post("/api/v1/doctors/appointments", headers={"Authorization": f"Bearer {u2}"}, json={
        "doctor_id": doc_id,
        "appointment_date": "2026-10-20",
        "start_time": "10:00",
        "consultation_type": "video"
    })
    # Must reject with 409 Conflict
    assert b2.status_code == 409
    assert "already booked" in b2.json()["detail"].lower()
