import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { randomInt } from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    // ✅ Get users list
    const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw new Error(usersError.message);

    const users = data?.users ?? [];
    const user = users.find((u: any) => u.email === email);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // ✅ Generate OTP
    const otp = randomInt(1000, 9999).toString();

    // ✅ Store OTP
    const { error: otpError } = await supabaseAdmin
      .from("otp_codes")
      .insert({
        email,
        otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });

    if (otpError) throw new Error(otpError.message);

    console.log("RESET OTP:", otp); // remove in production

    return NextResponse.json({ message: "OTP sent" });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
