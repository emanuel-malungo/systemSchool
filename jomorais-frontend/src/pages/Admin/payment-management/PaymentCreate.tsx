import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import {
  Search,
  User,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  Loader,
  AlertCircle,
  CheckCircle,
  X,
  Plus
} from "lucide-react"
import Container from "../../../components/layout/Container"
import {
  useAlunosConfirmados,
  useDadosFinanceirosAluno,
  useMesesPendentes,
  useTiposServico,
  useAllFormasPagamento,
  useCreatePagamento
} from "../../../hooks/usePayment"
import type { AlunoConfirmado } from "../../../types/payment.types"

interface PaymentFormData {
  codigo_Aluno: number
  tipo_servico: string
  mes: string
  ano: number
  preco: number
  codigo_formaPagamento: number
  data: string
  contaMovimentada?: string | undefined
  n_Bordoro?: string | undefined
  observacao?: string | undefined
}

const schema = yup.object({
  codigo_Aluno: yup.number().required("Selecione um aluno"),
  tipo_servico: yup.string().required("Selecione o tipo de serviço"),
  mes: yup.string().required("Selecione o mês"),
  ano: yup.number().required("Informe o ano"),
  preco: yup.number().positive("O valor deve ser positivo").required("Informe o valor"),
  codigo_formaPagamento: yup.number().required("Selecione a forma de pagamento"),
  data: yup.string().required("Selecione a data"),
  contaMovimentada: yup.string().notRequired(),
  n_Bordoro: yup.string().notRequired(),
  observacao: yup.string().notRequired()
}).required()

