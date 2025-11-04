export interface ITemplateCrudItem {
  id: string | number
  nome: string
  descricao?: string
  date?: string | number | Date
  data?: string | number | Date
  updatedAt?: string | number | Date
  createdAt?: string | number | Date
}
