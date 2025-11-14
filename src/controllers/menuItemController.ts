// menuItemController.ts (App Router - NextRequest / NextResponse)
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
// garante que a pasta exista
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export async function GET() {
  try {
    await dbConnect();
    const menuItems = await MenuItem.find({});
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('GET /api/menu-items error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const contentType = request.headers.get('content-type') || '';
    let name: string | undefined;
    let price: number | undefined;
    let validade: Date | undefined;
    let imageUrl: string | undefined = undefined;

    // Caso multipart/form-data -> usar request.formData()
    if (contentType.includes('multipart/form-data')) {
      // request.formData() é suportado no Route Handler (Node runtime).
      const form = await request.formData();

      const nameField = form.get('name') ?? form.get('nome');
      const priceField = form.get('price') ?? form.get('preco') ?? form.get('price');
      const validadeField = form.get('validade');

      name = typeof nameField === 'string' ? nameField : undefined;
      const priceStr = typeof priceField === 'string' ? priceField : (priceField ? String(priceField) : undefined);
      price = priceStr ? parseFloat(priceStr) : undefined;
      validade = validadeField ? new Date(String(validadeField)) : undefined;

      // arquivo (File do Web API)
      const file = form.get('image') as File | null;
      if (file && file.size && typeof file.name === 'string') {
        // ler ArrayBuffer e salvar como arquivo
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // gerar nome único
        const ext = path.extname(file.name) || '.jpg';
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const savePath = path.join(UPLOAD_DIR, fileName);
        fs.writeFileSync(savePath, buffer);
        imageUrl = `/uploads/${fileName}`;
      }
    } else {
      // Caso JSON normal
      const body = await request.json().catch(() => ({}));
      name = body.name || body.nome;
      price = body.price !== undefined ? parseFloat(body.price) : undefined;
      validade = body.validade ? new Date(body.validade) : undefined;

      // se enviou image como URL (por ex. no caso do front enviar JSON com image)
      if (body.image && typeof body.image === 'string') {
        imageUrl = body.image;
      }
    }

    // Validações
    if (!name || !price || !validade || Number.isNaN(price)) {
      return NextResponse.json(
        { error: 'Campos inválidos. name, price (num) e validade são obrigatórios.' },
        { status: 400 }
      );
    }

    // criar o documento (ajuste campos conforme seu schema)
    const menuItem = new MenuItem({
      name,
      price,
      validade,
      image: imageUrl ?? null,
    });

    await menuItem.save();

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/menu-items error:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
