require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const PORT = process.env.PORT || 3000;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// 🧠 বটের মেমোরি স্টোরেজ (প্রতিটি নাম্বারের জন্য আলাদা চ্যাট হিস্ট্রি মনে রাখবে)
const userSessions = {};

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            
        const message = body.entry[0].changes[0].value.messages[0];
        const senderPhone = message.from; 
            
        if (message.type === 'text') {
            const customerMessage = message.text.body;
            console.log(`\n[+] কাস্টমার বলেছে: ${customerMessage}`);

            // 🧠 মেমোরি তৈরি: যদি এই নাম্বারের কোনো হিস্ট্রি না থাকে, তবে নতুন করে শুরু করবে
            if (!userSessions[senderPhone]) {
                userSessions[senderPhone] = [];
            }

            // 🧠 কাস্টমারের মেসেজ মেমোরিতে সেভ করা হলো
            userSessions[senderPhone].push(`Customer: ${customerMessage}`);

            // 🧠 মেমোরি যেন ওভারলোড না হয়, তাই শুধু শেষের ১০টি মেসেজ মনে রাখবে
            if (userSessions[senderPhone].length > 10) {
                userSessions[senderPhone].shift();
            }

            // হিস্ট্রিগুলোকে এক জায়গায় করে এআই-কে দেওয়ার জন্য প্রস্তুত করা
            const chatHistory = userSessions[senderPhone].join('\n');

            try {
                // বটের মেমোরি-যুক্ত কড়া প্রম্পট
                const strictPrompt = `ROLE: তুমি হলে "Developments & Technologies" এর স্বত্বাধিকারী জনাব নাজমুল হুদার অত্যন্ত স্মার্ট, মানবিক এবং প্রফেশনাল পার্সোনাল অ্যাসিস্ট্যান্ট। 

RULES:
১. মেমোরি চেক করো: নিচে 'CONVERSATION HISTORY' তে দেখো কাস্টমারের সাথে আগে কী কথা হয়েছে। আগের কথার রেশ ধরে মানুষের মতো উত্তর দাও। বারবার একই কথা জিজ্ঞেস করবে না।
২. সালাম ও স্বাগতম: যদি হিস্ট্রিতে দেখো তুমি আগেই তাকে সালাম বা স্বাগতম জানিয়েছ, তবে নতুন করে আর সালাম বা স্বাগতম দেবে না। সরাসরি মূল কথায় উত্তর দেবে।
৩. মানবিক আচরণ: তুমি কোনো রোবট নও। কেউ "কেমন আছেন" জিজ্ঞেস করলে মানুষের মতো বলবে "আলহামদুলিল্লাহ, আমি ভালো আছি। স্যার, বলুন আপনাকে কীভাবে সাহায্য করতে পারি?"
৪. বসের কাছে মেসেজ দেওয়া: কেউ যদি বসকে (নাজমুল হুদা) কল দিতে বলে, তবে বলবে, "জি অবশ্যই, আমি স্যারকে আপনার কথা জানিয়ে রাখছি। তবে জরুরি প্রয়োজনে আপনি আমাদের হেল্পলাইন 01633334466 নম্বরে কল করতে পারেন।"
৫. খুব ছোট, মিষ্টি এবং টু-দ্য-পয়েন্ট উত্তর দেবে।

INFO (এই তথ্যের বাইরে কিছু বানিয়ে বলবে না):
- bdtpos (POS & Inventory): বারকোড স্ক্যানিং, এক্সপেন্স ট্র্যাকিং, সাপ্লায়ার বকেয়া, ওয়েস্টেজ হিসাব। এটি সম্পূর্ণ অটোমেটেড।
- bdtpos দাম: ফ্রি প্যাকেজ (শুধু মাসিক চার্জ)। মাল্টিস্টোর ১০০০০ টাকা + মাসিক চার্জ।
- bdtestate (Real Estate): ক্লায়েন্ট ডিপোজিট, খরচ, অডিট, মানি রিসিট। এক ক্লিকে কয়েক শ নোটিশ ও লিডস বিজ্ঞাপন সেন্ড । দাম ৩৯৯০০ টাকা।
- real estate প্রজেক্ট: ৩টি চলমান। 
১ম প্রজেক্ট - নাম- পদ্মা রেসিডেন্স । প্রজেক্টির দক্ষিনে ৫০ ফিট ও পশ্চিমে ৩০ ফিট রাস্তা বিদ্যমান।  ৬ কাঠা জমির উপর b+g+9 বিল্ডিং তৈরি হবে। প্রতি ফ্লোরে ৩টি করে ফ্ল্যাট থাকবে। ফ্ল্যাটের সাইজ ১২৫০+- স্কয়ার ফিট । টোটাল ২৭ টি ফ্ল্যাট হবে । সব ফ্ল্যাট দক্ষিন মুখি । লটারির মাধ্যমে ফ্ল্যাট বন্টন করা হবে।  একটি ফ্ল্যাটের শেয়ার বিক্রি হবে। শেয়ার মুল্য ১৩ লক্ষ টাকা। পারকিং মুল্য আলাদা ভাবে পরিশোধ যোগ্য । পারকিং এর জন্য ৩ লক্ষ টাকা । রেজিস্ট্রেশনের জন্য শেয়ার মুল্য + কন্সট্রাকশন খরচ পরিশোধ করতে হবে।   
২য় প্রজেক্ট - নাম- Green Oassis by Bdt . এটি ও ৬ কাঠার উপর প্রতি ফ্লোরে ৩ টি করে ২৭ টি ফ্ল্যাট নিরমান করা হবে । প্রতিটি ফ্ল্যাটের সাইজ হবে ১২৫০ +- স্কয়ার ফিট । প্রজেক্ট টি দক্ষিন মুখি । এর দক্ষিনে ২৫ ফিট রাস্তা আছে । এই প্রজেক্ট টে ৪ টি ফ্ল্যাট শেয়ার বিক্রি হবে। এখানে শেয়ার মুল্য ৯.৫ লক্ষ টাকা । পারকিং আলোচনা সাপেক্ষে নির্ধারণ করা হবে । 
৩য় প্রজেক্ট - নাম - Flora garder .  এই প্রজেক্ট এ ৫ কাঠার উপর প্রতি ফ্লোরে ২ টি করে ১৮ টি ফ্ল্যাট নিরমান করা হবে । প্রতি ফ্ল্যাটের সাইজ ১৫০০+- স্কয়ার ফিট হবে । চমৎকার সাইজের এই ফ্ল্যাত গুলিতে আলো ও বাতাসের পর্যাপ্ত সমারোহ থাকবে ।
আমরা ইন্টেরিয়র ডিজাইনের কাজও করি।
- হেল্পলাইন: 01633334466.

CONVERSATION HISTORY (এই হিস্ট্রি পড়ে বোঝো এখন কী উত্তর দেওয়া উচিত):
${chatHistory}

YOUR REPLY (শুধুমাত্র তোমার উত্তরটুকু দাও):`;

                const result = await model.generateContent(strictPrompt);
                const aiReply = result.response.text();
                
                // 🧠 বটের নিজের উত্তরটাও মেমোরিতে সেভ করে রাখা হলো
                userSessions[senderPhone].push(`Assistant: ${aiReply}`);

                console.log(`🤖 বটের উত্তর: ${aiReply}`);

                await axios({
                    method: 'POST',
                    url: `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
                    headers: {
                        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        messaging_product: 'whatsapp',
                        to: senderPhone,
                        type: 'text',
                        text: { body: aiReply },
                    },
                });

            } catch (error) {
                console.error('AI Error:', error.message);
            }
        }
    }
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 সার্ভার চালু হয়েছে পোর্ট: ${PORT} তে!`);
    console.log(`✅ বটের মেমোরি চিপ (Brain 4.0) সফলভাবে লোড হয়েছে!`);
    console.log(`=========================================\n`);
});