import { Route, Routes, Navigate } from 'react-router-dom'
import AuthPage from '../pages/Auth'
import Dashboard from '../pages/Admin/Dashboard'
import UsersManagement from '../components/settings-management'
import AnoLectivoManagement from '../pages/Admin/settings-management/AnoLectivoManagement'
import InstitutionManagement from '../pages/Admin/settings-management/InstitutionManagement'
import StudentManagement from '../pages/Admin/student-management/StudentManagement'
import AddStudent from '../pages/Admin/student-management/AddStudent'
import EditStudent from '../pages/Admin/student-management/EditStudent'
import MatriculaManagement from '../pages/Admin/matricula-management/MatriculaManagement'
import AddMatricula from '../pages/Admin/matricula-management/AddMatricula'
import EditMatricula from '../pages/Admin/matricula-management/EditMatricula'
import ConfirmationManagement from '../pages/Admin/confirmation-management/ConfirmationManagement'
import TransferManagement from '../pages/Admin/transfer-management/TransferManagement'
import ProvenienciaManagement from '../pages/Admin/proveniencia-management/ProvenienciaManagement'
import TurmaManagement from '../pages/Admin/turma-management/TurmaManagement'
import CourseManagement from '../pages/Admin/course-management/CourseManagement'
import ClassManagement from '../pages/Admin/class-management/ClassManagement'
import DisciplineManagement from '../pages/Admin/discipline-management/DisciplineManagement'
import RoomManagement from '../pages/Admin/room-management/RoomManagement'
import TeacherManagement from '../pages/Admin/teacher-management/TeacherManagement'
import DisciplineTeacherManagement from '../pages/Admin/discipline-teacher-management/DisciplineTeacherManagement'
import DirectorTurmaManagement from '../pages/Admin/director-turma-management/DirectorTurmaManagement'
import StudentReports from '../pages/Admin/reports-management/StudentReports'
import FinancialReports from '../pages/Admin/financial-reports/FinancialReports'
import AcademicReports from '../pages/Admin/reports-management/AcademicReports'
import { Payments, PaymentCreate, CreditNotes } from '../pages/Admin/payment-management'
import FinancialServicesManagement from '../pages/Admin/financial-services/FinancialServicesManagement'
import { ProtectedRoute } from './protected.routes'
import { PublicRoute } from './public.routes'

export default function IndexRoutes() {
  return (
	<Routes>
	  {/* Rota raiz - redireciona para auth */}
	  <Route path='/' element={<Navigate to='/auth' replace />} />
	  
	  {/* Rotas públicas - apenas para usuários não autenticados */}
	  <Route element={<PublicRoute redirectTo='/admin' />}>
	    <Route path='/auth' element={<AuthPage />} />
	  </Route>
	  
	  {/* Rotas protegidas - apenas para usuários autenticados */}
	  <Route element={<ProtectedRoute />}>
	  	<Route path='/admin' element={<Dashboard />} />
	  	<Route path='/admin/dashboard' element={<Dashboard />} />
	  	<Route path='/admin/users' element={<UsersManagement />} />
	  	<Route path='/admin/settings-management/ano-letivo' element={<AnoLectivoManagement />} />
	  	<Route path='/admin/settings-management/instituicao' element={<InstitutionManagement />} />
	  	<Route path='/admin/student-management' element={<StudentManagement />} />
	  	<Route path='/admin/student-management/student' element={<StudentManagement />} />
	  	<Route path='/admin/student-management/student/add' element={<AddStudent />} />
	  	<Route path='/admin/student-management/student/edit/:id' element={<EditStudent />} />
	  	<Route path='/admin/student-management/enrolls' element={<MatriculaManagement />} />
	  	<Route path='/admin/student-management/enrolls/add' element={<AddMatricula />} />
	  	<Route path='/admin/student-management/enrolls/edit/:id' element={<EditMatricula />} />
	  	<Route path='/admin/student-management/confirmations' element={<ConfirmationManagement />} />
	  	<Route path='/admin/student-management/transfers' element={<TransferManagement />} />
	  	<Route path='/admin/student-management/proveniencias' element={<ProvenienciaManagement />} />
	  	<Route path='/admin/academic-management/turmas' element={<TurmaManagement />} />
	  	<Route path='/admin/academic-management/cursos' element={<CourseManagement />} />
	  	<Route path='/admin/academic-management/classes' element={<ClassManagement />} />
	  	<Route path='/admin/discipline-management' element={<DisciplineManagement />} />
	  	<Route path='/admin/academic-management/salas' element={<RoomManagement />} />
	  	<Route path='/admin/teacher-management/teacher' element={<TeacherManagement />} />
	  	<Route path='/admin/teacher-management/discipline-teacher' element={<DisciplineTeacherManagement />} />
	  	<Route path='/admin/teacher-management/director-turma' element={<DirectorTurmaManagement />} />
	  	<Route path='/admin/reports-management/students' element={<StudentReports />} />
	  	<Route path='/admin/reports-management/financial' element={<FinancialReports />} />
	  	<Route path='/admin/reports-management/academic' element={<AcademicReports />} />
	  	<Route path='/admin/payment-management/payments' element={<Payments />} />
	  	<Route path='/admin/payment-management/create' element={<PaymentCreate />} />
	  	<Route path='/admin/financial-services' element={<FinancialServicesManagement />} />
	  	<Route path='/admin/financeiro/notas-credito' element={<CreditNotes />} />
	  </Route>

	  {/* Rota 404 - redireciona para auth */}
	  <Route path='*' element={<Navigate to='/auth' replace />} />
	</Routes>
  )
}