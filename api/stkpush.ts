import type { VercelRequest, VercelResponse } from "@vercel/node";

const KIPAY_URL = process.env.KIPAY_API_URL;

function normalizePhone(phone: string): string | null {
  let cleaned = phone.replace(/[\s+-]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  } else if (
    cleaned.startsWith("7") ||
    cleaned.startsWith("1")
  ) {
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
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { phone, amount, reference } = req.body ?? {};

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
        message: "Amount must be a valid whole number",
      });
    }

    // Validate reference
    if (
      typeof reference !== "string" ||
      reference.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment reference",
      });
    }

    // Normalize phone number
    const msisdn = normalizePhone(String(phone));

    if (!msisdn) {
      return res.status(400).json({
        success: false,
        message: "Invalid Kenyan phone number",
      });
    }

    // Check KiPay credentials
    const apiKey = process.env.KIPAY_API_KEY;

    if (!apiKey || !KIPAY_URL) {
      console.error("KiPay environment variables missing");

      return res.status(500).json({
        success: false,
        message: "Payment service is not configured",
      });
    }

    // Initiate KiPay STK Push
    const response = await fetch(
      `${KIPAY_URL}/collections/stk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          phone: msisdn,
          amount: paymentAmount,
          reference,
          description: "Order payment",
        }),
        signal: AbortSignal.timeout(25000),
      }
    );

    const responseText = await response.text();

    let result: unknown;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }

    if (!response.ok) {
      console.error("KiPay STK request failed:", result);

      return res.status(502).json({
        success: false,
        message: "KiPay rejected the STK Push request",
        data: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: "STK Push request submitted successfully",
      data: result,
    });

  } catch (error) {
    console.error("KiPay STK Push error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to initiate payment",
    });
  }
}
