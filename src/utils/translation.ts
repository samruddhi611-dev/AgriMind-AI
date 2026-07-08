export type LanguageCode = "en" | "hi" | "mr";

export interface TranslationDictionary {
  // Login Screen
  loginTitle: string;
  loginSubtext: string;
  welcomeBack: string;
  createAccount: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  confirmPasswordLabel: string;
  termsText: string;
  signInBtn: string;
  createAccountBtn: string;
  pleaseWait: string;
  orContinue: string;
  googleSignIn: string;
  googleSignUp: string;
  developerProfiles: string;
  footerNewToPlatform: string;
  footerCreateWorkspace: string;
  footerAlreadyUser: string;
  footerSignIn: string;
  
  // Dashboard & Navigation
  primaryMemberDesk: string;
  greetingMorning: string;
  greetingFarmer: string;
  locationDetails: string;
  consultAiButton: string;
  telemetryTitle: string;
  telemetrySubtitle: string;
  liveSimulator: string;
  tempLabel: string;
  humidityLabel: string;
  windSpeedLabel: string;
  rainChanceLabel: string;
  simulateShifts: string;
  soilTempSlider: string;
  precipRiskSlider: string;
  aiAdvisorTitle: string;
  computingText: string;
  irrigationAdviceTitle: string;
  pestAdviceTitle: string;
  sprayingAdviceTitle: string;
  harvestAdviceTitle: string;
  operationsCenterTitle: string;
  
  // Quick Actions
  diseaseScanner: string;
  liveCropPrices: string;
  govtSchemes: string;
  farmPlotting: string;
  smartPlanner: string;
  knowledgeHub: string;
  satelliteMap: string;
  
  // Agronomy Alerts
  alertsTitle: string;
  diseaseAlertTitle: string;
  diseaseAlertDesc: string;
  marketAlertTitle: string;
  marketAlertDesc: string;
  sowingAlertTitle: string;
  sowingAlertDesc: string;

  // Voice & Accessibility Prompts
  listenButtonText: string;
  speakToNavigate: string;
  micListening: string;
  micStopped: string;
  voiceDialogTitle: string;
  voiceDialogDesc: string;
  voiceOptionsLabel: string;
  sayOrClickOption: string;
  voiceResultTitle: string;
  closeText: string;
  voiceErrorText: string;
  
  // Spoken Text Narrations (What the speech synthesis will read)
  loginNarration: string;
  dashboardNarration: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    loginTitle: "AgriMind AI Platform",
    loginSubtext: "Access smart crop planning, ML leaf diagnostics, real-time weather logs, and fertilizer prediction models.",
    welcomeBack: "Welcome Back",
    createAccount: "Create Your Account",
    emailLabel: "Email Address",
    emailPlaceholder: "name@agrimind.ai",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    confirmPasswordLabel: "Confirm Password",
    termsText: "I accept the AgriMind AI Terms of Service and consent to localized crop data analysis.",
    signInBtn: "Sign In",
    createAccountBtn: "Create Free Account",
    pleaseWait: "Please wait...",
    orContinue: "Or continue with",
    googleSignIn: "Sign In with Google",
    googleSignUp: "Sign Up with Google",
    developerProfiles: "Quick-Access Developer Profiles",
    footerNewToPlatform: "New agricultural partner?",
    footerCreateWorkspace: "Create your workspace",
    footerAlreadyUser: "Already have an agricultural workspace?",
    footerSignIn: "Sign In instead",

    primaryMemberDesk: "Primary Member Desk",
    greetingMorning: "Good Morning",
    greetingFarmer: "Ramesh Patel",
    locationDetails: "Your agricultural center in Indore, MP is running efficiently with robust soil profiles.",
    consultAiButton: "Consult AI Assistant",
    telemetryTitle: "Micro-Climate Telemetry",
    telemetrySubtitle: "Fine-tune climate stats to preview real-time AI farming advice.",
    liveSimulator: "Live Simulator",
    tempLabel: "Temperature",
    humidityLabel: "Humidity",
    windSpeedLabel: "Wind Speed",
    rainChanceLabel: "Rain Chance",
    simulateShifts: "Simulate Environmental Shifts",
    soilTempSlider: "Soil/Air Temp",
    precipRiskSlider: "Precipitation Risk",
    aiAdvisorTitle: "AI Weather Farming Advisor",
    computingText: "Computing...",
    irrigationAdviceTitle: "Irrigation Advice",
    pestAdviceTitle: "Pest Management",
    sprayingAdviceTitle: "Spraying Suitability",
    harvestAdviceTitle: "Sowing & Harvest",
    operationsCenterTitle: "Operations Center",

