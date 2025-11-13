import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({ status: 'Recebido' })
      .populate('items.menuItem')
      .sort({ createdAt: 1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch kitchen orders' }, { status: 500 });
  }
}
