// src/app/api/empresas/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Credentials = { email: string; password: string } | null;

interface Empresa {
  id: string;
  companyName?: string;
  cnpj?: string;
  location?: string;
  respName?: string;
  respPhone?: string;
  preferredMeetingAt?: string;
  status?: string;
  createdAt?: string;
  credentials?: Credentials;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'empresas.json');

function readAllEmpresas(): Empresa[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]') as Empresa[];
  } catch (e) {
    console.error('erro parse empresas.json', e);
    return [];
  }
}
function writeAllEmpresas(list: Empresa[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, cnpj, location, respName, respPhone, preferredMeetingAt } = body;
    if (!companyName || !respName) {
      return NextResponse.json({ error: 'companyName e respName são obrigatórios' }, { status: 400 });
    }
    const list = readAllEmpresas();
    const newItem: Empresa = {
      id: String(Date.now()) + Math.random().toString(36).slice(2,8),
      companyName, cnpj, location, respName, respPhone, preferredMeetingAt,
      status: 'pending',
      createdAt: new Date().toISOString(),
      credentials: null
    };
    list.push(newItem);
    writeAllEmpresas(list);
    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const list = readAllEmpresas();
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao listar' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body as { id?: string; action?: 'approve'|'reject' };
    if (!id || !action) return NextResponse.json({ error: 'id e action são obrigatórios' }, { status: 400 });

    const list = readAllEmpresas();
    const idx = list.findIndex((x: Empresa) => x.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });

    if (action === 'reject') {
      list[idx].status = 'rejected';
      writeAllEmpresas(list);
      return NextResponse.json({ ok: true, updated: list[idx] });
    }

    // approve -> gerar e gravar credenciais
    if (action === 'approve') {
      const email = `${Date.now().toString(36).slice(-6)}@ecofood.local`;
      const password = Math.random().toString(36).slice(2,10);
      list[idx].status = 'approved';
      list[idx].credentials = { email: email.trim(), password: password.trim() };
      writeAllEmpresas(list);
      return NextResponse.json({ ok: true, updated: list[idx], credentials: { email, password } });
    }

    return NextResponse.json({ error: 'action inválida' }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}
