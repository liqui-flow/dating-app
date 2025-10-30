import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Email & New Password required" }, { status: 400 });

    // check verified otp
    const { data: otp, error: otpError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("verified", true)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (!otp || otpError)
      return NextResponse.json({ error: "OTP not verified" }, { status: 400 });

    // update password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(otp.user_id, {
      password
    });

    if (error) throw error;

    return NextResponse.json({ message: "Password reset successful" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
