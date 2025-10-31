import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { randomInt } from "crypto";

export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw new Error(usersError.message);

    const users = data?.users ?? [];
    const user = users.find((u: any) => u.email === email);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get user's name from user metadata or email
    const userName = user.user_metadata?.name || user.user_metadata?.full_name || email.split('@')[0];

    const otp = randomInt(1000, 9999).toString();

    const { error: otpError } = await supabaseAdmin
      .from("otp_codes")
      .insert({
        email,
        otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });

    if (otpError) throw new Error(otpError.message);

    // ✅ SEND OTP USING MSG91
    await fetch("https://control.msg91.com/api/v5/email/send", {
      method: "POST",
      headers: {
        "authkey": process.env.MSG91_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        recipients: [{ 
          to: [{ email }],
          variables: { 
            name: userName,
            otp: otp,
            OTP: otp
          }
        }],
        from: { email: "dev@no-reply.lovesathi.com", name: "LoveSathi" },
        domain: "no-reply.lovesathi.com",
        template_id: process.env.MSG91_EMAIL_TEMPLATE_ID
      }),
    });

    console.log("RESET OTP:", otp, "for user:", userName);

    return NextResponse.json({ message: "OTP sent" });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
