import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('id', parseInt(params.id))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          status: 'error', 
          message: 'Gift card not found' 
        }, { status: 404 });
      }
      throw error;
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
    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .update(body)
      .eq('id', parseInt(params.id))
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('gift_cards')
      .delete()
      .eq('id', parseInt(params.id));

    if (error) throw error;

    return NextResponse.json({ 
      status: 'success', 
      message: 'Gift card deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}