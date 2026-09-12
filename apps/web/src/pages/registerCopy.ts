import type { LandingLang } from "./landingCopy";

interface RegisterCopy {
  heading: string;
  fullName: string;
  state: string;
  village: string;
  landSize: string;
  primaryCrop: string;
  preferredLanguage: string;
  crops: { paddy: string; wheat: string; maize: string };
  useMyLocation: string;
  saveContinue: string;
  saving: string;
  errorMsg: string;
}

export const REGISTER_COPY: Record<LandingLang, RegisterCopy> = {
  en: {
    heading: "Complete your profile",
    fullName: "Full name",
    state: "State",
    village: "Village",
    landSize: "Land size (acres)",
    primaryCrop: "Primary crop",
    preferredLanguage: "Preferred language",
    crops: { paddy: "Paddy", wheat: "Wheat", maize: "Maize" },
    useMyLocation: "Use my current location",
    saveContinue: "Save & Continue",
    saving: "Saving...",
    errorMsg: "Could not save your profile. Please check the fields."
  },
  hi: {
    heading: "अपनी प्रोफ़ाइल पूरी करें",
    fullName: "पूरा नाम",
    state: "राज्य",
    village: "गाँव",
    landSize: "भूमि का आकार (एकड़)",
    primaryCrop: "मुख्य फसल",
    preferredLanguage: "पसंदीदा भाषा",
    crops: { paddy: "धान", wheat: "गेहूं", maize: "मक्का" },
    useMyLocation: "मेरा वर्तमान स्थान उपयोग करें",
    saveContinue: "सहेजें और जारी रखें",
    saving: "सहेजा जा रहा है...",
    errorMsg: "आपकी प्रोफ़ाइल सहेजी नहीं जा सकी। कृपया फ़ील्ड जांचें।"
  },
  ta: {
    heading: "உங்கள் சுயவிவரத்தை முடிக்கவும்",
    fullName: "முழு பெயர்",
    state: "மாநிலம்",
    village: "கிராமம்",
    landSize: "நில அளவு (ஏக்கர்)",
    primaryCrop: "முதன்மை பயிர்",
    preferredLanguage: "விருப்பமான மொழி",
    crops: { paddy: "நெல்", wheat: "கோதுமை", maize: "மக்காச்சோளம்" },
    useMyLocation: "எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்து",
    saveContinue: "சேமித்து தொடரவும்",
    saving: "சேமிக்கிறது...",
    errorMsg: "உங்கள் சுயவிவரத்தை சேமிக்க முடியவில்லை. புலங்களைச் சரிபார்க்கவும்."
  },
  te: {
    heading: "మీ ప్రొఫైల్‌ను పూర్తి చేయండి",
    fullName: "పూర్తి పేరు",
    state: "రాష్ట్రం",
    village: "గ్రామం",
    landSize: "భూమి పరిమాణం (ఎకరాలు)",
    primaryCrop: "ప్రధాన పంట",
    preferredLanguage: "ఇష్టపడే భాష",
    crops: { paddy: "వరి", wheat: "గోధుమ", maize: "మొక్కజొన్న" },
    useMyLocation: "నా ప్రస్తుత స్థానాన్ని ఉపయోగించండి",
    saveContinue: "సేవ్ చేసి కొనసాగించండి",
    saving: "సేవ్ చేస్తోంది...",
    errorMsg: "మీ ప్రొఫైల్‌ను సేవ్ చేయలేకపోయాము. దయచేసి ఫీల్డ్‌లను తనిఖీ చేయండి."
  },
  kn: {
    heading: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    state: "ರಾಜ್ಯ",
    village: "ಗ್ರಾಮ",
    landSize: "ಭೂಮಿಯ ಗಾತ್ರ (ಎಕರೆ)",
    primaryCrop: "ಪ್ರಮುಖ ಬೆಳೆ",
    preferredLanguage: "ಆದ್ಯತೆಯ ಭಾಷೆ",
    crops: { paddy: "ಭತ್ತ", wheat: "ಗೋಧಿ", maize: "ಮೆಕ್ಕೆಜೋಳ" },
    useMyLocation: "ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಬಳಸಿ",
    saveContinue: "ಉಳಿಸಿ ಮತ್ತು ಮುಂದುವರಿಸಿ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
    errorMsg: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಕ್ಷೇತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."
  }
};
