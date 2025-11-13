import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'empresas.json');

export type Empresa = {
  id: string;
  companyName: string;
  cnpj?: string;
  location?: string;
  respName?: string;
  respPhone?: string;
  preferredMeetingAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  credentials?: { email: string; password: string } | null;
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

export function readAllEmpresas(): Empresa[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, { encoding: 'utf8' });
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

export function writeAllEmpresas(list: Empresa[]) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

export function addEmpresa(e: Omit<Empresa, 'id' | 'status' | 'createdAt' | 'credentials'>) {
  const list = readAllEmpresas();
  const newItem: Empresa = {
    id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
    ...e,
    status: 'pending',
    createdAt: new Date().toISOString(),
    credentials: null,
  };
  list.push(newItem);
  writeAllEmpresas(list);
  return newItem;
}

export function updateEmpresa(id: string, patch: Partial<Empresa>) {
  const list = readAllEmpresas();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch };
  list[idx] = updated;
  writeAllEmpresas(list);
  return updated;
}

export function findEmpresaByEmail(email: string) {
  const list = readAllEmpresas();
  return list.find((e) => e.credentials?.email === email && e.status === 'approved') || null;
}