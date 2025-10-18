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
      'students.contact': 'Contato',
      'students.category': 'Categoria',
      'students.current-belt': 'Faixa Atual',
      'students.actions': 'Ações',
      'students.no-belt': 'Sem faixa',
      'students.not-set': 'Não definido',
      'students.no-students-found': 'Nenhum aluno encontrado',
      'students.adjust-search-terms': 'Tente ajustar os termos de busca',
      'students.created-success': 'Aluno criado com sucesso!',
      'students.updated-success': 'Aluno atualizado com sucesso!',
      'students.deleted-success': 'Aluno excluído com sucesso!',
      'students.form.full-name': 'Nome Completo',
      'students.form.email': 'Email',
      'students.form.cpf': 'CPF',
      'students.form.rg': 'RG',
      'students.form.birth-date': 'Data de Nascimento',
      'students.form.phone': 'Telefone',
      'students.form.alternative-phone': 'Telefone Alternativo',
      'students.form.age-category': 'Categoria de Idade',
      'students.form.address': 'Endereço',
      'students.form.city': 'Cidade',
      'students.form.state': 'Estado',
      'students.form.zip-code': 'CEP',
      'students.form.emergency-contact': 'Contato de Emergência',
      'students.form.emergency-phone': 'Telefone de Emergência',
      'students.form.medical-information': 'Informações Médicas',
      'students.form.save': 'Salvar',
      'students.form.cancel': 'Cancelar',
      'students.form.saving': 'Salvando...',
      'students.form.update-student': 'Atualizar Aluno',
      'students.form.create-student': 'Criar Aluno',

      // Navigation menu
      'nav.dashboard': 'Dashboard',
      'nav.students': 'Alunos',
      'nav.guardians': 'Responsáveis',
      'nav.graduations': 'Graduações',
      'nav.financial': 'Financeiro',
      'nav.products': 'Produtos',
      'nav.reports': 'Relatórios',
      'nav.settings': 'Configurações',

      // Error messages
      'error.invalid-cpf': 'Por favor, digite um CPF válido',
      'error.guardian-search': 'Erro ao buscar responsável. Tente novamente.',
      'error.children-require-guardian':
        'Crianças precisam de um responsável. Procure ou adicione um responsável.',
      'error.saving-student': 'Erro ao salvar aluno. Tente novamente.',
      'success.guardian-found': 'Responsável encontrado!',
      'info.guardian-not-found':
        'Responsável não encontrado. Preencha os dados para cadastrar um novo.',
      'students.search-placeholder': 'Buscar por nome, email ou CPF...',
      'students.sort-by': 'Ordenar por',
      'students.sort-name': 'Nome',
      'students.sort-category': 'Categoria',
      'students.sort-belt': 'Faixa/Graduação',

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
      'welcome.instruction':
        'Comece criando seu primeiro aluno no menu Alunos (sidebar → Alunos → Novo Aluno)',
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
      'students.contact': 'Contact',
      'students.category': 'Category',
      'students.current-belt': 'Current Belt',
      'students.actions': 'Actions',
      'students.no-belt': 'No belt',
      'students.not-set': 'Not Set',
      'students.no-students-found': 'No students found',
      'students.adjust-search-terms': 'Try adjusting your search terms',
      'students.created-success': 'Student created successfully!',
      'students.updated-success': 'Student updated successfully!',
      'students.deleted-success': 'Student deleted successfully!',
      'students.form.full-name': 'Full Name',
      'students.form.email': 'Email',
      'students.form.cpf': 'CPF',
      'students.form.rg': 'RG',
      'students.form.birth-date': 'Birth Date',
      'students.form.phone': 'Phone',
      'students.form.alternative-phone': 'Alternative Phone',
      'students.form.age-category': 'Age Category',
      'students.form.address': 'Address',
      'students.form.city': 'City',
      'students.form.state': 'State',
      'students.form.zip-code': 'ZIP Code',
      'students.form.emergency-contact': 'Emergency Contact',
      'students.form.emergency-phone': 'Emergency Phone',
      'students.form.medical-information': 'Medical Information',
      'students.form.save': 'Save',
      'students.form.cancel': 'Cancel',
      'students.form.saving': 'Saving...',
      'students.form.update-student': 'Update Student',
      'students.form.create-student': 'Create Student',

      // Navigation menu
      'nav.dashboard': 'Dashboard',
      'nav.students': 'Students',
      'nav.guardians': 'Guardians',
      'nav.graduations': 'Graduations',
      'nav.financial': 'Financial',
      'nav.products': 'Products',
      'nav.reports': 'Reports',
      'nav.settings': 'Settings',

      // Error messages
      'error.invalid-cpf': 'Please enter a valid CPF',
      'error.guardian-search':
        'Error searching for guardian. Please try again.',
      'error.children-require-guardian':
        'Children require a guardian. Please search for or add a guardian.',
      'error.saving-student': 'Error saving student. Please try again.',
      'success.guardian-found': 'Guardian found!',
      'info.guardian-not-found':
        'Guardian not found. Please fill in the details to register a new one.',
      'students.search-placeholder': 'Search by name, email, or CPF...',
      'students.sort-by': 'Sort by',
      'students.sort-name': 'Name',
      'students.sort-category': 'Age Category',
      'students.sort-belt': 'Belt/Graduation',

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
      'welcome.instruction':
        'Start by creating your first student in the Students menu (sidebar → Students → New Student)',
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
