import { useState, useEffect } from 'react'
import { Loader2, Download } from 'lucide-react'
import Container from '../../components/layout/Container'
import { DirectorService, type IDirectorTurma } from '../../services/director.service'
import { BoletimWordGenerator } from '../../utils/BoletimWordGenerator'
import { toast } from 'react-toastify'

export default function DirectorBoletins() {
  const [loading, setLoading] = useState(false)
  const [turmasDirigidas, setTurmasDirigidas] = useState<IDirectorTurma[]>([])
  
  const [selectedTurmaId, setSelectedTurmaId] = useState('')
  const [selectedTrimestreId, setSelectedTrimestreId] = useState('1')

  const TRIMESTRES = [
    { codigo: 1, designacao: '1º Trimestre' },
    { codigo: 2, designacao: '2º Trimestre' },
    { codigo: 3, designacao: '3º Trimestre' },
  ]

  const selectedTurma = turmasDirigidas.find(t => t.codigo_Turma.toString() === selectedTurmaId)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const turmas = await DirectorService.getMinhasTurmas()
      setTurmasDirigidas(turmas)
    } catch (error) {
      console.error(error)
    }
  }

  const handleGenerateBoletins = async () => {
    if (!selectedTurma || !selectedTrimestreId) {
      toast.warning('Selecione uma turma e um trimestre.')
      return;
    }

    try {
      setLoading(true)
      const data = await DirectorService.getBoletimTurma(
        selectedTurma.codigo_Turma, 
        parseInt(selectedTrimestreId), 
        parseInt(String(selectedTurma.tb_turmas?.codigo || '1')) // need to pass anoLectivoId, but our backend can figure it out or we send it
      )
      
      await BoletimWordGenerator.generateWord(data)

      toast.success('Boletins gerados com sucesso!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao gerar boletins.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Emissão de Boletins</h1>
          <p className="text-gray-500 text-sm mt-1">Gere os boletins de aproveitamento para as suas turmas.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">A Minha Turma</label>
              <select
                value={selectedTurmaId}
                onChange={e => setSelectedTurmaId(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-[#007C00] outline-none bg-gray-50"
              >
                <option value="">Selecione...</option>
                {turmasDirigidas.map(t => (
                  <option key={t.codigo_Turma} value={t.codigo_Turma}>
                    {t.tb_turmas?.designacao} - {t.tb_turmas?.tb_classes?.designacao || ''} ({t.anoLectivo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Trimestre</label>
              <select
                value={selectedTrimestreId}
                onChange={e => setSelectedTrimestreId(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:ring-[#007C00] outline-none bg-gray-50"
              >
                {TRIMESTRES.map(t => (
                  <option key={t.codigo} value={t.codigo}>{t.designacao}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleGenerateBoletins}
              disabled={loading || !selectedTurmaId}
              className="px-8 py-4 bg-[#007C00] hover:bg-[#005a00] text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
              Gerar Boletins da Turma
            </button>
          </div>
        </div>
      </div>
    </Container>
  )
}
