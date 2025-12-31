import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getClaimTicketDetails } from './actions'
import {
  ClaimHeader,
  ClaimInfo,
  ClaimVehicle,
  ClaimCustomer,
  ClaimThirdParty,
  ClaimCommunications,
  ClaimTimeline,
  ClaimAttachments,
} from './components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  Image, 
  ShoppingCart,
  Car,
  User,
  Users
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ ticketId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticketId } = await params
  const ticket = await getClaimTicketDetails(ticketId)
  
  if (!ticket) {
    return { title: 'Sinistro não encontrado' }
  }
  
  return {
    title: `#${ticket.ticket_number} - ${ticket.title} | Sinistros`,
    description: ticket.description?.slice(0, 160)
  }
}

// Função para verificar se usuário pode gerenciar o sinistro
async function canManageClaim(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  // Buscar perfil e roles do usuário
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select(`
      role:roles!role_id(name)
    `)
    .eq('user_id', user.id)
  
  if (!userRoles) return false
  
  // Roles que podem gerenciar sinistros
  const manageRoles = [
    'Desenvolvedor',
    'Administrador',
    'Diretor',
    'Gerente',
    'Supervisor',
    'Analista',
    'Encarregado'
  ]
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return userRoles.some(ur => manageRoles.includes((ur.role as any)?.name))
}

export default async function SinistroDetailsPage({ params }: PageProps) {
  const { ticketId } = await params
  
  // Buscar dados em paralelo
  const [ticket, canManage] = await Promise.all([
    getClaimTicketDetails(ticketId),
    canManageClaim()
  ])
  
  if (!ticket) {
    notFound()
  }
  
  const claimDetails = ticket.claim_details?.[0] || null
  
  // Verificar se tem dados de terceiro
  const hasThirdParty = claimDetails?.has_third_party === true
  
  // Verificar se tem dados de veículo
  const hasVehicle = claimDetails && (
    claimDetails.vehicle_plate || 
    claimDetails.vehicle_make || 
    claimDetails.vehicle_model
  )
  
  // Verificar se tem dados de cliente
  const hasCustomer = claimDetails && (
    claimDetails.customer_name || 
    claimDetails.customer_phone || 
    claimDetails.customer_email
  )
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <ClaimHeader ticket={ticket} />
      
      {/* Conteúdo Principal com Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="details" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Detalhes</span>
          </TabsTrigger>
          <TabsTrigger value="communications" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Comunicações</span>
            {ticket.communications.length > 0 && (
              <span className="ml-1 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {ticket.communications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="attachments" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Anexos</span>
            {ticket.attachments.length > 0 && (
              <span className="ml-1 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {ticket.attachments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="purchases" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Compras</span>
            {ticket.purchases.length > 0 && (
              <span className="ml-1 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {ticket.purchases.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Tab: Detalhes */}
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações da Ocorrência */}
              <ClaimInfo ticket={ticket} />
              
              {/* Dados do Veículo */}
              {hasVehicle && (
                <ClaimVehicle claimDetails={claimDetails} />
              )}
              
              {/* Dados do Cliente */}
              {hasCustomer && (
                <ClaimCustomer claimDetails={claimDetails} />
              )}
              
              {/* Dados do Terceiro */}
              {hasThirdParty && (
                <ClaimThirdParty claimDetails={claimDetails} />
              )}
            </div>
            
            {/* Sidebar com resumo */}
            <div className="space-y-6">
              {/* Resumo rápido de dados */}
              <div className="space-y-4">
                {/* Veículo resumo */}
                {claimDetails?.vehicle_plate && (
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      Veículo
                    </div>
                    <p className="text-lg font-bold tracking-wider">{claimDetails.vehicle_plate}</p>
                    {(claimDetails.vehicle_make || claimDetails.vehicle_model) && (
                      <p className="text-sm text-muted-foreground">
                        {[claimDetails.vehicle_make, claimDetails.vehicle_model].filter(Boolean).join(' ')}
                        {claimDetails.vehicle_year && ` (${claimDetails.vehicle_year})`}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Cliente resumo */}
                {claimDetails?.customer_name && (
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Cliente
                    </div>
                    <p className="font-medium">{claimDetails.customer_name}</p>
                    {claimDetails.customer_phone && (
                      <a 
                        href={`tel:${claimDetails.customer_phone.replace(/\D/g, '')}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {claimDetails.customer_phone}
                      </a>
                    )}
                  </div>
                )}
                
                {/* Terceiro resumo */}
                {hasThirdParty && claimDetails?.third_party_name && (
                  <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2 text-amber-700 dark:text-amber-400">
                      <Users className="h-4 w-4" />
                      Terceiro Envolvido
                    </div>
                    <p className="font-medium">{claimDetails.third_party_name}</p>
                    {claimDetails.third_party_phone && (
                      <a 
                        href={`tel:${claimDetails.third_party_phone.replace(/\D/g, '')}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {claimDetails.third_party_phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              {/* Timeline resumida (últimos 5 eventos) */}
              <ClaimTimeline 
                history={ticket.history.slice(0, 5)} 
                communications={[]}
                purchases={[]}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Tab: Comunicações */}
        <TabsContent value="communications" className="mt-6">
          <ClaimCommunications
            ticketId={ticketId}
            communications={ticket.communications as Array<{
              id: string
              communication_date: string
              channel: string
              summary: string
              next_contact_date: string | null
              created_at: string
              creator: {
                id: string
                full_name: string
                avatar_url: string | null
              } | null
            }>}
            canManage={canManage}
          />
        </TabsContent>
        
        {/* Tab: Anexos */}
        <TabsContent value="attachments" className="mt-6">
          <ClaimAttachments
            ticketId={ticketId}
            attachments={(ticket.attachments as Array<{
              id: string
              file_name: string
              file_type: string
              file_size: number
              file_path: string
              category?: string
              created_at: string
              uploader: {
                id: string
                full_name: string
                avatar_url: string | null
              } | null
            }>).map(att => ({
              ...att,
              file_url: att.file_path // Map file_path to file_url
            }))}
            canManage={canManage}
          />
        </TabsContent>
        
        {/* Tab: Compras Internas */}
        <TabsContent value="purchases" className="mt-6">
          <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/30">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Compras Internas</h3>
            <p className="text-sm">
              O sistema de compras internas será implementado na Fase 4.
            </p>
            {ticket.purchases.length > 0 && (
              <p className="text-sm mt-2">
                {ticket.purchases.length} compra(s) registrada(s)
              </p>
            )}
          </div>
        </TabsContent>
        
        {/* Tab: Histórico */}
        <TabsContent value="history" className="mt-6">
          <ClaimTimeline 
            history={ticket.history as Array<{
              id: string
              action: string
              old_value: string | null
              new_value: string | null
              metadata: Record<string, unknown> | null
              created_at: string
              user: {
                id: string
                full_name: string
                avatar_url: string | null
              } | null
            }>}
            communications={ticket.communications as Array<{
              id: string
              communication_date: string
              channel: string
              summary: string
              creator: {
                id: string
                full_name: string
                avatar_url: string | null
              } | null
            }>}
            purchases={ticket.purchases as Array<{
              id: string
              title: string
              status: string
              created_at: string
              creator: {
                id: string
                full_name: string
                avatar_url: string | null
              } | null
            }>}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
