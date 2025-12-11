import { Test, getAIResponse } from "./test.js";

// var selected = localStorage.getItem("theme");
// selected = selected ?? "light";
// if (selected == "dark") {
//   document.body.className = "dark-mode";
// } else if (selected == "light") {
//   document.body.className = "";
// } else {
//   if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//     document.body.className = "dark-mode";
//   } else {
//     document.body.className = "";
//   }
// }

const translationKeys = {
  ielts_gen: "General Training IELTS",
  ielts_acad: "Academic IELTS",
  toeic: "TOEIC",
};

const params = new URLSearchParams(window.location.search);
const testType = params.get("type");
if (params.get("include") === null) {
  window.location.href = "/";
}
const testIncludes = params.get("include").split(" ");
document.title = `${translationKeys[testType]} practice - Writemaster`;
if (!(testType in translationKeys) || testIncludes == []) {
  window.location.href = "/";
}

let stage = 0;
Test.ActionButton.addEventListener("click", () => {
  if (stage == 0) {
    stage = 1;
    document.getElementById("readyMessage").remove();
    Test.ActionButton.innerHTML = "Submit";
    Test.TestBox.className = "";
    Test.Timer.start();
    Test.enable();
  } else {
    if (!window.confirm("Are you sure you want to submit?")) return;
    stage = 2;
    Test.Timer.update(); /* window.confirm() function blocks that from updating for some reason */
    Test.submit();
  }
});

let questionsLeftToGenerate = 0;
function checkGenerationFinished() {
  questionsLeftToGenerate--;
  questionsLeftToGenerate <= 0 && Test.ready();
}
/*const renderer = new marked.Renderer();

renderer.link = function (href, title, text) {
  // Return a span that looks like a link but is not clickable
  return `<span style="text-decoration: underline;">${text}</span>`;
};*/

//marked.setOptions({ renderer });
function Generate(name, isReading = false, from = 0, to = 0, exact = "") {
  questionsLeftToGenerate++;
  const section = document.createElement("div");
  const sectionTitle = document.createElement("h3");
  const sectionQuestion = document.createElement("p");
  const sectionTextbox = document.createElement("textarea");
  const sectionResponse = document.createElement("p");
  section.className = "section";
  sectionTitle.innerText = name;

  // just found out if you change the indentation there the thing breaks
  getAIResponse(
    `Generate a ${translationKeys[testType]} ${name} question.

Requirements:
- Output **only** the question text and its required reading passage**. Do **not** include titles, explanations, tips, instructions, greetings, closings, or meta commentary.
- The response **must** begin with the full reading passage, followed by a blank line, followed by the question(s).


${
  isReading
    ? `- Produce **only** reading questions numbered from ${from} to ${to}. Do **not** generate any questions outside this range. \n - Remember, ${exact}. 
- The passage must be original, complete, and fully self-contained.
- Do not summarize, shorten, merge, or omit any parts of the selected questions.
- Ensure every selected question and every answer option (if any) appears in full.
- Place a newline after each question and after each answer option.`
    : `- If the task involves data (charts, graphs, comparisons, processes, etc.), represent all data **only** using Markdown tables. Do not use images, ASCII, or non-table charts.`
}

- The passage and questions must be fully self-contained and formatted exactly like a standard ${
      translationKeys[testType]
    } ${name} prompt.
- Do not add anything before or after the passage + question text.
- Output the **complete** passage and question text, and nothing else.
- If the response is long, continue until all required content is produced. Do **not** stop early or truncate the output.`
  ).then((response) => {
    sectionQuestion.innerHTML = marked.parse(response.replace("\n", "\n\n"));
    Test.Questions.questions.push({
      question: response,
      answer: sectionTextbox,
      response: sectionResponse,
    });
    checkGenerationFinished();
  });

  section.appendChild(sectionTitle);
  section.appendChild(sectionQuestion);
  section.appendChild(sectionTextbox);
  section.appendChild(sectionResponse);

  document.getElementById("test").appendChild(section);
}

/*on start */
document.getElementById("title").innerText = `${translationKeys[
  testType
].toUpperCase()} PRACTICE TEST`;

