from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.config import settings
from app.core.security import get_current_user
router = APIRouter()

@router.post("/create-intent/{order_id}")
async def create_payment_intent(order_id: str, current_user=Depends(get_current_user)):
    # In production: create Stripe PaymentIntent
    return {"client_secret": "pi_demo_secret_123", "amount": 14520, "currency": "eur"}

@router.post("/webhook")
async def stripe_webhook(request: Request):
    # In production: verify Stripe signature and handle events
    return {"received": True}
