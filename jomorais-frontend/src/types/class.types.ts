export interface IClassInput {
  designacao: string
  status?: number
  notaMaxima?: number
  exame?: boolean
}

export interface IClass {
  codigo: number
  designacao: string
  status: number
  notaMaxima: number
  exame: boolean
}

export interface IPagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

export interface IClassListResponse {
  data: IClass[]
  pagination: IPagination
}
