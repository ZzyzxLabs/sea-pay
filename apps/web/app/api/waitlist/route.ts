import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

// Helper function to load env from root .env file
function loadRootEnv() {
  // Try multiple possible paths to root .env
  const possiblePaths = [
    // From monorepo root (if cwd is root)
    path.resolve(process.cwd(), ".env"),
    // From apps/web (if cwd is apps/web)
    path.resolve(process.cwd(), "..", "..", ".env"),
    // From .next directory (production build)
    path.resolve(process.cwd(), "..", "..", "..", "..", ".env"),
  ];

  for (const rootEnvPath of possiblePaths) {
    try {
      // Try to read and parse root .env file
      const envContent = readFileSync(rootEnvPath, "utf-8");
      const envVars: Record<string, string> = {};

      envContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...valueParts] = trimmed.split("=");
          if (key && valueParts.length > 0) {
            const value = valueParts
              .join("=")
              .trim()
              .replace(/^["']|["']$/g, "");
            envVars[key.trim()] = value;
          }
        }
      });

      // Merge into process.env (only if not already set)
      Object.entries(envVars).forEach(([key, value]) => {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      });

      // Successfully loaded from this path
      return;
    } catch {
      // Try next path
      continue;
    }
  }
  // Root .env not found - that's okay, Next.js will use its own env loading
}

// Load root .env on module initialization
loadRootEnv();

interface WaitlistRequest {
  email: string;
  source?: string;
  role?: string;
  referral?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: WaitlistRequest = await request.json();
    const { email, source, role, referral, ...utmParams } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get Loops API key from environment
    const loopsApiKey = process.env.LOOPS_API_KEY;

    if (!loopsApiKey) {
      console.error("LOOPS_API_KEY not configured");
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    // Prepare request body matching Loops API format
    const requestBody: Record<string, unknown> = {
      email: email.toLowerCase().trim(),
      tags: ["waitlist"],
      source: source || "website",
    };

    // Add metadata if we have any custom fields
    const metadata: Record<string, string> = {};
    if (role) metadata.role = role;
    if (referral) metadata.referral = referral;

    // Add UTM parameters if present
    if (utmParams.utm_source) metadata.utm_source = utmParams.utm_source;
    if (utmParams.utm_medium) metadata.utm_medium = utmParams.utm_medium;
    if (utmParams.utm_campaign) metadata.utm_campaign = utmParams.utm_campaign;
    if (utmParams.utm_term) metadata.utm_term = utmParams.utm_term;
    if (utmParams.utm_content) metadata.utm_content = utmParams.utm_content;

    // Only add metadata if we have any
    if (Object.keys(metadata).length > 0) {
      requestBody.metadata = metadata;
    }

    // Call Loops API to create/update contact
    // Loops API endpoint: https://app.loops.so/api/v1/contacts/create
    const loopsResponse = await fetch(
      "https://app.loops.so/api/v1/contacts/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loopsApiKey}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    let loopsData;
    try {
      loopsData = await loopsResponse.json();
    } catch (parseError) {
      // If response is not JSON, get text instead
      const text = await loopsResponse.text();
      console.error("Loops API non-JSON response:", text);
      return NextResponse.json(
        { error: "Failed to add to waitlist. Please try again." },
        { status: 500 }
      );
    }

    if (!loopsResponse.ok) {
      console.error("Loops API error:", {
        status: loopsResponse.status,
        statusText: loopsResponse.statusText,
        data: loopsData,
      });

      // Handle specific error cases
      if (loopsResponse.status === 400) {
        return NextResponse.json(
          { error: loopsData.message || "Invalid request" },
          { status: 400 }
        );
      }

      if (loopsResponse.status === 401 || loopsResponse.status === 403) {
        console.error("Loops API authentication error - check LOOPS_API_KEY");
        return NextResponse.json(
          { error: "Service temporarily unavailable. Please try again later." },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: "Failed to add to waitlist. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully added to waitlist!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing waitlist signup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
