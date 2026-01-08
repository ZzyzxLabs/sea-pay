import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { addressesToAdd, addressesToRemove } = body;

    const alchemyToken = process.env.ALCHEMY_TOKEN;
    const webhookId = process.env.WEBHOOK_ID;

    if (!alchemyToken) {
      return NextResponse.json(
        { error: "ALCHEMY_TOKEN not configured in .env.local" },
        { status: 500 }
      );
    }

    if (!webhookId) {
      return NextResponse.json(
        { error: "WEBHOOK_ID not configured in .env.local" },
        { status: 500 }
      );
    }
    
    const url = "https://dashboard.alchemy.com/api/update-webhook-addresses";
    const options = {
      method: "PATCH",
      headers: {
        "X-Alchemy-Token": alchemyToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook_id: webhookId,
        addresses_to_add: addressesToAdd || [],
        addresses_to_remove: addressesToRemove || [],
      }),
    };
    
    console.log("Sending PATCH request to Alchemy:", {
      webhook_id: webhookId,
      addresses_to_add: addressesToAdd,
      addresses_to_remove: addressesToRemove,
    });

    const response = await fetch(url, options);
    const data = await response.json();

    console.log("Alchemy API Response:", {
      status: response.status,
      ok: response.ok,
      data: data,
    });

    if (!response.ok) {
      console.error("Alchemy API Error:", data);
      return NextResponse.json(
        { error: "Failed to update webhook addresses", details: data },
        { status: response.status }
      );
    }

    console.log("Successfully updated webhook. Current webhook state:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating webhook addresses:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
