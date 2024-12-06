import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!giftCard) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Gift card not found' 
      }, { status: 404 });
    }

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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const giftCard = await prisma.giftCard.update({
      where: { id: parseInt(params.id) },
      data: body
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    await prisma.giftCard.delete({
      where: { id: parseInt(params.id) }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar gift card:', error);
    return new NextResponse(null, { status: 500 });
  }
} 