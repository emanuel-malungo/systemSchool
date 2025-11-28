import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, FileText } from 'lucide-react';
import { useCreateNotaCredito } from '../../hooks/usePayment';
import type { PagamentoDetalhe } from '../../types/payment.types';
import { toast } from 'react-toastify';

interface CreditNoteModalProps {
  open: boolean;
  onClose: () => void;
  payment: PagamentoDetalhe | null;
  onSuccess?: () => void;
}

const CreditNoteModal: React.FC<CreditNoteModalProps> = ({
  open,
  onClose,
  payment,
  onSuccess
}) => {
  const createNotaCredito = useCreateNotaCredito();
  
  const [formData, setFormData] = useState({
    motivo: '',
    observacao: '',
    numeroNotaCredito: ''
  });

  // Gerar número automático da nota de crédito
  const generateNextNumber = () => {
    const currentYear = new Date().getFullYear();
    const randomNumber = Math.floor(Math.random() * 9999) + 1;
    return `NC-${currentYear}-${String(randomNumber).padStart(4, '0')}`;
  };

  // Preencher dados quando o modal abrir
  useEffect(() => {
    if (open && payment) {
      setFormData({
        motivo: `Anulação da fatura ${payment.fatura}`,
        observacao: '',
        numeroNotaCredito: generateNextNumber()
      });
    }
  }, [open, payment]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment) return;

    try {
      const creditNoteData = {
        designacao: formData.motivo,
        fatura: payment.fatura || '',
        descricao: formData.observacao || formData.motivo, // Usar observação ou motivo como descrição
        valor: payment.preco.toString(), // Converter para string conforme schema
        codigo_aluno: payment.codigo_Aluno,
        documento: payment.fatura || '',
        next: '',
        dataOperacao: new Date().toISOString().split('T')[0] // Data atual no formato YYYY-MM-DD
      };

      console.log('[CreditNoteModal] Enviando dados:', creditNoteData);
      
      await createNotaCredito.mutateAsync(creditNoteData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao criar nota de crédito:', error);
      toast.error(error.message || 'Erro ao criar nota de crédito');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value).replace('AOA', 'Kz');
  };

  if (!open || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              Criar Nota de Crédito
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Preencha os dados para anular a fatura e reverter o pagamento
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Informações do Pagamento */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Informações do Pagamento</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Aluno:</span>
                <p className="font-medium">{payment.aluno?.nome}</p>
              </div>
              <div>
                <span className="text-gray-600">Documento:</span>
                <p className="font-medium">{payment.aluno?.n_documento_identificacao}</p>
              </div>
              <div>
                <span className="text-gray-600">Serviço:</span>
                <p className="font-medium">{payment.tipoServico?.designacao}</p>
              </div>
              <div>
                <span className="text-gray-600">Mês/Ano:</span>
                <p className="font-medium">{payment.mes}</p>
              </div>
              <div>
                <span className="text-gray-600">Valor:</span>
                <p className="font-medium text-green-600">{formatCurrency(payment.preco)}</p>
              </div>
              <div>
                <span className="text-gray-600">Fatura:</span>
                <p className="font-medium">{payment.fatura}</p>
              </div>
            </div>
          </div>

          {/* Alerta de Aviso */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>Atenção:</strong> Esta ação irá anular permanentemente a fatura e reverter o pagamento. 
              Os meses pagos serão revertidos no histórico do aluno. Esta operação não pode ser desfeita.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Número da Nota de Crédito */}
            <div>
              <label htmlFor="numeroNotaCredito" className="block text-sm font-medium text-gray-700 mb-1">
                Número da Nota de Crédito
              </label>
              <input
                id="numeroNotaCredito"
                type="text"
                value={formData.numeroNotaCredito}
                onChange={(e) => handleInputChange('numeroNotaCredito', e.target.value)}
                placeholder="NC-2024-0001"
                required
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Gerado automaticamente</p>
            </div>

            {/* Motivo */}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
                Motivo da Anulação *
              </label>
              <input
                id="motivo"
                type="text"
                value={formData.motivo}
                onChange={(e) => handleInputChange('motivo', e.target.value)}
                placeholder="Motivo da anulação"
                required
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.motivo.length}/200 caracteres</p>
            </div>

            {/* Observação */}
            <div>
              <label htmlFor="observacao" className="block text-sm font-medium text-gray-700 mb-1">
                Observação Detalhada
              </label>
              <textarea
                id="observacao"
                value={formData.observacao}
                onChange={(e) => handleInputChange('observacao', e.target.value)}
                placeholder="Descreva o motivo detalhado da anulação..."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.observacao.length}/500 caracteres</p>
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                Valor a Anular
              </label>
              <input
                id="valor"
                type="text"
                value={formatCurrency(payment.preco)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Valor original do pagamento</p>
            </div>

            {createNotaCredito.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  {createNotaCredito.error?.message || 'Erro ao criar nota de crédito'}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={createNotaCredito.isPending}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createNotaCredito.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createNotaCredito.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Anular Fatura
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreditNoteModal;
