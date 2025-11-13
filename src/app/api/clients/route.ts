// src/app/api/clients/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body as any;

    // simples validação
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Senha muito curta' }, { status: 400 });
    }

    // gravação simples em data/clients.json (demo)
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'clients.json');
    await fs.mkdir(dataDir, { recursive: true });

    let clients: any[] = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      clients = JSON.parse(raw || '[]');
    } catch (e) {
      clients = [];
    }

    if (clients.find(c => c.email === email.toLowerCase())) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    const newClient = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password, // <--- apenas demo, não salve senha sem hash em produção
      createdAt: new Date().toISOString(),
    };

    clients.unshift(newClient);
    await fs.writeFile(filePath, JSON.stringify(clients, null, 2), 'utf8');

    return NextResponse.json({ ok: true, id: newClient.id });
  } catch (err) {
    console.error('API /api/clients error:', err);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
