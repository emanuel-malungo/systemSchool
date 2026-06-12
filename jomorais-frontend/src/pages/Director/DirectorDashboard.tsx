import { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, CheckCircle } from 'lucide-react';
import { DirectorService } from '../../services/director.service';
import Container from '../../components/layout/Container';

export default function DirectorDashboard() {
  const [stats, setStats] = useState({ turmas: 0, disciplinas: 0 });
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const p = await DirectorService.getPerfil();
        setPerfil(p);
        
        const turmas = await DirectorService.getMinhasTurmas();
        let totalDisciplinas = 0;
        turmas.forEach(t => {
          totalDisciplinas += t.disciplinas?.length || 0;
        });

        setStats({
          turmas: turmas.length,
          disciplinas: totalDisciplinas
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  return (
    <Container>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Painel do Diretor de Turma</h1>
          <p className="text-gray-500 text-sm mt-1">Bem-vindo(a), {perfil?.Nome || 'Diretor'}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-50 text-blue-600"><Users size={24} /></div>
            <div><p className="text-sm font-semibold text-gray-500">Minhas Turmas</p><h3 className="text-2xl font-bold">{stats.turmas}</h3></div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-xl bg-green-50 text-green-600"><BookOpen size={24} /></div>
            <div><p className="text-sm font-semibold text-gray-500">Disciplinas</p><h3 className="text-2xl font-bold">{stats.disciplinas}</h3></div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-xl bg-purple-50 text-purple-600"><CheckCircle size={24} /></div>
            <div><p className="text-sm font-semibold text-gray-500">Lançamentos</p><h3 className="text-2xl font-bold">Ativo</h3></div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-xl bg-orange-50 text-orange-600"><FileText size={24} /></div>
            <div><p className="text-sm font-semibold text-gray-500">Boletins</p><h3 className="text-2xl font-bold">Gerar</h3></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Bem-vindo ao Portal do Diretor de Turma</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Como Diretor de Turma, você tem permissão especial para gerir completamente as turmas que lhe foram atribuídas:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Lançar notas para <b>todas as disciplinas</b> da sua turma.</li>
            <li>Visualizar e alterar notas lançadas por outros professores para a sua turma.</li>
            <li>Gerar o <b>Boletim de Notas</b> da sua turma.</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
