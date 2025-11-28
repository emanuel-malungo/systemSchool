/**
 * Utilitários de formatação para números e valores
 */

/**
 * Formata números grandes de forma compacta
 * @param value - Valor numérico a ser formatado
 * @param options - Opções de formatação
 * @returns String formatada (ex: "1,5M", "12K", "850")
 * 
 * @example
 * formatCompactNumber(1500) // "1,5K"
 * formatCompactNumber(1500000) // "1,5M"
 * formatCompactNumber(1500000000) // "1,5B"
 */
export function formatCompactNumber(
  value: number,
  options?: {
    decimals?: number
    locale?: string
  }
): string {
  const { decimals = 1, locale = 'pt-BR' } = options || {}

  const formats = [
    { value: 1e9, symbol: 'B' },  // Bilhões
    { value: 1e6, symbol: 'M' },  // Milhões
    { value: 1e3, symbol: 'K' },  // Milhares
  ]

  for (const format of formats) {
    if (Math.abs(value) >= format.value) {
      const formatted = (value / format.value).toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      })
      return `${formatted}${format.symbol}`
    }
  }

  return value.toLocaleString(locale)
}

/**
 * Formata valores monetários de forma compacta
 * @param value - Valor monetário
 * @param currency - Código da moeda (padrão: AOA - Kwanza)
 * @param compact - Se deve usar formato compacto
 * @returns String formatada com moeda
 */
export function formatCurrency(
  value: number,
  currency: 'AOA' | 'USD' | 'EUR' = 'AOA',
  compact = true
): string {
  const symbols = {
    AOA: 'Kz',
    USD: '$',
    EUR: '€',
  }

  if (compact && Math.abs(value) >= 1000) {
    return `${formatCompactNumber(value)} ${symbols[currency]}`
  }

  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  return `${formatted} ${symbols[currency]}`
}

/**
 * Formata percentuais
 * @param value - Valor percentual (ex: 0.15 para 15%)
 * @param decimals - Casas decimais (padrão: 1)
 * @returns String formatada com sinal de %
 * 
 * @example
 * formatPercentage(0.082) // "+8,2%"
 * formatPercentage(-0.05) // "-5,0%"
 */
export function formatPercentage(
  value: number,
  decimals = 1
): string {
  const sign = value >= 0 ? '+' : ''
  const formatted = (value * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${sign}${formatted}%`
}

/**
 * Formata números inteiros com separadores de milhares
 * @param value - Valor numérico
 * @returns String formatada
 * 
 * @example
 * formatNumber(4686) // "4.686"
 * formatNumber(1500000) // "1.500.000"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR')
}

/**
 * Determina se um valor deve usar formato compacto
 * @param value - Valor numérico
 * @param threshold - Limite para usar compacto (padrão: 10000)
 * @returns true se deve usar formato compacto
 */
export function shouldUseCompactFormat(
  value: number,
  threshold = 10000
): boolean {
  return Math.abs(value) >= threshold
}

/**
 * Formata valores de forma inteligente baseado no tamanho
 * @param value - Valor numérico
 * @param type - Tipo de formatação
 * @returns String formatada adequadamente
 */
export function formatSmartValue(
  value: number,
  type: 'number' | 'currency' | 'percentage' = 'number'
): string {
  switch (type) {
    case 'currency':
      return formatCurrency(value)
    case 'percentage':
      return formatPercentage(value)
    case 'number':
    default:
      if (shouldUseCompactFormat(value)) {
        return formatCompactNumber(value)
      }
      return formatNumber(value)
  }
}

/**
 * Remove zeros desnecessários de strings formatadas
 * @param value - String com o valor formatado
 * @returns String sem zeros desnecessários
 * 
 * @example
 * trimZeros("1,0M") // "1M"
 * trimZeros("2,50K") // "2,5K"
 */
export function trimZeros(value: string): string {
  return value.replace(/,0+([KMB])/g, '$1').replace(/,(\d)0+([KMB])/g, ',$1$2')
}
