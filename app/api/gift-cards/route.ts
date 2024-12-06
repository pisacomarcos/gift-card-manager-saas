import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$connect();
    const giftCards = await prisma.giftCard.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ 
      status: 'success', 
      data: giftCards 
    });
  } catch (error) {
    console.error('Error en GET /api/gift-cards:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Error de conexión con la base de datos' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const giftCard = await prisma.giftCard.create({
      data: {
        ...body,
        code: body.code || `GC-${Date.now()}`,
        status: body.status || "ACTIVE",
        createdAt: new Date()
      }
    });
    return NextResponse.json({ 
      status: 'success', 
      data: giftCard 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
} 