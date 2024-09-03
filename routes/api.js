"use strict";

const Translator = require("../components/translator.js");

module.exports = function (app) {
  const translator = new Translator();

  app.route("/api/translate").post((req, res) => {
    console.log("req.body :>> ", req.body); //console logging req.body
    const { text, locale } = req.body; //required fields
    if (!locale || text == undefined) { //checks if they are present
      res.json({ error: "Required field(s) missing" }); //if not, return error
      return;
    }
    if (text == "") { //checks for empty text
      res.json({ error: "No text to translate" }); //if there is no text we can response with json "No text to translate"
      return; //and return
    }
    let translation = ""; //variable for translation
    if (locale == "american-to-british") { //checks for what our locle is in req.body and matches what "language we are in"
      translation = translator.toBritishEnglish(text); //if American we call toBritishEnglish
    } else if (locale == "british-to-american") { //if not American we call toAmericanEnglish
      translation = translator.toAmericanEnglish(text); //and call toAmericanEnglish
    } else {
      res.json({ error: "Invalid value for locale field" }); //if not American or British we return error
      return;
    }
    if (translation == text || !translation) { //if translation is equal to matched text and not equal to itself 
      res.json({ text, translation: "Everything looks good to me!" }); //Return json with text and translation and "Everything looks good to me!"
    } else {
      res.json({ text, translation: translation[1] }); //else return json with text and translation
    }
  });
};