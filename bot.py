import asyncio
import os
import time
from TonTools import Wallet, TonCenterClient

# --- الإعدادات ---
# ضع عنوان محفظتك الشخصية بين علامتي التنصيص بالأسفل
MY_WALLET = "UQCynb1kgftPUU-52BHZZMSKZu-TgXaPgjqXVVNOXqX0Fcau" 

# جلب المفاتيح من إعدادات GitHub Secrets
BOT_SEED = os.getenv('BOT_SEED') 
API_KEY = os.getenv('TON_API_KEY') 

client = TonCenterClient(base_url='https://toncenter.com/api/v2/', api_key=API_KEY)
wallet = Wallet(provider=client, mnemonics=BOT_SEED)

# قائمة الأسعار حسب المستويات الـ 20
PRICES = {
    1: 1, 2: 2, 3: 4, 4: 8, 5: 10, 6: 12, 7: 21, 8: 24,
    9: 30, 10: 40, 11: 50, 12: 60, 13: 70, 14: 80,
    15: 90, 16: 100, 17: 120, 18: 150, 19: 180, 20: 200
}

async def distribute():
    print("جاري فحص المعاملات الجديدة...")
    try:
        txs = await wallet.get_transactions(limit=5)
        for tx in txs:
            if tx.type == 'in':
                amount = tx.amount
                sender = tx.sender
                try:
                    # قراءة رقم المستوى من تعليق المشترك
                    level = int(tx.message.strip())
                    expected_price = PRICES.get(level)
                    
                    if expected_price and amount >= expected_price:
                        if level == 1:
                            # المستوى 1: 0.8 لك و 0.2 للمشترك
                            await wallet.transfer(destination=MY_WALLET, amount=0.8, message="Owner Share L1")
                            await wallet.transfer(destination=sender, amount=0.2, message="Cashback L1")
                        else:
                            # باقي المستويات: النصف لك والنصف للمحيل (افتراضياً لك حالياً)
                            half = amount / 2
                            await wallet.transfer(destination=MY_WALLET, amount=half, message=f"L{level} Share 1")
                            await wallet.transfer(destination=MY_WALLET, amount=half, message=f"L{level} Share 2")
                        print(f"✅ تم تنفيذ التوزيع للمستوى {level}")
                except Exception as e:
                    continue
    except Exception as e:
        print(f"خطأ أثناء الفحص: {e}")

if __name__ == "__main__":
    # تشغيل البوت لمدة 4 دقائق ونصف وفحص الشبكة كل 15 ثانية
    for _ in range(18):
        asyncio.run(distribute())
        time.sleep(15)
