import { TableCell } from '@/app/components/ui/table';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Trash2, MessageCircle } from 'lucide-react';
import { GiftCard } from '@/app/types';

interface TableRowProps {
  card: GiftCard;
  spendAmount: { [key: number]: string };
  onSpendAmountChange: (id: number, value: string) => void;
  onSpendSubmit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Activa';
    case 'USED':
      return 'Usada';
    default:
      return status;
  }
};

export const TableRow = ({ card, spendAmount, onSpendAmountChange, onSpendSubmit, onDelete }: TableRowProps) => {
  // Función para formatear el número de teléfono
  const formatWhatsAppNumber = (phoneNumber: string) => {
    // Elimina todos los caracteres no numéricos
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Si el número empieza con 54, lo dejamos así
    // Si no, le agregamos 54 al principio (código de Argentina)
    const formattedNumber = cleanNumber.startsWith('54') 
      ? cleanNumber 
      : `54${cleanNumber}`;
    
    return formattedNumber;
  };

  const whatsappLink = `https://wa.me/${formatWhatsAppNumber(card.phoneNumber)}`;

  return (
    <tr>
      <TableCell>{card.code}</TableCell>
      <TableCell>${card.value}</TableCell>
      <TableCell className="text-left">
        {card.status === 'USED' ? `$${card.amountSpent || 0}` : '-'}
      </TableCell>
      <TableCell>{card.purchaser}</TableCell>
      <TableCell>{card.recipient}</TableCell>
      <TableCell>{getStatusLabel(card.status)}</TableCell>
      <TableCell>{new Date(card.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        {card.status === 'ACTIVE' ? (
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={spendAmount[card.id] || ''}
              onChange={(e) => onSpendAmountChange(card.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSpendSubmit(card.id);
                }
              }}
              className="w-32"
              placeholder="Monto"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSpendSubmit(card.id)}
            >
              Gastar
            </Button>
          </div>
        ) : (
          <span>{card.spentDate ? new Date(card.spentDate).toLocaleDateString() : 'N/A'}</span>
        )}
      </TableCell>
      <TableCell className="pl-4 w-[80px]">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(whatsappLink, '_blank')}
            className="text-green-600 hover:text-green-700"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (window.confirm('¿Estás seguro de que deseas eliminar esta gift card?')) {
                onDelete(card.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </tr>
  );
}; 