import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { invitedEmail, inviterName, token, userExists, permissions } = body

    if (!invitedEmail || !inviterName || !token) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Get app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const acceptUrl = userExists
      ? `${appUrl}/dashboard/sharing?accept=${token}`
      : `${appUrl}/auth/signup?invitation=${token}`

    // Count permissions
    const resourcesWithAccess = Object.entries(permissions).filter(([_, perms]: [string, any]) => perms.view).length

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 16px;
      color: #555;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .permissions-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .permissions-box h3 {
      margin: 0 0 12px;
      font-size: 16px;
      color: #333;
    }
    .permissions-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .permissions-list li {
      padding: 4px 0;
      color: #666;
      font-size: 14px;
    }
    .footer {
      background: #f8f9fa;
      padding: 24px 30px;
      text-align: center;
      color: #888;
      font-size: 13px;
      border-top: 1px solid #e9ecef;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Invitación a FindexApp</h1>
    </div>
    <div class="content">
      <p>Hola,</p>
      <p><strong>${inviterName}</strong> te ha invitado a colaborar en sus finanzas personales en <strong>FindexApp</strong>.</p>
      
      <div class="permissions-box">
        <h3>🔐 Permisos otorgados:</h3>
        <p style="margin: 0 0 8px; color: #666; font-size: 14px;">
          Tendrás acceso a <strong>${resourcesWithAccess}</strong> sección(es) de su cuenta financiera.
        </p>
      </div>

      ${userExists
        ? `
      <p>Ya tienes una cuenta en FindexApp, simplemente acepta la invitación haciendo clic en el botón de abajo:</p>
      `
        : `
      <p>Para aceptar esta invitación, primero debes crear una cuenta en FindexApp:</p>
      `
      }
      
      <div style="text-align: center;">
        <a href="${acceptUrl}" class="button">
          ${userExists ? "Aceptar Invitación" : "Crear Cuenta y Aceptar"}
        </a>
      </div>

      <p style="color: #888; font-size: 13px; margin-top: 32px;">
        Este enlace es único y personal. No lo compartas con nadie.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} FindexApp - Gestión de Finanzas Personales</p>
      <p>
        Si no esperabas este correo, puedes ignorarlo de forma segura.
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Send email
    const { data, error } = await resend.emails.send({
      from: "FindexApp <onboarding@agendemosapp.com>", // Change this to your verified domain
      to: [invitedEmail],
      subject: `${inviterName} te ha invitado a colaborar en FindexApp`,
      html: emailHtml,
    })

    if (error) {
      console.error("[v0] Error sending email:", error)
      return NextResponse.json({ error: "Error al enviar el correo" }, { status: 500 })
    }

    console.log("[v0] Email sent successfully:", data)
    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error("[v0] Error in send-invitation-email:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
