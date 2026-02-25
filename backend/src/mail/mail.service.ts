import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: true, // Port 465 için true
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const from = this.configService.get('SMTP_FROM');

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log('E-posta gönderildi: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('E-posta gönderme hatası:', error);
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
}
