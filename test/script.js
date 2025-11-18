const enableAI = true;

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
const testIncludes = params.getAll("include");
document.title = `${translationKeys[testType]} practice - Writemaster`;

let timeLeft = 0; // seconds
let intervalId = 0; // what
const TimerElement = document.getElementById("timer");
function startTimer(time) {
  timeLeft = Date.now() + 1000 * time;
  intervalId = setInterval(updateTimer, 100);
}

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

document.getElementById("submit_btn").addEventListener("click", () => {
  // asking for confirmation
  window.confirm('Are you sure you want to submit?') && submit();
});

function submit() {
  //tbh idk what should be done here
  //leave that for qh
  TimerElement.style = /*css*/ "color:var(--accent-color)";
  clearInterval(intervalId);
  console.log("Test is done!");
  alert("aqme");
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

document.getElementById('title').innerText = `${translationKeys[testType].toUpperCase()} PRACTICE TEST`;
if (testType != 'toeic') {
  if (testIncludes.includes('writing')) {
    const section1 = document.createElement('div');
    const section1Title = document.createElement('h3');
    const section1Question = document.createElement('p');
    const section1Textbox = document.createElement('textarea');
    
    section1.className = 'section';
    section1Title.innerText = 'Writing task 1';
    getAIResponse(
      `I'm practicing for ${translationKeys[testType]}, can you generate a writing part 1 question for me? I don't want any tips/directions, as I'd like this to be a sort of mock test. \nNotes: you only need to provide charts in ONLY image form (not text form with markdown) if it is academic IELTS and otherwise, you should ONLY ANSWER WITH THE EXAM QUESTION and nothing else (except thE chart IMAGE), not even a title like 'IELTS Writing part 2'; and also not use any markdown, just plain text. Thanks.`
    ).then((response) => {
      section1Question.innerText = response;
    });
    
    section1.appendChild(section1Title);
    section1.appendChild(section1Question);
    section1.appendChild(section1Textbox);
    document.getElementById('test').appendChild(section1);
    startTimer(3600);
  }
}
