// pages/api/messages.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

type Message = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), 'messages.json');

async function readMessages(): Promise<Message[]> {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeMessages(messages: Message[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), 'utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const msgs = await readMessages();
    return res.status(200).json(msgs.sort((a,b)=> +new Date(b.createdAt) - +new Date(a.createdAt)));
  }

  if (req.method === 'POST') {
    const { name, message } = req.body || {};
    if (!name || !message) return res.status(400).json({ error: 'Missing fields' });

    const msgs = await readMessages();
    const newMsg: Message = { id: uuidv4(), name, message, createdAt: new Date().toISOString() };
    msgs.unshift(newMsg);
    await writeMessages(msgs);
    return res.status(201).json(newMsg);
  }

  return res.status(405).end();
}
