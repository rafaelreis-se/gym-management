import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  'pt-BR': {
    translation: {
      // Common
      welcome: 'Bem-vindo',
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Excluir',
      search: 'Buscar',
      add: 'Adicionar',
      back: 'Voltar',
      yes: 'Sim',
      no: 'Não',
      confirm: 'Confirmar',
      
      // Navigation
      home: 'Início',
      dashboard: 'Painel',
      students: 'Alunos',
      login: 'Entrar',
      logout: 'Sair',
      profile: 'Perfil',
      settings: 'Configurações',
      
      // Gracie Barra
      'gracie-barra-araxa': 'Gracie Barra Araxá',
      'admin-portal': 'Portal Admin',
      'student-portal': 'Portal do Aluno',
      
      // Student
      'students.title': 'Gestão de Alunos',
      'students.new': 'Novo Aluno',
      'students.edit': 'Editar Aluno',
      'students.list': 'Lista de Alunos',
      'students.name': 'Nome',
      'students.email': 'E-mail',
      'students.phone': 'Telefone',
      'students.status': 'Status',
      'students.belt': 'Faixa',
      'students.enrollment-date': 'Data de Matrícula',
      
      // Status
      'status.active': 'Ativo',
      'status.inactive': 'Inativo',
      'status.suspended': 'Suspenso',
      'status.cancelled': 'Cancelado',
      
      // Messages
      'messages.success.save': 'Salvo com sucesso!',
      'messages.success.delete': 'Excluído com sucesso!',
      'messages.error.generic': 'Ocorreu um erro. Tente novamente.',
      'messages.confirm.delete': 'Tem certeza que deseja excluir?',
      
      // Welcome messages
      'welcome.admin': 'Bem-vindo ao Gracie Barra Araxá Admin',
      'welcome.student': 'Bem-vindo ao seu painel de treinamento!',
      'welcome.instruction': 'Comece criando seu primeiro aluno no menu Alunos (sidebar → Alunos → Novo Aluno)',
    },
  },
  'en-US': {
    translation: {
      // Common
      welcome: 'Welcome',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      add: 'Add',
      back: 'Back',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      
      // Navigation
      home: 'Home',
      dashboard: 'Dashboard',
      students: 'Students',
      login: 'Login',
      logout: 'Logout',
      profile: 'Profile',
      settings: 'Settings',
      
      // Gracie Barra
      'gracie-barra-araxa': 'Gracie Barra Araxá',
      'admin-portal': 'Admin Portal',
      'student-portal': 'Student Portal',
      
      // Student
      'students.title': 'Student Management',
      'students.new': 'New Student',
      'students.edit': 'Edit Student',
      'students.list': 'Student List',
      'students.name': 'Name',
      'students.email': 'Email',
      'students.phone': 'Phone',
      'students.status': 'Status',
      'students.belt': 'Belt',
      'students.enrollment-date': 'Enrollment Date',
      
      // Status
      'status.active': 'Active',
      'status.inactive': 'Inactive',
      'status.suspended': 'Suspended',
      'status.cancelled': 'Cancelled',
      
      // Messages
      'messages.success.save': 'Saved successfully!',
      'messages.success.delete': 'Deleted successfully!',
      'messages.error.generic': 'An error occurred. Please try again.',
      'messages.confirm.delete': 'Are you sure you want to delete?',
      
      // Welcome messages
      'welcome.admin': 'Welcome to Gracie Barra Araxá Admin',
      'welcome.student': 'Welcome to your training dashboard!',
      'welcome.instruction': 'Start by creating your first student in the Students menu (sidebar → Students → New Student)',
    },
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'pt-BR', // Default language
    lng: 'pt-BR', // Initial language
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

