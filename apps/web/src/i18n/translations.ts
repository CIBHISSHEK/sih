import type { LandingLang } from "../pages/landingCopy";

export interface AppTranslations {
  common: {
    back: string;
    logout: string;
    loading: string;
  };
  login: {
    tagline: string;
    phoneLabel: string;
    digitsOf: (n: number, total: number) => string;
    sendOtp: string;
    sending: string;
    demoNote: string;
    demoModeTag: string;
    otpPrefilled: string;
    enterOtp: string;
    verify: string;
    verifying: string;
    changePhone: string;
    cantReachServer: string;
    invalidOtp: string;
    incompletePhone: string;
    otpExpired: string;
    tooManyAttempts: string;
    firebaseError: string;
    smsSentTo: string;
  };
  farmerHome: {
    greeting: string;
    bookSlot: string;
    bookByVoice: string;
    yourBookings: string;
    noBookings: string;
    loading: string;
  };
  bookingWizard: {
    title: string;
    cropLabel: string;
    quantityLabel: string;
    dateLabel: string;
    next: string;
    daysSinceHarvestLabel: string;
    storageLabel: string;
    open: string;
    covered: string;
    checkRisk: string;
    checking: string;
    riskPreCheckLabel: string;
    seeRecommendations: string;
    findingCentres: string;
    whyThisCentre: string;
    hideReasoning: string;
    confirmBookingPrefix: string;
    bookingInProgress: string;
    noCentresAvailable: string;
    noSlotsLeftToday: string;
    kmAway: string;
    queueLabel: string;
    waitLabel: string;
    uploadPhotoLabel: string;
    uploadPhotoHint: string;
    analyzingPhoto: string;
    photoSignalLabel: string;
    retakePhoto: string;
    removePhoto: string;
    skipPhoto: string;
    photoUnavailable: string;
    usingGpsLocation: string;
    usingProfileLocation: string;
    retryGps: string;
    useRegisteredVillage: string;
    locatingGps: string;
  };
  bookingTracker: {
    token: string;
    arrivalOtp: string;
    slot: string;
    queuePosition: string;
    estimatedWait: string;
    status: string;
    cancelBooking: string;
    cancelledMsg: string;
    noShowMsg: string;
    qualityRisk: string;
    procurementResult: string;
    accepted: string;
    rejected: string;
    payment: string;
    notifications: string;
    noNotifications: string;
  };
  voiceBooking: {
    title: string;
    subtitle: string;
    tapToSpeak: string;
    listening: string;
    noSpeechSupport: string;
    typePlaceholder: string;
    send: string;
    backToHome: string;
    micDenied: string;
    noSpeechDetected: string;
    recognitionError: string;
    restartingSession: string;
    somethingWentWrong: string;
    insecureContext: string;
    noMicFound: string;
    noVoiceForLanguage: string;
  };
}

