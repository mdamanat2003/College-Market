export type LanguageCode = 'en' | 'hi' | 'ar';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

export const translations = {
  en: {
    // Common
    appName: 'Ooplabdh',
    selectLanguage: 'Select Language',
    backToHome: 'Back to Home',
    cancel: 'Cancel',
    loading: 'Loading...',

    // Login Screen
    welcomeBack: 'Welcome Back',
    signInSubtitle: 'Sign in to continue to Ooplabdh',
    emailAddress: 'Email Address',
    emailPlaceholder: 'you@college.edu',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign Up',
    hidePassword: 'Hide password',
    showPassword: 'Show password',

    // Validation & Errors
    emailRequired: 'Email is required.',
    passwordRequired: 'Password is required.',
    adminLoginNotAllowed: 'Admin login is not allowed from here. Please use the Admin Portal.',
    welcomeMessage: 'Welcome back!',
    hiUser: 'Hi',
    serverError: 'Server error. Is the backend running?',
    loginFailed: 'Login failed',

    // Register Screen
    createAccount: 'Create Account',
    joinOoplabdh: 'Join Ooplabdh college community',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Rahul Sharma',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    collegeName: 'College Name',
    collegePlaceholder: 'e.g. IIT Delhi, DU',
    phoneOptional: 'Phone Number (Optional)',
    alreadyHaveAccount: 'Already have an account?',

    // Navigation & Tabs
    home: 'Home',
    academic: 'Academic',
    chat: 'Chat',
    community: 'Community',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    language: 'Language',
  },

  hi: {
    // Common
    appName: 'उपलब्ध',
    selectLanguage: 'भाषा चुनें',
    backToHome: 'होम पर वापस जाएं',
    cancel: 'रद्द करें',
    loading: 'लोड हो रहा है...',

    // Login Screen
    welcomeBack: 'वापसी पर स्वागत है',
    signInSubtitle: 'उपलब्ध पर जारी रखने के लिए साइन इन करें',
    emailAddress: 'ईमेल पता',
    emailPlaceholder: 'you@college.edu',
    password: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    signIn: 'साइन इन करें',
    dontHaveAccount: 'क्या आपके पास खाता नहीं है?',
    signUp: 'साइन अप करें',
    hidePassword: 'पासवर्ड छिपाएं',
    showPassword: 'पासवर्ड दिखाएं',

    // Validation & Errors
    emailRequired: 'ईमेल आवश्यक है।',
    passwordRequired: 'पासवर्ड आवश्यक है।',
    adminLoginNotAllowed: 'एडमिन लॉगिन की अनुमति यहां से नहीं है। कृपया एडमिन पोर्टल का उपयोग करें।',
    welcomeMessage: 'वापसी पर स्वागत है!',
    hiUser: 'नमस्ते',
    serverError: 'सर्वर त्रुटि। क्या बैकएंड चल रहा है?',
    loginFailed: 'लॉगिन विफल रहा',

    // Register Screen
    createAccount: 'खाता बनाएं',
    joinOoplabdh: 'उपलब्ध कॉलेज समुदाय से जुड़ें',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'राहुल शर्मा',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'अपने पासवर्ड की पुष्टि करें',
    collegeName: 'कॉलेज का नाम',
    collegePlaceholder: 'जैसे आईआईटी दिल्ली, डीयू',
    phoneOptional: 'फोन नंबर (वैकल्पिक)',
    alreadyHaveAccount: 'क्या आपके पास पहले से एक खाता मौजूद है?',

    // Navigation & Tabs
    home: 'होम',
    academic: 'अकादमिक',
    chat: 'चैट',
    community: 'कम्युनिटी',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    language: 'भाषा',
  },

  ar: {
    // Common
    appName: 'أوبلابذ',
    selectLanguage: 'اختر اللغة',
    backToHome: 'العودة إلى الرئيسية',
    cancel: 'إلغاء',
    loading: 'جاري التحميل...',

    // Login Screen
    welcomeBack: 'مرحباً بعودتك',
    signInSubtitle: 'تسجيل الدخول للمتابعة في أوبلابذ',
    emailAddress: 'البريد الإلكتروني',
    emailPlaceholder: 'you@college.edu',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور الخاصة بك',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    dontHaveAccount: 'ليس لديك حساب؟',
    signUp: 'إنشاء حساب',
    hidePassword: 'إخفاء كلمة المرور',
    showPassword: 'إظهار كلمة المرور',

    // Validation & Errors
    emailRequired: 'البريد الإلكتروني مطلوب.',
    passwordRequired: 'كلمة المرور مطلوبة.',
    adminLoginNotAllowed: 'تسجيل دخول المسؤول غير مسموح به من هنا. يرجى استخدام بوابة المسؤول.',
    welcomeMessage: 'مرحباً بعودتك!',
    hiUser: 'مرحباً',
    serverError: 'خطأ في الخادم. هل يعمل الخادم الخلفي؟',
    loginFailed: 'فشل تسجيل الدخول',

    // Register Screen
    createAccount: 'إنشاء حساب جديد',
    joinOoplabdh: 'انضم إلى مجتمع كليتك في أوبلابذ',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'أحمد علي',
    confirmPassword: 'تأكيد كلمة المرور',
    confirmPasswordPlaceholder: 'أكد كلمة المرور الخاص بك',
    collegeName: 'اسم الكلية',
    collegePlaceholder: 'مثل جامعة القاهرة، IIT',
    phoneOptional: 'رقم الهاتف (اختياري)',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',

    // Navigation & Tabs
    home: 'الرئيسية',
    academic: 'أكاديمي',
    chat: 'المحادثة',
    community: 'المجتمع',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    language: 'اللغة',
  },
} as const;

export type TranslationKeys = keyof typeof translations.en;
