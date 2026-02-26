import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async sendMail(to: string, subject: string, html: string) {
    const from = this.configService.get('SMTP_FROM') || 'MAKUtalk <onboarding@resend.dev>';

    try {
      const { data, error } = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Resend error:', error);
        throw error;
      }

      console.log('E-posta başarıyla gönderildi:', data?.id);
      return data;
    } catch (error) {
      console.error('E-posta gönderim hatası:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const subject = "MAKUtalk'a Hoş Geldin!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #2563eb;">Merhaba ${fullName || 'MAKÜlü'}! 👋</h2>
        <p>MAKUtalk topluluğuna katıldığın için çok mutluyuz. Dijital kampüsün tadını çıkarmaya hemen başlayabilirsin!</p>
        <div style="margin: 32px 0;">
          <a href="${this.configService.get('FRONTEND_URL') || '#'}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Kampüse Gir</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px;">Bu e-posta MAKUtalk tarafından otomatik olarak gönderilmiştir.</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }

  async sendVerificationCode(email: string, code: string) {
    console.log(`\n=== 📧 DOĞRULAMA KODU (${email}) ===`);
    console.log(`KOD: ${code}`);
    console.log(`====================================\n`);
    const subject = 'MAKUtalk Doğrulama Kodun';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;">
        <h2 style="color: #2563eb;">MAKUtalk'a Hoş Geldin! 👋</h2>
        <p>Kayıt işlemini tamamlamak için aşağıdaki doğrulama kodunu kullan:</p>
        <div style="margin: 32px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a; background-color: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #3b82f6;">${code}</span>
        </div>
        <p style="color: #64748b;">Bu kod 15 dakika boyunca geçerlidir.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px;">Eğer bu kaydı sen yapmadıysan bu e-postayı dikkate alma.</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }

  async sendPasswordResetCode(email: string, code: string) {
    console.log(`\n=== 🔐 ŞİFRE SIFIRLAMA KODU (${email}) ===`);
    console.log(`KOD: ${code}`);
    console.log(`==========================================\n`);
    const subject = 'MAKUtalk Şifre Sıfırlama Kodu';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;">
        <h2 style="color: #2563eb;">Şifre Sıfırlama İsteği 🔐</h2>
        <p>Hesabının şifresini sıfırlamak için aşağıdaki kodu kullan:</p>
        <div style="margin: 32px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a; background-color: #fef2f2; padding: 12px 24px; border-radius: 8px; border: 1px dashed #ef4444;">${code}</span>
        </div>
        <p style="color: #64748b;">Eğer şifre sıfırlama isteğinde bulunmadıysan, lütfen hesabının güvenliğini kontrol et.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px;">Bu e-posta MAKUtalk tarafından güvenlik gereği gönderilmiştir.</p>
      </div>
    `;
    return this.sendMail(email, subject, html);
  }

  async sendReportEmail(reporter: string, reported: string, reason: string, subReason: string) {
    const subject = `⚠️ Yeni Şikayet Bildirimi: @${reported}`;
    const date = new Date().toLocaleString('tr-TR');
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ef4444; border-radius: 16px; padding: 24px; background-color: #fef2f2;">
        <h2 style="color: #b91c1c; margin-top: 0;">⚠️ Şikayet Bildirimi</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #fee2e2; color: #991b1b; font-weight: bold;">Tarih:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #fee2e2;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #fee2e2; color: #991b1b; font-weight: bold;">Şikayet Eden:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #fee2e2;">@${reporter}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #fee2e2; color: #991b1b; font-weight: bold;">Şikayet Edilen:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #fee2e2;">@${reported}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #fee2e2; color: #991b1b; font-weight: bold;">Ana Kategori:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #fee2e2;">${reason}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #991b1b; font-weight: bold;">Detaylı Sebep:</td>
            <td style="padding: 10px 0;">${subReason}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding: 12px; background-color: white; border-radius: 8px; border: 1px solid #fecaca; font-size: 13px; color: #7f1d1d;">
          <strong>Not:</strong> Bu kullanıcı bildirimi üzerine gerekli incelemelerin başlatılması önerilir.
        </div>
      </div>
    `;
    // Şikayeti doğrulanmış olan admin adresine gönderiyoruz
    return this.sendMail('2312101063@ogr.mehmetakif.edu.tr', subject, html);
  }
}
