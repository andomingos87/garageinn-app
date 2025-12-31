'use client'

import { User, Phone, Mail, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ClaimCustomerProps {
  claimDetails: {
    customer_name: string | null
    customer_phone: string | null
    customer_email: string | null
    customer_cpf: string | null
  } | null
}

export function ClaimCustomer({ claimDetails }: ClaimCustomerProps) {
  if (!claimDetails) return null
  
  const { customer_name, customer_phone, customer_email, customer_cpf } = claimDetails
  
  // Se não tem dados do cliente, não renderiza
  if (!customer_name && !customer_phone && !customer_email && !customer_cpf) {
    return null
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4" />
          Dados do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {customer_name && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                Nome
              </p>
              <p className="font-medium">{customer_name}</p>
            </div>
          )}
          
          {customer_phone && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Telefone
              </p>
              <p className="font-medium">
                <a 
                  href={`tel:${customer_phone.replace(/\D/g, '')}`}
                  className="hover:underline text-primary"
                >
                  {customer_phone}
                </a>
              </p>
            </div>
          )}
          
          {customer_email && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                E-mail
              </p>
              <p className="font-medium">
                <a 
                  href={`mailto:${customer_email}`}
                  className="hover:underline text-primary"
                >
                  {customer_email}
                </a>
              </p>
            </div>
          )}
          
          {customer_cpf && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                CPF
              </p>
              <p className="font-medium">{customer_cpf}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

