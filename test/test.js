let enableAI = true;
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  console.log("Running locally");
  enableAI = confirm("Enable?");
} else {
  console.log("Running on prod");
  enableAI = true;
}

/**
 * Prompts the AI placed on the Writemaster™'s official Vercel™ API.
 * @param {string} prompt The prompt inputted to the AI.
 * @returns {Promise} Text from AI if successful. Note that .then() must be used as this is an asynchronous function.
 * @author hpol™ and Stonkalyasatone™
 *
 */
export async function getAIResponse(prompt = "") {
  if (!enableAI) {
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 1000)
    );
    console.log(prompt);
    return `This is a response to the question "${prompt}"`;
    //return prompt;
  }
  const response = await fetch(
    `https://writemaster-api.vercel.app/api/ai?prompt=${encodeURIComponent(
      prompt
    )}`
  );

  if (response.error?.code == 429) {
    window.alert(
      "We have reached our rate limit for AI usage, please try again later."
    );
    throw new Error("RATE LIMITED: please try again later shortly.");
  } else if (response.error?.code) {
    window.alert(
      "Encountered unknown errors while prompting the AI, please try again later."
    );
    throw new Error("error :(");
  }

  const data = await response.json();
  console.log(data);
  return data.choices[0].message.content.replaceAll(/`+/gi, "");
}

/**
 * TIMER!!!!111!!
 * manages timer part of the test
 */
export class Timer {
  static TimerElement = document.getElementById("timer");
  static intervalId;
  static timeGiven = 0;
  static timeLeft = 0;

  /**
   * *Sets* the timer, but *doesn't start* it
   * @param {number} time In milliseconds
   */

  static set(time) {
    this.timeLeft = Date.now() + 1000 * time;
    this.update();
    this.timeGiven = time;
  }

  static start() {
    this.timeLeft = Date.now() + 1000 * this.timeGiven;
    this.intervalId = setInterval(this.update.bind(this), 100);
    // setInterval makes "this" keyword no longer refer to what it used to iirc
    // binding so it does
  }

  static update() {
    let et = Math.ceil((this.timeLeft - Date.now()) / 1000);
    if (et <= 0) {
      this.TimerElement.innerHTML = "0:00";
      this.TimerElement.style = /*css*/ "color:var(--accent-color)";
      Test.submit();
      return;
    } else {
      this.TimerElement.style = "";
    }

    let seconds = (et % 60).toString();
    let minutes = (Math.floor(et / 60) % 60).toString();
    let hours = Math.floor(et / 3600).toString();
    if (hours == 0) {
      this.TimerElement.innerHTML = `${minutes}:${seconds.padStart(2, "0")}`;
    } else {
      this.TimerElement.innerHTML = `${hours}:${minutes.padStart(
        2,
        "0"
      )}:${seconds.padStart(2, "0")}`;
    }
  }
}

// I wish there was a private keyword in js and not just ts
/**
 * I handle questions
 */
export class Questions {
  static questions = [];

  static questionsLeftToGenerate = 0;
  /**
   * @private
   */
  static checkGenerationFinished() {
    this.questionsLeftToGenerate--;
    this.questionsLeftToGenerate <= 0 && Test.ready();
  }

  /**
   * Generates a writing question
   * @param {string} name Name of the question (e.g. "Writing Part 1")
   * @param {string} test Name of test
   */
  static generateWriting(name, test) {
    this.questionsLeftToGenerate++;
    const section = document.createElement("div");
    const sectionTitle = document.createElement("h3");
    const sectionQuestion = document.createElement("p");
    const sectionTextbox = document.createElement("textarea");
    const sectionResponse = document.createElement("p");
    section.className = "section";
    sectionTitle.innerText = name;

    // just found out if you change the indentation there the thing breaks
    getAIResponse(
      `Generate a ${test} ${name} question.
  
Requirements:
- Output **only** the question text and its required reading passage. Do **not** include titles, explanations, tips, instructions, greetings, closings, or meta commentary.
- The response **must** begin with **only** the full reading passage (which means you musn't put the question/requirement here), followed by a markdown line break (three dashes, like this: \`---\`) padded with new lines both before and after, followed by the question.  
- If the task involves data (charts, graphs, comparisons, processes, etc.), represent all data **only** using Markdown tables. Do not use images, ASCII, or non-table charts
- The passage and questions must be fully self-contained and formatted exactly like a standard ${test} ${name} prompt.
- Do not add anything before or after the passage + question text.
- Output the **complete** passage and question text, and nothing else.
- If the response is long, continue until all required content is produced. Do **not** stop early or truncate the output.`
    ).then((response) => {
      sectionQuestion.innerHTML = marked.parse(response);
      Test.Questions.questions.push({
        question: response,
        answer: sectionTextbox,
        response: sectionResponse,
        type: (test == "TOEIC") ? "toeic" : "ielts",
        skill: "writing"
      });
      this.checkGenerationFinished();
    });

    section.appendChild(sectionTitle);
    section.appendChild(sectionQuestion);
    section.appendChild(sectionTextbox);
    section.appendChild(sectionResponse);

    document.getElementById("test").appendChild(section);
  }

  /**
   * The code is self documenting with how long the function name is
   * @param {string | number} task The task (1–⁠5)
   * @param {[number]?} excl Images to exclude
   * @returns `excl` but with the image in the question added to it
   */
  static generateTOEICWritingSection1(task, excl = []) {
    this.questionsLeftToGenerate++;
    const section = document.createElement("div");
    const sectionTitle = document.createElement("h3");
    const sectionQuestion = document.createElement("div");
    const sectionTextbox = document.createElement("textarea");
    const sectionResponse = document.createElement("p");
    section.className = "section";
    sectionTitle.innerText = `TOEIC Writing Task ${task} (Write a sentence on a picture)`;
    //prettier-ignore
    const images = [
      { img: "AtBreathtaking.png", desc: "Four people walking on a road, looking at a breathtaking mountain far away." },
      { img: "BookshelfLibrary.png", desc: "A bookshelf filled with colorful books, arranged to look like a rainbow." },
      { img: "BreakfastToast.png", desc: "Two pieces of toast and an egg on the plate." },
      { img: "BroomAutumn.png", desc: "An illustration of a kid raking leaves." },
      { img: "CashierItems.png", desc: "A woman waiting for the cashier to count the items she just bought." },
      { img: "CheckupX-ray.png", desc: "A person on a hospital bed, looking as a doctor points to his X-ray teeth scan." },
      { img: "ChefKitchen.png", desc: "A chef holding a flaming pan in the kitchen." },
      { img: "ColleaguesBrainstorm.png", desc: "Several colleagues sitting next to a table, facing the center and talking." },
      { img: "FallBlock.png", desc: "A rail blocked by a giant, dry tree." },
      { img: "FamilyBackyard.png", desc: "A family in their backyard. Four are sitting at a white table, while two is near a grill, one of them only observing." },
      { img: "GuitarPark.png", desc: "A man playing a guitar while sitting on a bench, in the park." },
      { img: "LaptopCoffee shop.png", desc: "The interior of a coffee shop. Notably, of the three people visible in the image, two are using laptops." },
      { img: "LaptopOffice.png", desc: "A woman using a desktop inside an office cubicle, next to a laptop barely inside view." },
      { img: "PaintbrushCanvas.png", desc: "A woman using a paintbrush to draw something on an canvas/easel." },
      { img: "ReviewColleague.png", desc: "Two office employees pointing at a clipboard." },
      { img: "StudentLaboratory.png", desc: "Two students messing with a few beakers containing colored fluids. On the background there are more students out of focus." },
      { img: "StudentsHomework.png", desc: "Seven students sitting next to a table with assorted documents, talking." },
      { img: "SuitcaseAirport.png", desc: "A line of people patiently waiting next to the suitcase conveyor. at the airport." },
      { img: "UmbrellaRainy.png", desc: "Around 6 to 9 people walking across a zebra crossing, holding umbrellas because it's raining." },
    ];
    let p = Math.floor(Math.random() * images.length);
    while (excl.includes(p)) {
      p = Math.floor(Math.random() * images.length);
    }
    const picture = images[p];
    const questionTextElement = document.createElement("p");
    const questionPictureElement = document.createElement("img");
    //prettier-ignore
    const words = (picture.img.replace(/\..*$/g, "").match(/[A-Z][a-z -]*/g) ?? []).map((e) => e.toLowerCase()).join(" / ");
    questionTextElement.innerHTML = marked.parse(
      "Write **ONE** sentence to describe the picture above. You must use these words: " +
        words
    );
    questionPictureElement.src = `${window.location.origin}/Questions/TOEIC/Part1/${picture.img}`;
    sectionQuestion.appendChild(questionPictureElement);
    sectionQuestion.appendChild(questionTextElement);
    sectionTextbox.className = "short";
    Test.Questions.questions.push({
      question: `Write **ONE** sentence based on the picture given. You must use these words: ${words}. ${
        picture.desc != ""
          ? ` The following description has been prepared by the testmaker: "${picture.desc}". The answer doesn't need to contain all parts of the description.`
          : " Unfortunately, the testmaker has not prepared a description for this image in textual form."
      }`,
      answer: sectionTextbox,
      response: sectionResponse,
      type: "toeic",
      skill: "writing"
    });

    new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 1000)
    ).then(this.checkGenerationFinished.bind(this));
    // do this so that this doesn't finish all before the other parts
    // which makes the test "ready" before the other parts load

    section.appendChild(sectionTitle);
    section.appendChild(sectionQuestion);
    section.appendChild(sectionTextbox);
    section.appendChild(sectionResponse);

    document.getElementById("test").appendChild(section);
    return excl.concat(p);
  }

  
  /**
   * Generates an IELTS Reading question
   * @param {string} name Section name
   * @param {string} test Test name
   * @param {number} from Starting question
   * @param {number} to Ending question
   * @param {{[["true_false_not_given" |
   *         "matching_information" |
   *         "short_answer" |
   *         "sentence_completion" |
   *         "matching_features" |
   *         "matching_headings" |
   *         "multiple_choice" |
   *         "summary_completion"]: number]}} type Question type
   */
  static generateIELTSReading(name, test, from, to, type) {
    this.questionsLeftToGenerate++;
    const section = document.createElement("div");
    const sectionTitle = document.createElement("h3");
    const sectionQuestion = document.createElement("p");
    const sectionAnswer = document.createElement("div");
    const sectionResponse = document.createElement("p");
    section.className = "section";
    sectionTitle.innerText = name;

    const questionTypes = {
      "true_false_not_given": "True / False / Not Given. **Required format:** \`{Question number}. {Question}. \`",
      "matching_information": "Match statements (not headings) to paragraphs. **Required format:** \`{Question number}. {Capital letter for each statement}-{Statement}. \` Mark each paragraph with a lowercase roman numberal (e.g. i, ii, vi, ...) when generating them.",
      "matching_headings": "Match headings (not statements) to paragraphs. **Required format:** \`{Question number}. {Question}. \` Mark each paragraph with a lowercase roman numberal (e.g. i, ii, vi, ...) when generating them.",
      "matching_features": "Match features (not headings or statements) to statements/attributes. **Required format:** \`Given these statements: \n{Capital letter for each statement}. {Statement}.\` \`{Question number}. {Feature}.\`",
      "summary_completion": "Complete a given summary using words from the passage. **Give a summary of the passage with some keywords replaced with this required format:** \`[...] {Question number}. ________ [...]\` Remember, 8 exact underscores.",
      "sentence_completion": "Complete a given sentence using words from the passage. **Give a sentence (note) related to the passage in this *required format:* \`{Question number}. {Sentence}\` with some keywords replaced with this:** \`________\` Remember, 8 exact underscores. **ONE blank per question, and each blank can have <= 3 words.**",
      "multiple_choice": "Multiple choice question. **Required format:** \`{Question number}. {Question}?\` \`[A, B, C or D]. [Choice].\`",
      "short_answer": "Answer questions using NO MORE THAN THREE WORDS using words from the passage. **Required format: \`{Question number}. {Question}? \`**"
    }

    getAIResponse(
        `Generate a ${test} ${name} question.
    
Requirements:
- Output **only** the question text and its required reading passage. Do **not** include titles, explanations, tips, instructions, greetings, closings, or meta commentary.
- The response **must** begin with the full reading passage, followed by a \`---\` horizontal line, followed by the question(s). Use a \`---\` **ONLY** between each ***different* question types ***(REQUIRED)***. Questions of same type are to be with eachother and questions of different types are to be separated..**
- Produce **only** reading questions numbered from ***${from} to ${to}.*** Do ***not*** generate any questions outside this range.
- The question types and amount are: ${
  Object.entries(type).map(([ques, amount]) => `${amount} questions of type '${questionTypes[ques]}'`).join(' ')
}. These questions are inside the given range. Please do ***NOT*** generate extra questions.
- You only need to generate the question themselves, I will handle all the user input answer things.
- Remember to *NOT* say the question requirement, like "Pick TRUE, FALSE or NOT GIVEN for each of the given statements". Please, those brackets in the format are not to be put onto the tests. They're like javascript \${} interpolation.
- The passage must be original, complete, and fully self-contained.
- Do not summarize, shorten, merge, or omit any parts of the selected questions.
- Ensure every selected question and every answer option (if any) appears in full.
- Place a newline after each question and after each answer option.
- The passage and questions must be fully self-contained and formatted exactly like a standard ${test} ${name} prompt.
- Do not add anything before or after the passage + question text.
- Output the **complete** passage and question text, and nothing else.
- If the response is long, continue until all required content is produced. Do **not** stop early or truncate the output.
- FOLLOW THE ORDER GIVEN ABOVE, DO NOT MIX UP ORDER.
- FOLLOW THE CORRECT FORMAT AND QUESTION TYPES GIVEN STOP GENERATING WRONG SENTENCE TYPES ***I KNOW WHAT I ASKED***
- PLEASE DO NOT ADD STUFF WE DID NOT ASK, JUST THE QUESTION. DON'T ADD "True/False/Not Given" TO THE END OF TRUE FALSE NOT GIVEN QUESTIONS BECAUSE **WE DIDN'T ASK.**
- ***Note: Follow exactly, do not add stuff we did not ask. Treat this like you're generating for a regex algorithm to scan; if you use the wrong format or generate outside of provided range, it doesn't work.***`
    ).then((response) => {
      const parts = response.replace("\n", "\n\n").split("---");
      parts[parts.length - 1] += "\n"; // IMPORTANT: Do not remove. This is not purely decorative.
      console.log(parts);
      let i = 1;
      let questionText;

      Object.entries(type).forEach(([questionType, _]) => {
        sectionQuestion.innerHTML = marked.parse(parts[0] + "\n\n");
        
        if (questionType == "true_false_not_given") {
          sectionAnswer.appendChild(document.createElement("hr"));
          const questions = [...parts[i].matchAll(/\d+\. .+\n/ig)];
          const questionReq = document.createElement("p");
          questionReq.innerHTML = "<br>Pick TRUE, FALSE or NOT GIVEN for each of the following statements.";
          questionReq.id = "question";
          sectionAnswer.appendChild(questionReq);

          let j = 0
          questions.forEach(question => {
            const questionElement = document.createElement("p");
            questionElement.innerHTML = question[0].trim().concat(`\
              <div class="tfng" style="margin-left: 2.5rem;"><input type="radio" name="${questionType}-${i}-${j}" id="true" /><span class="tfng_inner">T</span></div>\
              <div class="tfng"><input type="radio" name="${questionType}-${i}-${j}" id="false" /><span class="tfng_inner">F</span></div>\
              <div class="tfng"><input type="radio" name="${questionType}-${i}-${j}" id="not given" /><span class="tfng_inner">NG</span></div>`);
            sectionAnswer.appendChild(questionElement);
            j++;
          });
          
          sectionAnswer.appendChild(document.createElement("br"));
        }

        if (questionType == "sentence_completion") {
          sectionAnswer.appendChild(document.createElement("hr"));
          const questions = [...parts[i].matchAll(/\[?\d+\]?\.? .+\n/ig)];
          const questionReq = document.createElement("p");
          questionReq.innerHTML = "<br>Fill in the blanks using words from the passage using NO MORE THAN THREE WORDS.";
          questionReq.id = "question";
          sectionAnswer.appendChild(questionReq);

          let j = 0
          questions.forEach(question => {
            const questionElement = document.createElement("p");
            questionElement.innerHTML = question[0].trim().replace(/_+/, '<div class="inline" contenteditable="true"></div>');
            sectionAnswer.appendChild(questionElement);
            j++;
          });
          
          sectionAnswer.appendChild(document.createElement("br"));
        }
        i++;
      })
      Test.Questions.questions.push({
        question: response,
        answer: sectionAnswer,
        response: sectionResponse,
        type: (test == "TOEIC") ? "toeic" : "ielts",
        ieltsType: (test == "Academic IELTS") ? "ielts_acad" : "ielts_gen",
        skill: "reading",
        readingQuestionType: type
      });
      this.checkGenerationFinished();
    });
    section.appendChild(sectionTitle);
    section.appendChild(sectionQuestion);
    section.appendChild(sectionAnswer);
    section.appendChild(sectionResponse);

    document.getElementById("test").appendChild(section);      
  }
}

