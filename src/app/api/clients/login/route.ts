import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'clients.json');
    let clients: any[] = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      clients = JSON.parse(raw || '[]');
    } catch (e) {
      clients = [];
    }

    const user = clients.find(c => c.email === String(email).toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const role = user.role || 'cliente';
    return NextResponse.json({ ok: true, id: user.id, role });
  } catch (err) {
    console.error('/api/clients/login error:', err);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