export const TRANSLATIONS: Record<LandingLang, AppTranslations> = {
  en: {
    common: { back: "Back", logout: "Log out", loading: "Loading..." },
    login: {
      tagline: "Smart slot booking for procurement centres",
      phoneLabel: "Phone number",
      digitsOf: (n, total) => `${n}/${total} digits`,
      sendOtp: "Send OTP",
      sending: "Sending...",
      demoNote: "Demo phones: 9999999999 = Admin, 8888888888 = Staff, any other = Farmer.",
      demoModeTag: "Demo mode",
      otpPrefilled: "your OTP is prefilled:",
      enterOtp: "Enter OTP",
      verify: "Verify & Continue",
      verifying: "Verifying...",
      changePhone: "Change phone number",
      cantReachServer: "Can't reach the server. Make sure the API is running (npm run dev) and try again.",
      invalidOtp: "Invalid OTP. Please try again.",
      incompletePhone: "Enter your full 10-digit phone number.",
      otpExpired: "That code expired — please request a new one.",
      tooManyAttempts: "Too many attempts — please wait a bit before trying again.",
      firebaseError: "Could not send the SMS. Please check the number and try again.",
      smsSentTo: "OTP sent by SMS to"
    },
    farmerHome: {
      greeting: "Namaste",
      bookSlot: "Book a slot",
      bookByVoice: "Book by voice",
      yourBookings: "Your bookings",
      noBookings: "No bookings yet.",
      loading: "Loading..."
    },
    bookingWizard: {
      title: "Book a slot",
      cropLabel: "Crop",
      quantityLabel: "Quantity (quintals)",
      dateLabel: "Preferred date",
      next: "Next",
      daysSinceHarvestLabel: "Days since harvest",
      storageLabel: "Storage",
      open: "Open",
      covered: "Covered",
      checkRisk: "Check quality risk",
      checking: "Checking...",
      riskPreCheckLabel: "Quality risk pre-check",
      seeRecommendations: "See recommended centres",
      findingCentres: "Finding centres...",
      whyThisCentre: "Why this centre?",
      hideReasoning: "Hide reasoning",
      confirmBookingPrefix: "Confirm booking at",
      bookingInProgress: "Booking...",
      noCentresAvailable: "No centres available nearby for this date/quantity.",
      noSlotsLeftToday: "No slots are left today, so we've moved you to tomorrow instead.",
      kmAway: "km away",
      queueLabel: "Queue",
      waitLabel: "Wait",
      uploadPhotoLabel: "Photo of your produce (optional)",
      uploadPhotoHint: "Adds an AI photo-quality signal to your risk check — a heuristic demo analysis, not a certified grading.",
      analyzingPhoto: "Analyzing photo...",
      photoSignalLabel: "Photo-based quality signal",
      retakePhoto: "Retake photo",
      removePhoto: "Remove photo",
      skipPhoto: "Skip — I don't have a photo",
      photoUnavailable: "Photo analysis isn't available right now — continuing with weather-based risk only.",
      usingGpsLocation: "Using your current GPS location",
      usingProfileLocation: "Using your registered village location",
      retryGps: "My current location",
      useRegisteredVillage: "My registered village",
      locatingGps: "Locating..."
    },
    bookingTracker: {
      token: "Token",
      arrivalOtp: "Arrival OTP",
      slot: "Slot",
      queuePosition: "Queue position",
      estimatedWait: "Estimated wait",
      status: "Status",
      cancelBooking: "Cancel booking",
      cancelledMsg: "Booking cancelled",
      noShowMsg: "Booking marked as no-show",
      qualityRisk: "Quality risk at booking time",
      procurementResult: "Procurement result",
      accepted: "Accepted",
      rejected: "Rejected",
      payment: "Payment",
      notifications: "Notifications",
      noNotifications: "No live notifications yet — updates will appear here."
    },
    voiceBooking: {
      title: "Voice booking",
      subtitle: "Speak your answers, or type them below. Works fully offline in demo mode.",
      tapToSpeak: "Tap to speak",
      listening: "Listening...",
      noSpeechSupport: "Speech recognition isn't available in this browser — please type your answer.",
      typePlaceholder: "Type your answer...",
      send: "Send",
      backToHome: "Back to home",
      micDenied: "Microphone access was blocked — please allow it in your browser, or type your answer instead.",
      noSpeechDetected: "Didn't catch that — please try again, or type your answer.",
      recognitionError: "Speech recognition had a problem — please try again, or type your answer.",
      restartingSession: "That session timed out — starting a fresh one.",
      somethingWentWrong: "Something went wrong reaching the server — please try again.",
      insecureContext: "Voice input needs a secure page (https or localhost) — please open this site directly in a browser tab, not an embedded preview.",
      noMicFound: "No microphone was found on this device — please type your answer instead.",
      noVoiceForLanguage: "No voice for this language is installed on your device, so audio is playing in the default voice instead — you can still read the text below. On Windows, add one under Settings > Time & Language > Speech > Add voices."
    }
  },
  hi: {
    common: { back: "वापस", logout: "लॉग आउट", loading: "लोड हो रहा है..." },
    login: {
      tagline: "खरीद केंद्रों के लिए स्मार्ट स्लॉट बुकिंग",
      phoneLabel: "फ़ोन नंबर",
      digitsOf: (n, total) => `${n}/${total} अंक`,
      sendOtp: "OTP भेजें",
      sending: "भेजा जा रहा है...",
      demoNote: "डेमो फोन: 9999999999 = एडमिन, 8888888888 = स्टाफ, कोई अन्य = किसान।",
      demoModeTag: "डेमो मोड",
      otpPrefilled: "आपका OTP पहले से भरा है:",
      enterOtp: "OTP दर्ज करें",
      verify: "सत्यापित करें और जारी रखें",
      verifying: "सत्यापित हो रहा है...",
      changePhone: "फ़ोन नंबर बदलें",
      cantReachServer: "सर्वर से संपर्क नहीं हो पा रहा। सुनिश्चित करें कि API चल रहा है और पुनः प्रयास करें।",
      invalidOtp: "गलत OTP। कृपया पुनः प्रयास करें।",
      incompletePhone: "अपना पूरा 10 अंकों का फ़ोन नंबर दर्ज करें।",
      otpExpired: "वह कोड समय समाप्त हो गया — कृपया नया कोड मंगवाएं।",
      tooManyAttempts: "बहुत अधिक प्रयास — कृपया कुछ देर बाद फिर कोशिश करें।",
      firebaseError: "SMS नहीं भेजा जा सका। कृपया नंबर जांचें और फिर प्रयास करें।",
      smsSentTo: "OTP SMS द्वारा भेजा गया:"
    },
    farmerHome: {
      greeting: "नमस्ते",
      bookSlot: "स्लॉट बुक करें",
      bookByVoice: "आवाज़ से बुक करें",
      yourBookings: "आपकी बुकिंग",
      noBookings: "अभी तक कोई बुकिंग नहीं।",
      loading: "लोड हो रहा है..."
    },
    bookingWizard: {
      title: "स्लॉट बुक करें",
      cropLabel: "फसल",
      quantityLabel: "मात्रा (क्विंटल)",
      dateLabel: "पसंदीदा तारीख़",
      next: "आगे",
      daysSinceHarvestLabel: "फसल कटे हुए दिन",
      storageLabel: "भंडारण",
      open: "खुला",
      covered: "ढका हुआ",
      checkRisk: "गुणवत्ता जोखिम जांचें",
      checking: "जांच हो रही है...",
      riskPreCheckLabel: "गुणवत्ता जोखिम पूर्व-जांच",
      seeRecommendations: "अनुशंसित केंद्र देखें",
      findingCentres: "केंद्र खोजे जा रहे हैं...",
      whyThisCentre: "यह केंद्र क्यों?",
      hideReasoning: "कारण छुपाएं",
      confirmBookingPrefix: "यहां बुकिंग की पुष्टि करें:",
      bookingInProgress: "बुक हो रहा है...",
      noCentresAvailable: "इस तारीख़/मात्रा के लिए आस-पास कोई केंद्र उपलब्ध नहीं है।",
      noSlotsLeftToday: "आज के लिए कोई स्लॉट बाकी नहीं है, इसलिए आपको कल के लिए दिखाया जा रहा है।",
      kmAway: "किमी दूर",
      queueLabel: "कतार",
      waitLabel: "प्रतीक्षा",
      uploadPhotoLabel: "अपनी फसल की फोटो (वैकल्पिक)",
      uploadPhotoHint: "आपकी जोखिम जांच में AI फोटो-गुणवत्ता संकेत जोड़ता है — यह एक अनुमानित डेमो विश्लेषण है, प्रमाणित ग्रेडिंग नहीं।",
      analyzingPhoto: "फोटो का विश्लेषण हो रहा है...",
      photoSignalLabel: "फोटो-आधारित गुणवत्ता संकेत",
      retakePhoto: "फिर से फोटो लें",
      removePhoto: "फोटो हटाएं",
      skipPhoto: "छोड़ें — मेरे पास फोटो नहीं है",
      photoUnavailable: "फोटो विश्लेषण अभी उपलब्ध नहीं है — केवल मौसम-आधारित जोखिम के साथ जारी रखा जा रहा है।",
      usingGpsLocation: "आपके वर्तमान GPS स्थान का उपयोग किया जा रहा है",
      usingProfileLocation: "आपके पंजीकृत गाँव के स्थान का उपयोग किया जा रहा है",
      retryGps: "मेरा वर्तमान स्थान",
      useRegisteredVillage: "मेरा पंजीकृत गाँव",
      locatingGps: "स्थान खोजा जा रहा है..."
    },
    bookingTracker: {
      token: "टोकन",
      arrivalOtp: "आगमन OTP",
      slot: "स्लॉट",
      queuePosition: "कतार स्थिति",
      estimatedWait: "अनुमानित प्रतीक्षा",
      status: "स्थिति",
      cancelBooking: "बुकिंग रद्द करें",
      cancelledMsg: "बुकिंग रद्द कर दी गई",
      noShowMsg: "बुकिंग नो-शो के रूप में चिह्नित",
      qualityRisk: "बुकिंग के समय गुणवत्ता जोखिम",
      procurementResult: "खरीद परिणाम",
      accepted: "स्वीकृत",
      rejected: "अस्वीकृत",
      payment: "भुगतान",
      notifications: "सूचनाएं",
      noNotifications: "अभी तक कोई लाइव सूचना नहीं — अपडेट यहां दिखाई देंगे।"
    },
    voiceBooking: {
      title: "आवाज़ से बुकिंग",
      subtitle: "अपने जवाब बोलें, या नीचे टाइप करें। डेमो मोड में पूरी तरह ऑफ़लाइन काम करता है।",
      tapToSpeak: "बोलने के लिए टैप करें",
      listening: "सुन रहा है...",
      noSpeechSupport: "इस ब्राउज़र में स्पीच पहचान उपलब्ध नहीं है — कृपया अपना जवाब टाइप करें।",
      typePlaceholder: "अपना जवाब टाइप करें...",
      send: "भेजें",
      backToHome: "होम पर वापस जाएं",
      micDenied: "माइक्रोफ़ोन एक्सेस अवरुद्ध था — कृपया इसे ब्राउज़र में अनुमति दें, या अपना जवाब टाइप करें।",
      noSpeechDetected: "समझ नहीं आया — कृपया फिर से प्रयास करें, या अपना जवाब टाइप करें।",
      recognitionError: "स्पीच पहचान में समस्या हुई — कृपया फिर से प्रयास करें, या अपना जवाब टाइप करें।",
      restartingSession: "वह सत्र समय समाप्त हो गया — नया सत्र शुरू किया जा रहा है।",
      somethingWentWrong: "सर्वर तक पहुंचने में कुछ गड़बड़ हुई — कृपया फिर से प्रयास करें।",
      insecureContext: "आवाज़ इनपुट के लिए सुरक्षित पेज चाहिए (https या localhost) — कृपया इस साइट को सीधे ब्राउज़र टैब में खोलें, किसी एम्बेडेड प्रीव्यू में नहीं।",
      noMicFound: "इस डिवाइस पर कोई माइक्रोफ़ोन नहीं मिला — कृपया अपना जवाब टाइप करें।",
      noVoiceForLanguage: "आपके डिवाइस पर इस भाषा की आवाज़ स्थापित नहीं है, इसलिए डिफ़ॉल्ट आवाज़ में सुनाया जा रहा है — आप नीचे लिखा हुआ पढ़ सकते हैं। Windows पर, Settings > Time & Language > Speech > Add voices से जोड़ें।"
    }
  },
  ta: {
    common: { back: "பின்", logout: "வெளியேறு", loading: "ஏற்றுகிறது..." },
    login: {
      tagline: "கொள்முதல் மையங்களுக்கான ஸ்மார்ட் ஸ்லாட் முன்பதிவு",
      phoneLabel: "தொலைபேசி எண்",
      digitsOf: (n, total) => `${n}/${total} இலக்கங்கள்`,
      sendOtp: "OTP அனுப்பு",
      sending: "அனுப்புகிறது...",
      demoNote: "டெமோ எண்கள்: 9999999999 = நிர்வாகி, 8888888888 = ஊழியர், மற்றவை = விவசாயி.",
      demoModeTag: "டெமோ முறை",
      otpPrefilled: "உங்கள் OTP முன்பே நிரப்பப்பட்டுள்ளது:",
      enterOtp: "OTP ஐ உள்ளிடவும்",
      verify: "சரிபார்த்து தொடரவும்",
      verifying: "சரிபார்க்கிறது...",
      changePhone: "தொலைபேசி எண்ணை மாற்று",
      cantReachServer: "சேவையகத்தை அடைய முடியவில்லை. API இயங்குகிறதா எனச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
      invalidOtp: "தவறான OTP. மீண்டும் முயற்சிக்கவும்.",
      incompletePhone: "உங்கள் முழு 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்.",
      otpExpired: "அந்த குறியீடு காலாவதியானது — புதிய குறியீட்டைக் கோரவும்.",
      tooManyAttempts: "பல முயற்சிகள் — சிறிது நேரம் காத்திருந்து மீண்டும் முயற்சிக்கவும்.",
      firebaseError: "SMS அனுப்ப முடியவில்லை. எண்ணைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
      smsSentTo: "OTP SMS மூலம் அனுப்பப்பட்டது:"
    },
    farmerHome: {
      greeting: "வணக்கம்",
      bookSlot: "ஸ்லாட் முன்பதிவு",
      bookByVoice: "குரல் மூலம் முன்பதிவு",
      yourBookings: "உங்கள் முன்பதிவுகள்",
      noBookings: "இதுவரை முன்பதிவுகள் இல்லை.",
      loading: "ஏற்றுகிறது..."
    },
    bookingWizard: {
      title: "ஸ்லாட் முன்பதிவு",
      cropLabel: "பயிர்",
      quantityLabel: "அளவு (குவிண்டால்)",
      dateLabel: "விருப்பமான தேதி",
      next: "அடுத்து",
      daysSinceHarvestLabel: "அறுவடையான நாட்கள்",
      storageLabel: "சேமிப்பு",
      open: "திறந்த",
      covered: "மூடிய",
      checkRisk: "தர அபாயத்தை சரிபார்க்கவும்",
      checking: "சரிபார்க்கிறது...",
      riskPreCheckLabel: "தர அபாய முன் சரிபார்ப்பு",
      seeRecommendations: "பரிந்துரைக்கப்பட்ட மையங்களைக் காண்க",
      findingCentres: "மையங்களைத் தேடுகிறது...",
      whyThisCentre: "ஏன் இந்த மையம்?",
      hideReasoning: "காரணத்தை மறை",
      confirmBookingPrefix: "இங்கு முன்பதிவை உறுதிசெய்யவும்:",
      bookingInProgress: "முன்பதிவு செய்கிறது...",
      noCentresAvailable: "இந்த தேதி/அளவிற்கு அருகில் மையங்கள் இல்லை.",
      noSlotsLeftToday: "இன்றைக்கு ஸ்லாட்கள் இல்லை, எனவே நாளைக்கு காட்டப்படுகிறது.",
      kmAway: "கிமீ தொலைவில்",
      queueLabel: "வரிசை",
      waitLabel: "காத்திருப்பு",
      uploadPhotoLabel: "உங்கள் விளைபொருளின் புகைப்படம் (விருப்பத்தேர்வு)",
      uploadPhotoHint: "உங்கள் அபாய சரிபார்ப்பில் AI புகைப்பட-தர சமிக்ஞையைச் சேர்க்கிறது — இது ஒரு தோராய டெமோ பகுப்பாய்வு, சான்றளிக்கப்பட்ட தரப்படுத்தல் அல்ல.",
      analyzingPhoto: "புகைப்படத்தை பகுப்பாய்வு செய்கிறது...",
      photoSignalLabel: "புகைப்படம் அடிப்படையிலான தர சமிக்ஞை",
      retakePhoto: "மீண்டும் புகைப்படம் எடு",
      removePhoto: "புகைப்படத்தை அகற்று",
      skipPhoto: "தவிர்க்க — என்னிடம் புகைப்படம் இல்லை",
      photoUnavailable: "புகைப்பட பகுப்பாய்வு தற்போது கிடைக்கவில்லை — வானிலை அடிப்படையிலான அபாயத்துடன் மட்டும் தொடர்கிறது.",
      usingGpsLocation: "உங்கள் தற்போதைய GPS இருப்பிடம் பயன்படுத்தப்படுகிறது",
      usingProfileLocation: "உங்கள் பதிவு செய்யப்பட்ட கிராம இருப்பிடம் பயன்படுத்தப்படுகிறது",
      retryGps: "எனது தற்போதைய இருப்பிடம்",
      useRegisteredVillage: "எனது பதிவு செய்த கிராமம்",
      locatingGps: "கண்டறிகிறது..."
    },
    bookingTracker: {
      token: "டோக்கன்",
      arrivalOtp: "வருகை OTP",
      slot: "ஸ்லாட்",
      queuePosition: "வரிசை நிலை",
      estimatedWait: "மதிப்பிடப்பட்ட காத்திருப்பு",
      status: "நிலை",
      cancelBooking: "முன்பதிவை ரத்து செய்",
      cancelledMsg: "முன்பதிவு ரத்து செய்யப்பட்டது",
      noShowMsg: "முன்பதிவு வராதவர் என குறிக்கப்பட்டது",
      qualityRisk: "முன்பதிவு நேரத்தில் தர அபாயம்",
      procurementResult: "கொள்முதல் முடிவு",
      accepted: "ஏற்கப்பட்டது",
      rejected: "நிராகரிக்கப்பட்டது",
      payment: "கட்டணம்",
      notifications: "அறிவிப்புகள்",
      noNotifications: "இன்னும் நேரலை அறிவிப்புகள் இல்லை — புதுப்பிப்புகள் இங்கே தோன்றும்."
    },
    voiceBooking: {
      title: "குரல் முன்பதிவு",
      subtitle: "உங்கள் பதில்களைப் பேசுங்கள், அல்லது கீழே தட்டச்சு செய்யுங்கள். டெமோ முறையில் முழுவதும் ஆஃப்லைனில் வேலை செய்கிறது.",
      tapToSpeak: "பேச தட்டவும்",
      listening: "கேட்கிறது...",
      noSpeechSupport: "இந்த உலாவியில் பேச்சு அங்கீகாரம் இல்லை — தயவுசெய்து உங்கள் பதிலைத் தட்டச்சு செய்யவும்.",
      typePlaceholder: "உங்கள் பதிலைத் தட்டச்சு செய்யவும்...",
      send: "அனுப்பு",
      backToHome: "முகப்புக்குத் திரும்பு",
      micDenied: "மைக்ரோஃபோன் அணுகல் தடுக்கப்பட்டது — உலாவியில் அனுமதிக்கவும், அல்லது உங்கள் பதிலைத் தட்டச்சு செய்யவும்.",
      noSpeechDetected: "புரியவில்லை — மீண்டும் முயற்சிக்கவும், அல்லது உங்கள் பதிலைத் தட்டச்சு செய்யவும்.",
      recognitionError: "பேச்சு அங்கீகாரத்தில் சிக்கல் — மீண்டும் முயற்சிக்கவும், அல்லது உங்கள் பதிலைத் தட்டச்சு செய்யவும்.",
      restartingSession: "அந்த அமர்வு காலாவதியானது — புதிய அமர்வைத் தொடங்குகிறது.",
      somethingWentWrong: "சேவையகத்தை அடைவதில் சிக்கல் — மீண்டும் முயற்சிக்கவும்.",
      insecureContext: "குரல் உள்ளீட்டிற்கு பாதுகாப்பான பக்கம் தேவை (https அல்லது localhost) — இந்த தளத்தை நேரடியாக உலாவி டேபில் திறக்கவும், உட்பொதிக்கப்பட்ட முன்னோட்டத்தில் அல்ல.",
      noMicFound: "இந்த சாதனத்தில் மைக்ரோஃபோன் கிடைக்கவில்லை — உங்கள் பதிலைத் தட்டச்சு செய்யவும்.",
      noVoiceForLanguage: "உங்கள் சாதனத்தில் இந்த மொழிக்கான குரல் நிறுவப்படவில்லை, எனவே இயல்புநிலை குரலில் ஒலிக்கிறது — கீழே உள்ள உரையைப் படிக்கலாம். Windows-இல், Settings > Time & Language > Speech > Add voices வழியாக சேர்க்கவும்."
    }
  },
  te: {
    common: { back: "వెనుకకు", logout: "లాగ్ అవుట్", loading: "లోడ్ అవుతోంది..." },
    login: {
      tagline: "సేకరణ కేంద్రాల కోసం స్మార్ట్ స్లాట్ బుకింగ్",
      phoneLabel: "ఫోన్ నంబర్",
      digitsOf: (n, total) => `${n}/${total} అంకెలు`,
      sendOtp: "OTP పంపండి",
      sending: "పంపుతోంది...",
      demoNote: "డెమో నంబర్లు: 9999999999 = అడ్మిన్, 8888888888 = సిబ్బంది, ఇతరులు = రైతు.",
      demoModeTag: "డెమో మోడ్",
      otpPrefilled: "మీ OTP ముందుగానే నింపబడింది:",
      enterOtp: "OTP నమోదు చేయండి",
      verify: "ధృవీకరించి కొనసాగించండి",
      verifying: "ధృవీకరిస్తోంది...",
      changePhone: "ఫోన్ నంబర్ మార్చండి",
      cantReachServer: "సర్వర్‌ను చేరుకోలేకపోయాము. API నడుస్తుందో లేదో నిర్ధారించుకుని మళ్లీ ప్రయత్నించండి.",
      invalidOtp: "తప్పు OTP. దయచేసి మళ్లీ ప్రయత్నించండి.",
      incompletePhone: "మీ పూర్తి 10 అంకెల ఫోన్ నంబర్‌ను నమోదు చేయండి.",
      otpExpired: "ఆ కోడ్ గడువు ముగిసింది — దయచేసి కొత్త కోడ్‌ను అభ్యర్థించండి.",
      tooManyAttempts: "చాలా ప్రయత్నాలు — దయచేసి కొంచెం సేపు ఆగి మళ్లీ ప్రయత్నించండి.",
      firebaseError: "SMS పంపలేకపోయాము. దయచేసి నంబర్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
      smsSentTo: "OTP SMS ద్వారా పంపబడింది:"
    },
    farmerHome: {
      greeting: "నమస్తే",
      bookSlot: "స్లాట్ బుక్ చేయండి",
      bookByVoice: "వాయిస్ ద్వారా బుక్ చేయండి",
      yourBookings: "మీ బుకింగ్‌లు",
      noBookings: "ఇంకా బుకింగ్‌లు లేవు.",
      loading: "లోడ్ అవుతోంది..."
    },
    bookingWizard: {
      title: "స్లాట్ బుక్ చేయండి",
      cropLabel: "పంట",
      quantityLabel: "పరిమాణం (క్వింటాళ్లు)",
      dateLabel: "ఇష్టపడే తేదీ",
      next: "తదుపరి",
      daysSinceHarvestLabel: "కోత నుండి రోజులు",
      storageLabel: "నిల్వ",
      open: "బహిరంగ",
      covered: "కప్పబడిన",
      checkRisk: "నాణ్యత ప్రమాదాన్ని తనిఖీ చేయండి",
      checking: "తనిఖీ చేస్తోంది...",
      riskPreCheckLabel: "నాణ్యత ప్రమాద ముందస్తు తనిఖీ",
      seeRecommendations: "సిఫార్సు చేసిన కేంద్రాలను చూడండి",
      findingCentres: "కేంద్రాలను కనుగొంటోంది...",
      whyThisCentre: "ఈ కేంద్రం ఎందుకు?",
      hideReasoning: "కారణాన్ని దాచు",
      confirmBookingPrefix: "ఇక్కడ బుకింగ్‌ను నిర్ధారించండి:",
      bookingInProgress: "బుక్ చేస్తోంది...",
      noCentresAvailable: "ఈ తేదీ/పరిమాణానికి సమీపంలో కేంద్రాలు లేవు.",
      noSlotsLeftToday: "ఈరోజుకు స్లాట్‌లు లేవు, కాబట్టి రేపటికి చూపిస్తున్నాము.",
      kmAway: "కి.మీ దూరంలో",
      queueLabel: "క్యూ",
      waitLabel: "వేచి ఉండండి",
      uploadPhotoLabel: "మీ ఉత్పత్తి ఫోటో (ఐచ్ఛికం)",
      uploadPhotoHint: "మీ ప్రమాద తనిఖీకి AI ఫోటో-నాణ్యత సంకేతాన్ని జోడిస్తుంది — ఇది అంచనా వేసిన డెమో విశ్లేషణ, ధృవీకరించిన గ్రేడింగ్ కాదు.",
      analyzingPhoto: "ఫోటోను విశ్లేషిస్తోంది...",
      photoSignalLabel: "ఫోటో-ఆధారిత నాణ్యత సంకేతం",
      retakePhoto: "మళ్లీ ఫోటో తీయండి",
      removePhoto: "ఫోటోను తీసివేయండి",
      skipPhoto: "దాటవేయి — నా వద్ద ఫోటో లేదు",
      photoUnavailable: "ఫోటో విశ్లేషణ ప్రస్తుతం అందుబాటులో లేదు — వాతావరణ ఆధారిత ప్రమాదంతో మాత్రమే కొనసాగుతోంది.",
      usingGpsLocation: "మీ ప్రస్తుత GPS స్థానం ఉపయోగించబడుతోంది",
      usingProfileLocation: "మీ నమోదిత గ్రామ స్థానం ఉపయోగించబడుతోంది",
      retryGps: "నా ప్రస్తుత స్థానం",
      useRegisteredVillage: "నా నమోదిత గ్రామం",
      locatingGps: "గుర్తిస్తోంది..."
    },
    bookingTracker: {
      token: "టోకెన్",
      arrivalOtp: "రాక OTP",
      slot: "స్లాట్",
      queuePosition: "క్యూ స్థానం",
      estimatedWait: "అంచనా వేచి ఉండే సమయం",
      status: "స్థితి",
      cancelBooking: "బుకింగ్‌ను రద్దు చేయండి",
      cancelledMsg: "బుకింగ్ రద్దు చేయబడింది",
      noShowMsg: "బుకింగ్ నో-షో గా గుర్తించబడింది",
      qualityRisk: "బుకింగ్ సమయంలో నాణ్యత ప్రమాదం",
      procurementResult: "సేకరణ ఫలితం",
      accepted: "ఆమోదించబడింది",
      rejected: "తిరస్కరించబడింది",
      payment: "చెల్లింపు",
      notifications: "నోటిఫికేషన్‌లు",
      noNotifications: "ఇంకా ప్రత్యక్ష నోటిఫికేషన్‌లు లేవు — నవీకరణలు ఇక్కడ కనిపిస్తాయి."
    },
    voiceBooking: {
      title: "వాయిస్ బుకింగ్",
      subtitle: "మీ సమాధానాలు మాట్లాడండి, లేదా క్రింద టైప్ చేయండి. డెమో మోడ్‌లో పూర్తిగా ఆఫ్‌లైన్‌లో పనిచేస్తుంది.",
      tapToSpeak: "మాట్లాడటానికి నొక్కండి",
      listening: "వింటోంది...",
      noSpeechSupport: "ఈ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ అందుబాటులో లేదు — దయచేసి మీ సమాధానాన్ని టైప్ చేయండి.",
      typePlaceholder: "మీ సమాధానాన్ని టైప్ చేయండి...",
      send: "పంపండి",
      backToHome: "హోమ్‌కు తిరిగి వెళ్ళండి",
      micDenied: "మైక్రోఫోన్ యాక్సెస్ నిరోధించబడింది — దయచేసి బ్రౌజర్‌లో అనుమతించండి, లేదా మీ సమాధానాన్ని టైప్ చేయండి.",
      noSpeechDetected: "అర్థం కాలేదు — దయచేసి మళ్లీ ప్రయత్నించండి, లేదా మీ సమాధానాన్ని టైప్ చేయండి.",
      recognitionError: "స్పీచ్ రికగ్నిషన్‌లో సమస్య — దయచేసి మళ్లీ ప్రయత్నించండి, లేదా టైప్ చేయండి.",
      restartingSession: "ఆ సెషన్ గడువు ముగిసింది — కొత్త సెషన్ ప్రారంభిస్తోంది.",
      somethingWentWrong: "సర్వర్‌ను చేరుకోవడంలో సమస్య — దయచేసి మళ్లీ ప్రయత్నించండి.",
      insecureContext: "వాయిస్ ఇన్‌పుట్‌కు సురక్షిత పేజీ అవసరం (https లేదా localhost) — దయచేసి ఈ సైట్‌ను నేరుగా బ్రౌజర్ ట్యాబ్‌లో తెరవండి, ఎంబెడెడ్ ప్రివ్యూలో కాదు.",
      noMicFound: "ఈ పరికరంలో మైక్రోఫోన్ కనుగొనబడలేదు — దయచేసి మీ సమాధానాన్ని టైప్ చేయండి.",
      noVoiceForLanguage: "మీ పరికరంలో ఈ భాషకు వాయిస్ ఇన్‌స్టాల్ చేయబడలేదు, కాబట్టి డిఫాల్ట్ వాయిస్‌లో వినిపిస్తోంది — మీరు కింద ఉన్న వచనాన్ని చదవవచ్చు. Windows‌లో, Settings > Time & Language > Speech > Add voices ద్వారా జోడించండి."
    }
  },
  kn: {
    common: { back: "ಹಿಂದೆ", logout: "ಲಾಗ್ ಔಟ್", loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..." },
    login: {
      tagline: "ಖರೀದಿ ಕೇಂದ್ರಗಳಿಗಾಗಿ ಸ್ಮಾರ್ಟ್ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್",
      phoneLabel: "ಫೋನ್ ಸಂಖ್ಯೆ",
      digitsOf: (n, total) => `${n}/${total} ಅಂಕೆಗಳು`,
      sendOtp: "OTP ಕಳುಹಿಸಿ",
      sending: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
      demoNote: "ಡೆಮೊ ಫೋನ್‌ಗಳು: 9999999999 = ಅಡ್ಮಿನ್, 8888888888 = ಸಿಬ್ಬಂದಿ, ಇತರೆ = ರೈತ.",
      demoModeTag: "ಡೆಮೊ ಮೋಡ್",
      otpPrefilled: "ನಿಮ್ಮ OTP ಈಗಾಗಲೇ ತುಂಬಿಸಲಾಗಿದೆ:",
      enterOtp: "OTP ನಮೂದಿಸಿ",
      verify: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮುಂದುವರಿಸಿ",
      verifying: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      changePhone: "ಫೋನ್ ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ",
      cantReachServer: "ಸರ್ವರ್ ಅನ್ನು ತಲುಪಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. API ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಂಡು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      invalidOtp: "ತಪ್ಪು OTP. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      incompletePhone: "ನಿಮ್ಮ ಪೂರ್ಣ 10 ಅಂಕಿಯ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
      otpExpired: "ಆ ಕೋಡ್ ಅವಧಿ ಮುಗಿದಿದೆ — ದಯವಿಟ್ಟು ಹೊಸ ಕೋಡ್ ಕೋರಿ.",
      tooManyAttempts: "ಹಲವಾರು ಪ್ರಯತ್ನಗಳು — ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯ ಕಾದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      firebaseError: "SMS ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      smsSentTo: "OTP SMS ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ:"
    },
    farmerHome: {
      greeting: "ನಮಸ್ಕಾರ",
      bookSlot: "ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ",
      bookByVoice: "ಧ್ವನಿ ಮೂಲಕ ಬುಕ್ ಮಾಡಿ",
      yourBookings: "ನಿಮ್ಮ ಬುಕಿಂಗ್‌ಗಳು",
      noBookings: "ಇನ್ನೂ ಯಾವುದೇ ಬುಕಿಂಗ್‌ಗಳಿಲ್ಲ.",
      loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..."
    },
    bookingWizard: {
      title: "ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ",
      cropLabel: "ಬೆಳೆ",
      quantityLabel: "ಪ್ರಮಾಣ (ಕ್ವಿಂಟಾಲ್)",
      dateLabel: "ಆದ್ಯತೆಯ ದಿನಾಂಕ",
      next: "ಮುಂದೆ",
      daysSinceHarvestLabel: "ಕೊಯ್ಲಿನಿಂದ ದಿನಗಳು",
      storageLabel: "ಸಂಗ್ರಹಣೆ",
      open: "ತೆರೆದ",
      covered: "ಮುಚ್ಚಿದ",
      checkRisk: "ಗುಣಮಟ್ಟದ ಅಪಾಯವನ್ನು ಪರಿಶೀಲಿಸಿ",
      checking: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      riskPreCheckLabel: "ಗುಣಮಟ್ಟದ ಅಪಾಯ ಮುನ್ ಪರಿಶೀಲನೆ",
      seeRecommendations: "ಶಿಫಾರಸು ಮಾಡಿದ ಕೇಂದ್ರಗಳನ್ನು ನೋಡಿ",
      findingCentres: "ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
      whyThisCentre: "ಈ ಕೇಂದ್ರ ಏಕೆ?",
      hideReasoning: "ಕಾರಣವನ್ನು ಮರೆಮಾಡಿ",
      confirmBookingPrefix: "ಇಲ್ಲಿ ಬುಕಿಂಗ್ ಅನ್ನು ದೃಢೀಕರಿಸಿ:",
      bookingInProgress: "ಬುಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      noCentresAvailable: "ಈ ದಿನಾಂಕ/ಪ್ರಮಾಣಕ್ಕೆ ಹತ್ತಿರದಲ್ಲಿ ಯಾವುದೇ ಕೇಂದ್ರಗಳು ಲಭ್ಯವಿಲ್ಲ.",
      noSlotsLeftToday: "ಇಂದು ಯಾವುದೇ ಸ್ಲಾಟ್‌ಗಳು ಉಳಿದಿಲ್ಲ, ಆದ್ದರಿಂದ ನಾಳೆಗೆ ತೋರಿಸಲಾಗುತ್ತಿದೆ.",
      kmAway: "ಕಿ.ಮೀ ದೂರದಲ್ಲಿ",
      queueLabel: "ಸಾಲು",
      waitLabel: "ಕಾಯುವಿಕೆ",
      uploadPhotoLabel: "ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಫೋಟೋ (ಐಚ್ಛಿಕ)",
      uploadPhotoHint: "ನಿಮ್ಮ ಅಪಾಯ ಪರಿಶೀಲನೆಗೆ AI ಫೋಟೋ-ಗುಣಮಟ್ಟದ ಸಂಕೇತವನ್ನು ಸೇರಿಸುತ್ತದೆ — ಇದು ಅಂದಾಜು ಡೆಮೊ ವಿಶ್ಲೇಷಣೆ, ಪ್ರಮಾಣೀಕೃತ ಗ್ರೇಡಿಂಗ್ ಅಲ್ಲ.",
      analyzingPhoto: "ಫೋಟೋ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
      photoSignalLabel: "ಫೋಟೋ ಆಧಾರಿತ ಗುಣಮಟ್ಟದ ಸಂಕೇತ",
      retakePhoto: "ಮತ್ತೆ ಫೋಟೋ ತೆಗೆಯಿರಿ",
      removePhoto: "ಫೋಟೋ ತೆಗೆದುಹಾಕಿ",
      skipPhoto: "ಬಿಟ್ಟುಬಿಡಿ — ನನ್ನ ಬಳಿ ಫೋಟೋ ಇಲ್ಲ",
      photoUnavailable: "ಫೋಟೋ ವಿಶ್ಲೇಷಣೆ ಈಗ ಲಭ್ಯವಿಲ್ಲ — ಹವಾಮಾನ ಆಧಾರಿತ ಅಪಾಯದೊಂದಿಗೆ ಮಾತ್ರ ಮುಂದುವರಿಯಲಾಗುತ್ತಿದೆ.",
      usingGpsLocation: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ GPS ಸ್ಥಳವನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ",
      usingProfileLocation: "ನಿಮ್ಮ ನೋಂದಾಯಿತ ಗ್ರಾಮದ ಸ್ಥಳವನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ",
      retryGps: "ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳ",
      useRegisteredVillage: "ನನ್ನ ನೋಂದಾಯಿತ ಗ್ರಾಮ",
      locatingGps: "ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ..."
    },
    bookingTracker: {
      token: "ಟೋಕನ್",
      arrivalOtp: "ಆಗಮನ OTP",
      slot: "ಸ್ಲಾಟ್",
      queuePosition: "ಸಾಲಿನ ಸ್ಥಾನ",
      estimatedWait: "ಅಂದಾಜು ಕಾಯುವಿಕೆ",
      status: "ಸ್ಥಿತಿ",
      cancelBooking: "ಬುಕಿಂಗ್ ರದ್ದುಗೊಳಿಸಿ",
      cancelledMsg: "ಬುಕಿಂಗ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
      noShowMsg: "ಬುಕಿಂಗ್ ನೋ-ಶೋ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ",
      qualityRisk: "ಬುಕಿಂಗ್ ಸಮಯದಲ್ಲಿ ಗುಣಮಟ್ಟದ ಅಪಾಯ",
      procurementResult: "ಖರೀದಿ ಫಲಿತಾಂಶ",
      accepted: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
      rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
      payment: "ಪಾವತಿ",
      notifications: "ಅಧಿಸೂಚನೆಗಳು",
      noNotifications: "ಇನ್ನೂ ಯಾವುದೇ ನೇರ ಪ್ರಸಾರ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ — ನವೀಕರಣಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ."
    },
    voiceBooking: {
      title: "ಧ್ವನಿ ಬುಕಿಂಗ್",
      subtitle: "ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ಮಾತನಾಡಿ, ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ. ಡೆಮೊ ಮೋಡ್‌ನಲ್ಲಿ ಸಂಪೂರ್ಣವಾಗಿ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.",
      tapToSpeak: "ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
      listening: "ಆಲಿಸುತ್ತಿದೆ...",
      noSpeechSupport: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಪೀಚ್ ರೆಕಗ್ನಿಷನ್ ಲಭ್ಯವಿಲ್ಲ — ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಟೈಪ್ ಮಾಡಿ.",
      typePlaceholder: "ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಟೈಪ್ ಮಾಡಿ...",
      send: "ಕಳುಹಿಸಿ",
      backToHome: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
      micDenied: "ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ — ದಯವಿಟ್ಟು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಅನುಮತಿಸಿ, ಅಥವಾ ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಟೈಪ್ ಮಾಡಿ.",
      noSpeechDetected: "ಅರ್ಥವಾಗಲಿಲ್ಲ — ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ, ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.",
      recognitionError: "ಸ್ಪೀಚ್ ರೆಕಗ್ನಿಷನ್‌ನಲ್ಲಿ ಸಮಸ್ಯೆ — ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ, ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.",
      restartingSession: "ಆ ಅಧಿವೇಶನದ ಅವಧಿ ಮುಗಿದಿದೆ — ಹೊಸ ಅಧಿವೇಶನ ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ.",
      somethingWentWrong: "ಸರ್ವರ್ ಅನ್ನು ತಲುಪುವಲ್ಲಿ ಸಮಸ್ಯೆ — ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      insecureContext: "ಧ್ವನಿ ಇನ್‌ಪುಟ್‌ಗೆ ಸುರಕ್ಷಿತ ಪುಟ ಬೇಕು (https ಅಥವಾ localhost) — ದಯವಿಟ್ಟು ಈ ಸೈಟ್ ಅನ್ನು ನೇರವಾಗಿ ಬ್ರೌಸರ್ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ, ಎಂಬೆಡೆಡ್ ಪ್ರಿವ್ಯೂನಲ್ಲಿ ಅಲ್ಲ.",
      noMicFound: "ಈ ಸಾಧನದಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಕಂಡುಬಂದಿಲ್ಲ — ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಟೈಪ್ ಮಾಡಿ.",
      noVoiceForLanguage: "ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಈ ಭಾಷೆಗೆ ಧ್ವನಿ ಸ್ಥಾಪಿಸಲಾಗಿಲ್ಲ, ಆದ್ದರಿಂದ ಡೀಫಾಲ್ಟ್ ಧ್ವನಿಯಲ್ಲಿ ಪ್ಲೇ ಆಗುತ್ತಿದೆ — ನೀವು ಕೆಳಗಿನ ಪಠ್ಯವನ್ನು ಓದಬಹುದು. Windows ನಲ್ಲಿ, Settings > Time & Language > Speech > Add voices ಮೂಲಕ ಸೇರಿಸಿ."
    }
  }
};