/**
Performs a forward- and reverse- linear interpolation on the number x.
@param {number} x The value to be processed
@param {number} m The start of the 1st interpolation range
@param {number} n The end of the 1st interpolation range
@param {number} p The start of the 2st interpolation range
@param {number} q The end of the 2st interpolation range
@returns A number y=lerp(k,p,q), where k is a number statisfying lerp(k,m,n)=x and lerp(x,y,z)=xz+(1-x)y.
@author Stonkalyasatone
 */
function squish(x, m, n, p, q) {
  return p + (q - p) * ((x - m) / (n - m));
}

/**
 * Converts from total questions correct to band
 * @param {number} correct Total questions correct
 * @param {"ielts_gen" | "ielts_acad"} type Type of test
 * @returns Estimated band
 */
function IELTSReadingToBand(correct, type) {
  if (type == "ielts_gen") {
    if (correct >= 39) return 9;
    else if (correct >= 37) return 8.5;
    else if (correct >= 36) return 8;
    else if (correct >= 34) return 7.5;
    else if (correct >= 32) return 7;
    else if (correct >= 30) return 6.5;
    else if (correct >= 27) return 6;
    else if (correct >= 23) return 5.5;
    else if (correct >= 19) return 5;
    else if (correct >= 15) return 4.5;
    else if (correct >= 12) return 4;
    else if (correct >= 9) return 3.5;
    else if (correct >= 6) return 3;
    else if (correct >= 4) return 2.5;
    return 0;
  } else {
    if (correct >= 39) return 9;
    else if (correct >= 37) return 8.5;
    else if (correct >= 35) return 8;
    else if (correct >= 33) return 7.5;
    else if (correct >= 30) return 7;
    else if (correct >= 27) return 6.5;
    else if (correct >= 23) return 6;
    else if (correct >= 19) return 5.5;
    else if (correct >= 15) return 5;
    else if (correct >= 13) return 4.5;
    else if (correct >= 10) return 4;
    else if (correct >= 8) return 3.5;
    else if (correct >= 6) return 3;
    else if (correct >= 5) return 2.5;
    return 0;
  }
}

