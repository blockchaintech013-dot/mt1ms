
import type { VercelRequest, VercelResponse } from "@vercel/node";

const KIPAY_URL = process.env.KIPAY_API_URL?.replace(/\/+$/, "");
const KIPAY_STK_PATH =
  process.env.KIPAY_STK_PATH || "/stk/push";

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

  return /^254[17]\d{8}$/.test(cleaned)
    ? cleaned
    : null;
}

function maskPhone(phone: string): string {
  return phone.length >= 4
    ? `${phone.slice(0, 3)}******${phone.slice(-2)}`
    : "***";
}

function isHtmlResponse(
  contentType: string,
  responseText: string
): boolean {
  return (
    contentType.includes("text/html") ||
    /<!DOCTYPE html|<html|Just a moment|Cloudflare/i.test(
      responseText.slice(0, 1000)
    )
  );
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Only POST requests are allowed",
    });
  }

  try {
    const { phone, amount, reference } = req.body ?? {};

    // Validate required fields
    if (
      phone === undefined ||
      amount === undefined ||
      reference === undefined ||
      phone === null ||
      amount === null ||
      reference === null ||
      String(phone).trim() === "" ||
      String(reference).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        code: "MISSING_REQUIRED_FIELDS",
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
        code: "INVALID_AMOUNT",
        message: "Amount must be a valid whole number greater than zero",
      });
    }

    // Validate reference
    if (
      typeof reference !== "string" ||
      reference.trim().length === 0 ||
      reference.length > 100
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_REFERENCE",
        message: "Reference must be a non-empty string of at most 100 characters",
      });
    }

    // Normalize and validate Kenyan phone number
    const msisdn = normalizePhone(String(phone));

    if (!msisdn) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PHONE_NUMBER",
        message: "Enter a valid Kenyan Safaricom phone number",
      });
    }

    // Check environment variables
    const apiKey = process.env.KIPAY_API_KEY;

    if (!apiKey || !KIPAY_URL) {
      console.error("KiPay configuration is incomplete");

      return res.status(500).json({
        success: false,
        code: "PAYMENT_CONFIGURATION_ERROR",
        message: "Payment service is not configured",
      });
    }

    // Validate endpoint configuration
    if (
      !KIPAY_STK_PATH.startsWith("/") ||
      KIPAY_STK_PATH.startsWith("//")
    ) {
      console.error("Invalid KIPAY_STK_PATH configuration");

      return res.status(500).json({
        success: false,
        code: "INVALID_PAYMENT_ENDPOINT",
        message: "Payment service endpoint is incorrectly configured",
      });
    }

    const endpoint = `${KIPAY_URL}${KIPAY_STK_PATH}`;

    console.log("Initiating KiPay STK Push:", {
      endpoint,
      phone: maskPhone(msisdn),
      amount: paymentAmount,
      reference,
    });

    // Send STK Push request to KiPay
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone: msisdn,
        amount: paymentAmount,
        reference,
        description: "Order payment",
      }),
      signal: AbortSignal.timeout(25000),
    });

    const responseText = await response.text();
    const contentType =
      response.headers.get("content-type")?.toLowerCase() || "";

    // Detect Cloudflare/browser challenge responses
    if (isHtmlResponse(contentType, responseText)) {
      console.error("KiPay returned an HTML challenge response:", {
        status: response.status,
        endpoint,
        contentType,
      });

      return res.status(502).json({
        success: false,
        code: "KIPAY_CLOUDFLARE_BLOCK",
        message:
          "KiPay returned a Cloudflare challenge instead of an API response. Check the API endpoint or contact KiPay support.",
        upstreamStatus: response.status,
      });
    }

    // Parse JSON response
    let result: any;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("KiPay returned an invalid response:", {
        status: response.status,
        contentType,
      });

      return res.status(502).json({
        success: false,
        code: "KIPAY_INVALID_RESPONSE",
        message: "KiPay returned an unreadable response",
        upstreamStatus: response.status,
      });
    }

    // Handle unsuccessful KiPay responses
    if (!response.ok) {
      console.error("KiPay STK request failed:", {
        status: response.status,
        response: result,
      });

      return res.status(502).json({
        success: false,
        code: "KIPAY_REQUEST_FAILED",
        message:
          result?.message ||
          "KiPay rejected the STK Push request",
        upstreamStatus: response.status,
        data: result,
      });
    }

    // Successful request: STK Push has been submitted,
    // not necessarily paid.
    return res.status(200).json({
      success: true,
      code: "STK_PUSH_SUBMITTED",
      message: "STK Push request submitted successfully",
      data: result,
    });

  } catch (error: unknown) {
    // Handle request timeout
    if (
      error instanceof Error &&
      error.name === "TimeoutError"
    ) {
      console.error("KiPay request timed out");

      return res.status(504).json({
        success: false,
        code: "KIPAY_TIMEOUT",
        message: "KiPay did not respond in time. Please check payment status before retrying.",
      });
    }

    console.error("KiPay STK Push error:", error);

    return res.status(500).json({
      success: false,
      code: "INTERNAL_PAYMENT_ERROR",
      message: "An unexpected error occurred while initiating payment",
    });
  }
}
