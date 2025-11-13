// pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

type Data = { ok: boolean; message?: string; fallbackMailto?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ ok: false, message: 'Missing fields' });

  // Destino do contato (configurável via env)
  const to = process.env.CONTACT_TO || 'ecofood005@gmail.com';

  // Se variáveis SMTP configuradas, tenta enviar via nodemailer
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true p/ 465
        auth: { user, pass },
      });

      const mail = {
        from: `${name} <${email}>`,
        to,
        subject: `Contato pelo site - ${name}`,
        text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
        html: `<p><strong>Nome:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Mensagem:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`,
      };

      await transporter.sendMail(mail);
      return res.status(200).json({ ok: true, message: 'Email enviado' });
    } catch (err: any) {
      console.error('Erro nodemailer:', err?.message || err);
      // fallback para mailto
      const fallback = `mailto:${to}?subject=${encodeURIComponent('Contato pelo site - ' + name)}&body=${encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`)}`;
      return res.status(500).json({ ok: false, message: 'Erro ao enviar email pelo servidor', fallbackMailto: fallback });
    }
  } else {
    // Se não configurado, retorna fallback mailto para o cliente abrir
    const fallback = `mailto:${to}?subject=${encodeURIComponent('Contato pelo site - ' + name)}&body=${encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`)}`;
    return res.status(200).json({ ok: true, message: 'Fallback mailto', fallbackMailto: fallback });
  }
}
