import { NextResponse } from 'next/server';
import { findEmpresaByEmail } from '@/lib/empresasStore';
 export async function POST(request: Request) {
   try {
     const body = await request.json();
     const { email, password } = body;
     if (!email || !password) return NextResponse.json({ error: 'email e password obrigatórios' }, { status: 400 });
     const found = findEmpresaByEmail(email);
     if (!found) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
     if (found.credentials?.password !== password) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
     return NextResponse.json({ ok: true, empresa: { id: found.id, companyName: found.companyName } });
   } catch (err) {
     return NextResponse.json({ error: 'Erro no login' }, { status: 500 });
   }
 }
