// const express = require("express");
// const { GoogleGenAI } = require("@google/genai");

// const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// if (!process.env.GEMINI_API_KEY) console.warn("⚠️ GEMINI_API_KEY is missing!");

// module.exports = function () {
//   const router = express.Router();

//   // POST /api/chat
//   router.post("/chat", async (req, res) => {
//     const { message } = req.body;
//     if (!message) return res.status(400).json({ error: "Message is required" });

//     let reply = "";
//     const msgLower = message.toLowerCase();

//     // Short conversational rules specific to Food Sharing
// if (msgLower.includes("hi") || msgLower.includes("hello")) {
//   reply = "Hello! 👋 Welcome to Food Sharing! How can I help you today?";
// } else if (msgLower.includes("donate") || msgLower.includes("give food")) {
//   reply = "You can donate food by visiting the 'Add Food' page. 🍲";
// } else if (msgLower.includes("request") || msgLower.includes("need food")) {
//   reply = "To request food, go to the 'Request Food' section and fill out the form. 📝";
// } else if (msgLower.includes("status")) {
//   reply = "You can check the status of your requests in the 'My Requests' page.";
// } else if (msgLower.includes("available food") || msgLower.includes("foods")) {
//   reply = "Check out the 'Available Foods' page to see all currently available donations. 🥗";
// } else if (msgLower.includes("login") || msgLower.includes("signup")) {
//   reply = "Please login or signup to access food donations and requests. 🔑";
// } else if (msgLower.includes("support") || msgLower.includes("help")) {
//   reply = "Our support team is here to help! You can contact us via the 'Contact' page.";
// } else if (msgLower.includes("thank")) {
//   reply = "You're welcome! 😊 Happy to help.";
// } else if (msgLower.includes("who") && msgLower.includes("we")) {
//   reply = "Food Sharing is a community platform where donors can share food and those in need can request it. 🍽️";
// } else {
// //   Optional: Fallback to Gemini AI or mock reply
//   try {
//     const response = await gemini.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: `You are a Food Sharing assistant. Keep answers short and helpful. User asked: "${message}"`,
//     });
//     reply = response.text || "I'm here to help with Food Sharing!";
//   } catch (err) {
//     console.error("Gemini Error:", err);
//     reply = "I'm here to help with Food Sharing!";
//   }

// //   Fallback mock reply
//   reply = "I'm here to help with Food Sharing! Could you please clarify your question?";
// }

// res.json({ reply });
//   });

//   return router;
// };

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
if (!process.env.GEMINI_API_KEY) console.warn("⚠️ GEMINI_API_KEY is missing!");

module.exports = function () {
  const router = express.Router();

  // POST /api/chat
  router.post("/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    let reply = "";
    const msgLower = message.toLowerCase();

    // Simple language detection: check for Bengali characters
    const isBangla = /[\u0980-\u09FF]/.test(message);

    if (!isBangla) {
      // English predefined rules
      if (msgLower.includes("hi") || msgLower.includes("hello")) {
        reply = "Hello! 👋 Welcome to Food Sharing! How can I help you today?";
      } else if (msgLower.includes("donate") || msgLower.includes("give food")) {
        reply = "You can donate food by visiting the 'Add Food' page. 🍲";
      } else if (msgLower.includes("request") || msgLower.includes("need food")) {
        reply = "To request food, go to the 'Request Food' section and fill out the form. 📝";
      } else if (msgLower.includes("status")) {
        reply = "You can check the status of your requests in the 'My Requests' page.";
      } else if (msgLower.includes("available food") || msgLower.includes("foods")) {
        reply = "Check out the 'Available Foods' page to see all currently available donations. 🥗";
      } else if (msgLower.includes("login") || msgLower.includes("signup")) {
        reply = "Please login or signup to access food donations and requests. 🔑";
      } else if (msgLower.includes("support") || msgLower.includes("help")) {
        reply = "Our support team is here to help! You can contact us via the 'Contact' page.";
      } else {
        // Fallback Gemini AI for English
        try {
          const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a Food Sharing assistant. Answer concisely in English. User asked: "${message}"`,
          });
          reply = response.text || "I'm here to help with Food Sharing!";
        } catch (err) {
          console.error("Gemini Error:", err);
          reply = "I'm here to help with Food Sharing!";
        }
      }
    } else {
      // Bengali predefined rules
      if (msgLower.includes("হাই") || msgLower.includes("হ্যালো")) {
        reply = "হ্যালো! 👋 Food Sharing-এ আপনাকে স্বাগতম! আমি কিভাবে সাহায্য করতে পারি?";
      } else if (msgLower.includes("দান") || msgLower.includes("খাবার দিতে")) {
        reply = "আপনি 'Add Food' পেজে গিয়ে খাবার দান করতে পারেন। 🍲";
      } else if (msgLower.includes("অনুরোধ") || msgLower.includes("খাবারের প্রয়োজন")) {
        reply = "'Request Food' সেকশনে গিয়ে ফর্ম পূরণ করে খাবারের অনুরোধ করতে পারেন। 📝";
      } else if (msgLower.includes("স্ট্যাটাস")) {
        reply = "আপনি 'My Requests' পেজে আপনার অনুরোধের স্ট্যাটাস দেখতে পারেন।";
      } else if (msgLower.includes("উপলব্ধ খাবার") || msgLower.includes("খাবার")) {
        reply = "'Available Foods' পেজে গিয়ে সব দানকৃত খাবার দেখতে পারেন। 🥗";
      } else if (msgLower.includes("লগইন") || msgLower.includes("সাইনআপ")) {
        reply = "খাবার দান ও অনুরোধ অ্যাক্সেস করার জন্য লগইন বা সাইনআপ করুন। 🔑";
      } else if (msgLower.includes("সহায়তা") || msgLower.includes("সাপোর্ট")) {
        reply = "আমাদের সহায়তা দল সাহায্য করতে প্রস্তুত! 'Contact' পেজে যোগাযোগ করতে পারেন।";
      } else {
        // Fallback Gemini AI for Bengali
        try {
          const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a Food Sharing assistant. Answer concisely in Bengali. User asked: "${message}"`,
          });
          reply = response.text || "আমি Food Sharing এ সাহায্য করতে এখানে আছি!";
        } catch (err) {
          console.error("Gemini Error:", err);
          reply = "আমি Food Sharing এ সাহায্য করতে এখানে আছি!";
        }
      }
    }

    res.json({ reply });
  });

  return router;
};
