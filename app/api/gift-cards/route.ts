import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: giftCards, error } = await supabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
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
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .insert([{
        ...body,
        code: body.code || `GC-${Date.now()}`,
        status: body.status || "ACTIVE",
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

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