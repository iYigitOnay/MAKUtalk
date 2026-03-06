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
    const from =
      this.configService.get('SMTP_FROM') || 'MAKUtalk <onboarding@resend.dev>';

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

  // --- LOGO GENERATOR ---
  private getLogoHtml() {
    return `
      <div style="font-size: 24px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: -1px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        MAKU<span style="font-size: 20px; font-weight: 700; text-transform: lowercase; color: #9333ea; background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">talk</span>
      </div>
    `;
  }

  // --- KAYIT TEMASI (Mavi-Mor) ---
  private getAuthWrapper(content: string) {
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050505; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #111111; border-radius: 24px; border: 1px solid #222222; overflow: hidden;">
                <tr>
                  <td style="padding: 45px 40px 25px;">
                    ${this.getLogoHtml()}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 40px; color: #ffffff;">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #0a0a0a; border-top: 1px solid #222222; color: #444444; font-size: 10px; text-align: left; line-height: 1.5; text-transform: uppercase; letter-spacing: 1px;">
                    BU E-POSTA MAKUTALK EKOSİSTEMİ TARAFINDAN GÖNDERİLMİŞTİR.<br>
                    © ${new Date().getFullYear()} MEHMET AKİF ERSOY ÜNİVERSİTESİ
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // --- ŞİFRE TEMASI (Kırmızı) ---
  private getSecurityWrapper(content: string) {
    return `
      <!DOCTYPE html>
      <html lang="tr">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #050505; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #0f0f0f; border-radius: 24px; border: 1px solid #1a1a1a; overflow: hidden;">
                <tr>
                  <td style="padding: 45px 40px 25px;">
                    ${this.getLogoHtml()}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 40px; color: #ffffff;">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #050505; border-top: 1px solid #1a1a1a; color: #333333; font-size: 10px; text-align: left; line-height: 1.5; text-transform: uppercase; letter-spacing: 1px;">
                    GÜVENLİK BİRİMİ BİLGİLENDİRMESİDİR.<br>
                    MAKUTALK SECURITY OPS
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const subject = "MAKUtalk'a Hoş Geldiniz";
    const content = `
      <h1 style="font-size: 32px; font-weight: 800; margin: 0 0 20px; color: #ffffff; letter-spacing: -1px;">Hoş Geldin!</h1>
      <p style="font-size: 16px; color: #888888; line-height: 1.6; margin: 0 0 30px;">MAKÜ'nün dijital kampüs topluluğuna başarılı bir şekilde katıldınız. Yeni nesil üniversite deneyimi şimdi başlıyor.</p>
      <a href="${this.configService.get('FRONTEND_URL') || '#'}" style="display: inline-block; padding: 18px 36px; background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%); color: #ffffff !important; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 1px;">HUB'I KEŞFET</a>
    `;
    return this.sendMail(email, subject, this.getAuthWrapper(content));
  }

  async sendVerificationCode(email: string, code: string) {
    const subject = `MAKUtalk Doğrulama Kodu`;
    const blueGradient =
      'background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);';
    const content = `
      <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 20px; color: #ffffff; letter-spacing: -0.5px;">Hesabınızı Aktifleştirin</h1>
      <p style="font-size: 16px; color: #888888; line-height: 1.6; margin: 0 0 35px;">Kayıt işlemini tamamlamak için aşağıdaki 6 haneli doğrulama kodunu kullanın:</p>
      <div style="${blueGradient} padding: 2px; border-radius: 18px; display: inline-block;">
        <div style="background-color: #111111; padding: 25px 45px; border-radius: 16px;">
          <span style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #ffffff;">${code}</span>
        </div>
      </div>
      <p style="font-size: 12px; color: #444444; margin-top: 35px;">Bu kod 15 dakika geçerlidir. Eğer kayıt işlemini siz başlatmadıysanız bu maili silebilirsiniz.</p>
    `;
    return this.sendMail(email, subject, this.getAuthWrapper(content));
  }

  async sendPasswordResetCode(email: string, code: string) {
    const subject = `MAKUtalk Şifre Sıfırlama Kodu`;
    const redGradient =
      'background: linear-gradient(135deg, #e11d48 0%, #881337 100%);';
    const content = `
      <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 20px; color: #ffffff; letter-spacing: -0.5px;">Şifrenizi Yenileyin</h1>
      <p style="font-size: 16px; color: #888888; line-height: 1.6; margin: 0 0 35px;">Hesabınız için bir şifre sıfırlama talebinde bulunuldu. İşlemi tamamlamak için aşağıdaki geçici anahtarı kullanın.</p>
      <div style="${redGradient} padding: 2px; border-radius: 18px; display: inline-block;">
        <div style="background-color: #0f0f0f; padding: 25px 45px; border-radius: 16px;">
          <span style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #ffffff;">${code}</span>
        </div>
      </div>
      <p style="font-size: 13px; color: #ef4444; margin-top: 35px; font-weight: 600;">Güvenlik Uyarısı: Şifre sıfırlama isteği size ait değilse lütfen hemen hesabınızı güvenceye alın.</p>
    `;
    return this.sendMail(email, subject, this.getSecurityWrapper(content));
  }

  async sendReportEmail(
    reporter: string,
    reported: string,
    reason: string,
    subReason: string,
  ) {
    const subject = `⚠️ İnceleme Bildirimi: @${reported}`;
    const date = new Date().toLocaleString('tr-TR');
    const html = `
      <div style="background-color: #050505; padding: 40px; font-family: sans-serif; color: #ffffff;">
        <div style="max-width: 500px; margin: 0 auto; background: #111111; padding: 30px; border-radius: 20px; border: 1px solid #ef4444;">
          <h2 style="color: #ef4444; margin-top: 0;">Şikayet Bildirimi</h2>
          <p style="font-size: 14px; color: #999999;"><strong>Tarih:</strong> ${date}</p>
          <p style="font-size: 14px; color: #999999;"><strong>Bildiren:</strong> @${reporter}</p>
          <p style="font-size: 14px; color: #999999;"><strong>Bildirilen:</strong> @${reported}</p>
          <hr style="border: 0; border-top: 1px solid #222222; margin: 20px 0;">
          <p style="font-size: 14px; color: #ffffff;"><strong>Kategori:</strong> ${reason}</p>
          <p style="font-size: 14px; color: #ffffff;"><strong>Detay:</strong> ${subReason}</p>
        </div>
      </div>
    `;
    return this.sendMail('2312101063@ogr.mehmetakif.edu.tr', subject, html);
  }
}