    diseaseScanner: "Disease Scanner",
    liveCropPrices: "Live Crop Prices",
    govtSchemes: "Govt Schemes",
    farmPlotting: "Farm Plotting",
    smartPlanner: "Smart Planner",
    knowledgeHub: "Knowledge Hub",
    satelliteMap: "Satellite Map",

    alertsTitle: "Agronomy Alerts",
    diseaseAlertTitle: "Regional Early Blight Alert",
    diseaseAlertDesc: "Mandi reports indicate high spores of Early Blight in Tomato specimens around central MP. Keep foliage dry.",
    marketAlertTitle: "Soybean Index Spikes +4.2%",
    marketAlertDesc: "High seed milling requests in Gujarat markets drive local Soybean spot prices above ₹5,800/Quintal.",
    sowingAlertTitle: "Sowing window: Kharif Maize",
    sowingAlertDesc: "Soil moisture values of 18-22% are ideal for starting open seedbed drills of early Kharif Maize.",

    listenButtonText: "🔊 Listen (Audio Help)",
    speakToNavigate: "🎤 Speak to Navigate",
    micListening: "Listening... Speak now",
    micStopped: "Tap mic to speak",
    voiceDialogTitle: "Voice Guidance Assistant",
    voiceDialogDesc: "Say commands like 'Open Weather', 'Show Market Prices', 'Scan Disease', or 'Help me'.",
    voiceOptionsLabel: "Or click a command below to say it:",
    sayOrClickOption: "Tap to activate",
    voiceResultTitle: "Spoken commands heard:",
    closeText: "Close Assistant",
    voiceErrorText: "Speech not recognized. Please try again.",
    loginNarration: "Welcome to AgriMind AI smart farming platform. Please choose your language at the top. You can log in using email and password, or tap one of the quick access developer profiles at the bottom.",
    dashboardNarration: "Welcome to your smart farming dashboard. You have micro-climate telemetry showing temperature, humidity, wind speed, and rain. The AI weather assistant is recommending to apply micro-sprinklers early in the morning and scout eggplant specimens for whiteflies. Your quick action buttons include: Disease Scanner, Live Crop Prices, and Government Schemes."
  },
  hi: {
    loginTitle: "एग्रीमाइंड एआई प्लेटफॉर्म",
    loginSubtext: "स्मार्ट फसल नियोजन, एआई पत्ती रोग निदान, वास्तविक समय मौसम लॉग और उर्वरक भविष्यवाणी मॉडल तक पहुंचें।",
    welcomeBack: "आपका स्वागत है",
    createAccount: "अपना नया खाता बनाएं",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "name@agrimind.ai",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "पासवर्ड दर्ज करें",
    fullNameLabel: "पूरा नाम",
    fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    termsText: "मैं एग्रीमाइंड एआई की सेवा शर्तों को स्वीकार करता हूं और फसल डेटा विश्लेषण के लिए सहमति देता हूं।",
    signInBtn: "साइन इन करें",
    createAccountBtn: "मुफ़्त खाता बनाएं",
    pleaseWait: "कृपया प्रतीक्षा करें...",
    orContinue: "या इसके साथ जारी रखें",
    googleSignIn: "गूगल के साथ साइन इन करें",
    googleSignUp: "गूगल के साथ साइन अप करें",
    developerProfiles: "त्वरित-पहुंच डेवलपर प्रोफाइल",
    footerNewToPlatform: "नए किसान मित्र हैं?",
    footerCreateWorkspace: "नया खाता बनाएं",
    footerAlreadyUser: "पहले से खाता है?",
    footerSignIn: "साइन इन करें",

    primaryMemberDesk: "प्राथमिक सदस्य डेस्क",
    greetingMorning: "शुभ प्रभात",
    greetingFarmer: "रमेश पटेल",
    locationDetails: "इन्दौर, मध्य प्रदेश में आपका कृषि केंद्र मजबूत मृदा प्रोफाइल के साथ कुशलतापूर्वक कार्य कर रहा है।",
    consultAiButton: "एआई सहायक से सलाह लें",
    telemetryTitle: "सूक्ष्म-जलवायु माप (टेलीमेट्री)",
    telemetrySubtitle: "वास्तविक समय एआई कृषि सलाह देखने के लिए मौसम के आँकड़े बदलें।",
    liveSimulator: "लाइव सिम्युलेटर",
    tempLabel: "तापमान",
    humidityLabel: "आर्द्रता",
    windSpeedLabel: "हवा की गति",
    rainChanceLabel: "बारिश की संभावना",
    simulateShifts: "पर्यावरणीय बदलावों का अनुकरण करें",
    soilTempSlider: "मिट्टी/हवा का तापमान",
    precipRiskSlider: "बारिश का जोखिम",
    aiAdvisorTitle: "एआई मौसम खेती सलाहकार",
    computingText: "गणना की जा रही है...",
    irrigationAdviceTitle: "सिंचाई सलाह",
    pestAdviceTitle: "कीट प्रबंधन",
    sprayingAdviceTitle: "छिड़काव उपयुक्तता",
    harvestAdviceTitle: "बुवाई और कटाई",
    operationsCenterTitle: "संचालन केंद्र",

    diseaseScanner: "रोग स्कैनर",
    liveCropPrices: "लाइव फसल कीमतें",
    govtSchemes: "सरकारी योजनाएं",
    farmPlotting: "खेत का नक्शा",
    smartPlanner: "स्मार्ट प्लानर",
    knowledgeHub: "ज्ञान केंद्र",
    satelliteMap: "सैटेलाइट मानचित्र",

    alertsTitle: "कृषि अलर्ट",
    diseaseAlertTitle: "क्षेत्रीय अगेती झुलसा अलर्ट",
    diseaseAlertDesc: "मंडी रिपोर्टों से पता चलता है कि मध्य प्रदेश के आसपास टमाटर के पौधों में अगेती झुलसा रोग की संभावना अधिक है। पत्तों को सूखा रखें।",
    marketAlertTitle: "सोयाबीन सूचकांक +4.2% बढ़ा",
    marketAlertDesc: "गुजरात के बाजारों में उच्च तेल मिलों की मांग से स्थानीय सोयाबीन हाजिर कीमतें ₹5,800/क्विंटल से ऊपर चली गई हैं।",
    sowingAlertTitle: "बुवाई का समय: खरीफ मक्का",
    sowingAlertDesc: "जल्दी खरीफ मक्के की बुवाई शुरू करने के लिए 18-22% की मिट्टी की नमी आदर्श है।",

    listenButtonText: "🔊 सुनें (ऑडियो सहायता)",
    speakToNavigate: "🎤 नेविगेट करने के लिए बोलें",
    micListening: "सुन रहा हूँ... अब बोलें",
    micStopped: "बोलने के लिए माइक टैप करें",
    voiceDialogTitle: "आवाज मार्गदर्शन सहायक",
    voiceDialogDesc: "'मौसम खोलें', 'बाजार भाव दिखाएं', 'बीमारी जांचें', या 'मदद करें' जैसे आदेश बोलें।",
    voiceOptionsLabel: "या बोलने के लिए नीचे दिए गए बटन पर टैप करें:",
    sayOrClickOption: "सक्रिय करने के लिए दबाएं",
    voiceResultTitle: "सुने गए आदेश:",
    closeText: "सहायक बंद करें",
    voiceErrorText: "आवाज समझ में नहीं आई। कृपया पुनः प्रयास करें।",
    loginNarration: "एग्रीमाइंड एआई स्मार्ट खेती मंच में आपका स्वागत है। कृपया शीर्ष पर अपनी पसंदीदा भाषा चुनें। आप ईमेल और पासवर्ड का उपयोग करके लॉग इन कर सकते हैं, या नीचे दिए गए त्वरित पहुंच डेवलपर किसान प्रोफाइल पर टैप कर सकते हैं।",
    dashboardNarration: "आपके स्मार्ट खेती डैशबोर्ड में आपका स्वागत है। आपके पास तापमान, आर्द्रता, हवा की गति और बारिश दिखाने वाली सूक्ष्म-जलवायु टेलीमेट्री है। एआई मौसम सहायक सुबह जल्दी छिड़काव करने और सफेद मक्खियों के लिए बैंगन के पौधों की निगरानी करने की सलाह दे रहा है। आपके त्वरित बटन में शामिल हैं: रोग स्कैनर, लाइव फसल कीमतें और सरकारी योजनाएं।"
  },
  mr: {
    loginTitle: "अ‍ॅग्रीमाइंड एआय प्लॅटफॉर्म",
    loginSubtext: "स्मार्ट पीक नियोजन, वनस्पती रोग निदान, वास्तविक वेळ हवामान आणि खत व्यवस्थापनाचा एआय सल्ला मिळवा.",
    welcomeBack: "आपले स्वागत आहे",
    createAccount: "नवीन खाते तयार करा",
    emailLabel: "ईमेल पत्ता",
    emailPlaceholder: "name@agrimind.ai",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "पासवर्ड टाका",
    fullNameLabel: "पूर्ण नाव",
    fullNamePlaceholder: "तुमचे पूर्ण नाव टाका",
    confirmPasswordLabel: "पासवर्डची पुष्टी करा",
    termsText: "मी अ‍ॅग्रीमाइंड एआयच्या सेवा अटी स्वीकारतो आणि पीक डेटा विश्लेषणासाठी संमती देतो.",
    signInBtn: "साइन इन करा",
    createAccountBtn: "विनामूल्य खाते बनवा",
    pleaseWait: "कृपया प्रतीक्षा करा...",
    orContinue: "किंवा यासह पुढे जा",
    googleSignIn: "गुगलने लॉगिन करा",
    googleSignUp: "गुगलने नोंदणी करा",
    developerProfiles: "झटपट प्रवेश शेतकरी प्रोफाईल",
    footerNewToPlatform: "नवीन शेतकरी मित्र आहात का?",
    footerCreateWorkspace: "नवीन खाते तयार करा",
    footerAlreadyUser: "आधीच खाते आहे का?",
    footerSignIn: "लॉगिन करा",

    primaryMemberDesk: "शेतकरी सेवा केंद्र",
    greetingMorning: "शुभ सकाळ",
    greetingFarmer: "रमेश पटेल",
    locationDetails: "इंदूर, मध्य प्रदेश येथील तुमचे कृषी केंद्र उत्कृष्ट जमिनीच्या आरोग्यासह कार्यरत आहे.",
    consultAiButton: "एआय सल्लागाराशी बोला",
    telemetryTitle: "हवामान व जमिनीची सद्यस्थिती",
    telemetrySubtitle: "अचूक एआय शेती सल्ला मिळवण्यासाठी हवामानाची माहिती तपासा.",
    liveSimulator: "लाइव सिम्युलेटर",
    tempLabel: "तापमान",
    humidityLabel: "हवेतील ओलसरपणा (आर्द्रता)",
    windSpeedLabel: "वाऱ्याचा वेग",
    rainChanceLabel: "पावसाची शक्यता",
    simulateShifts: "हवामान बदलून सल्ला तपासा",
    soilTempSlider: "जमीन/हवेचे तापमान",
    precipRiskSlider: "पावसाचा अंदाज",
    aiAdvisorTitle: "एआय हवामान शेती सल्लागार",
    computingText: "माहिती मिळवत आहे...",
    irrigationAdviceTitle: "पाणी व्यवस्थापन सल्ला",
    pestAdviceTitle: "कीड नियंत्रण व्यवस्थापन",
    sprayingAdviceTitle: "औषध फवारणी सल्ला",
    harvestAdviceTitle: "पेरणी आणि कापणी वेळ",
    operationsCenterTitle: "शेतकरी झटपट सेवा",

    diseaseScanner: "पीक रोग स्कॅनर",
    liveCropPrices: "बाजार भाव (मंडी भाव)",
    govtSchemes: "शासकीय योजना",
    farmPlotting: "शेत नकाशा",
    smartPlanner: "स्मार्ट नियोजक",
    knowledgeHub: "माहिती भांडार",
    satelliteMap: "सॅटेलाईट मॅप",

    alertsTitle: "कृषी सल्ले व तातडीच्या सूचना",
    diseaseAlertTitle: "प्रादेशिक अगेती करपा रोग चेतावणी",
    diseaseAlertDesc: "मध्य प्रदेशमध्ये टोमॅटो पिकांवर करपा रोगाचा प्रादुर्भाव वाढण्याची शक्यता आहे. पाने कोरडी ठेवा.",
    marketAlertTitle: "सोयाबीन दरांमध्ये +४.२% वाढ",
    marketAlertDesc: "गुजरात बाजारपेठेत सोयाबीनची मागणी वाढल्याने स्थानिक सोयाबीनचे दर ₹५,८००/क्विंटलच्या पार गेले आहेत.",
    sowingAlertTitle: "पेरणीची योग्य वेळ: खरीप मका",
    sowingAlertDesc: "खरीप मक्याची पेरणी सुरू करण्यासाठी जमिनीत १८-२२% ओल असणे अत्यंत फायदेशीर आहे.",

    listenButtonText: "🔊 ऐका (ऑडिओ मदत)",
    speakToNavigate: "🎤 बोलून चालवा (आवाज आदेश)",
    micListening: "ऐकत आहे... आता बोला",
    micStopped: "बोलण्यासाठी माईक दाबा",
    voiceDialogTitle: "आवाज मार्गदर्शन आणि बोलून मदत",
    voiceDialogDesc: "असे आदेश बोला: 'हवामान उघडा', 'बाजार भाव दाखवा', 'योजना उघडा' किंवा 'मदत करा'.",
    voiceOptionsLabel: "किंवा खालीलपैकी एका आदेशावर थेट क्लिक करा:",
    sayOrClickOption: "चालू करण्यासाठी दाबा",
    voiceResultTitle: "आम्ही ऐकलेले आदेश:",
    closeText: "मदत खिडकी बंद करा",
    voiceErrorText: "आवाज स्पष्ट ऐकू आला नाही. कृपया पुन्हा बोला किंवा खाली क्लिक करा.",

    loginNarration: "अ‍ॅग्रीमाइंड एआय स्मार्ट शेती प्लॅटफॉर्मवर आपले स्वागत आहे. कृपया सर्वात वर आपली आवडती भाषा निवडा. तुम्ही ईमेल आणि पासवर्ड टाकून लॉगिन करू शकता, किंवा खालीलपैकी कोणत्याही एका शेतकरी प्रोफाईलवर क्लिक करून थेट प्रवेश करू शकता.",
    dashboardNarration: "तुमच्या स्मार्ट शेती डॅशबोर्डवर आपले स्वागत आहे. येथे तापमान, आर्द्रता, वाऱ्याचा वेग आणि पावसाचा अंदाज दाखवला आहे. एआय सल्लागार सकाळी लवकर पाणी फवारण्याचा आणि वांग्यावरील पांढऱ्या माशीचे निरीक्षण करण्याचा सल्ला देत आहे. तुमच्या महत्त्वाच्या सेवांमध्ये पीक रोग स्कॅनर, बाजार भाव आणि शासकीय योजना यांचा समावेश आहे."
  }
};

export function speakText(text: string, lang: LanguageCode) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  
  // Cancel active narration
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (lang === "mr") {
    utterance.lang = "mr-IN";
  } else if (lang === "hi") {
    utterance.lang = "hi-IN";
  } else {
    utterance.lang = "en-US";
  }

  // Slightly slower rate for accessibility and low literacy readability
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
