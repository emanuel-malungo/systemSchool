import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import os from 'os';

// Importar utilitários BigInt
import { bigIntMiddleware } from './utils/bigint.utils.js';

// Importar rotas
import authRoutes from './routes/auth.routes.js';
import userssRoutes from './routes/users.routes.js';
import geographicRoutes from './routes/geographic.routes.js';
import institutionalRoutes from './routes/institutional.routes.js';
import institutionalManagementRoutes from './routes/institutional-management.routes.js';
import academicManagementRoutes from './routes/academic-management.routes.js';
import academicManagementReportsRoutes from './routes/academic-management-reports.routes.js';
import studentManagementRoutes from './routes/student-management.routes.js';
import statusControlRoutes from './routes/status-control.routes.js';
import financialServicesRoutes from './routes/financial-services.routes.js';
import paymentManagementRoutes from './routes/payment-management.routes.js';
import saftRoutes from './routes/saft.routes.js';
import academicStaffRoutes from './routes/academic-staff.routes.js';
import academicEvaluationRoutes from './routes/academic-evaluation.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportsManagementRoutes from './routes/reports-management.routes.js';
import financialManagementReportsRoutes from './routes/financial-management-reports.routes.js';

// Importar Swagger
import { swaggerDocs } from './config/swagger.js';

dotenv.config();

const app = express();

// Middlewares globais
app.use(morgan('dev'));

// Configuração CORS mais específica
app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para lidar com BigInt automaticamente
app.use(bigIntMiddleware);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Jomorais Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      geographic: '/api/geographic',
      institutional: '/api/institutional',
      institutionalManagement: '/api/institutional-management',
      academicManagement: '/api/academic-management',
      academicManagementReports: '/api/academic-management/reports',
      studentManagement: '/api/student-management',
      statusControl: '/api/status-control',
      financialServices: '/api/financial-services',
      paymentManagement: '/api/payment-management',
      academicStaff: '/api/academic-staff',
      academicEvaluation: '/api/academic-evaluation',
      dashboard: '/api/dashboard',
      reportsManagement: '/api/reports-management',
      financialManagementReports: '/api/financial-management/reports',
      docs: '/api/docs'
    }
  });
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userssRoutes);
app.use('/api/geographic', geographicRoutes);
app.use('/api/institutional', institutionalRoutes);
app.use('/api/institutional-management', institutionalManagementRoutes);
app.use('/api/academic-management', academicManagementRoutes);
app.use('/api/academic-management/reports', academicManagementReportsRoutes);
app.use('/api/student-management', studentManagementRoutes);
app.use('/api/status-control', statusControlRoutes);
app.use('/api/financial-services', financialServicesRoutes);
app.use('/api/payment-management', paymentManagementRoutes);
app.use('/api/finance-management/saft', saftRoutes);
app.use('/api/academic-staff', academicStaffRoutes);
app.use('/api/academic-evaluation', academicEvaluationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports-management', reportsManagementRoutes);
app.use('/api/financial-management/reports', financialManagementReportsRoutes);

// Documentação Swagger
swaggerDocs(app);

// Middleware de tratamento de erros globais (deve ser o último)
app.use((err, req, res, next) => {
  console.error('Erro global capturado:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Função para obter o IP da rede local
const getLocalIP = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log(`🚀 Servidor rodando em ${BASE_URL}`);
  console.log(`📡 Acesso local: http://localhost:${PORT}`);
  console.log(`🌐 Acesso na rede: http://${localIP}:${PORT}`);
});