Test.disable();
if (testType != "toeic") {
  let time = 0;
  if (testIncludes.includes("reading")) {
    Generate(
      "Reading Tasks [SECTION 1]",
      true,
      1,
      7,
      "all questions use the same text: seven items (suitcases/classes/websites/...) of a list (A–G), and that the answerer should select which item each statement refers to. Maintain single-context integrity"
    );
    // Generate(
    //   "Reading Tasks [SECTION 1]",
    //   true,
    //   8,
    //   14,
    //   "all questions use the same text, and that the answerer should determine whether statements agree with the information. Maintain single-context integrity\n - Generate a connected text with multiple paragraphs, not several disconnected options, which is allowed, but highly discouraged."
    // );
    Test.Questions.generateIELTSReading(
      "Reading Tasks [SECTION 1]", 
      translationKeys[testType],
      8,
      14,
      {"true_false_not_given": 7}
    )
    Generate(
      "Reading Tasks [SECTION 2]",
      true,
      15,
      20,
      "all questions use the same text, and that the answerer should provide responses according to the passage. Maintain single-context integrity\n - Generate a connected text with multiple paragraphs, not several disconnected options, which is allowed, but highly discouraged."
    );
    // Generate(
    //   "Reading Tasks [SECTION 2]",
    //   true,
    //   21,
    //   27,
    //   "all questions use the same text, and that the answerer should complete the notes using ONE WORD ONLY from the passage. Maintain single-context integrity\n - Generate a connected text with multiple paragraphs, not several disconnected options, which is allowed, but highly discouraged."
    // );
    Test.Questions.generateIELTSReading(
      "Reading Tasks [Section 2]",
      translationKeys[testType],
      21,
      27,
      {"sentence_completion": 7}
    )
    Generate(
      "Reading Tasks [SECTION 3]",
      true,
      28,
      40,
      "all questions use the same long text. Include paragraph heading matching (Q28–36) and summary completion (Q37–40). Maintain single-context integrity\n - Generate a connected text with multiple paragraphs, not several disconnected options, which is allowed, but highly discouraged."
    );

    time += 60 * 60; // 60 minutes
  }

  if (testIncludes.includes("writing1")) {
    Test.Questions.generateWriting("Writing Task 1", translationKeys[testType]);
    time += 20 * 60; // 20 minutes
  }
  
  if (testIncludes.includes("writing2")) {
    Test.Questions.generateWriting("Writing Task 2", translationKeys[testType]);
    time += 40 * 60; // 40 minutes
  }
  
  if (testIncludes.includes("test")) {
    Test.Questions.generateIELTSReading("Reading Section 1 [Passage 1]", translationKeys[testType], 1, 6, {"true_false_not_given": 3, "sentence_completion": 2, "short_answer": 1});
    time += 60 * 60;
  }

  Test.Timer.set(time);
} else {
  // TOEIC test generation logic
  let time = 0;

  // READING (TOEIC L&R Part 5–7)
  if (testIncludes.includes("reading")) {
    // PART 5: Incomplete Sentences
    Generate(
      "Reading Part 5 (Incomplete Sentences)",
      true,
      1,
      30,
      "provide sentence-level grammar & vocabulary, one blank, options A–D"
    );

    // PART 6: Text Completion
    Generate(
      "Reading Part 6 (Text Completion)",
      true,
      31,
      46,
      "provide four short texts, each with four blanks. Maintain contextual coherence"
    );

    // PART 7: Single Passages
    Generate(
      "Reading Part 7 (Single Passages)",
      true,
      47,
      75,
      "provide single texts (emails, notices, articles) with 2–5 questions each"
    );

    // PART 7: Multiple Passages
    Generate(
      "Reading Part 7 (Double/Multiple Passages)",
      true,
      76,
      100,
      "provide paired or multi-part texts; 5–6 questions per set"
    );

    time += 75 * 60; // TOEIC Reading section duration
  }

  if (testIncludes.includes("writing1to5")) {
    let excl = [];
    excl = Test.Questions.generateTOEICWritingSection1(1);
    excl = Test.Questions.generateTOEICWritingSection1(2, excl);
    excl = Test.Questions.generateTOEICWritingSection1(3, excl);
    excl = Test.Questions.generateTOEICWritingSection1(4, excl);
    excl = Test.Questions.generateTOEICWritingSection1(5, excl);
    time = 10 * 60;
  }
  if (testIncludes.includes("writing6")) {
    Test.Questions.generateWriting(
      "Writing Task 6 (Respond to a Written Request)",
      "TOEIC"
    );
    time += 10 * 60;
  }
  if (testIncludes.includes("writing7")) {
    Test.Questions.generateWriting(
      "Writing Task 7 (Respond to a Written Request)",
      "TOEIC"
    );
    time += 10 * 60;
  }
  if (testIncludes.includes("writing8")) {
    Test.Questions.generateWriting("Writing Task 8 (Opinion Essay)", "TOEIC");
    time += 30 * 60;
  }

  Test.Timer.set(time);
}

window.Test = Test;
