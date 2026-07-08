const axios = require("axios");
require("dotenv").config();

class PaymentService {
  async initializeTransaction(gateway, order, userEmail) {
    const amountInKoboOrMinor = Math.round(order.grandTotal * 100);
    const callbackUrl = `http://localhost:3000/checkout/success`;

    // A standard browser signature string to bypass Cloudflare/Firewall blocks
    const fallbackUserAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    if (gateway === "paystack") {
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: userEmail,
          amount: amountInKoboOrMinor,
          reference: order._id.toString(),
          callback_url: callbackUrl,
          metadata: { orderId: order._id },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
            "User-Agent": fallbackUserAgent, // ⚡ Inject browser signature here
          },
        },
      );
      return response.data.data.authorization_url;
    }

    if (gateway === "flutterwave") {
      const response = await axios.post(
        "https://flutterwave.com",
        {
          tx_ref: order._id.toString(),
          amount: order.grandTotal,
          currency: "NGN",
          redirect_url: callbackUrl,
          customer: { email: userEmail },
          customizations: { title: "E-Commerce Purchase" },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            "Content-Type": "application/json",
            "User-Agent": fallbackUserAgent, // ⚡ Inject browser signature here
          },
        },
      );
      return response.data.data.link;
    }

    throw new Error("Unsupported payment gateway configuration selection.");
  }

  async verifyTransaction(gateway, reference) {
    const fallbackUserAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    if (gateway === "paystack") {
      const response = await axios.get(`https://paystack.co{reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "User-Agent": fallbackUserAgent, // ⚡ Inject here too
        },
      });
      return response.data.data.status === "success";
    }

    if (gateway === "flutterwave") {
      const response = await axios.get(
        `https://flutterwave.com{reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            "User-Agent": fallbackUserAgent, // ⚡ Inject here too
          },
        },
      );
      return response.data.data.status === "successful";
    }

    return false;
  }
}

module.exports = new PaymentService();
