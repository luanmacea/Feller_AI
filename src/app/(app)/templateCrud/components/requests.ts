import api from '@/services/api'

interface ICreateTemplateCrud {
  id?: number | string
  nome: string
  descricao: string
}

export async function getTemplateCrud() {
  try {
    const response = await api.get('/templateCrud')
    return response
  } catch (error: any) {
    return error.response
  }
}

export async function getTemplateCrudItem(id: number) {
  try {
    const response = await api.get(`/templateCrud/${id}`)
    return response
  } catch (error: any) {
    return error.response
  }
}

export async function postTemplateCrud(data: ICreateTemplateCrud) {
  try {
    const response = await api.post('/templateCrud', {
      ...data,
    })
    return response
  } catch (error: any) {
    return error.response
  }
}
export async function putTemplateCrud(data: ICreateTemplateCrud) {
  try {
    const response = await api.put('/templateCrud', {
      ...data,
    })
    return response
  } catch (error: any) {
    return error.response
  }
}
export async function deleteTemplateCrud(id: string) {
  try {
    const response = await api.delete(`/templateCrud/${id}`)
    return response
  } catch (error: any) {
    return error.response
  }
}
