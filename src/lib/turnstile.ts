/**
 * Verifies a Cloudflare Turnstile CAPTCHA token.
 * Documentation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn("⚠️ TURNSTILE_SECRET_KEY is not set. Verification skipped (dangerous!).");
    // During development, if key is missing, we might want to return true to avoid blocking ourselves
    // But in production, this should definitely fail.
    return process.env.NODE_ENV === "development";
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secret,
          response: token,
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error("Turnstile verification failed:", data["error-codes"]);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error during Turnstile verification:", error);
    return false;
  }
}
