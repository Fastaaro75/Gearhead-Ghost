const express = require("express");
const path = require("path");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require("dotenv").config();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/create-checkout-session", async (req, res) => {
  const { plan } = req.body;
  let priceId;
  if (plan === "monthly") {
    priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
  } else if (plan === "lifetime") {
    priceId = process.env.STRIPE_LIFETIME_PRICE_ID;
  } else {
    return res.status(400).send("Invalid plan");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: "https://your-domain.com/chat.html",
      cancel_url: "https://your-domain.com",
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).send(`Stripe error: ${e.message}`);
  }
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));