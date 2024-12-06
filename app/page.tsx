'use client'

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader } from '@/app/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog'
import { useToast } from '@/app/components/ui/use-toast'
import { Gift, CreditCard, BarChart3, Search, Plus, DollarSign, LogOut, HelpCircle, Download, GiftIcon, Trash2, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import Image from 'next/image'
import { TableRow } from '@/app/components/TableRow'
import { GiftCard } from '@/app/types'
import { SpeedInsights } from "@vercel/speed-insights/next"

const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear().toString().slice(-2)
  return `${day}/${month}/${year}`
}


export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isLoggedIn') === 'true'
    }
    return false
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [giftCards, setGiftCards] = useState<GiftCard[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('giftCards')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [newGiftCard, setNewGiftCard] = useState({
    value: '',
    purchaser: '',
    recipient: '',
    phoneNumber: '',
    responsible: '',
  })
  const [spendAmount, setSpendAmount] = useState<{ [key: number]: string }>({})
  const [spendDate, setSpendDate] = useState<{ [key: number]: string }>({})
  const [showUsed, setShowUsed] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString())
  }, [isLoggedIn])

  useEffect(() => {
    localStorage.setItem('giftCards', JSON.stringify(giftCards))
  }, [giftCards])

  useEffect(() => {
    if (isLoggedIn) {
      const loadGiftCards = async () => {
        try {
          const response = await fetch('/api/gift-cards', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          if (data.status === 'success') {
            setGiftCards(data.data);
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error('Error loading gift cards:', error);
          toast({
            title: "Error al cargar Gift Cards",
            description: "Por favor, verifica tu conexión e intenta nuevamente",
            variant: "destructive",
          });
        }
      };
      
      loadGiftCards();
      
      // Recargar datos cada 5 minutos
      const interval = setInterval(loadGiftCards, 300000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, toast]);

  const generateGiftCardCode = () => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `GC-${timestamp}-${random}`;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'orejanegra@webdos' && password === '1184') {
      setIsLoggedIn(true)
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema de gestión de Gift Cards",
      })
    } else {
      toast({
        title: "Error de inicio de sesión",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      })
    }
  }

  const handleCreateGiftCard = async () => {
    if (newGiftCard.value && newGiftCard.purchaser && newGiftCard.recipient && newGiftCard.phoneNumber && newGiftCard.responsible) {
      try {
        const response = await fetch('/api/gift-cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: generateGiftCardCode(),
            value: Number(newGiftCard.value),
            status: 'ACTIVE',
            purchaser: newGiftCard.purchaser,
            recipient: newGiftCard.recipient,
            phoneNumber: newGiftCard.phoneNumber,
            responsible: newGiftCard.responsible,
          })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
          setGiftCards(prevCards => [...prevCards, data.data]);
          setNewGiftCard({ value: '', purchaser: '', recipient: '', phoneNumber: '', responsible: '' });
          toast({
            title: "Gift Card creada",
            description: `Se ha creado la gift card ${data.data.code} para ${data.data.recipient}`,
          });
          const closeButton = document.querySelector('[data-dialog-close]');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast({
          title: "Error al crear Gift Card",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        });
      }
    }
  };

  const handleSpendAmount = async (id: number) => {
    const amount = Number(spendAmount[id]);
    if (!isNaN(amount) && amount > 0) {
      try {
        const currentDate = new Date().toISOString();
        const response = await fetch(`/api/gift-cards/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: "USED",
            amountSpent: amount,
            spentDate: currentDate
          })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
          setGiftCards(prevCards =>
            prevCards.map(card =>
              card.id === id 
                ? { 
                    ...card, 
                    status: "USED", 
                    amountSpent: amount, 
                    spentDate: currentDate 
                  } 
                : card
            )
          );
          
          setSpendAmount(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
          });
          
          toast({
            title: "Gift Card gastada",
            description: `Se ha registrado un gasto de $${amount}`,
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast({
          title: "Error al gastar Gift Card",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
    localStorage.removeItem('isLoggedIn')
  }

  const filteredGiftCards = useMemo(() => {
    return giftCards.filter(card => {
      const matchesSearch = card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.purchaser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.recipient.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = showUsed ? card.status === "USED" : card.status === "ACTIVE";
      
      return matchesSearch && matchesStatus;
    });
  }, [giftCards, searchTerm, showUsed]);

  const totalActive = giftCards.filter(card => card.status === 'ACTIVE').length
  const totalValue = giftCards.reduce((sum, card) => sum + card.value, 0)
  const totalSpent = giftCards.reduce((sum, card) => sum + (card.amountSpent || 0), 0)
  const redemptionRate = useMemo(() => {
    const totalValue = giftCards.reduce((sum, card) => sum + card.value, 0);
    const totalSpent = giftCards.reduce((sum, card) => sum + (card.amountSpent || 0), 0);
    return totalValue > 0 ? (totalSpent / totalValue) * 100 : 0;
  }, [giftCards]);

  const getMonthlyChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const generateMonthlySalesReport = () => {
    const monthlyData: { [key: string]: any } = {};
    
    giftCards.forEach(card => {
      const date = new Date(card.createdAt);
      const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          quantity: 0,
          totalValue: 0,
          totalSpent: 0,
          cards: [],
        };
      }
      
      monthlyData[monthKey].quantity += 1;
      monthlyData[monthKey].totalValue += card.value;
      monthlyData[monthKey].totalSpent += card.amountSpent || 0;
      monthlyData[monthKey].cards.push(card);
    });

    Object.values(monthlyData).forEach(month => {
      month.redemptionRate = month.totalValue > 0 
        ? (month.totalSpent / month.totalValue) * 100 
        : 0;
    });

    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/');
      const [bMonth, bYear] = b.month.split('/');
      return new Date(2000 + parseInt(bYear), parseInt(bMonth) - 1).getTime() - 
             new Date(2000 + parseInt(aYear), parseInt(aMonth) - 1).getTime();
    });
  };

  const handleBackup = () => {
    const dataToExport = giftCards.map(card => ({
      Código: card.code,
      Valor: card.value,
      Comprador: card.purchaser,
      Destinatario: card.recipient,
      Estado: card.status,
      'Fecha de Creación': card.createdAt,
      'Teléfono del Comprador': card.phoneNumber,
      Responsable: card.responsible,
      'Fecha de Gasto': card.spentDate || 'N/A'
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Gift Cards")
    XLSX.writeFile(wb, "gift_cards_backup.xlsx")
  }

  const handleDeleteGiftCard = async (id: number) => {
    try {
      const response = await fetch(`/api/gift-cards/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        setGiftCards(prevCards => prevCards.filter(card => card.id !== id));
        toast({
          title: "Gift Card eliminada",
          description: "La gift card ha sido eliminada exitosamente",
        });
        return;
      }
      throw new Error('Error al eliminar la gift card');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar la gift card",
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader className="flex flex-col items-center">
            <Image
              src="/new-webdos-gc.png"
              alt="WebDos Logo"
              width={270}
              height={38}
              priority
              className="mb-5"
            />
            <CardDescription>Ingrese sus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Usuario</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
              <Button className="w-full mt-4 bg-gray-800 text-white hover:bg-gray-700" type="submit">Ingresar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <head>
        <link rel="icon" href="/favicon-giftcard.png" />
      </head>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Gift Card Manager</h2>
        </div>
        <Tabs defaultValue="gift-cards" className="space-y-4">
          <TabsList className="border-b border-gray-200">
            <TabsTrigger value="gift-cards">Gift Cards</TabsTrigger>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
          </TabsList>
          <TabsContent value="gift-cards" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar gift cards..."
                  className="pl-8 border-gray-300 hover:border-gray-400 hover:text-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  variant={showUsed ? "default" : "outline"}
                  onClick={() => setShowUsed(!showUsed)}
                  className="border-gray-300 hover:border-gray-400 hover:text-gray-600"
                >
                  {showUsed ? "Ocultar Usadas" : "Mostrar Usadas"}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#171717] text-white hover:bg-[#2a2a2a]">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Gift Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Gift Card</DialogTitle>
                      <DialogDescription>
                        Complete los datos de la nueva gift card. Los campos marcados con * son obligatorios.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                          Valor <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="value"
                          type="number"
                          className="col-span-3"
                          value={newGiftCard.value}
                          onChange={(e) => setNewGiftCard({ ...newGiftCard, value: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="purchaser" className="text-right">
                          Comprador <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="purchaser"
                          className="col-span-3"
                          value={newGiftCard.purchaser}
                          onChange={(e) => setNewGiftCard({ ...newGiftCard, purchaser: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="recipient" className="text-right">
                          Destinatario <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="recipient"
                          className="col-span-3"
                          value={newGiftCard.recipient}
                          onChange={(e) => setNewGiftCard({ ...newGiftCard, recipient: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phoneNumber" className="text-right">
                          Teléfono <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phoneNumber"
                          className="col-span-3"
                          value={newGiftCard.phoneNumber}
                          onChange={(e) => setNewGiftCard({ ...newGiftCard, phoneNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="responsible" className="text-right">
                          Responsable <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="responsible"
                          className="col-span-3"
                          value={newGiftCard.responsible}
                          onChange={(e) => setNewGiftCard({ ...newGiftCard, responsible: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleCreateGiftCard}>Crear Gift Card</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="relative pb-16">
              <Card className="border-gray-300">
                <Table className="w-full">
                  <TableHeader>
                    <tr>
                      <TableHead className="w-[200px]">Código</TableHead>
                      <TableHead className="w-[100px] text-left">Valor</TableHead>
                      <TableHead className="w-[100px] text-left">Gastado</TableHead>
                      <TableHead className="w-[150px]">Comprador</TableHead>
                      <TableHead className="w-[150px]">Destinatario</TableHead>
                      <TableHead className="w-[100px]">Estado</TableHead>
                      <TableHead className="w-[150px]">Fecha de Creación</TableHead>
                      <TableHead className="w-[150px]">{showUsed ? "Fecha de Uso" : "Canjear"}</TableHead>
                      <TableHead className="w-[80px] pl-4">Acciones</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {filteredGiftCards.map((card) => (
                      <TableRow 
                        key={card.id} 
                        card={card}
                        spendAmount={spendAmount}
                        onSpendAmountChange={(id, value) => {
                          setSpendAmount(prev => ({
                            ...prev,
                            [id]: value
                          }));
                        }}
                        onSpendSubmit={(id) => {
                          const amount = Number(spendAmount[id]);
                          if (!isNaN(amount) && amount > 0) {
                            handleSpendAmount(id);
                          }
                        }}
                        onDelete={handleDeleteGiftCard}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Card>
              <div className="absolute bottom-0 right-0">
                <Button
                  onClick={handleBackup}
                  className="bg-[#171717] text-white hover:bg-[#2a2a2a]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Backup
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Gift Cards Activas
                  </CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalActive}</div>
                  <p className="text-xs text-muted-foreground">
                    {getMonthlyChange(totalActive, totalActive - 1)}% desde el último mes
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Valor Total
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue}</div>
                  <p className="text-xs text-muted-foreground">
                    {getMonthlyChange(totalValue, totalValue - giftCards[giftCards.length - 1]?.value || 0)}% desde el último mes
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Gastado
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalSpent}</div>
                  <p className="text-xs text-muted-foreground">
                    {getMonthlyChange(totalSpent, totalSpent - (giftCards[giftCards.length - 1]?.amountSpent || 0))}% desde el último mes
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tasa de Redención
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{redemptionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {getMonthlyChange(redemptionRate, redemptionRate - 2)}% desde el último mes
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle>Historial de Ventas Mensuales</CardTitle>
                <CardDescription>Resumen de ventas de gift cards por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>Mes</TableHead>
                      <TableHead>Cantidad Vendida</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Acciones</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {generateMonthlySalesReport().map((month, index) => (
                      <tr key={index}>
                        <TableCell>{month.month}</TableCell>
                        <TableCell>{month.quantity}</TableCell>
                        <TableCell>${month.totalValue}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-gray-300 hover:border-gray-400 hover:text-gray-600"
                                onClick={() => setSelectedMonth(month.month)}
                              >
                                Ver detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Detalles de Ventas - {month.month}</DialogTitle>
                                <DialogDescription>
                                  Información detallada de las ventas del mes
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 items-center gap-4">
                                  <span className="font-semibold">Gift Cards Vendidas:</span>
                                  <span>{month.quantity}</span>
                                </div>
                                <div className="grid grid-cols-2 items-center gap-4">
                                  <span className="font-semibold">Valor Total:</span>
                                  <span>${month.totalValue}</span>
                                </div>
                                <div className="grid grid-cols-2 items-center gap-4">
                                  <span className="font-semibold">Total Gastado:</span>
                                  <span>${month.totalSpent}</span>
                                </div>
                                <div className="grid grid-cols-2 items-center gap-4">
                                  <span className="font-semibold">Tasa de Redención:</span>
                                  <span>{month.redemptionRate.toFixed(2)}%</span>
                                </div>
                              </div>
                              <div className="mt-6">
                                <h4 className="font-semibold mb-2">Gift Cards del Mes:</h4>
                                <ul className="list-disc pl-5">
                                  {month.cards.map((card: GiftCard, idx: number) => {
                                    const statusLabels = {
                                      active: "Activa",
                                      redeemed: "Canjeada",
                                      expired: "Vencida"
                                    };
                                    return (
                                      <li key={idx}>
                                        {card.code} - ${card.value} ({statusLabels[card.status as keyof typeof statusLabels]})
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <footer className="border-t border-gray-200">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center">
            <Link 
              href="https://www.webdos.dev" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Image 
                src="/new-webdos-gc.png"
                alt="WebDos Logo"
                width={210}
                height={30}
                priority
              />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Desarrollado por <Link href="https://www.webdos.ar" target="_blank" rel="noopener noreferrer" className="hover:underline">WebDos Devs</Link>.
          </p>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-gray-300 hover:border-gray-400 hover:text-gray-600">
              <HelpCircle className="mr-2 h-4 w-4" />
              Ayuda
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-gray-300 hover:border-gray-400 hover:text-gray-600">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </footer>
      <SpeedInsights />
    </div>
  )
}