const translations = {
  en: {
    // Sidebar
    dashboard: 'Dashboard',
    aiChat: 'AI Chat',
    moodTracker: 'Mood Tracker',
    journal: 'Journal',
    insights: 'Insights',
    settings: 'Settings',
    logout: 'Logout',

    // Dashboard
    goodMorning: 'Good morning, John 😊',
    goodAfternoon: 'Good afternoon, John ☀️',
    goodEvening: 'Good evening, John 🌙',
    aiGreetingHappy: "I noticed you've been feeling better lately. Keep it up!",
    aiGreetingCalm: "You seem at peace today. That's wonderful to see.",
    aiGreetingSad: "I'm here for you. Let's take things one step at a time.",
    aiGreetingStressed: "I sense some tension. How about a quick breathing exercise?",
    aiGreetingAnxious: "Take a deep breath. You're doing better than you think.",
    dashboardSubtitle: 'Here is a summary of your mental well-being today.',
    dayStreak: 'Streak',
    mindful: 'Mindful',
    currentMood: 'Current Mood',
    happy: 'Happy',
    stressLevel: 'Stress Level',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    tipOfTheDay: 'Tip of the Day',
    tipText: '"Take 5 minutes to practice deep breathing. Need help? Try our AI guide."',
    personalizedSuggestions: 'Personalized Suggestions',
    guidedBreathing: 'Guided Breathing',
    guidedBreathingDesc: 'Take 1 minute to center yourself and reduce stress.',
    practiceGratitude: 'Practice Gratitude',
    practiceGratitudeDesc: 'Write down 3 things you are grateful for today.',
    quickActions: 'Quick Actions',
    chatWithAI: 'Chat with AI',
    logYourMood: 'Log your Mood',

    // AI Companion Section
    aiCompanionTitle: '🤖 Your AI Companion Says',
    aiCompanionTip1: "You've handled stress well this week — great job!",
    aiCompanionTip2: 'Try a short breathing exercise today to stay centered.',
    aiCompanionTip3: 'Journaling has been helping your mood. Keep writing!',

    // XAI Labels
    xaiBreathing: 'Recommended because your stress level is high',
    xaiGratitude: 'Journaling improves your mood by 40% on average',
    xaiBreathingLow: 'Great for maintaining your calm state',
    xaiGratitudeLow: 'Build on your positive momentum today',

    // Today's Summary
    todaySummaryCalm: "Today you seem calm with low stress. Keep it up! 🎉",
    todaySummaryHappy: "You're radiating positivity today! Wonderful energy! ✨",
    todaySummarySad: "It's okay to have tough days. I'm right here with you. 💙",
    todaySummaryStressed: "I notice some stress today. Let's work through it together. 🤝",
    todaySummaryAnxious: "Feeling a bit anxious? That's normal. Let's breathe together. 🌿",
    todaysMentalState: "Today's Mental State",

    // Chat
    aiTherapist: 'AI Therapist',
    yourSafeSpace: 'Your safe space to talk.',
    calm: 'Calm',
    stressed: 'Stressed',
    crisisDetected: 'We\'re Here For You 💙',
    crisisMessage: "I'm really sorry you're feeling this way. You're not alone, and it takes real courage to reach out. Please know that help is always available.",
    contactHelpline: 'Contact Helpline',
    typeYourMessage: 'Type your message...',
    aiIsTyping: 'AI is typing…',
    chipStressed: 'I feel stressed',
    chipAdvice: 'Give me advice',
    chipRelax: 'Help me relax',
    chipAnxious: 'I feel anxious',

    // AI Memory Messages
    aiMemoryWork: "You mentioned work stress yesterday — how is it today?",
    aiMemoryJournal: "Last time you journaled, your mood improved! Want to try again?",
    aiMemoryGeneral: "Hi John! I remember our last chat. How have you been since then?",

    // Mood Tracker
    howAreYouFeeling: 'How are you feeling today?',
    moodTrackerSubtitle: 'Log your mood to track your emotional well-being over time.',
    addNote: 'Add a note (optional)',
    moodNotePlaceholder: "What's making you feel this way?",
    logMood: 'Log Mood',

    // Journal
    journalTitle: 'Journal',
    journalSubtitle: 'Write down your thoughts and reflect.',
    journalPlaceholder: "How are you feeling right now? What's on your mind?",
    aiSuggestion: 'AI Suggestion',
    reflectWithAI: 'Reflect with AI',
    saveEntry: 'Save Entry',

    // Insights
    insightsTitle: 'Insights',
    insightsSubtitle: 'AI-powered analytics on your well-being.',
    moodTrends: 'Mood Trends',
    stressScore: 'Stress Score',
    chartPlaceholder: 'Chart Area Placeholder',
    emotionCalendar: 'Emotion Calendar (This Month)',
    anxious: 'Anxious',
    angry: 'Angry',
    sad: 'Sad',
    aiWeeklyObservation: 'AI Weekly Observation',
    weeklyObservationText: '"You felt happy 60% of this week. We noticed that you feel significantly better on days when you write in your journal. Keep up the good habit!"',
    mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',

    // AI Insight Cards
    aiInsightMood: '📊 You tend to feel stressed after long work hours. Consider taking breaks.',
    aiInsightStress: '📈 Your stress peaks on Wednesdays. Plan something relaxing mid-week.',
    aiInsightPattern: '🧠 Your mood improves 40% on days you journal. Keep writing!',

    // Settings
    settingsTitle: 'Settings',
    settingsSubtitle: 'Manage your preferences.',
    appPreferences: 'App Preferences',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Toggle dark UI theme',
    notifications: 'Notifications',
    notificationsDesc: 'Receive daily reminders',
    anonymousMode: 'Anonymous Mode',
    anonymousModeDesc: 'Keep journal entries private and anonymous',
    languageLabel: 'Language',
    languageDesc: 'English / Urdu',

    // Profile
    profileTitle: 'Profile',
    profileSubtitle: 'Manage your personal details and app preferences.',
    basicInfo: 'Basic Information',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone (Optional)',
    mentalHealthPref: 'Mental Health Preferences',
    preferredTone: 'AI Preferred Tone',
    friendly: 'Friendly & Casual',
    professional: 'Professional & Clinical',
    motivational: 'Motivational & Cheerful',
    reminderTime: 'Daily Reminder Time',
    privacySettings: 'Privacy Settings',
    saveChanges: 'Save Changes',
    viewProfile: 'View Profile',
    clickToUpload: 'Click avatar to upload photo',

    // Notifications
    notificationsTitle: 'Notifications',
    logMoodNotification: 'Log your mood for today!',
    twoHoursAgo: '2 hours ago',
    takeBreak: 'Take a break and breathe.',
    fiveHoursAgo: '5 hours ago',

    // Breathing Exercise
    boxBreathing: 'Box Breathing',
    breathingDesc: 'Follow the animation to relieve stress.',
    ready: 'Ready',

    // Login
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    loginSubtitle: 'Enter your details to access your account',
    signupSubtitle: 'Sign up to start your journey',
    name: 'Name',
    password: 'Password',
    signIn: 'Sign In',
    dontHaveAccount: "Don't have an account? ",
    alreadyHaveAccount: "Already have an account? ",
    signUp: 'Sign up',
    logIn: 'Log in',

    // Floating AI Actions
    talkToAI: '💬 Talk to AI',
    helpMeRelax: '🧘 Help me relax',
    iFeelAnxious: '😰 I feel anxious',
  },

  ur: {
    // Sidebar
    dashboard: 'ڈیش بورڈ',
    aiChat: 'AI چیٹ',
    moodTracker: 'موڈ ٹریکر',
    journal: 'جرنل',
    insights: 'بصیرت',
    settings: 'ترتیبات',
    logout: 'لاگ آؤٹ',

    // Dashboard
    goodMorning: '😊 !صبح بخیر، جان',
    goodAfternoon: '☀️ !دوپہر بخیر، جان',
    goodEvening: '🌙 !شام بخیر، جان',
    aiGreetingHappy: 'مجھے لگتا ہے آپ بہتر محسوس کر رہے ہیں۔ شاباش!',
    aiGreetingCalm: 'آج آپ پرسکون لگ رہے ہیں۔ یہ دیکھ کر خوشی ہوئی۔',
    aiGreetingSad: 'میں آپ کے ساتھ ہوں۔ آئیے ایک ایک قدم چلتے ہیں۔',
    aiGreetingStressed: 'کچھ تناؤ محسوس ہو رہا ہے۔ سانس کی مشق کیسی رہے گی؟',
    aiGreetingAnxious: 'گہرا سانس لیں۔ آپ اپنے خیال سے بہتر کر رہے ہیں۔',
    dashboardSubtitle: 'آج آپ کی ذہنی تندرستی کا خلاصہ یہ ہے۔',
    dayStreak: 'سلسلہ بندی',
    mindful: 'ذہن سازی',
    currentMood: 'موجودہ موڈ',
    happy: 'خوش',
    stressLevel: 'تناؤ کی سطح',
    low: 'کم',
    medium: 'درمیانہ',
    high: 'زیادہ',
    tipOfTheDay: 'آج کی ٹِپ',
    tipText: '"5 منٹ گہرے سانس لینے کی مشق کریں۔ مدد چاہیے؟ ہمارے AI گائیڈ کو آزمائیں۔"',
    personalizedSuggestions: 'ذاتی تجاویز',
    guidedBreathing: 'سانس کی رہنمائی',
    guidedBreathingDesc: 'ایک منٹ خود کو مرکوز کریں اور تناؤ کم کریں۔',
    practiceGratitude: 'شکرگزاری کی مشق',
    practiceGratitudeDesc: 'آج 3 چیزیں لکھیں جن کے لیے آپ شکرگزار ہیں۔',
    quickActions: 'فوری اقدامات',
    chatWithAI: 'AI سے بات کریں',
    logYourMood: 'اپنا موڈ لکھیں',

    // AI Companion Section
    aiCompanionTitle: '🤖 آپ کا AI ساتھی کہتا ہے',
    aiCompanionTip1: 'آپ نے اس ہفتے تناؤ کو اچھی طرح سنبھالا — شاباش!',
    aiCompanionTip2: 'آج ایک مختصر سانس کی مشق آزمائیں۔',
    aiCompanionTip3: 'جرنل لکھنے سے آپ کا موڈ بہتر ہو رہا ہے۔ لکھتے رہیں!',

    // XAI Labels
    xaiBreathing: 'تجویز کیونکہ آپ کا تناؤ زیادہ ہے',
    xaiGratitude: 'جرنل لکھنے سے موڈ 40% بہتر ہوتا ہے',
    xaiBreathingLow: 'آپ کے سکون کو برقرار رکھنے کے لیے بہترین',
    xaiGratitudeLow: 'آج اپنی مثبت رفتار پر عمل کریں',

    // Today's Summary
    todaySummaryCalm: "آج آپ پرسکون لگ رہے ہیں کم تناؤ کے ساتھ۔ شاباش! 🎉",
    todaySummaryHappy: "آپ آج خوشی بکھیر رہے ہیں! شاندار توانائی! ✨",
    todaySummarySad: "مشکل دن ہونا ٹھیک ہے۔ میں آپ کے ساتھ ہوں۔ 💙",
    todaySummaryStressed: "آج کچھ تناؤ محسوس ہو رہا ہے۔ آئیے مل کر حل کرتے ہیں۔ 🤝",
    todaySummaryAnxious: "تھوڑی بےچینی ہے؟ عام بات ہے۔ آئیے سانس لیتے ہیں۔ 🌿",
    todaysMentalState: 'آج کی ذہنی حالت',

    // Chat
    aiTherapist: 'AI تھراپسٹ',
    yourSafeSpace: 'بات کرنے کے لیے آپ کی محفوظ جگہ۔',
    calm: 'پرسکون',
    stressed: 'تناؤ',
    crisisDetected: '💙 ہم آپ کے ساتھ ہیں',
    crisisMessage: 'مجھے واقعی افسوس ہے کہ آپ ایسا محسوس کر رہے ہیں۔ آپ اکیلے نہیں ہیں، اور مدد مانگنا حقیقی ہمت ہے۔ جان لیں کہ مدد ہمیشہ دستیاب ہے۔',
    contactHelpline: 'ہیلپ لائن سے رابطہ کریں',
    typeYourMessage: '...اپنا پیغام ٹائپ کریں',
    aiIsTyping: '...AI ٹائپ کر رہا ہے',
    chipStressed: 'مجھے تناؤ ہے',
    chipAdvice: 'مجھے مشورہ دیں',
    chipRelax: 'آرام کرنے میں مدد کریں',
    chipAnxious: 'مجھے بےچینی ہے',

    // AI Memory Messages
    aiMemoryWork: 'آپ نے کل کام کے تناؤ کا ذکر کیا تھا — آج کیسا ہے؟',
    aiMemoryJournal: 'پچھلی بار جرنل لکھنے سے آپ کا موڈ بہتر ہوا! دوبارہ آزمائیں؟',
    aiMemoryGeneral: 'ہائے جان! مجھے ہماری پچھلی بات یاد ہے۔ تب سے کیسے ہیں؟',

    // Mood Tracker
    howAreYouFeeling: 'آج آپ کیسا محسوس کر رہے ہیں؟',
    moodTrackerSubtitle: 'وقت کے ساتھ اپنی جذباتی تندرستی کو ٹریک کرنے کے لیے اپنا موڈ لاگ کریں۔',
    addNote: 'نوٹ شامل کریں (اختیاری)',
    moodNotePlaceholder: 'آپ کو ایسا کیوں محسوس ہو رہا ہے؟',
    logMood: 'موڈ لاگ کریں',

    // Journal
    journalTitle: 'جرنل',
    journalSubtitle: 'اپنے خیالات لکھیں اور غور کریں۔',
    journalPlaceholder: 'ابھی آپ کیسا محسوس کر رہے ہیں؟ آپ کے ذہن میں کیا ہے؟',
    aiSuggestion: 'AI تجویز',
    reflectWithAI: 'AI کے ساتھ غور کریں',
    saveEntry: 'اندراج محفوظ کریں',

    // Insights
    insightsTitle: 'بصیرت',
    insightsSubtitle: 'آپ کی تندرستی پر AI سے چلنے والے تجزیات۔',
    moodTrends: 'موڈ رجحانات',
    stressScore: 'تناؤ سکور',
    chartPlaceholder: 'چارٹ ایریا',
    emotionCalendar: 'جذبات کیلنڈر (اس ماہ)',
    anxious: 'فکرمند',
    angry: 'ناراض',
    sad: 'اداس',
    aiWeeklyObservation: 'AI ہفتہ وار مشاہدہ',
    weeklyObservationText: '"آپ نے اس ہفتے 60% خوشی محسوس کی۔ ہم نے دیکھا کہ جن دنوں آپ جرنل میں لکھتے ہیں ان دنوں آپ نمایاں طور پر بہتر محسوس کرتے ہیں۔ اچھی عادت جاری رکھیں!"',
    mon: 'پیر', tue: 'منگل', wed: 'بدھ', thu: 'جمعرات', fri: 'جمعہ', sat: 'ہفتہ', sun: 'اتوار',

    // AI Insight Cards
    aiInsightMood: '📊 آپ لمبے کام کے اوقات کے بعد تناؤ محسوس کرتے ہیں۔ وقفے لیں۔',
    aiInsightStress: '📈 آپ کا تناؤ بدھ کو زیادہ ہوتا ہے۔ ہفتے کے وسط میں آرام کریں۔',
    aiInsightPattern: '🧠 جرنل لکھنے سے آپ کا موڈ 40% بہتر ہوتا ہے۔ لکھتے رہیں!',

    // Settings
    settingsTitle: 'ترتیبات',
    settingsSubtitle: 'اپنی ترجیحات کا نظم کریں۔',
    appPreferences: 'ایپ کی ترجیحات',
    darkMode: 'ڈارک موڈ',
    darkModeDesc: 'ڈارک UI تھیم ٹوگل کریں',
    notifications: 'اطلاعات',
    notificationsDesc: 'روزانہ یاد دہانیاں وصول کریں',
    anonymousMode: 'گمنام موڈ',
    anonymousModeDesc: 'جرنل اندراجات کو نجی اور گمنام رکھیں',
    languageLabel: 'زبان',
    languageDesc: 'انگریزی / اردو',

    // Profile
    profileTitle: 'پروفائل',
    profileSubtitle: 'اپنی ذاتی تفصیلات اور ایپ ترجیحات کا نظم کریں۔',
    basicInfo: 'بنیادی معلومات',
    fullName: 'پورا نام',
    email: 'ای میل',
    phone: 'فون (اختیاری)',
    mentalHealthPref: 'ذہنی صحت کی ترجیحات',
    preferredTone: 'AI کا ترجیحی لہجہ',
    friendly: 'دوستانہ اور غیر رسمی',
    professional: 'پیشہ ورانہ اور طبی',
    motivational: 'حوصلہ افزا اور خوشگوار',
    reminderTime: 'روزانہ یاد دہانی کا وقت',
    privacySettings: 'رازداری کی ترتیبات',
    saveChanges: 'تبدیلیاں محفوظ کریں',
    viewProfile: 'پروفائل دیکھیں',
    clickToUpload: 'تصویر اپ لوڈ کرنے کے لیے اوتار پر کلک کریں',

    // Notifications
    notificationsTitle: 'اطلاعات',
    logMoodNotification: '!آج کا موڈ لاگ کریں',
    twoHoursAgo: '2 گھنٹے پہلے',
    takeBreak: 'وقفہ لیں اور سانس لیں۔',
    fiveHoursAgo: '5 گھنٹے پہلے',

    // Breathing Exercise
    boxBreathing: 'باکس بریتھنگ',
    breathingDesc: 'تناؤ دور کرنے کے لیے اینیمیشن کی پیروی کریں۔',
    ready: 'تیار',

    // Login
    welcomeBack: 'واپسی پر خوش آمدید',
    createAccount: 'اکاؤنٹ بنائیں',
    loginSubtitle: 'اپنے اکاؤنٹ تک رسائی کے لیے تفصیلات درج کریں',
    signupSubtitle: 'اپنا سفر شروع کرنے کے لیے سائن اپ کریں',
    name: 'نام',
    password: 'پاسورڈ',
    signIn: 'سائن ان',
    dontHaveAccount: 'کیا آپ کا اکاؤنٹ نہیں ہے؟ ',
    alreadyHaveAccount: 'کیا آپ کا پہلے سے اکاؤنٹ ہے؟ ',
    signUp: 'سائن اپ',
    logIn: 'لاگ ان',

    // Floating AI Actions
    talkToAI: '💬 AI سے بات کریں',
    helpMeRelax: '🧘 آرام میں مدد کریں',
    iFeelAnxious: '😰 مجھے بےچینی ہے',
  },
};

export function t(key, language) {
  return translations[language]?.[key] || translations.en[key] || key;
}

export default translations;
