from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import settings
from pathlib import Path

# Path to the templates directory
TEMPLATES_DIR = Path(__file__).parent.parent / "templates" / "email"

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=TEMPLATES_DIR,
)

async def send_otp_email(email_to: EmailStr, otp_code: str):
    message = MessageSchema(
        subject="Your Password Reset OTP",
        recipients=[email_to],
        template_body={"otp_code": otp_code},
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message, template_name="otp.html")


async def send_order_placed_email(email_to: EmailStr, order_id: str, total_amount: float, user_name: str, items: list[dict] = None):
    message = MessageSchema(
        subject=f"Order Placed #{str(order_id).split('-')[0]}",
        recipients=[email_to],
        template_body={
            "user_name": user_name,
            "order_id": str(order_id).split('-')[0],
            "total_amount": f"{total_amount:.2f}",
            "items": items or []
        },
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message, template_name="order_placed.html")


async def send_order_confirmation_email(email_to: EmailStr, order_id: str, total_amount: float, user_name: str, items: list[dict] = None):
    message = MessageSchema(
        subject=f"Payment Successful - Order #{str(order_id).split('-')[0]}",
        recipients=[email_to],
        template_body={
            "user_name": user_name,
            "order_id": str(order_id).split('-')[0],
            "total_amount": f"{total_amount:.2f}",
            "items": items or []
        },
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message, template_name="order_confirmation.html")


async def send_order_cancellation_email(email_to: EmailStr, order_id: str, total_amount: float, user_name: str, items: list[dict] = None):
    message = MessageSchema(
        subject=f"Order Cancelled #{str(order_id).split('-')[0]}",
        recipients=[email_to],
        template_body={
            "user_name": user_name,
            "order_id": str(order_id).split('-')[0],
            "total_amount": f"{total_amount:.2f}",
            "items": items or []
        },
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message, template_name="order_cancellation.html")


async def send_order_status_update_email(email_to: EmailStr, order_id: str, status: str, total_amount: float, user_name: str, items: list[dict] = None):
    message = MessageSchema(
        subject=f"Order Update #{str(order_id).split('-')[0]}",
        recipients=[email_to],
        template_body={
            "user_name": user_name,
            "order_id": str(order_id).split('-')[0],
            "status": status.upper(),
            "total_amount": f"{total_amount:.2f}",
            "items": items or []
        },
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message, template_name="order_status_update.html")
