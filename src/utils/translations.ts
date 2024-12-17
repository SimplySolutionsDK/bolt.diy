export const translations = {
  en: {
    common: {
      appName: 'TickTalk'
    },
    user: {
      profile: 'User Profile',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      company: 'Company',
      staff: 'Staff',
      customer: 'Customer',
      memberSince: 'Member Since'
    },
    auth: {
      login: {
        title: 'Sign In',
        email: 'Email address',
        password: 'Password',
        submit: 'Sign in',
        createAccount: 'Create an account',
        noAccount: 'New to TickTalk?',
        continueWith: 'Or continue with',
        error: 'Invalid email or password',
        forgotPassword: 'Forgot your password?'
      },
      resetPassword: {
        title: 'Reset Password',
        description: 'Enter your email address and we will send you instructions to reset your password.',
        email: 'Email address',
        submit: 'Send reset instructions',
        backToLogin: 'Back to login',
        error: 'Failed to send reset instructions. Please try again.',
        successTitle: 'Check your email',
        successMessage: 'If an account exists with this email, you will receive password reset instructions.'
      },
      register: {
        title: 'Create Account',
        fullName: 'Full name',
        email: 'Email address',
        password: 'Password',
        accountType: 'Account type',
        customer: 'Customer',
        staff: 'Staff',
        submit: 'Create account',
        hasAccount: 'Already have an account?',
        signIn: 'Sign in instead',
        continueWith: 'Or continue with',
        error: 'Failed to create account. Please try again.',
        googleError: 'Failed to sign in with Google. Please try again.'
      }
    },
    nav: {
      home: 'Home',
      dashboard: 'Dashboard',
      customerDashboard: 'Customer Overview',
      staffDashboard: 'Staff Overview',
      consultantDashboard: 'Consultant Overview',
      balances: 'Balances',
      time: 'Time',
      activeBalances: 'Active Balances',
      activeFeatures: 'Active Features',
      totalHours: 'Total Hours',
      activeCustomers: 'Active Customers',
      companies: 'Companies',
      admin: 'Admin',
      settings: 'Settings',
      features: 'Features'
    },
    company: {
      information: 'Company Information',
      users: 'Company Users',
      totalUsers: 'users',
      noUsers: 'No users found for this company',
      serviceTypes: 'Service Types',
      description: 'Description',
      editCompany: 'Edit Company',
      saveChanges: 'Save Changes'
    },
    time: {
      title: 'Time Tracking',
      selectBalance: 'Select Balance',
      logTransaction: 'Log Transaction',
      trackTime: 'Track Time',
      addTransaction: 'Add Transaction',
      willRemain: 'will remain after this transaction',
      noBalanceSelected: 'No balance selected',
      selectBalancePrompt: 'Select a balance to view and log transactions',
      noActiveBalances: 'No active balances',
      createBalancePrompt: 'Create a balance to start tracking',
      hoursRemaining: 'hours remaining',
      creditsRemaining: 'credits remaining',
      loggedOn: 'Logged on',
      consultant: 'Consultant',
      hoursUsed: 'used',
      creditsUsed: 'spent'
    },
    balances: {
      title: 'Balance Management',
      timersTotal: 'Timer i alt',
      timersRemaining: 'Timer tilbage',
      creditsTotal: 'Kreditter i alt', 
      creditsRemaining: 'Kreditter tilbage',
      createBalance: 'Create Balance',
      initialBalance: 'Initial Balance',
      balanceType: 'Type',
      balanceTypes: {
        hours: 'Hours',
        credits: 'Credits'
      },
      currentBalance: 'Current Balance',
      expiryDate: 'Expiry Date',
      notes: 'Notes',
      notesPlaceholder: 'Additional notes about this balance...',
      cancel: 'Cancel',
      create: 'Create Balance',
      delete: 'Delete Balance',
      deleteConfirm: 'Are you sure you want to delete balance {balanceNumber}? This action cannot be undone.',
      noBalances: 'No balances found',
      createPrompt: 'Get started by creating a new balance',
      total: 'total',
      expires: 'Expires',
      expired: 'This balance has expired',
      lowBalance: 'Low balance warning',
      status: {
        inactive: 'Inactive',
        lowBalance: 'Low Balance',
        mediumBalance: 'Medium Balance',
        goodBalance: 'Good Balance'
      }
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      selectLanguage: 'Select your preferred language',
      english: 'English',
      danish: 'Danish',
      saved: 'Settings saved successfully',
    },
    upgrade: {
      consultantPlan: 'Consultant Plan',
      consultantDescription: 'Upgrade to consultant status and unlock advanced features',
      features: 'What\'s included',
      featuresList: [
        'Create and manage your own prepaid cards',
        'Advanced time tracking features',
        'Priority support',
        'Custom branding options',
        'Detailed analytics and reports'
      ],
      month: 'month',
      upgradeNow: 'Upgrade Now',
      alreadyConsultant: 'You\'re a Consultant',
      enjoyBenefits: 'Enjoy all the benefits of your consultant subscription',
      upgradeSuccess: 'Upgrade Successful!',
      processingUpgrade: 'Your account is being upgraded to consultant status...'
    },
    features: {
      title: 'Feature Management',
      createFeature: 'Create Feature',
      noFeatures: 'No features found',
      createPrompt: 'Get started by creating a new feature request',
      priority: {
        high: 'High Priority',
        medium: 'Medium Priority',
        low: 'Low Priority'
      },
      status: {
        proposed: 'Proposed',
        scoping: 'Scoping',
        in_progress: 'In Progress',
        completed: 'Completed'
      },
      details: {
        description: 'Description',
        assignCustomer: 'Assign Customer',
        assignConsultant: 'Assign Consultant',
        selectCustomer: 'Select a customer',
        selectConsultant: 'Select a consultant',
        createdAt: 'Created',
        lastUpdated: 'Last Updated'
      },
      form: {
        title: 'Title',
        titlePlaceholder: 'Enter feature title',
        description: 'Description',
        descriptionPlaceholder: 'Describe the feature in detail',
        assignConsultant: 'Assign Consultant',
        selectConsultant: 'Select a consultant',
        priority: 'Priority',
        status: 'Status',
        submit: 'Submit Feature',
        cancel: 'Cancel'
      }
    }
  },
  da: {
    common: {
      appName: 'TickTalk'
    },
    user: {
      profile: 'Brugerprofil',
      name: 'Navn',
      email: 'Email',
      role: 'Rolle',
      company: 'Virksomhed',
      staff: 'Medarbejder',
      customer: 'Kunde',
      memberSince: 'Medlem Siden'
    },
    auth: {
      login: {
        title: 'Log Ind',
        email: 'Email adresse',
        password: 'Adgangskode',
        submit: 'Log ind',
        createAccount: 'Opret konto',
        noAccount: 'Ny hos TickTalk?',
        continueWith: 'Eller fortsæt med',
        error: 'Ugyldig email eller adgangskode',
        forgotPassword: 'Glemt din adgangskode?'
      },
      resetPassword: {
        title: 'Nulstil Adgangskode',
        description: 'Indtast din email adresse, og vi sender dig instruktioner til at nulstille din adgangskode.',
        email: 'Email adresse',
        submit: 'Send instruktioner',
        backToLogin: 'Tilbage til login',
        error: 'Kunne ikke sende instruktioner. Prøv igen.',
        successTitle: 'Tjek din email',
        successMessage: 'Hvis der findes en konto med denne email, vil du modtage instruktioner til at nulstille din adgangskode.'
      },
      register: {
        title: 'Opret Konto',
        fullName: 'Fulde navn',
        email: 'Email adresse',
        password: 'Adgangskode',
        accountType: 'Kontotype',
        customer: 'Kunde',
        staff: 'Medarbejder',
        submit: 'Opret konto',
        hasAccount: 'Har du allerede en konto?',
        signIn: 'Log ind i stedet',
        continueWith: 'Eller fortsæt med',
        error: 'Kunne ikke oprette konto. Prøv igen.',
        googleError: 'Kunne ikke logge ind med Google. Prøv igen.'
      }
    },
    nav: {
      home: 'Hjem',
      dashboard: 'Dashboard',
      customerDashboard: 'Kunde Oversigt',
      staffDashboard: 'Medarbejder Oversigt',
      consultantDashboard: 'Konsulent Oversigt',
      balances: 'Saldi',
      time: 'Tid',
      activeBalances: 'Aktive Saldi',
      activeFeatures: 'Aktive Funktioner',
      totalHours: 'Samlede Timer',
      activeCustomers: 'Aktive Kunder',
      companies: 'Virksomheder',
      admin: 'Admin',
      settings: 'Indstillinger',
      features: 'Funktioner'
    },
    company: {
      information: 'Virksomhedsinformation',
      users: 'Virksomhedsbrugere',
      totalUsers: 'brugere',
      noUsers: 'Ingen brugere fundet for denne virksomhed',
      serviceTypes: 'Servicetyper',
      description: 'Beskrivelse',
      editCompany: 'Rediger Virksomhed',
      saveChanges: 'Gem Ændringer'
    },
    time: {
      title: 'Tidsregistrering',
      selectBalance: 'Vælg Saldo',
      logTransaction: 'Registrer Transaktion',
      trackTime: 'Spor Tid',
      addTransaction: 'Tilføj Transaktion',
      willRemain: 'vil være tilbage efter denne transaktion',
      noBalanceSelected: 'Ingen saldo valgt',
      selectBalancePrompt: 'Vælg en saldo for at se og registrere transaktioner',
      noActiveBalances: 'Ingen aktive saldi',
      createBalancePrompt: 'Opret en saldo for at begynde',
      hoursRemaining: 'timer tilbage',
      creditsRemaining: 'kreditter tilbage',
      loggedOn: 'Registreret den',
      consultant: 'Konsulent',
      hoursUsed: 'brugt',
      creditsUsed: 'brugt'
    },
    balances: {
      title: 'Saldo Administration',
      timersTotal: 'Timer i alt',
      timersRemaining: 'Timer tilbage',
      creditsTotal: 'Kreditter i alt',
      creditsRemaining: 'Kreditter tilbage',
      createBalance: 'Opret Saldo',
      initialBalance: 'Start Saldo',
      balanceType: 'Type',
      balanceTypes: {
        hours: 'Timer',
        credits: 'Kreditter'
      },
      currentBalance: 'Nuværende Saldo',
      expiryDate: 'Udløbsdato',
      notes: 'Noter',
      notesPlaceholder: 'Yderligere noter om denne saldo...',
      cancel: 'Annuller',
      create: 'Opret Saldo',
      delete: 'Slet Saldo',
      deleteConfirm: 'Er du sikker på, at du vil slette saldo {balanceNumber}? Denne handling kan ikke fortrydes.',
      noBalances: 'Ingen saldi fundet',
      createPrompt: 'Kom i gang ved at oprette en ny saldo',
      total: 'i alt',
      expires: 'Udløber',
      expired: 'Denne saldo er udløbet',
      lowBalance: 'Advarsel om lav saldo',
      status: {
        inactive: 'Inaktiv',
        lowBalance: 'Lav Saldo',
        mediumBalance: 'Medium Saldo',
        goodBalance: 'God Saldo'
      }
    },
    settings: {
      title: 'Indstillinger',
      language: 'Sprog',
      selectLanguage: 'Vælg dit foretrukne sprog',
      english: 'Engelsk',
      danish: 'Dansk',
      saved: 'Indstillinger gemt',
    },
    upgrade: {
      consultantPlan: 'Konsulent Plan',
      consultantDescription: 'Opgrader til konsulent status og få adgang til avancerede funktioner',
      features: 'Hvad er inkluderet',
      featuresList: [
        'Opret og administrer dine egne forudbetalte kort',
        'Avancerede tidssporingsfunktioner',
        'Prioriteret support',
        'Tilpassede brandingmuligheder',
        'Detaljerede analyser og rapporter'
      ],
      month: 'måned',
      upgradeNow: 'Opgrader Nu',
      alreadyConsultant: 'Du er Konsulent',
      enjoyBenefits: 'Nyd alle fordelene ved dit konsulent abonnement',
      upgradeSuccess: 'Opgradering Gennemført!',
      processingUpgrade: 'Din konto bliver opgraderet til konsulent status...'
    },
    features: {
      title: 'Funktionsstyring',
      createFeature: 'Opret Funktion',
      noFeatures: 'Ingen funktioner fundet',
      createPrompt: 'Kom i gang ved at oprette en ny funktionsanmodning',
      priority: {
        high: 'Høj Prioritet',
        medium: 'Medium Prioritet',
        low: 'Lav Prioritet'
      },
      status: {
        proposed: 'Foreslået',
        scoping: 'Under Vurdering',
        in_progress: 'Under Udvikling',
        completed: 'Færdig'
      },
      details: {
        description: 'Beskrivelse',
        assignCustomer: 'Tildel Kunde',
        assignConsultant: 'Tildel Konsulent',
        selectCustomer: 'Vælg en kunde',
        selectConsultant: 'Vælg en konsulent',
        createdAt: 'Oprettet',
        lastUpdated: 'Sidst Opdateret'
      },
      form: {
        title: 'Titel',
        titlePlaceholder: 'Indtast funktionstitel',
        description: 'Beskrivelse',
        descriptionPlaceholder: 'Beskriv funktionen i detaljer',
        assignConsultant: 'Tildel Konsulent',
        selectConsultant: 'Vælg en konsulent',
        priority: 'Prioritet',
        status: 'Status',
        submit: 'Indsend Funktion',
        cancel: 'Annuller'
      }
    }
  },
} as const;