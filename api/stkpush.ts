
import type { VercelRequest, VercelResponse } from "@vercel/node";

const PAYWAVE_URL =
  `${process.env.PAYWAVE_API_URL}/v1/stkpush`;

function normalizePhone(phone: string): string | null {
  let cleaned = phone.replace(/[\s+-]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("7") ||
             cleaned.startsWith("1")) {
    cleaned = "254" + cleaned;
  }

  if (!/^254[17]\d{8}$/.test(cleaned)) {
    return null;
  }

  return cleaned;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { phone, amount, reference } = req.body;

    // Validate required fields
    if (!phone || !amount || !reference) {
      return res.status(400).json({
        success: false,
        message: "Phone, amount and reference are required",
      });
    }

    // Validate amount
    const paymentAmount = Number(amount);

    if (
      !Number.isSafeInteger(paymentAmount) ||
      paymentAmount < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a whole number greater than zero",
      });
    }

    // Normalize and validate phone number
    const msisdn = normalizePhone(String(phone));

    if (!msisdn) {
      return res.status(400).json({
        success: false,
        message: "Invalid Kenyan phone number",
      });
    }

    // Check API credentials
    const apiKey = process.env.PAYWAVE_API_KEY;
    const email = process.env.PAYWAVE_EMAIL;

    if (!apiKey || !email || !process.env.PAYWAVE_API_URL) {
      console.error("Paywave environment variables missing");

      return res.status(500).json({
        success: false,
        message: "Payment service is not configured",
      });
    }

    // Initiate STK Push
    const response = await fetch(PAYWAVE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        email,
        amount: String(paymentAmount),
        msisdn,
        reference: String(reference),
      }),
      signal: AbortSignal.timeout(25000),
    });

    const responseText = await response.text();

    let result: unknown;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }

    if (!response.ok) {
      console.error("Paywave rejected STK request:", result);

      return res.status(502).json({
        success: false,
        message: "STK Push request was rejected",
        data: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: "STK Push request submitted",
      data: result,
    });

  } catch (error) {
    console.error("STK Push error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to initiate payment",
    });
  }
}
