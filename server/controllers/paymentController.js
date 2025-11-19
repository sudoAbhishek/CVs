const Razorpay = require("razorpay");
const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order.model");
const Resume = require("../models/Resume.model");

// Generate unique share token
const generateShareToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

exports.createOrder = async (req, res) => {
  try {
    // Razorpay uses Base64 encoded key:secret for REST API calls
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    // Order details for Razorpay (₹1 → 100 paise)
    const options = {
      amount: 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    // Create order via Razorpay REST API (server-to-server call)
    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      options,
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    // Save order in DB with logged-in user ID
    await Order.create({
      userId: req.user.id,
      razorpay_order_id: response.data.id,
      amount: response.data.amount,
      receipt: response.data.receipt,
      status: "created",
      rawResponse: response.data
    });

    // Return created order to frontend
    return res.json(response.data);

  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).json({ message: "Failed to create order" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, resumeId } =
      req.body;

    // String format Razorpay expects for signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    // Generate expected signature using key secret
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Fetch order from DB
    const order = await Order.findOne({ razorpay_order_id });
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // If signature matches → payment success
    if (expectedSignature === razorpay_signature) {
      order.razorpay_payment_id = razorpay_payment_id;
      order.razorpay_signature = razorpay_signature;
      order.status = "paid";
      await order.save();

      // If resumeId provided, generate share token for it
      let shareToken = null;
      if (resumeId) {
        shareToken = generateShareToken();
        await Resume.findByIdAndUpdate(resumeId, {
          shareToken: shareToken,
          isShared: true,
          sharedAt: new Date()
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Payment verified successfully",
        shareToken: shareToken,
        data: order
      });

    }

    // If signature invalid → mark failed
    order.status = "failed";
    await order.save();

    return res.status(400).json({
      status: "fail",
      message: "Payment verification failed"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Payment verification failed" });
  }
};