/**
 * now I am become tests, the destroyer of students
 */
export class Test {
  static ActionButton = document.getElementById("submit_btn");
  static TestBox = document.getElementById("test");
  static Timer = Timer;
  static Questions = Questions;

  /**
   * Makes it so users can start the test
   */
  static ready() {
    try {
      document.getElementById("testrdy").remove();
    } catch (error) {
      // do nothing
    }
    document.getElementById("readyMessage").className = "ready";
    this.ActionButton.disabled = false;
  }

  static disable() {
    this.TestBox.querySelectorAll("input, textarea").forEach((e) => {
      e.disabled = true;
    });
  }

  static enable() {
    document.getElementById("test").className = "";
    this.TestBox.querySelectorAll("input, textarea").forEach((e) => {
      e.disabled = false;
    });
  }

  /**
   * Submits the test and grades the questions
   */
  static submit() {
    let avgScore = 0;
    let totalReadingScore = 0;
    let count = 0;
    let generated = 0;

    this.Timer.TimerElement.style = /*css*/ "color:var(--accent-color)";
    clearInterval(this.Timer.intervalId);
    console.log("Test is done!");
    Test.disable();
    this.ActionButton.disabled = true;

    this.Questions.questions.forEach((e) => {
      generated++;
      e.response.innerHTML = /*html*/ `<span class="loader"></span>Response generation in progress...`;

      let userAnswer = "";
      if (e.skill != "writing") {
        const answers = e.answer.querySelectorAll("p");
        const questionsTypes = e.readingQuestionType;
        let currentQuestionType = 0;
        let currentAnswer = 0;
        console.log(questionsTypes);
        
        answers.forEach(answer => {
          if (answer.id == "question") return;
          const type = Object.keys(questionsTypes)[currentQuestionType];

          userAnswer += answer.innerText.match(/\d+/)[0] + ". ";
          if (type == "true_false_not_given") {
            userAnswer += document.querySelector(`input[name="true_false_not_given-${currentQuestionType + 1}-${currentAnswer}"]:checked`).id;
          } else if (type == "sentence_completion") {
            userAnswer += answer.querySelector("div").innerText;
          }
          userAnswer += "\n";

          currentAnswer++;
          questionsTypes[type]--;
          if (questionsTypes[type] <= 0) {
            currentQuestionType++;
            currentAnswer = 0;
          }
        });
        // TODO: THIS MESS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      } else {
        userAnswer = e.answer.value;
      }
      getAIResponse(`Generate a helpful review for the following answer:\n
${userAnswer}\n
The question is:\n
${e.question}\n\n
Requirements:
- Evaluate the quality, clarity, correctness, and completeness of the answer.${
e.skill == "writing" ? 
"- Provide a decent-length constructive review, proposing fixes to spelling and grammar, and better vocab & sentence structure for flow. You can give a \"rewritten\" version of the test taker's answer, but **don't grade that.**\n\
- At the end, output exactly one integer score from 0 to 100 in the format \"Your score: XX\"." 
: 
"- Grade the test taker's answer. \
- For empty answers, treat them as wrong. \
- For wrong answers, provide some short corrections and reasoning AFTER GRADING. YOU HAVE TO BOTH GRADE AND PROVIDE CORRECTION.\n\
- For each correct answer, give ONE point. At the end, output exactly one integer: questions in this section the user got correct. Format: \"Questions correct: X\" (just the questions correct, no how many out of how many).\n\
- *Rememeber:* take in the full context. If the passage said 'Thursday and Friday', the blank was '_____ and Friday', then the user answering 'Thursday' is correct, because if you insert the answer into the blank, it makes sense."
}
- No other scoring formats or text after the score.
- Be fair but not harsh. Rate using the same criterion as actual ${e.type.toUpperCase()} test graders.`).then(
        (r) => {
          e.response.innerHTML = /*html*/ `Here's what the AI thinks about your work.<br><div class="response">${marked.parse(
            r
          )}</div>`;
          console.log("done")
          
          if (e.skill == "writing") {
            if (!enableAI) {
              e.score = +prompt("test!").match(
                /Your\s\s?score:\s*((?:\d|[.,]\d)+)/i
              )[1];
            } else {
              e.score = +r.match(/Your\s\s?score:\s*((?:\d|[.,]\d)+)/i)[1];
            }
            avgScore += e.score; // Writing score
            count++;
          } else {
            e.score = +r.match(/Questions\s\s?correct:\s\s?(\d+)/i)[1];
            totalReadingScore += e.score;
          }

          generated--;
          
          // After all answers have been graded
          if (generated == 0) {
            avgScore += IELTSReadingToBand(totalReadingScore, e.ieltsType);
            avgScore /= (count + 1);
            let scoreElement = document.createElement("h1");
            scoreElement.innerHTML = `Your score is <code>${avgScore.toFixed(
              1
            )}<small>/100</small></code>, corresponding to a ${
              e.type == "toeic" ? "score" : "band"
            } of <code>${
              e.type == "toeic"
                ? squish(avgScore, 0, 100, 10, 990).toFixed(0)
                : squish(avgScore, 0, 100, 0, 9).toFixed(1)
            }`;
            this.TestBox.appendChild(scoreElement);
          }
        }
      );
    });
  }
}
