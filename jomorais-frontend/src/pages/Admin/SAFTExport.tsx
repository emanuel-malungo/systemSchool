import { useState, useEffect, useRef } from 'react'
import { 
  FileText, 
  Download, 
  Settings, 
  Calendar,
  Building2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Receipt,
  DollarSign,
  Eye,
  FileDown,
  Info,
  CheckCircle,
  XCircle,
  Key,
  Shield
} from 'lucide-react'
import Container from '../../components/layout/Container'
import StatCard from '../../components/common/StatCard'
import ErrorBoundary from '../../components/common/ErrorBoundary'
import type { ISAFTExportConfig, ISAFTExportResponse } from '../../types/saft.types'
import { toast } from 'react-toastify'
import SAFTService from '../../services/saft.service'
import CryptoService from '../../services/crypto.service'
import '../../assets/styles/saft.css'

// Componente de Loading para estatísticas
const StatsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <StatCard
        key={i}
        title=""
        value=""
        icon={Users}
        loading={true}
      />
    ))}
  </div>
)

// Modal de Progresso da Exportação
const ExportProgressModal = ({ 
  isOpen, 
  progress, 
  onClose 
}: { 
  isOpen: boolean
  progress: number
  onClose: () => void 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Gerando Ficheiro SAFT
          </h3>
          
          <p className="text-gray-600 mb-6">
            Por favor, aguarde enquanto processamos os dados...
          </p>

          {/* Barra de Progresso */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`progress-bar-fill progress-${Math.floor(progress / 10) * 10}`}
            ></div>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            {progress}% concluído
          </div>

          {progress < 100 && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4 animate-pulse" />
              Processando dados fiscais...
            </div>
          )}

          {progress === 100 && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Modal de Confirmação
const ConfirmExportModal = ({ 
  isOpen, 
  config, 
  onConfirm, 
  onCancel 
}: {
  isOpen: boolean
  config: ISAFTExportConfig | null
  onConfirm: () => void
  onCancel: () => void
}) => {
  if (!isOpen || !config) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Confirmar Exportação SAFT
            </h3>
            <p className="text-gray-600">
              Verifique os dados antes de continuar com a geração do ficheiro.
            </p>
          </div>
        </div>

        {/* Resumo da Configuração */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração da Exportação
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Período:</span>
              <div className="font-medium">
                {new Date(config.startDate).toLocaleDateString('pt-AO')} - {new Date(config.endDate).toLocaleDateString('pt-AO')}
              </div>
            </div>
            
            <div>
              <span className="text-gray-500">Empresa:</span>
              <div className="font-medium">{config.companyInfo.name}</div>
            </div>
            
            <div>
              <span className="text-gray-500">NIF:</span>
              <div className="font-medium">{config.companyInfo.nif}</div>
            </div>
            
            <div>
              <span className="text-gray-500">Incluir:</span>
              <div className="font-medium">
                {[
                  config.includeCustomers && 'Clientes',
                  config.includeProducts && 'Produtos', 
                  config.includeInvoices && 'Faturas',
                  config.includePayments && 'Pagamentos'
                ].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            Confirmar Exportação
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SAFTExport() {
  // Estado do formulário
  const [formData, setFormData] = useState<Partial<ISAFTExportConfig>>({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    includeCustomers: true,
    includeProducts: true,
    includeInvoices: true,
    includePayments: true,
    companyInfo: {
      nif: '',
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: ''
    },
    softwareInfo: {
      name: 'JoMorais-SAFT',
      version: '1.0.0',
      certificateNumber: '',
      companyNIF: '5101165107'
    }
  })

  // Estados dos modais
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  
  // Estados locais substituindo o hook
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportResult, setExportResult] = useState<ISAFTExportResponse | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [statistics, setStatistics] = useState({
    totalInvoices: 0,
    totalPayments: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalAmount: 0
  })
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(true)
  const [hasKeys, setHasKeys] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastExport, setLastExport] = useState<ISAFTExportResponse | null>(null)
  
  const isLoadingStatsRef = useRef(false)
  const statsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para carregar estatísticas
  const loadStatistics = async (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      return
    }
    
    if (isLoadingStatsRef.current) {
      return
    }
    
    try {
      isLoadingStatsRef.current = true
      setIsLoadingStatistics(true)
      
      const stats = await SAFTService.getExportStatistics(startDate, endDate)
      
      setStatistics(stats)
    } catch (error: unknown) {
      const err = error as Error
      console.error('❌ Erro ao carregar estatísticas:', err)
      setStatistics({
        totalInvoices: 0,
        totalPayments: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalAmount: 0
      })
    } finally {
      setIsLoadingStatistics(false)
      isLoadingStatsRef.current = false
    }
  }
  
  // Carregar estatísticas quando as datas mudarem
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      // Limpar timeout anterior
      if (statsTimeoutRef.current) {
        clearTimeout(statsTimeoutRef.current)
      }
      
      // Debounce de 500ms
      statsTimeoutRef.current = setTimeout(() => {
        loadStatistics(formData.startDate!, formData.endDate!)
      }, 500)
    }
    
    return () => {
      if (statsTimeoutRef.current) {
        clearTimeout(statsTimeoutRef.current)
      }
    }
  }, [formData.startDate, formData.endDate])

  // Carregar informações da empresa
  const loadCompanyInfo = async () => {
    try {
      const response = await SAFTService.getCompanyInfo()
      
      if (response?.data) {
        setFormData(prev => ({
          ...prev,
          companyInfo: {
            ...prev.companyInfo!,
            nif: response.data.nif || prev.companyInfo!.nif,
            name: response.data.nome || prev.companyInfo!.name,
            address: response.data.endereco || prev.companyInfo!.address,
            city: response.data.cidade || prev.companyInfo!.city,
            postalCode: response.data.codigoPostal || prev.companyInfo!.postalCode,
            phone: response.data.telefone || prev.companyInfo!.phone,
            email: response.data.email || prev.companyInfo!.email,
          }
        }))
      }
    } catch {
      // Usar dados padrão da empresa (API não disponível)
    }
  }
  
  // Verificar chaves criptográficas
  const checkCryptoKeys = () => {
    const hasPrivateKey = localStorage.getItem('saft_private_key')
    const hasPublicKey = localStorage.getItem('saft_public_key')
    setHasKeys(!!(hasPrivateKey && hasPublicKey))
  }
  
  // Inicializar dados ao montar componente
  useEffect(() => {
    checkCryptoKeys()
    loadCompanyInfo()
    const startDate = formData.startDate
    const endDate = formData.endDate
    if (startDate && endDate) {
      loadStatistics(startDate, endDate)
    }
    
    return () => {
      if (statsTimeoutRef.current) {
        clearTimeout(statsTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Gerar chaves criptográficas
  const generateKeys = async () => {
    try {
      setIsExporting(true)
      setExportProgress(20)
      
      const keyPair = await CryptoService.generateKeyPair()
      
      localStorage.setItem('saft_private_key', keyPair.privateKey)
      localStorage.setItem('saft_public_key', keyPair.publicKey)
      
      setHasKeys(true)
      setExportProgress(0)
      setIsExporting(false)
      
      toast.success('Chaves criptográficas geradas com sucesso!\n\nIMPORTANTE: Faça backup das suas chaves e registe a chave pública na AGT.')
    } catch (error) {
      console.error('Erro ao gerar chaves:', error)
      toast.error('Erro ao gerar chaves criptográficas')
      setIsExporting(false)
      setExportProgress(0)
    }
  }
  
  // Exportar chave pública
  const exportPublicKey = (format: 'pem' | 'txt' = 'pem') => {
    try {
      const publicKey = localStorage.getItem('saft_public_key')
      if (!publicKey) {
        toast.error('Chave pública não encontrada. Gere as chaves primeiro.')
        return
      }

      let keyContent: string
      let fileName: string
      let mimeType: string

      if (format === 'pem') {
        keyContent = CryptoService.exportPublicKeyPEM()
        fileName = 'chave_publica_saft.pem'
        mimeType = 'application/x-pem-file'
      } else {
        keyContent = `CHAVE PÚBLICA SAFT-AO
		Sistema: Jomorais
		Data: ${new Date().toLocaleString('pt-AO')}
		Algoritmo: RSA 2048 bits + SHA-256

		=== INÍCIO DA CHAVE PÚBLICA ===
		${CryptoService.exportPublicKeyPEM()}
		=== FIM DA CHAVE PÚBLICA ===

		INSTRUÇÕES:
		1. Registar esta chave no portal da AGT
		2. Aguardar aprovação e número de certificado
		3. Inserir número do certificado no sistema
		4. Iniciar uso em produção

		IMPORTANTE: Manter esta chave segura e fazer backup!`
        fileName = 'chave_publica_saft.txt'
        mimeType = 'text/plain'
      }

      const blob = new Blob([keyContent], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
      
      toast.success(`Chave pública exportada: ${fileName}`)
    } catch (error) {
      console.error('Erro ao exportar chave pública:', error)
      toast.error('Erro ao exportar chave pública')
    }
  }
  
  // Controlar modal de progresso
  useEffect(() => {
    if (isExporting) {
      setShowProgressModal(true)
    } else if (exportProgress === 100 || !isExporting) {
      setTimeout(() => setShowProgressModal(false), 1000)
    }
  }, [isExporting, exportProgress])

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Validar configuração
  const validateConfig = async () => {
    try {
      const validation = await SAFTService.validateExportConfig(formData as ISAFTExportConfig)
      setValidationErrors(validation.errors || [])
      return validation.valid
    } catch {
      setValidationErrors(['Erro ao validar configuração'])
      return false
    }
  }
  
  const handleSubmit = () => {
    // Validações básicas
    if (!formData.startDate || !formData.endDate) {
      toast.error('Por favor, selecione o período da exportação')
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Data de início deve ser anterior à data de fim')
      return
    }
    
    if (!hasKeys) {
      toast.error('É necessário gerar chaves criptográficas antes de exportar.')
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmExport = async () => {

    setShowConfirmModal(false)
    setIsExporting(true)
    setExportProgress(0)
    setExportResult(null)
    setValidationErrors([])
    setError(null)

    try {
      // Validar configuração
      setExportProgress(10)
      
      const isValid = await validateConfig()
      
      if (!isValid) {
        setIsExporting(false)
        return
      }

      // Exportar SAFT
      setExportProgress(30)
      
      const result = await SAFTService.exportSAFT(formData as ISAFTExportConfig)
      
      setExportProgress(100)
      setExportResult(result)

      if (result.success && result.downloadUrl) {
        SAFTService.downloadSAFTFile(result.downloadUrl, result.fileName || 'saft.xml')
        setLastExport(result)
        toast.success('Ficheiro SAFT gerado com sucesso!')
      } else {
        setError(result.message || 'Erro na exportação')
        toast.error(result.message || 'Erro ao gerar ficheiro SAFT')
      }
    } catch (err: unknown) {
      const error = err as Error
      const errorMessage = error.message || 'Erro desconhecido na exportação'
      setExportResult({
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      })
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsExporting(false)
      setTimeout(() => setExportProgress(0), 2000)
    }
  }
  
  // Download do último export
  const downloadLastExport = () => {
    if (lastExport && lastExport.downloadUrl) {
      SAFTService.downloadSAFTFile(lastExport.downloadUrl, lastExport.fileName || 'saft.xml')
    } else {
      toast.warning('Nenhuma exportação anterior encontrada')
    }
  }

//   const isStatsLoading = isLoadingStatistics

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        {/* <div className="bg-linear-to-br from-blue-50 via-white to-blue-50 rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="relative p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100/30 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Exportação SAFT-AO
                  </h1>
                  <p className="text-gray-600 text-lg max-w-2xl">
                    Gere ficheiros SAFT (Standard Audit File for Tax) em conformidade com a legislação fiscal angolana.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Sistema conforme Decreto Executivo 74/19</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                {lastExport && (
                  <button
                    onClick={downloadLastExport}
                    className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md"
                  >
                    <FileDown className="h-5 w-5" />
                    Último Ficheiro
                  </button>
                )}
              </div>
            </div>
          </div>
        </div> */}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-semibold mb-1">Erro na Exportação</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {/* <ErrorBoundary>
          {isStatsLoading ? (
            <StatsLoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total de Faturas"
                  value={statistics?.totalInvoices || 0}
                  valueType="number"
                  icon={Receipt}
                  subtitle="no período selecionado"
                  iconBgColor="bg-gradient-to-br from-blue-500 to-blue-600"
                  iconColor="text-white"
                  bgGradient="from-blue-50 via-white to-blue-50/50"
                />

                <StatCard
                  title="Total de Pagamentos"
                  value={statistics?.totalPayments || 0}
                  valueType="number"
                  icon={DollarSign}
                  subtitle="registrados no sistema"
                  iconBgColor="bg-gradient-to-br from-green-500 to-green-600"
                  iconColor="text-white"
                  bgGradient="from-green-50 via-white to-green-50/50"
                />

                <StatCard
                  title="Valor Total"
                  value={statistics?.totalAmount || 0}
                  valueType="currency"
                  currency="AOA"
                  icon={TrendingUp}
                  subtitle="montante das transações"
                  iconBgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                  iconColor="text-white"
                  bgGradient="from-purple-50 via-white to-purple-50/50"
                />

                <StatCard
                  title="Total de Clientes"
                  value={statistics?.totalCustomers || 0}
                  valueType="number"
                  icon={Users}
                  subtitle="alunos registrados"
                  iconBgColor="bg-gradient-to-br from-orange-500 to-orange-600"
                  iconColor="text-white"
                  bgGradient="from-orange-50 via-white to-orange-50/50"
                />
              </div>
            )}
        </ErrorBoundary> */}

        {/* Segurança Criptográfica */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                <Key className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Segurança Criptográfica</h2>
            </div>

            <div className="space-y-6">
              {/* Status das Chaves */}
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  {hasKeys ? (
                    <>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Chaves Configuradas</h3>
                        <p className="text-sm text-gray-600">Sistema pronto para exportação SAFT</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Chaves Não Configuradas</h3>
                        <p className="text-sm text-gray-600">É necessário gerar chaves RSA antes de exportar</p>
                      </div>
                    </>
                  )}
                </div>

                {!hasKeys ? (
                  <button
                    onClick={generateKeys}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Key className="h-5 w-5" />
                    Gerar Chaves RSA
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportPublicKey('txt')}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <Download className="h-4 w-4" />
                      Exportar (.txt)
                    </button>
                    <button
                      onClick={() => exportPublicKey('pem')}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <Download className="h-4 w-4" />
                      Exportar (.pem)
                    </button>
                  </div>
                )}
              </div>

              {/* Informações sobre Chaves Criptográficas */}
              {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">Sobre as Chaves Criptográficas</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Algoritmo: RSA 2048 bits + SHA-256</li>
                      <li>• As chaves são usadas para assinar digitalmente os ficheiros SAFT</li>
                      <li>• A chave pública deve ser registada no portal da AGT</li>
                      <li>• Após aprovação, receberá um número de certificado da AGT</li>
                      <li>• Faça backup seguro das suas chaves!</li>
                    </ul>
                  </div>
                </div>
              </div> */}

              {/* {hasKeys && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">Próximos Passos</h4>
                      <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                        <li>Exporte a chave pública usando os botões acima</li>
                        <li>Registe a chave no portal da Administração Geral Tributária (AGT)</li>
                        <li>Aguarde aprovação e obtenha o número do certificado</li>
                        <li>Insira o número do certificado na configuração abaixo</li>
                        <li>Inicie a geração de ficheiros SAFT</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Export Configuration Form */}
		
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Configuração da Exportação</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Período */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Período da Exportação
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data de Início
                          </label>
                          <input
                            type="date"
                            title="Data de início do período SAFT"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data de Fim
                          </label>
                          <input
                            type="date"
                            title="Data de fim do período SAFT"
                            value={formData.endDate}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dados a Incluir */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Dados a Incluir
                      </h3>
                      
                      <div className="space-y-4">
                        {[
                          { key: 'includeCustomers', label: 'Clientes (Alunos)', icon: Users },
                          { key: 'includeProducts', label: 'Produtos/Serviços', icon: Receipt },
                          { key: 'includeInvoices', label: 'Faturas', icon: FileText },
                          { key: 'includePayments', label: 'Pagamentos', icon: DollarSign }
                        ].map(({ key, label, icon: Icon }) => (
                          <label key={key} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            title={`Incluir ${label}`}
                            checked={formData[key as keyof typeof formData] as boolean}
                            onChange={(e) => handleInputChange(key, e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                            <Icon className="h-5 w-5 text-gray-600" />
                            <span className="font-medium text-gray-900">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Informações da Empresa */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        Informações da Empresa
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            NIF
                          </label>
                          <input
                            type="text"
                            value={formData.companyInfo?.nif || ''}
                            onChange={(e) => handleInputChange('companyInfo.nif', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Número de Identificação Fiscal"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome da Empresa
                          </label>
                          <input
                            type="text"
                            value={formData.companyInfo?.name || ''}
                            onChange={(e) => handleInputChange('companyInfo.name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Nome completo da empresa"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Endereço
                          </label>
                          <input
                            type="text"
                            value={formData.companyInfo?.address || ''}
                            onChange={(e) => handleInputChange('companyInfo.address', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Endereço completo"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cidade
                            </label>
                            <input
                              type="text"
                              value={formData.companyInfo?.city || ''}
                              onChange={(e) => handleInputChange('companyInfo.city', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Cidade"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Código Postal
                            </label>
                            <input
                              type="text"
                              value={formData.companyInfo?.postalCode || ''}
                              onChange={(e) => handleInputChange('companyInfo.postalCode', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Código postal"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informações do Software */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Informações do Software
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Software
                          </label>
                          <input
                            type="text"
                            value={formData.softwareInfo?.name || ''}
                            onChange={(e) => handleInputChange('softwareInfo.name', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Nome do software"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Versão
                            </label>
                            <input
                              type="text"
                              value={formData.softwareInfo?.version || ''}
                              onChange={(e) => handleInputChange('softwareInfo.version', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="1.0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Certificado Nº
                            </label>
                            <input
                              type="text"
                              value={formData.softwareInfo?.certificateNumber || ''}
                              onChange={(e) => handleInputChange('softwareInfo.certificateNumber', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Info className="h-4 w-4" />
                    <span>O ficheiro será gerado em formato XML conforme SAFT-AO v1.04_01</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        if (lastExport) {
                          downloadLastExport()
                        } else {
                          toast.warning('Nenhuma exportação anterior encontrada')
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      disabled={!lastExport}
                    >
                      <Eye className="h-5 w-5" />
                      Último Ficheiro
                    </button>
                    
                    <button
                      onClick={handleSubmit}
                      disabled={isExporting}
                      className={`flex items-center gap-2 px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-medium shadow-md ${
                        isExporting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Download className="h-5 w-5" />
                      {isExporting ? 'Exportando...' : 'Gerar SAFT'}
                    </button>
                  </div>
                </div>
              </div>
        </div>

        {/* Modals */}
        <ConfirmExportModal
          isOpen={showConfirmModal}
          config={formData as ISAFTExportConfig}
          onConfirm={handleConfirmExport}
          onCancel={() => setShowConfirmModal(false)}
        />

        <ExportProgressModal
          isOpen={showProgressModal}
          progress={exportProgress}
          onClose={() => setShowProgressModal(false)}
        />
      </div>
    </Container>
  )
}