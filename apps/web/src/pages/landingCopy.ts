export type LandingLang = "en" | "hi" | "ta" | "te" | "kn";

// Alphabetical by English name: English, Hindi, Kannada, Tamil, Telugu.
export const LANGUAGE_OPTIONS: { code: LandingLang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" }
];

interface LandingCopy {
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trust: string;
  featuresHeading: string;
  features: { icon: string; title: string; desc: string }[];
  howHeading: string;
  steps: { title: string; desc: string }[];
  audienceHeading: string;
  audiences: { icon: string; title: string; desc: string }[];
  footerNote: string;
}

export const LANDING_COPY: Record<LandingLang, LandingCopy> = {
  en: {
    tagline: "Smart slot booking for procurement centres",
    heroTitle: "No more waiting in line without knowing why.",
    heroSubtitle:
      "Book your procurement slot in minutes, check your quality risk before you travel, and track your token live — by app or by voice, in your own language.",
    ctaPrimary: "Get started",
    ctaSecondary: "I already have an account",
    trust: "Built for government procurement centres · No smartphone required · Works offline for voice booking",
    featuresHeading: "What Procuremintra offers you",
    features: [
      { icon: "📅", title: "Smart slot booking", desc: "We recommend the best centre and time for you — based on distance, live queue, and capacity, with the reasoning shown on screen." },
      { icon: "🎙", title: "Book by voice", desc: "No smartphone or reading needed. Speak your answers in Hindi, Tamil, Telugu or English." },
      { icon: "🌾", title: "Quality risk pre-check", desc: "Know your rejection risk from weather and storage conditions before you travel, not after." },
      { icon: "📍", title: "Live queue tracking", desc: "See your real position and estimated wait time update live, from booking to payment." }
    ],
    howHeading: "How it works",
    steps: [
      { title: "Book a slot", desc: "Pick your crop and quantity — we recommend the best centre and time." },
      { title: "Travel with confidence", desc: "See your quality risk and queue position before you leave home." },
      { title: "Get paid, tracked", desc: "Track weighing, procurement and payment status in one place." }
    ],
    audienceHeading: "Built for everyone at the centre",
    audiences: [
      { icon: "🧑‍🌾", title: "Farmers", desc: "Book slots, track queue position, get paid on time." },
      { icon: "🧑‍💼", title: "Centre staff", desc: "Verify arrivals by OTP and move procurement forward, screen by screen." },
      { icon: "🏛️", title: "Government officials", desc: "Forecast arrivals, monitor rejection trends and payment SLAs." }
    ],
    footerNote: "A Smart India Hackathon 2026 prototype by Team DoomCore"
  },
  hi: {
    tagline: "खरीद केंद्रों के लिए स्मार्ट स्लॉट बुकिंग",
    heroTitle: "अब बिना वजह जाने कतार में इंतज़ार नहीं।",
    heroSubtitle:
      "मिनटों में अपना खरीद स्लॉट बुक करें, यात्रा से पहले अपने माल का गुणवत्ता जोखिम जानें, और अपना टोकन लाइव ट्रैक करें — ऐप से या आवाज़ से, अपनी भाषा में।",
    ctaPrimary: "शुरू करें",
    ctaSecondary: "मेरा खाता पहले से है",
    trust: "सरकारी खरीद केंद्रों के लिए बनाया गया · स्मार्टफोन ज़रूरी नहीं · आवाज़ बुकिंग बिना इंटरनेट भी काम करती है",
    featuresHeading: "Procuremintra आपको क्या देता है",
    features: [
      { icon: "📅", title: "स्मार्ट स्लॉट बुकिंग", desc: "दूरी, लाइव कतार और क्षमता के आधार पर हम आपके लिए सबसे अच्छा केंद्र और समय सुझाते हैं, कारण स्क्रीन पर दिखाया जाता है।" },
      { icon: "🎙", title: "आवाज़ से बुक करें", desc: "स्मार्टफोन या पढ़ने की ज़रूरत नहीं। हिंदी, तमिल, तेलुगु या अंग्रेज़ी में बोलकर जवाब दें।" },
      { icon: "🌾", title: "गुणवत्ता जोखिम जांच", desc: "मौसम और भंडारण की स्थिति से अस्वीकृति का जोखिम यात्रा से पहले जानें, बाद में नहीं।" },
      { icon: "📍", title: "लाइव कतार ट्रैकिंग", desc: "बुकिंग से भुगतान तक अपनी असली स्थिति और अनुमानित प्रतीक्षा समय लाइव देखें।" }
    ],
    howHeading: "यह कैसे काम करता है",
    steps: [
      { title: "स्लॉट बुक करें", desc: "अपनी फसल और मात्रा चुनें — हम सबसे अच्छा केंद्र और समय सुझाते हैं।" },
      { title: "भरोसे के साथ यात्रा करें", desc: "घर से निकलने से पहले अपना गुणवत्ता जोखिम और कतार स्थिति देखें।" },
      { title: "भुगतान, ट्रैक किया गया", desc: "तौल, खरीद और भुगतान की स्थिति एक ही जगह ट्रैक करें।" }
    ],
    audienceHeading: "केंद्र पर सभी के लिए बनाया गया",
    audiences: [
      { icon: "🧑‍🌾", title: "किसान", desc: "स्लॉट बुक करें, कतार स्थिति ट्रैक करें, समय पर भुगतान पाएं।" },
      { icon: "🧑‍💼", title: "केंद्र कर्मचारी", desc: "OTP से आगमन सत्यापित करें और खरीद को आगे बढ़ाएं।" },
      { icon: "🏛️", title: "सरकारी अधिकारी", desc: "आगमन का पूर्वानुमान, अस्वीकृति रुझान और भुगतान SLA देखें।" }
    ],
    footerNote: "Team DoomCore द्वारा Smart India Hackathon 2026 प्रोटोटाइप"
  },
  ta: {
    tagline: "கொள்முதல் மையங்களுக்கான ஸ்மார்ட் ஸ்லாட் முன்பதிவு",
    heroTitle: "இனி காரணம் தெரியாமல் வரிசையில் காத்திருக்க வேண்டாம்.",
    heroSubtitle:
      "நிமிடங்களில் உங்கள் கொள்முதல் ஸ்லாட்டை முன்பதிவு செய்யுங்கள், பயணிக்கும் முன் தர அபாயத்தை சரிபார்க்கவும், உங்கள் டோக்கனை நேரலையில் கண்காணிக்கவும் — ஆப் அல்லது குரல் மூலம், உங்கள் மொழியில்.",
    ctaPrimary: "தொடங்குங்கள்",
    ctaSecondary: "எனக்கு ஏற்கனவே கணக்கு உள்ளது",
    trust: "அரசு கொள்முதல் மையங்களுக்காக உருவாக்கப்பட்டது · ஸ்மார்ட்ஃபோன் தேவையில்லை · குரல் முன்பதிவு இணையம் இல்லாமலும் வேலை செய்யும்",
    featuresHeading: "Procuremintra உங்களுக்கு வழங்குவது",
    features: [
      { icon: "📅", title: "ஸ்மார்ட் ஸ்லாட் முன்பதிவு", desc: "தூரம், நேரலை வரிசை மற்றும் திறன் அடிப்படையில் சிறந்த மையம் மற்றும் நேரத்தை பரிந்துரைக்கிறோம், காரணம் திரையில் காட்டப்படும்." },
      { icon: "🎙", title: "குரல் மூலம் முன்பதிவு", desc: "ஸ்மார்ட்ஃபோன் அல்லது படிக்கத் தேவையில்லை. இந்தி, தமிழ், தெலுங்கு அல்லது ஆங்கிலத்தில் பேசி பதிலளிக்கவும்." },
      { icon: "🌾", title: "தர அபாய முன் சரிபார்ப்பு", desc: "வானிலை மற்றும் சேமிப்பு நிலைமைகளிலிருந்து நிராகரிப்பு அபாயத்தை பயணிக்கும் முன்பே அறியுங்கள்." },
      { icon: "📍", title: "நேரலை வரிசை கண்காணிப்பு", desc: "முன்பதிவு முதல் கட்டணம் வரை உங்கள் நிலை மற்றும் காத்திருப்பு நேரத்தை நேரலையில் காணுங்கள்." }
    ],
    howHeading: "இது எப்படி வேலை செய்கிறது",
    steps: [
      { title: "ஸ்லாட் முன்பதிவு செய்யுங்கள்", desc: "உங்கள் பயிர் மற்றும் அளவைத் தேர்வு செய்யுங்கள் — சிறந்த மையம் மற்றும் நேரத்தை பரிந்துரைக்கிறோம்." },
      { title: "நம்பிக்கையுடன் பயணியுங்கள்", desc: "வீட்டை விட்டு கிளம்பும் முன் உங்கள் தர அபாயம் மற்றும் வரிசை நிலையைக் காணுங்கள்." },
      { title: "கட்டணம், கண்காணிக்கப்பட்டது", desc: "எடைபோடுதல், கொள்முதல் மற்றும் கட்டண நிலையை ஒரே இடத்தில் கண்காணிக்கவும்." }
    ],
    audienceHeading: "மையத்தில் அனைவருக்கும் உருவாக்கப்பட்டது",
    audiences: [
      { icon: "🧑‍🌾", title: "விவசாயிகள்", desc: "ஸ்லாட் முன்பதிவு செய்யுங்கள், வரிசை நிலையைக் கண்காணியுங்கள், சரியான நேரத்தில் கட்டணம் பெறுங்கள்." },
      { icon: "🧑‍💼", title: "மைய ஊழியர்கள்", desc: "OTP மூலம் வருகையை சரிபார்த்து கொள்முதலை முன்னெடுக்கவும்." },
      { icon: "🏛️", title: "அரசு அதிகாரிகள்", desc: "வருகைகளை முன்னறிவிக்கவும், நிராகரிப்பு போக்குகள் மற்றும் கட்டண SLA-களைக் கண்காணிக்கவும்." }
    ],
    footerNote: "Team DoomCore-ஆல் Smart India Hackathon 2026 முன்மாதிரி"
  },
  te: {
    tagline: "సేకరణ కేంద్రాల కోసం స్మార్ట్ స్లాట్ బుకింగ్",
    heroTitle: "ఇక కారణం తెలియకుండా వరుసలో వేచి ఉండాల్సిన అవసరం లేదు.",
    heroSubtitle:
      "నిమిషాల్లో మీ సేకరణ స్లాట్‌ను బుక్ చేయండి, ప్రయాణానికి ముందు మీ నాణ్యత ప్రమాదాన్ని తనిఖీ చేయండి, మీ టోకెన్‌ను ప్రత్యక్షంగా ట్రాక్ చేయండి — యాప్ ద్వారా లేదా వాయిస్ ద్వారా, మీ భాషలో.",
    ctaPrimary: "ప్రారంభించండి",
    ctaSecondary: "నాకు ఇప్పటికే ఖాతా ఉంది",
    trust: "ప్రభుత్వ సేకరణ కేంద్రాల కోసం రూపొందించబడింది · స్మార్ట్‌ఫోన్ అవసరం లేదు · వాయిస్ బుకింగ్ ఆఫ్‌లైన్‌లో కూడా పనిచేస్తుంది",
    featuresHeading: "Procuremintra మీకు అందించేది",
    features: [
      { icon: "📅", title: "స్మార్ట్ స్లాట్ బుకింగ్", desc: "దూరం, ప్రత్యక్ష క్యూ మరియు సామర్థ్యం ఆధారంగా మీకు ఉత్తమ కేంద్రం మరియు సమయాన్ని సిఫార్సు చేస్తాము, కారణం స్క్రీన్‌పై చూపబడుతుంది." },
      { icon: "🎙", title: "వాయిస్ ద్వారా బుక్ చేయండి", desc: "స్మార్ట్‌ఫోన్ లేదా చదవడం అవసరం లేదు. హిందీ, తమిళం, తెలుగు లేదా ఇంగ్లీషులో మాట్లాడి సమాధానం ఇవ్వండి." },
      { icon: "🌾", title: "నాణ్యత ప్రమాద ముందస్తు తనిఖీ", desc: "వాతావరణం మరియు నిల్వ పరిస్థితుల నుండి తిరస్కరణ ప్రమాదాన్ని ప్రయాణానికి ముందే తెలుసుకోండి." },
      { icon: "📍", title: "ప్రత్యక్ష క్యూ ట్రాకింగ్", desc: "బుకింగ్ నుండి చెల్లింపు వరకు మీ నిజమైన స్థానం మరియు అంచనా వేచి ఉండే సమయాన్ని ప్రత్యక్షంగా చూడండి." }
    ],
    howHeading: "ఇది ఎలా పనిచేస్తుంది",
    steps: [
      { title: "స్లాట్ బుక్ చేయండి", desc: "మీ పంట మరియు పరిమాణాన్ని ఎంచుకోండి — మేము ఉత్తమ కేంద్రం మరియు సమయాన్ని సిఫార్సు చేస్తాము." },
      { title: "నమ్మకంతో ప్రయాణించండి", desc: "ఇంటి నుండి బయలుదేరే ముందు మీ నాణ్యత ప్రమాదం మరియు క్యూ స్థానాన్ని చూడండి." },
      { title: "చెల్లింపు, ట్రాక్ చేయబడింది", desc: "తూకం, సేకరణ మరియు చెల్లింపు స్థితిని ఒకే చోట ట్రాక్ చేయండి." }
    ],
    audienceHeading: "కేంద్రంలో అందరి కోసం రూపొందించబడింది",
    audiences: [
      { icon: "🧑‍🌾", title: "రైతులు", desc: "స్లాట్‌లు బుక్ చేయండి, క్యూ స్థానాన్ని ట్రాక్ చేయండి, సమయానికి చెల్లింపు పొందండి." },
      { icon: "🧑‍💼", title: "కేంద్ర సిబ్బంది", desc: "OTP ద్వారా రాకను ధృవీకరించి సేకరణను ముందుకు తీసుకెళ్లండి." },
      { icon: "🏛️", title: "ప్రభుత్వ అధికారులు", desc: "రాకలను అంచనా వేయండి, తిరస్కరణ ధోరణులు మరియు చెల్లింపు SLAలను పర్యవేక్షించండి." }
    ],
    footerNote: "టీమ్ DoomCore చే Smart India Hackathon 2026 ప్రోటోటైప్"
  },
  kn: {
    tagline: "ಖರೀದಿ ಕೇಂದ್ರಗಳಿಗಾಗಿ ಸ್ಮಾರ್ಟ್ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್",
    heroTitle: "ಇನ್ನು ಮುಂದೆ ಕಾರಣ ತಿಳಿಯದೆ ಸಾಲಿನಲ್ಲಿ ಕಾಯುವ ಅಗತ್ಯವಿಲ್ಲ.",
    heroSubtitle:
      "ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಖರೀದಿ ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ, ಪ್ರಯಾಣಿಸುವ ಮೊದಲು ನಿಮ್ಮ ಗುಣಮಟ್ಟದ ಅಪಾಯವನ್ನು ಪರಿಶೀಲಿಸಿ, ಮತ್ತು ನಿಮ್ಮ ಟೋಕನ್ ಅನ್ನು ನೇರ ಪ್ರಸಾರದಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ — ಆಪ್ ಮೂಲಕ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ, ನಿಮ್ಮ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ.",
    ctaPrimary: "ಪ್ರಾರಂಭಿಸಿ",
    ctaSecondary: "ನನ್ನ ಬಳಿ ಈಗಾಗಲೇ ಖಾತೆ ಇದೆ",
    trust: "ಸರ್ಕಾರಿ ಖರೀದಿ ಕೇಂದ್ರಗಳಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ · ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಅಗತ್ಯವಿಲ್ಲ · ಧ್ವನಿ ಬುಕಿಂಗ್ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿಯೂ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    featuresHeading: "Procuremintra ನಿಮಗೆ ನೀಡುವುದು",
    features: [
      { icon: "📅", title: "ಸ್ಮಾರ್ಟ್ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್", desc: "ದೂರ, ನೇರ ಪ್ರಸಾರ ಸಾಲು ಮತ್ತು ಸಾಮರ್ಥ್ಯದ ಆಧಾರದ ಮೇಲೆ ನಿಮಗಾಗಿ ಉತ್ತಮ ಕೇಂದ್ರ ಮತ್ತು ಸಮಯವನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ, ಕಾರಣವನ್ನು ಪರದೆಯ ಮೇಲೆ ತೋರಿಸಲಾಗುತ್ತದೆ." },
      { icon: "🎙", title: "ಧ್ವನಿ ಮೂಲಕ ಬುಕ್ ಮಾಡಿ", desc: "ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಅಥವಾ ಓದುವ ಅಗತ್ಯವಿಲ್ಲ. ಹಿಂದಿ, ತಮಿಳು, ತೆಲುಗು, ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ ಉತ್ತರಿಸಿ." },
      { icon: "🌾", title: "ಗುಣಮಟ್ಟದ ಅಪಾಯ ಮುನ್ ಪರಿಶೀಲನೆ", desc: "ಹವಾಮಾನ ಮತ್ತು ಸಂಗ್ರಹಣೆಯ ಸ್ಥಿತಿಯಿಂದ ತಿರಸ್ಕಾರದ ಅಪಾಯವನ್ನು ಪ್ರಯಾಣಿಸುವ ಮೊದಲೇ ತಿಳಿಯಿರಿ, ನಂತರ ಅಲ್ಲ." },
      { icon: "📍", title: "ನೇರ ಪ್ರಸಾರ ಸಾಲು ಟ್ರ್ಯಾಕಿಂಗ್", desc: "ಬುಕಿಂಗ್‌ನಿಂದ ಪಾವತಿಯವರೆಗೆ ನಿಮ್ಮ ನಿಜವಾದ ಸ್ಥಾನ ಮತ್ತು ಅಂದಾಜು ಕಾಯುವ ಸಮಯವನ್ನು ನೇರ ಪ್ರಸಾರದಲ್ಲಿ ನೋಡಿ." }
    ],
    howHeading: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    steps: [
      { title: "ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ", desc: "ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಪ್ರಮಾಣವನ್ನು ಆರಿಸಿ — ನಾವು ಉತ್ತಮ ಕೇಂದ್ರ ಮತ್ತು ಸಮಯವನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ." },
      { title: "ವಿಶ್ವಾಸದಿಂದ ಪ್ರಯಾಣಿಸಿ", desc: "ಮನೆ ಬಿಡುವ ಮೊದಲು ನಿಮ್ಮ ಗುಣಮಟ್ಟದ ಅಪಾಯ ಮತ್ತು ಸಾಲಿನ ಸ್ಥಾನವನ್ನು ನೋಡಿ." },
      { title: "ಪಾವತಿ, ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ", desc: "ತೂಕ, ಖರೀದಿ ಮತ್ತು ಪಾವತಿ ಸ್ಥಿತಿಯನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ." }
    ],
    audienceHeading: "ಕೇಂದ್ರದಲ್ಲಿ ಎಲ್ಲರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ",
    audiences: [
      { icon: "🧑‍🌾", title: "ರೈತರು", desc: "ಸ್ಲಾಟ್‌ಗಳನ್ನು ಬುಕ್ ಮಾಡಿ, ಸಾಲಿನ ಸ್ಥಾನವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಸಮಯಕ್ಕೆ ಪಾವತಿ ಪಡೆಯಿರಿ." },
      { icon: "🧑‍💼", title: "ಕೇಂದ್ರ ಸಿಬ್ಬಂದಿ", desc: "OTP ಮೂಲಕ ಆಗಮನವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಖರೀದಿಯನ್ನು ಮುಂದೆ ಸಾಗಿಸಿ." },
      { icon: "🏛️", title: "ಸರ್ಕಾರಿ ಅಧಿಕಾರಿಗಳು", desc: "ಆಗಮನಗಳನ್ನು ಮುನ್ಸೂಚಿಸಿ, ತಿರಸ್ಕಾರ ಪ್ರವೃತ್ತಿಗಳು ಮತ್ತು ಪಾವತಿ SLA ಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ." }
    ],
    footerNote: "ಟೀಮ್ DoomCore ನಿಂದ Smart India Hackathon 2026 ಮೂಲಮಾದರಿ"
  }
};
