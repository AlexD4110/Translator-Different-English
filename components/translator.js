// Import the required dictionaries for translation
const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

// Utility function to reverse key-value pairs in an object
const reverseDict = (obj) => {
  return Object.assign(
    {},
    ...Object.entries(obj).map(([k, v]) => ({ [v]: k }))
  );
};

// Translator class to handle translation between American and British English
class Translator {
  // Method to translate American English to British English
  toBritishEnglish(text) {
    // Combine the dictionaries for American-specific words and American to British spelling
    const dict = { ...americanOnly, ...americanToBritishSpelling };
    // Use American to British titles
    const titles = americanToBritishTitles;
    // Regular expression to match time format in American English
    const timeRegex = /([1-9]|1[012]):[0-5][0-9]/g;

    // Call the translate method with appropriate parameters
    const translated = this.translate(
      text,
      dict,
      titles,
      timeRegex,
      "toBritish"
    );

    // If no translation was done, return the original text
    if (!translated) {
      return text;
    }

    // Return the translated text
    return translated;
  }

  // Method to translate British English to American English
  toAmericanEnglish(text) {
    // Combine the dictionaries for British-specific words and reversed American to British spelling
    const dict = { ...britishOnly, ...reverseDict(americanToBritishSpelling) };
    // Use reversed American to British titles
    const titles = reverseDict(americanToBritishTitles);
    // Regular expression to match time format in British English
    const timeRegex = /([1-9]|1[012]).[0-5][0-9]/g;

    // Call the translate method with appropriate parameters
    const translated = this.translate(
      text,
      dict,
      titles,
      timeRegex,
      "toAmerican"
    );

    // If no translation was done, return the original text
    if (!translated) {
      return text;
    }

    // Return the translated text
    return translated;
  }

  // Method that handles the core translation logic
  translate(text, dict, titles, timeRegex, locale) {
    // Convert the input text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();
    // Object to store matches found in the text
    const matchesMap = {};

    // Search for titles/honorifics and add them to the matchesMap object
    Object.entries(titles).map(([k, v]) => {
      if (lowerText.includes(k)) {
        matchesMap[k] = v.charAt(0).toUpperCase() + v.slice(1); // Capitalize the first letter of the title
      }
    });

    // Filter words with spaces from the current dictionary
    const wordsWithSpace = Object.fromEntries(
      Object.entries(dict).filter(([k, v]) => k.includes(" "))
    );

    // Search for spaced word matches and add them to the matchesMap object
    Object.entries(wordsWithSpace).map(([k, v]) => {
      if (lowerText.includes(k)) {
        matchesMap[k] = v;
      }
    });

    // Search for individual word matches and add them to the matchesMap object
    lowerText.match(/(\w+([-'])(\w+)?['-]?(\w+))|\w+/g).forEach((word) => {
      if (dict[word]) matchesMap[word] = dict[word];
    });

    // Search for time matches and add them to the matchesMap object
    const matchedTimes = lowerText.match(timeRegex);

    if (matchedTimes) {
      matchedTimes.map((e) => {
        if (locale === "toBritish") {
          return (matchesMap[e] = e.replace(":", ".")); // Convert American time format to British
        }
        return (matchesMap[e] = e.replace(".", ":")); // Convert British time format to American
      });
    }

    // If no matches were found, return null
    if (Object.keys(matchesMap).length === 0) return null;

    // Return logic: return the translated text and its highlighted version
    const translation = this.replaceAll(text, matchesMap);
    const translationWithHighlight = this.replaceAllWithHighlight(
      text,
      matchesMap
    );

    return [translation, translationWithHighlight];
  }

  // Helper method to replace all occurrences of the matched words in the text
  replaceAll(text, matchesMap) {
    const re = new RegExp(Object.keys(matchesMap).join("|"), "gi");
    return text.replace(re, (matched) => matchesMap[matched.toLowerCase()]);
  }

  // Helper method to replace all occurrences with highlighted versions
  replaceAllWithHighlight(text, matchesMap) {
    const re = new RegExp(Object.keys(matchesMap).join("|"), "gi");
    return text.replace(re, (matched) => {
      return `<span class="highlight">${
        matchesMap[matched.toLowerCase()]
      }</span>`;
    });
  }
}

// Export the Translator class as a module
module.exports = Translator;
