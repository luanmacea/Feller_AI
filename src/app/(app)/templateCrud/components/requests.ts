import api from '@/services/api'

interface ICreateTemplateCrud {
  id?: number | string
  nome: string
  descricao: string
}

export async function getTemplateCrud() {
  const response = await api.get('/templateCrud')
  return response
}

export async function getTemplateCrudItem(id: number) {
  const response = await api.get(`/templateCrud/${id}`)
  return response
}

export async function postTemplateCrud(data: ICreateTemplateCrud) {
  const response = await api.post('/templateCrud', {
    ...data,
  })
  return response
}
export async function putTemplateCrud(data: ICreateTemplateCrud) {
  const response = await api.put('/templateCrud', {
    ...data,
  })
  return response
}

export async function deleteTemplateCrud(id: string) {
  const response = await api.delete(`/templateCrud/${id}`)
  return response
}
