Chart.defaults.elements.line.tension = 0.25;
const stored = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const theme = stored ?? (prefersDark ? "dark" : "light");
console.log(theme);
if (theme == "light") {
  Chart.defaults.backgroundColor = "#000000";
  Chart.defaults.borderColor = "#000000";
} else {
  Chart.defaults.backgroundColor = "#ffffff";
  Chart.defaults.borderColor = "#ffffff";
}

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
/*function parseTable(e) {
  //console.log(header);
  //console.log(body);

  let header = e.header;

  let body = e.rows;
  header = header.map((e) => e.text);
  let type = "number";
  body = body.map((m) => {
    return m.map((n) => {
      if (isNaN(+n.text)) {
        type = "string";
      }
      return n.text;
    });
  });
  let WillChart = false;
  if (type == "number") {
    body = body.map((m) => {
      return m.map((n) => +n);
    });
    WillChart = Math.random() >= 0.4;
  }
  return { h: header, b: body, c: WillChart };
}*/
function parseTable(e) {
  /*GPT-4: Do you trust me?
  Me, Stonkalyasatone: With every cell of my body.
   */
  let header = e.header.map((h) => h.text);
  let body = e.rows.map((r) => r.map((c) => c.text));

  let sidewaysHeaders = [];
  let maybeSideways = true;

  // Detect if we likely have sideways headers
  for (let row of body) {
    if (row.length > 1) {
      // If first cell is NOT numeric but the rest ARE numeric → sideways header detected
      const firstIsString = isNaN(+row[0]);
      const restAreNumbers = row.slice(1).every((v) => !isNaN(+v));

      if (firstIsString && restAreNumbers) {
        sidewaysHeaders.push(row[0]);
      } else {
        maybeSideways = false;
        break;
      }
    }
  }

  // If sideways headers confirmed (every row matched), remove them
  if (maybeSideways && sidewaysHeaders.length === body.length) {
    header = header.slice(1); // remove the first column header name
    body = body.map((row) => row.slice(1)); // remove each row’s first cell
  } else {
    sidewaysHeaders = []; // not consistent, discard
  }

  let type = "number";
  for (let row of body) for (let cell of row) if (isNaN(+cell)) type = "string";

  let WillChart = false;

  if (type === "number") {
    body = body.map((row) => row.map((num) => +num));
    WillChart = Math.random() >= 0.4;
  }
  if (sidewaysHeaders.length == 0) {
    //dummy values
    sidewaysHeaders = body.map((e, i) => `Series ${i + 1}`);
  }
  return {
    h: header,
    b: body,
    c: WillChart,
    sideways: sidewaysHeaders.length ? sidewaysHeaders : null, // add returned series names
  };
}

function regularTable(d) {
  let table = `<thead><tr>${d.h
    .map((e) => {
      return `<th>${e}</th>`;
    })
    .join("")}</tr></thead>`;
  table += `<tbody>${d.b
    .map((r) => {
      return `<tr>${r
        .map((c) => {
          return `<td>${c}</td>`;
        })
        .join(``)}</tr>`;
    })
    .join("")}</tbody>`;
  return table;
}
let gni = 0;
function getNewID() {
  gni++;
  return `dont_collide_with_me_${gni}`;
}
function generateChartFromMarkdownTable(e) {
  let d = parseTable(e);
  if (!d.c) {
    console.log(regularTable(d));
    return `<table>${regularTable(d)}</table>`;
  }
  let cid = getNewID();

  setTimeout(() => {
    new Chart(document.getElementById(cid), {
      type: Math.random() >= 0.8 ? "line" : "bar",
      data: {
        labels: d.h,
        datasets: d.b.map((row, i) => ({
          label: d.sideways[i],
          data: row,
        })),
      },
    });
  }, 100); /*wait a lil bit */
  return `<canvas id="${cid}"></canvas>`;
}
let renderer = new marked.Renderer();
renderer.table = generateChartFromMarkdownTable;
marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
});
marked.use({ renderer, sanitize: false });

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
    return `This is a response to the question "${prompt}"\n Also, here's a table:
    |h0|ba|sau|bay|
    |---|---|---|---|
    |a|3|1|4|
    |b|1|5|4|`;
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
        type: test == "TOEIC" ? "toeic" : "ielts",
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

      getAIResponse(`Generate a helpful review for the following answer:\n
${e.answer.value}\n
The question is:\n
${e.question}\n\n
Requirements:
- Evaluate the quality, clarity, correctness, and completeness of the answer.
- Provide a decent-length constructive review, proposing fixes to spelling and grammar, and better vocab & sentence structure for flow. You can give a "rewritten" version of the test taker's answer, but **don't grade that.**
- At the end, output exactly one integer score from 0 to 100 in the format "Your score: XX".
- No other scoring formats or text after the score.
- Be fair but not harsh. Rate using the same criterion as actual ${e.type.toUpperCase()} test graders, and give points based on each of those criterion at the start.`).then(
        (r) => {
          e.response.innerHTML = /*html*/ `Here's what the AI thinks about your work.<br><div class="response">${marked.parse(
            r
          )}</div>`;

          if (!enableAI) {
            e.score = +prompt("test!").match(
              /Your\s\s?score:\s*((?:\d|[.,]\d)+)/i
            )[1];
          } else {
            e.score = +r.match(/Your\s\s?score:\s*((?:\d|[.,]\d)+)/i)[1];
          }

          avgScore += e.score;
          count++;
          generated--;

          if (generated == 0) {
            avgScore /= count;
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
