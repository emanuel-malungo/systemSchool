import { useState } from 'react'
import { toast } from 'react-toastify'
import { 
  MapPin, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  Loader2,
  Building2,
  Home
} from 'lucide-react'
import Button from '../../common/Button'
import Input from '../../common/Input'
import Modal from '../../common/Modal'
import {
  useProvincias,
  useMunicipiosByProvincia,
  useComunasByMunicipio,
  useCreateProvincia,
  useUpdateProvincia,
  useDeleteProvincia,
  useCreateMunicipio,
  useUpdateMunicipio,
  useDeleteMunicipio,
  useCreateComuna,
  useUpdateComuna,
  useDeleteComuna,
} from '../../../hooks/useGeographic'

type EntityType = 'provincia' | 'municipio' | 'comuna'

interface ModalState {
  isOpen: boolean
  type: 'create' | 'edit' | 'delete'
  entityType: EntityType
  data?: {
    id?: number
    designacao?: string
    parentId?: number
    parentName?: string
  }
}

export default function GeographicManagement() {
  const [expandedProvincia, setExpandedProvincia] = useState<number | null>(null)
  const [expandedMunicipio, setExpandedMunicipio] = useState<number | null>(null)
  const [modalState, setModalState] = useState<ModalState>({ 
    isOpen: false, 
    type: 'create', 
    entityType: 'provincia' 
  })
  const [formValue, setFormValue] = useState('')

  // Queries
  const { data: provincias = [], isLoading: loadingProvincias } = useProvincias()
  const { data: municipios = [], isLoading: loadingMunicipios } = useMunicipiosByProvincia(
    expandedProvincia || 0,
    !!expandedProvincia
  )
  const { data: comunas = [], isLoading: loadingComunas } = useComunasByMunicipio(
    expandedMunicipio || 0,
    !!expandedMunicipio
  )

  // Mutations
  const createProvincia = useCreateProvincia()
  const updateProvincia = useUpdateProvincia()
  const deleteProvincia = useDeleteProvincia()
  const createMunicipio = useCreateMunicipio()
  const updateMunicipio = useUpdateMunicipio()
  const deleteMunicipio = useDeleteMunicipio()
  const createComuna = useCreateComuna()
  const updateComuna = useUpdateComuna()
  const deleteComuna = useDeleteComuna()

  const openModal = (type: 'create' | 'edit' | 'delete', entityType: EntityType, data?: ModalState['data']) => {
    setModalState({ isOpen: true, type, entityType, data })
    setFormValue(data?.designacao || '')
  }

  const closeModal = () => {
    setModalState({ isOpen: false, type: 'create', entityType: 'provincia' })
    setFormValue('')
  }

  const handleSubmit = async () => {
    const { type, entityType, data } = modalState

    if (type === 'delete') {
      try {
        if (entityType === 'provincia') {
          await deleteProvincia.mutateAsync(data!.id!)
          toast.success('Província excluída com sucesso!')
        } else if (entityType === 'municipio') {
          await deleteMunicipio.mutateAsync(data!.id!)
          toast.success('Município excluído com sucesso!')
        } else {
          await deleteComuna.mutateAsync(data!.id!)
          toast.success('Comuna excluída com sucesso!')
        }
        closeModal()
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Erro ao excluir')
      }
      return
    }

    if (!formValue.trim()) {
      toast.error('Designação é obrigatória')
      return
    }

    try {
      if (entityType === 'provincia') {
        if (type === 'create') {
          await createProvincia.mutateAsync(formValue.trim())
          toast.success('Província criada com sucesso!')
        } else {
          await updateProvincia.mutateAsync({ id: data!.id!, designacao: formValue.trim() })
          toast.success('Província atualizada com sucesso!')
        }
      } else if (entityType === 'municipio') {
        if (type === 'create') {
          await createMunicipio.mutateAsync({ 
            designacao: formValue.trim(), 
            codigo_Provincia: data!.parentId! 
          })
          toast.success('Município criado com sucesso!')
        } else {
          await updateMunicipio.mutateAsync({ id: data!.id!, designacao: formValue.trim() })
          toast.success('Município atualizado com sucesso!')
        }
      } else {
        if (type === 'create') {
          await createComuna.mutateAsync({ 
            designacao: formValue.trim(), 
            codigo_Municipio: data!.parentId! 
          })
          toast.success('Comuna criada com sucesso!')
        } else {
          await updateComuna.mutateAsync({ id: data!.id!, designacao: formValue.trim() })
          toast.success('Comuna atualizada com sucesso!')
        }
      }
      closeModal()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erro ao salvar')
    }
  }

  const getModalTitle = () => {
    const { type, entityType, data } = modalState
    const entityNames = {
      provincia: 'Província',
      municipio: 'Município',
      comuna: 'Comuna'
    }
    
    if (type === 'delete') {
      return `Excluir ${entityNames[entityType]}`
    }
    if (type === 'create') {
      if (data?.parentName) {
        return `Adicionar ${entityNames[entityType]} em ${data.parentName}`
      }
      return `Adicionar ${entityNames[entityType]}`
    }
    return `Editar ${entityNames[entityType]}`
  }

  const isPending = createProvincia.isPending || updateProvincia.isPending || deleteProvincia.isPending ||
    createMunicipio.isPending || updateMunicipio.isPending || deleteMunicipio.isPending ||
    createComuna.isPending || updateComuna.isPending || deleteComuna.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Gestão Geográfica
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie províncias, municípios e comunas
          </p>
        </div>
        <Button onClick={() => openModal('create', 'provincia')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Província
        </Button>
      </div>

      {/* Lista de Províncias */}
      <div className="bg-white rounded-lg shadow">
        {loadingProvincias ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : provincias.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Nenhuma província cadastrada
          </div>
        ) : (
          <div className="divide-y">
            {provincias.map((provincia) => (
              <div key={provincia.codigo} className="border-b last:border-b-0">
                {/* Província */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <button
                    onClick={() => {
                      setExpandedProvincia(expandedProvincia === provincia.codigo ? null : provincia.codigo)
                      setExpandedMunicipio(null)
                    }}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {expandedProvincia === provincia.codigo ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{provincia.designacao}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal('create', 'municipio', { 
                        parentId: provincia.codigo, 
                        parentName: provincia.designacao 
                      })}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Adicionar Município"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal('edit', 'provincia', { 
                        id: provincia.codigo, 
                        designacao: provincia.designacao 
                      })}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar Província"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal('delete', 'provincia', { 
                        id: provincia.codigo, 
                        designacao: provincia.designacao 
                      })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Excluir Província"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Municípios */}
                {expandedProvincia === provincia.codigo && (
                  <div className="bg-gray-50 pl-8">
                    {loadingMunicipios ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    ) : municipios.length === 0 ? (
                      <div className="text-center p-4 text-gray-500 text-sm">
                        Nenhum município cadastrado
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {municipios.map((municipio) => (
                          <div key={municipio.codigo}>
                            {/* Município */}
                            <div className="flex items-center justify-between p-3 hover:bg-gray-100">
                              <button
                                onClick={() => setExpandedMunicipio(
                                  expandedMunicipio === municipio.codigo ? null : municipio.codigo
                                )}
                                className="flex items-center gap-2 flex-1 text-left"
                              >
                                {expandedMunicipio === municipio.codigo ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                                <Building2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm">{municipio.designacao}</span>
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openModal('create', 'comuna', { 
                                    parentId: municipio.codigo, 
                                    parentName: municipio.designacao 
                                  })}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                  title="Adicionar Comuna"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => openModal('edit', 'municipio', { 
                                    id: municipio.codigo, 
                                    designacao: municipio.designacao 
                                  })}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Editar Município"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => openModal('delete', 'municipio', { 
                                    id: municipio.codigo, 
                                    designacao: municipio.designacao 
                                  })}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  title="Excluir Município"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Comunas */}
                            {expandedMunicipio === municipio.codigo && (
                              <div className="bg-white pl-8 border-l-2 border-green-200 ml-4">
                                {loadingComunas ? (
                                  <div className="flex items-center justify-center p-3">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                  </div>
                                ) : comunas.length === 0 ? (
                                  <div className="text-center p-3 text-gray-500 text-xs">
                                    Nenhuma comuna cadastrada
                                  </div>
                                ) : (
                                  <div className="divide-y divide-gray-100">
                                    {comunas.map((comuna) => (
                                      <div key={comuna.codigo} className="flex items-center justify-between p-2 hover:bg-gray-50">
                                        <div className="flex items-center gap-2">
                                          <Home className="h-3.5 w-3.5 text-orange-500" />
                                          <span className="text-sm text-gray-700">{comuna.designacao}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => openModal('edit', 'comuna', { 
                                              id: comuna.codigo, 
                                              designacao: comuna.designacao 
                                            })}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Editar Comuna"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => openModal('delete', 'comuna', { 
                                              id: comuna.codigo, 
                                              designacao: comuna.designacao 
                                            })}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Excluir Comuna"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={getModalTitle()}
      >
        <div className="space-y-4">
          {modalState.type === 'delete' ? (
            <p className="text-gray-600">
              Tem certeza que deseja excluir <strong>{modalState.data?.designacao}</strong>?
              <br />
              <span className="text-sm text-red-500">Esta ação não pode ser desfeita.</span>
            </p>
          ) : (
            <Input
              label="Designação"
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              placeholder="Digite o nome..."
              autoFocus
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeModal} disabled={isPending}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isPending}
              variant={modalState.type === 'delete' ? 'danger' : 'primary'}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {modalState.type === 'delete' ? 'Excluir' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
