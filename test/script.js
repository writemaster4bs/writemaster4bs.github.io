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
const testIncludes = params.get("include").split(" ");
document.title = `${translationKeys[testType]} practice - Writemaster`;
if (!(testType in translationKeys) || testIncludes == []) {
  window.location.href = "/";
}

let stage = 0;
let timeLeft = 0; // seconds
let intervalId = 0; // what
const TimerElement = document.getElementById("timer");

function startTimer(time) {
  timeLeft = Date.now() + 1000 * time;
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

ActionButton.addEventListener("click", () => {
  if (stage == 0) {
    stage = 1;
    ActionButton.innerHTML = "Submit";
    TestBox.className = "";
    startTimer(60 * 60); //can and will be changed later
    enableTest();
  } else {
    window.confirm("Are you sure you want to submit?") && submit();
  }
});

function readyTest() {
  document.getElementById("testrdy").innerHTML = "";
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
  TimerElement.style = /*css*/ "color:var(--accent-color)";
  clearInterval(intervalId);
  console.log("Test is done!");
  //alert("uiia");
  disableTest();
  ActionButton.disabled = true;
  Questions.forEach((e) => {
    getAIResponse(`Generate a helpful review for the following ${translationKeys[testType]} practice test answer:\n
${e.answer.value}\n
The question is:\n
${e.question}\n`).then((r) => {
      e.response.innerHTML = marked.parse(r);
    });
  });
}

async function getAIResponse(prompt = "") {
  if (!enableAI) return `This is a response to the question "${prompt}"`;

  const response = await fetch(
    `https://writemaster-api.vercel.app/api/ai?prompt=${encodeURIComponent(
      prompt
    )}`
  );

  if (response.status == 429) {
    window.alert(
      "We have reached our rate limit for AI usage, please try again later."
    );
    throw new Error("RATE LIMITED: please try again later shortly.");
  } else if (!response.ok) {
    window.alert(
      "Encountered unknown errors while prompting the AI, please try again later."
    );
    throw new Error("error :(");
  }

  const data = await response.json();
  console.log(data);
  return data.candidates[0].content.parts[0].text;
}

// CODE STARTS HERE
// is hpol or aqme a better username/displayname (pls answer i need to pick)
//hpol
// hpol it is (originally it was hybridpolaris but i shortened to hpol)

let questionsLeftToGenerate = 0;
function setGenerationFinished(questions) {
  questionsLeftToGenerate = questions;
}

function checkGenerationFinished() {
  questionsLeftToGenerate -= 1;
  questionsLeftToGenerate <= 0 && readyTest();
}
/*on start */

function generateIELTSWritingQuestion(task) {
	const section = document.createElement("div");
    const sectionTitle = document.createElement("h3");
    const sectionQuestion = document.createElement("p");
    const sectionTextbox = document.createElement("textarea");
    const sectionResponse = document.createElement("p");
    section.className = "section";
    sectionTitle.innerText = `Writing task ${task}`;

    getAIResponse(
      `Generate a ${translationKeys[testType]} Writing Task ${task} question.

Requirements:
- Produce *only* the question text. Do not include titles, tips, instructions, greetings, closings, word-count reminders, or any meta commentary.
- If the task involves data (charts, graphs, trends, comparisons, processes, etc.), represent all data using Markdown tables only. Do not include images, ASCII art, or non-table charts.
- The question should be fully self-contained and formatted exactly as a standard IELTS Writing Task 1 prompt.
- Do not add anything before or after the question. Output the question alone.`
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

document.getElementById("title").innerText = `${translationKeys[
  testType
].toUpperCase()} PRACTICE TEST`;
if (testType != "toeic") {
  setGenerationFinished(testIncludes.length);
  if (testIncludes.includes("writing1")) {
    generateIELTSWritingQuestion(1);
  }
  if (testIncludes.includes("writing2")) {
    generateIELTSWritingQuestion(2);
  }
}
