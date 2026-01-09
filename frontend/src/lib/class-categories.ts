/**
 * Sistema de categorização de turmas
 * 
 * Estrutura:
 * - Kids (vermelho): English Adventure 1-5
 * - Adults (azul): InstaEnglish Starter, InstaEnglish 1-4
 */

export type AgeGroup = 'Kids' | 'Adults'
export type KidsLevel = 'English Adventure 1' | 'English Adventure 2' | 'English Adventure 3' | 'English Adventure 4' | 'English Adventure 5'
export type AdultsLevel = 'InstaEnglish Starter' | 'InstaEnglish 1' | 'InstaEnglish 2' | 'InstaEnglish 3' | 'InstaEnglish 4'

export interface ClassCategory {
  ageGroup: AgeGroup
  level: KidsLevel | AdultsLevel
  color: string
  bgColor: string
  borderColor: string
  textColor: string
}

// Mapeamento de níveis para categorias
const kidsLevels: KidsLevel[] = [
  'English Adventure 1',
  'English Adventure 2',
  'English Adventure 3',
  'English Adventure 4',
  'English Adventure 5',
]

const adultsLevels: AdultsLevel[] = [
  'InstaEnglish Starter',
  'InstaEnglish 1',
  'InstaEnglish 2',
  'InstaEnglish 3',
  'InstaEnglish 4',
]

/**
 * Determina a categoria de uma turma baseado no nível
 */
export function getClassCategory(level: string | null | undefined): ClassCategory | null {
  if (!level) return null

  const normalizedLevel = level.trim()
  
  // Verificar se é Kids
  if (kidsLevels.some(l => normalizedLevel.toLowerCase().includes(l.toLowerCase()))) {
    return {
      ageGroup: 'Kids',
      level: kidsLevels.find(l => normalizedLevel.toLowerCase().includes(l.toLowerCase())) || kidsLevels[0],
      color: '#ef4444', // red-500
      bgColor: '#fef2f2', // red-50
      borderColor: '#fecaca', // red-200
      textColor: '#991b1b', // red-800
    }
  }
  
  // Verificar se é Adults
  if (adultsLevels.some(l => normalizedLevel.toLowerCase().includes(l.toLowerCase()))) {
    return {
      ageGroup: 'Adults',
      level: adultsLevels.find(l => normalizedLevel.toLowerCase().includes(l.toLowerCase())) || adultsLevels[0],
      color: '#3b82f6', // blue-500
      bgColor: '#eff6ff', // blue-50
      borderColor: '#bfdbfe', // blue-200
      textColor: '#1e40af', // blue-800
    }
  }

  // Padrão: se não corresponder, retorna null
  return null
}

/**
 * Retorna todas as opções de níveis disponíveis
 */
export function getAllLevels(): Array<{ ageGroup: AgeGroup; level: string }> {
  return [
    ...kidsLevels.map(level => ({ ageGroup: 'Kids' as AgeGroup, level })),
    ...adultsLevels.map(level => ({ ageGroup: 'Adults' as AgeGroup, level })),
  ]
}

/**
 * Retorna a cor do grupo etário
 */
export function getAgeGroupColor(ageGroup: AgeGroup): string {
  return ageGroup === 'Kids' ? '#ef4444' : '#3b82f6'
}

/**
 * Retorna badge variant baseado no grupo etário
 */
export function getAgeGroupBadgeClass(ageGroup: AgeGroup): string {
  if (ageGroup === 'Kids') {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-700'
  }
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700'
}

/**
 * Valida se um nível é válido
 */
export function isValidLevel(level: string): boolean {
  return [...kidsLevels, ...adultsLevels].some(l => 
    level.toLowerCase().includes(l.toLowerCase())
  )
}
