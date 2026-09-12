// Numeral-word parsing for a fixed-question voice flow. Deliberately small:
// only the ranges these prompts actually ask for (quantities, day counts).

const WORD_NUMBERS: Record<string, Record<string, number>> = {
  en: {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50
  },
  hi: {
    "शून्य": 0, "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "छह": 6, "सात": 7, "आठ": 8, "नौ": 9,
    "दस": 10, "बीस": 20, "तीस": 30, "चालीस": 40, "पचास": 50
  },
  ta: {
    "பூஜ்ஜியம்": 0, "ஒன்று": 1, "இரண்டு": 2, "மூன்று": 3, "நான்கு": 4, "ஐந்து": 5, "ஆறு": 6, "ஏழு": 7, "எட்டு": 8, "ஒன்பது": 9,
    "பத்து": 10, "இருபது": 20, "முப்பது": 30, "நாற்பது": 40, "ஐம்பது": 50
  },
  te: {
    "సున్నా": 0, "ఒకటి": 1, "రెండు": 2, "మూడు": 3, "నాలుగు": 4, "ఐదు": 5, "ఆరు": 6, "ఏడు": 7, "ఎనిమిది": 8, "తొమ్మిది": 9,
    "పది": 10, "ఇరవై": 20, "ముప్పై": 30, "నలభై": 40, "యాభై": 50
  },
  kn: {
    "ಸೊನ್ನೆ": 0, "ಒಂದು": 1, "ಎರಡು": 2, "ಮೂರು": 3, "ನಾಲ್ಕು": 4, "ಐದು": 5, "ಆರು": 6, "ಏಳು": 7, "ಎಂಟು": 8, "ಒಂಬತ್ತು": 9,
    "ಹತ್ತು": 10, "ಇಪ್ಪತ್ತು": 20, "ಮೂವತ್ತು": 30, "ನಲವತ್ತು": 40, "ಐವತ್ತು": 50
  }
};

export function extractNumber(text: string, lang: string): number | null {
  const digitMatch = text.match(/\d+(\.\d+)?/);
  if (digitMatch) return Number(digitMatch[0]);

  const words = text.toLowerCase().trim().split(/\s+/);
  const table = WORD_NUMBERS[lang] ?? WORD_NUMBERS.en;
  for (const word of words) {
    if (word in table) return table[word];
  }
  return null;
}
