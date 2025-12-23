'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ImportUnitData {
  name: string
  code: string
  address: string
  city: string | null
  state: string | null
  capacity: number | null
  cnpj: string | null
  neighborhood: string | null
  region: string | null
  administrator: string | null
  supervisor_name: string | null
}

export interface ImportResult {
  imported: number
  updated: number
  errors: { row: number; name: string; error: string }[]
}

/**
 * Importa unidades em massa
 */
export async function importUnits(units: ImportUnitData[]): Promise<ImportResult> {
  const supabase = await createClient()

  // Verificar admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return { imported: 0, updated: 0, errors: [{ row: 0, name: '', error: 'Acesso negado' }] }
  }

  const results: ImportResult = {
    imported: 0,
    updated: 0,
    errors: [],
  }

  for (let i = 0; i < units.length; i++) {
    const unit = units[i]

    try {
      // Verificar se já existe (por nome ou CNPJ)
      let existing = null
      
      // Primeiro tenta por CNPJ se disponível
      if (unit.cnpj) {
        const { data } = await supabase
          .from('units')
          .select('id')
          .eq('cnpj', unit.cnpj)
          .maybeSingle()
        existing = data
      }
      
      // Se não encontrou por CNPJ, tenta por nome
      if (!existing) {
        const { data } = await supabase
          .from('units')
          .select('id')
          .eq('name', unit.name)
          .maybeSingle()
        existing = data
      }

      if (existing) {
        // Atualizar existente (upsert)
        const { error } = await supabase
          .from('units')
          .update({
            address: unit.address,
            city: unit.city,
            state: unit.state,
            capacity: unit.capacity,
            cnpj: unit.cnpj,
            neighborhood: unit.neighborhood,
            region: unit.region,
            administrator: unit.administrator,
            supervisor_name: unit.supervisor_name,
          })
          .eq('id', existing.id)

        if (error) {
          results.errors.push({ row: i + 1, name: unit.name, error: error.message })
        } else {
          results.updated++
        }
      } else {
        // Inserir novo
        const { error } = await supabase
          .from('units')
          .insert({
            name: unit.name,
            code: unit.code,
            address: unit.address,
            city: unit.city,
            state: unit.state,
            capacity: unit.capacity,
            cnpj: unit.cnpj,
            neighborhood: unit.neighborhood,
            region: unit.region,
            administrator: unit.administrator,
            supervisor_name: unit.supervisor_name,
            status: 'active',
          })

        if (error) {
          results.errors.push({ row: i + 1, name: unit.name, error: error.message })
        } else {
          results.imported++
        }
      }
    } catch (err) {
      results.errors.push({ 
        row: i + 1, 
        name: unit.name, 
        error: err instanceof Error ? err.message : 'Erro desconhecido' 
      })
    }
  }

  revalidatePath('/unidades')

  return results
}

/**
 * Busca o próximo código de unidade disponível para sequência de códigos
 */
export async function getNextUnitCodeStart(): Promise<number> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('units')
    .select('code')
    .like('code', 'UN%')
    .order('code', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data?.code) {
    return 1
  }

  const lastNumber = parseInt(data.code.replace('UN', ''), 10)
  return lastNumber + 1
}