export default function PaymentCreate() {
  const [searchStudent, setSearchStudent] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<AlunoConfirmado | null>(null)
  const [showStudentSearch, setShowStudentSearch] = useState(false)
  const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<PaymentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: {
      data: new Date().toISOString().split('T')[0]
    }
  })

  const studentId = watch("codigo_Aluno")
  const anoLectivoId = selectedStudent?.confirmacao?.codigo_Ano_lectivo

  // Queries
  const { data: studentsData, isLoading: loadingStudents } = useAlunosConfirmados({
    search: searchStudent || undefined
  })

  const { data: financialData, isLoading: loadingFinancial } = useDadosFinanceirosAluno(
    studentId,
    anoLectivoId
  )

  const { data: pendingMonthsData } = useMesesPendentes(
    studentId,
    selectedStudent?.confirmacao?.codigo_Ano_lectivo
  )

  const { data: tiposServicoData } = useTiposServico()
  const { data: formasPagamentoData } = useAllFormasPagamento()

  // Mutations
  const createPayment = useCreatePagamento()

  const students = studentsData?.data || []
  const pendingMonths = pendingMonthsData?.data || []

  useEffect(() => {
    if (selectedStudent) {
      setValue("codigo_Aluno", selectedStudent.codigo)
    }
  }, [selectedStudent, setValue])

  const handleSelectStudent = (student: AlunoConfirmado) => {
    setSelectedStudent(student)
    setShowStudentSearch(false)
    setSearchStudent("")
  }

  const handleFormaPagamentoChange = (formaCodigo: number) => {
    setSelectedFormaPagamento(formaCodigo)
    setValue("codigo_formaPagamento", formaCodigo)
  }

  const onSubmit = async (data: PaymentFormData) => {
    if (!selectedStudent) {
      return
    }

    // Create payment data matching API expectations
    const paymentData = {
      codigo_Aluno: data.codigo_Aluno,
      tipo_servico: data.tipo_servico,
      mes: data.mes,
      ano: data.ano,
      preco: data.preco,
      totalgeral: data.preco, // assuming no additional fees
      codigo_formaPagamento: data.codigo_formaPagamento,
      codigoPagamento: 0, // will be set by backend
      data: data.data,
      contaMovimentada: data.contaMovimentada,
      n_Bordoro: data.n_Bordoro,
      observacao: data.observacao,
      codigo_Utilizador: 1 // TODO: Get from auth context
    }

    createPayment.mutate(paymentData, {
      onSuccess: () => {
        reset()
        setSelectedStudent(null)
        setSelectedFormaPagamento(null)
      }
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    }).format(value)
  }

  // Check if selected forma pagamento is bank deposit
  const selectedForma = formasPagamentoData?.data?.find(
    (f) => f.codigo === selectedFormaPagamento
  )
  const isBankDeposit = selectedForma?.designacao?.toLowerCase().includes('deposito') ||
                        selectedForma?.designacao?.toLowerCase().includes('transferencia')

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Pagamento</h1>
          <p className="text-gray-600 mt-1">
            Registre um novo pagamento de aluno
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Student Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Aluno</h2>
                
                {!selectedStudent ? (
                  <div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowStudentSearch(!showStudentSearch)}
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-500">Clique para selecionar um aluno</span>
                        <Search className="w-5 h-5 text-gray-400" />
                      </button>

                      {showStudentSearch && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                          <div className="p-3 border-b">
                            <input
                              type="text"
                              placeholder="Buscar por nome ou documento..."
                              value={searchStudent}
                              onChange={(e) => setSearchStudent(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {loadingStudents ? (
                              <div className="p-4 text-center">
                                <Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                              </div>
                            ) : students.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                Nenhum aluno encontrado
                              </div>
                            ) : (
                              students.map((student) => (
                                <button
                                  key={student.codigo}
                                  type="button"
                                  onClick={() => handleSelectStudent(student)}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{student.nome}</div>
                                  <div className="text-sm text-gray-500">
                                    {student.n_documento_identificacao} • {student.confirmacao?.turma?.tb_classes?.designacao || 'N/A'}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.codigo_Aluno && (
                      <p className="mt-1 text-sm text-red-600">{errors.codigo_Aluno.message}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {selectedStudent.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{selectedStudent.nome}</div>
                        <div className="text-sm text-gray-600">
                          {selectedStudent.n_documento_identificacao} • {selectedStudent.confirmacao?.turma?.tb_classes?.designacao || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(null)
                        setValue("codigo_Aluno", 0)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover aluno"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              {selectedStudent && (
                <>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Pagamento</h2>
                    
                    <div className="space-y-4">
                      {/* Service Type */}
                      <div>
                        <label htmlFor="tipo-servico" className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Serviço *
                        </label>
                        <select
                          id="tipo-servico"
                          {...register("tipo_servico")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione o tipo de serviço</option>
                          {tiposServicoData?.data?.map((tipo) => (
                            <option key={tipo.codigo} value={tipo.designacao}>
                              {tipo.designacao} {tipo.preco ? `- ${formatCurrency(tipo.preco)}` : ''}
                            </option>
                          ))}
                        </select>
                        {errors.tipo_servico && (
                          <p className="mt-1 text-sm text-red-600">{errors.tipo_servico.message}</p>
                        )}
                      </div>

                      {/* Month and Year */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="mes" className="block text-sm font-medium text-gray-700 mb-2">
                            Mês *
                          </label>
                          <select
                            id="mes"
                            {...register("mes")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Selecione</option>
                            {pendingMonths.map((monthObj) => (
                              <option key={monthObj.mes} value={monthObj.mes}>
                                {monthObj.mes}
                              </option>
                            ))}
                          </select>
                          {errors.mes && (
                            <p className="mt-1 text-sm text-red-600">{errors.mes.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-2">
                            Ano *
                          </label>
                          <input
                            id="ano"
                            type="number"
                            {...register("ano", { valueAsNumber: true })}
                            defaultValue={new Date().getFullYear()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {errors.ano && (
                            <p className="mt-1 text-sm text-red-600">{errors.ano.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-2">
                          Valor a Pagar *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            id="preco"
                            type="number"
                            step="0.01"
                            {...register("preco", { valueAsNumber: true })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        {errors.preco && (
                          <p className="mt-1 text-sm text-red-600">{errors.preco.message}</p>
                        )}
                      </div>

                      {/* Payment Date */}
                      <div>
                        <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                          Data do Pagamento *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            id="data"
                            type="date"
                            {...register("data")}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        {errors.data && (
                          <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
                        )}
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Forma de Pagamento *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {formasPagamentoData?.data?.map((forma) => (
                            <button
                              key={forma.codigo}
                              type="button"
                              onClick={() => handleFormaPagamentoChange(forma.codigo)}
                              className={`p-4 border-2 rounded-lg transition-all ${
                                selectedFormaPagamento === forma.codigo
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                                selectedFormaPagamento === forma.codigo
                                  ? 'text-blue-600'
                                  : 'text-gray-400'
                              }`} />
                              <div className="text-sm font-medium text-gray-900">{forma.designacao}</div>
                            </button>
                          ))}
                        </div>
                        {errors.codigo_formaPagamento && (
                          <p className="mt-1 text-sm text-red-600">{errors.codigo_formaPagamento.message}</p>
                        )}
                      </div>

                      {/* Bank Deposit Fields */}
                      {isBankDeposit && (
                        <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Informações de Depósito Bancário</span>
                          </div>

                          <div>
                            <label htmlFor="conta" className="block text-sm font-medium text-gray-700 mb-2">
                              Conta Movimentada
                            </label>
                            <input
                              id="conta"
                              type="text"
                              {...register("contaMovimentada")}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Ex: 0012345678"
                            />
                          </div>

                          <div>
                            <label htmlFor="bordoro" className="block text-sm font-medium text-gray-700 mb-2">
                              Nº Borderô
                            </label>
                            <input
                              id="bordoro"
                              type="text"
                              {...register("n_Bordoro")}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Ex: BRD123456"
                            />
                          </div>
                        </div>
                      )}

                      {/* Observations */}
                      <div>
                        <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-2">
                          Observações
                        </label>
                        <textarea
                          id="observacao"
                          {...register("observacao")}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Adicione observações sobre este pagamento..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={createPayment.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createPayment.isPending ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Registrar Pagamento
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        reset()
                        setSelectedStudent(null)
                        setSelectedFormaPagamento(null)
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Student Financial Panel */}
          {selectedStudent && (
            <div className="space-y-6">
              {/* Financial Summary */}
              {loadingFinancial ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                </div>
              ) : financialData?.success ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Situação Financeira
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Total Pago</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(financialData.data.totalPago || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-800">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Total Pendente</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">
                          {formatCurrency(financialData.data.totalPendente || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-800">
                          <User className="w-5 h-5" />
                          <span className="font-medium">Propina Mensal</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(financialData.data.propinaMensal || 0)}
                        </span>
                      </div>
                    </div>

                    {pendingMonths.length > 0 && (
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Meses Pendentes ({pendingMonths.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {pendingMonths.map((monthObj) => (
                            <span
                              key={monthObj.mes}
                              className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded"
                            >
                              {monthObj.mes}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Student Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Aluno</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Nome</div>
                    <div className="text-sm font-medium text-gray-900">{selectedStudent.nome}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Documento</div>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedStudent.n_documento_identificacao}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Curso/Classe</div>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedStudent.confirmacao?.turma?.tb_classes?.designacao || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Turma</div>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedStudent.confirmacao?.turma?.designacao || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
