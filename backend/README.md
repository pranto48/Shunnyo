# Shunnyo Backend (Cloudflare Workers, D1 & R2)

'Shunnyo' এর ক্লাউডফ্লেয়ার ব্যাকএন্ড ইঞ্জিন। এতে WebRTC সিগনালিং, D1 ডেটাবেজ এবং R2 অবজেক্ট স্টোরেজ সংযুক্ত রয়েছে।

---

## 🚀 প্রধান ফিচারসমূহ

1. **WebRTC সিগনালিং (Durable Objects & WebSockets)**:
   - রিয়েল-টাইম অডিও/ভিডিও কলের জন্য SDP Offer, Answer এবং ICE Candidates ব্রডকাস্ট।
   - রুট: `GET /ws/signaling/:roomId`

2. **Cloudflare R2 E2EE ফাইল স্টোরেজ**:
   - প্রি-সাইনড আপলোড টিকেট জেনারেশন: `POST /api/storage/presigned-url`
   - ডিরেক্ট এনক্রিপ্টেড ফাইল আপলোড: `PUT /api/storage/upload/:fileKey`
   - এনক্রিপ্টেড মিডিয়া স্ট্রিমিং ও ডাউনলোড: `GET /api/storage/file/:fileKey`

3. **Cloudflare D1 ডেটাবেজ (পাবলিক কি রেজিস্ট্রি)**:
   - ব্যবহারকারীর RSA পাবলিক কি ও ফিঙ্গারপ্রিন্ট রেজিস্ট্রি: `POST /api/auth/register-key`
   - প্রাপকের পাবলিক কি খোঁজা: `GET /api/users/:userId/public-key`
   - সক্রিয় ব্যবহারকারী তালিকা: `GET /api/users`

---

## 🛠️ কমান্ড ও ডেপ্লয়মেন্ট

```bash
# ১. ডিপেন্ডেন্সি ইনস্টলেশন
npm install

# ২. লোকাল D1 ডেটাবেজ ইনিশিয়ালাইজেশন
npm run d1:init

# ৩. লোকাল ডেভ সার্ভার রান করা
npm run dev

# ৪. ক্লাউডফ্লেয়ার ওয়ার্কার্সে ডেপ্লয় করা
npm run deploy
```
