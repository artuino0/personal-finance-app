import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface TaxSystem {
  value: string
  name: string
}

export interface CFDIUse {
  value: string
  name: string
}

export interface PaymentForm {
  value: string
  name: string
}

export interface Unit {
  value: string
  name: string
}

export interface ProductKey {
  value: string
  name: string
}

export function useTaxSystems() {
  const { data, error, isLoading } = useSWR<{ data: TaxSystem[] }>(
    "/api/facturapi/catalogs?catalog=regimenes",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000, // 1 hour
    }
  )

  return {
    taxSystems: data?.data || [],
    isLoading,
    error,
  }
}

export function useCFDIUses() {
  const { data, error, isLoading } = useSWR<{ data: CFDIUse[] }>(
    "/api/facturapi/catalogs?catalog=usos_cfdi",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000,
    }
  )

  return {
    cfdiUses: data?.data || [],
    isLoading,
    error,
  }
}

export function usePaymentForms() {
  const { data, error, isLoading } = useSWR<{ data: PaymentForm[] }>(
    "/api/facturapi/catalogs?catalog=formas_pago",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000,
    }
  )

  return {
    paymentForms: data?.data || [],
    isLoading,
    error,
  }
}

export function useUnits() {
  const { data, error, isLoading } = useSWR<{ data: Unit[] }>(
    "/api/facturapi/catalogs?catalog=unidades",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000,
    }
  )

  return {
    units: data?.data || [],
    isLoading,
    error,
  }
}

export function useProductKeys() {
  const { data, error, isLoading } = useSWR<{ data: ProductKey[] }>(
    "/api/facturapi/catalogs?catalog=productos",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000,
    }
  )

  return {
    productKeys: data?.data || [],
    isLoading,
    error,
  }
}

// Hook combinado para cargar todos los catálogos necesarios
export function useInvoiceCatalogs() {
  const taxSystems = useTaxSystems()
  const cfdiUses = useCFDIUses()
  const paymentForms = usePaymentForms()
  const units = useUnits()

  const isLoading = taxSystems.isLoading || cfdiUses.isLoading || paymentForms.isLoading || units.isLoading

  const error = taxSystems.error || cfdiUses.error || paymentForms.error || units.error

  return {
    taxSystems: taxSystems.taxSystems,
    cfdiUses: cfdiUses.cfdiUses,
    paymentForms: paymentForms.paymentForms,
    units: units.units,
    isLoading,
    error,
  }
}
