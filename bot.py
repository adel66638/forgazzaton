import asyncio
import os
from TonTools import Wallet, TonCenterClient

# الإعدادات من خلال "Secrets" في GitHub للأمان
MY_WALLET = "عنوان_محفظتك_الأساسية"
BOT_SEED = os.getenv('BOT_SEED') # سيتم جلبه من إعدادات الحساب
API_KEY = os.getenv('TON_API_KEY') 

client = TonCenterClient(base_url='https://toncenter.com/api/v2/', api_key=API_KEY)
wallet = Wallet(provider=client, mnemonics=BOT_SEED)

# المستويات والأسعار من الصور التي أرسلتها
PRICES = {
    1: 1, 2: 2, 3: 4, 4: 8, 5: 10, 6: 12, 7: 21, 8: 24,
    9: 30, 10: 40, 11: 50, 12: 60, 13: 70, 14: 80,
    15: 90, 16: 100, 17: 120, 18: 150, 19: 180, 20: 200
}

async def distribute():
    print("Checking transactions...")
    txs = await wallet.get_transactions(limit=5)
    for tx in txs:
        if tx.type == 'in':
            amount = tx.amount
            sender = tx.sender
            try:
                level = int(tx.message) # المستخدم يرسل رقم المستوى في التعليق
                if amount >= PRICES.get(level, 999):
                    if level == 1:
                        # قاعدة المستوى الأول: 0.8 لك و 0.2 للمشترك
                        await wallet.transfer(destination=MY_WALLET, amount=0.8)
                        await wallet.transfer(destination=sender, amount=0.2)
                    else:
                        # باقي المستويات: النصف لك والنصف للمحيل (افتراضي محفظتك إذا لم يحدد)
                        half = amount / 2
                        await wallet.transfer(destination=MY_WALLET, amount=half)
                        await wallet.transfer(destination=MY_WALLET, amount=half) # استبدل بمحفظة المحيل لاحقاً
                    print(f"Success for Level {level}")
            except:
                continue

if __name__ == "__main__":
    asyncio.run(distribute())
