const enableAI = false;

var selected = localStorage.getItem("theme");
selected = selected ?? "light";
if (selected == "dark") {
  document.body.className = "dark-mode";
} else if (selected == "light") {
  document.body.className = "";
} else {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.className = "dark-mode";
  } else {
    document.body.className = "";
  }
}

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
let timeLeft = 0; // seconds
let intervalId = 0; // what
const TimerElement = document.getElementById("timer");

function setTimer(time) {
  // me when i spaghetti code
  timeLeft = Date.now() + 1000 * time;
  updateTimer();
  timeLeft = time;
}

function startTimer() {
  timeLeft = Date.now() + 1000 * timeLeft;
  intervalId = setInterval(updateTimer, 100);
}

const ActionButton = document.getElementById("submit_btn");
const TestBox = document.getElementById("test");
function updateTimer() {
  // please make variable names more self explanatory :(
  let et = Math.ceil((timeLeft - Date.now()) / 1000);
  if (et <= 0) {
    clearInterval(intervalId);
    TimerElement.innerHTML = "0:00";
    TimerElement.style = /*css*/ "color:var(--accent-color)";
    submit();
    return;
  } else {
    TimerElement.style = "";
  }

  let seconds = (et % 60).toString();
  let minutes = (Math.floor(et / 60) % 60).toString();
  let hours = Math.floor(et / 3600).toString();
  if (hours == 0) {
    TimerElement.innerHTML = `${minutes}:${seconds.padStart(2, "0")}`;
  } else {
    TimerElement.innerHTML = `${hours}:${minutes.padStart(
      2,
      "0"
    )}:${seconds.padStart(2, "0")}`;
  }
}
let testTime = 0;
ActionButton.addEventListener("click", () => {
  if (stage == 0) {
    stage = 1;
    document.getElementById("readyMessage").remove();
    ActionButton.innerHTML = "Submit";
    TestBox.className = "";
    startTimer();
    enableTest();
  } else {
    window.confirm("Are you sure you want to submit?") && submit();
  }
});

function readyTest() {
  document.getElementById("testrdy").remove();
  document.getElementById("readyMessage").className = "ready";
  ActionButton.disabled = false;
}

function disableTest() {
  TestBox.querySelectorAll("input, textarea").forEach((e) => {
    e.disabled = true;
  });
}
disableTest();

function enableTest() {
  document.getElementById("test").className = "";
  TestBox.querySelectorAll("input, textarea").forEach((e) => {
    e.disabled = false;
  });
}

let Questions = [];
function submit() {
  stage = 2;
  let score = 0;
  let count = 0;
  let generated = 0;
  TimerElement.style = /*css*/ "color:var(--accent-color)";
  clearInterval(intervalId);
  console.log("Test is done!");
  //alert("uiia");
  disableTest();
  ActionButton.disabled = true;
  Questions.forEach((e) => {
    generated++;
    e.response.innerHTML = /*html*/ `<span class="loader"></span>Response generation in progress...`;

    getAIResponse(`Generate a helpful review for the following answer:\n
${e.answer.value}\n
The question is:\n
${e.question}\n\n
Requirements:
- Evaluate the quality, clarity, correctness, and completeness of the answer.
- Provide a brief constructive review.
- At the end, output exactly one integer score from 0 to 100 in the format: "Your score: XX".
- No other scoring formats or text after the score.
- Be fair but not harsh.`).then((r) => {
      e.response.innerHTML = /*html*/ `Here's what the AI thinks about your work.<br><div class="response">${marked.parse(
        r
      )}</div>`;
      if (enableAI) {
        e.score = parseInt(r.match(/Your score:\s*(\d+)/i)[1]);
      } else {
        e.score = 69; //funny haha number if AI is disabled
      }
      score += e.score;
      count++;
      generated--;
      if (generated == 0) {
        score /= count;
        TestBox.innerHTML += /*html*/ `<h1>Your score is <code>${score.toFixed(
          1
        )}<small>/100</small></code>, corresponding to a ${
          testType == "toeic"
            ? `score of <code>${Math.floor(score * 10)}</code>`
            : `band of <code>${(Math.floor(score * 0.9) / 10).toFixed(
                1
              )}</code>`
        }</h1>`;
      }
    });
  });
}

async function getAIResponse(prompt = "") {
  if (!enableAI) {
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 1000)
    );
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
  return data.candidates[0].content.parts[0].text;
}

let questionsLeftToGenerate = 0;
/*function setGenerationFinished(questions) {
  questionsLeftToGenerate = questions;
}*/

function checkGenerationFinished() {
  questionsLeftToGenerate--;
  questionsLeftToGenerate <= 0 && readyTest();
}

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
    ? `- Produce **only** reading questions numbered from ${from} to ${to}. Remember, ${exact}. Do **not** generate any questions outside this range.
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
    sectionQuestion.innerHTML = marked.parse(response);
    Questions.push({
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
    Generate(
      "Reading Tasks [SECTION 1]",
      true,
      8,
      14,
      "all questions use the same text, and that the answerer should determine whether statements agree with the information. Maintain single-context integrity"
    );
    Generate(
      "Reading Tasks [SECTION 2]",
      true,
      15,
      20,
      "all questions use the same text, and that the answerer should provide responses according to the passage. Maintain single-context integrity"
    );
    Generate(
      "Reading Tasks [SECTION 2]",
      true,
      21,
      27,
      "all questions use the same text, and that the answerer should complete the notes using ONE WORD ONLY from the passage. Maintain single-context integrity"
    );
    Generate(
      "Reading Tasks [SECTION 3]",
      true,
      28,
      40,
      "all questions use the same long text. Include paragraph heading matching (Q28–36) and summary completion (Q37–40). Maintain single-context integrity"
    );

    time += 60 * 60; // 60 minutes
  }
  if (testIncludes.includes("writing1")) {
    Generate("Writing Task 1");
    time += 20 * 60; // 20 minutes
  }
  if (testIncludes.includes("writing2")) {
    Generate("Writing Task 2");
    time += 40 * 60; // 40 minutes
  }
  setTimer(time);
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

  if (testIncludes.includes("writing1")) {
    Generate("TOEIC Writing Task 6 (Respond to a Written Request)");
    time += 10 * 60;
  }
  if (testIncludes.includes("writing1")) {
    Generate("TOEIC Writing Task 7 (Respond to a Written Request)");
    time += 10 * 60;
  }
  if (testIncludes.includes("writing2")) {
    Generate("TOEIC Writing Task 8 (Essay)");
    time += 10 * 60;
  }

  setTimer(time);
}
