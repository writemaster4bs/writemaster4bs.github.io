let the_chart = null;
let data = [
  { day: 6, month: 8, year: 2025, count: 10 },
  { day: 27, month: 8, year: 2025, count: 19 },
  { day: 8, month: 9, year: 2025, count: 25 },
  { day: 29, month: 9, year: 2025, count: 20 },
  { day: 10, month: 10, year: 2025, count: 30 },
  { day: 20, month: 10, year: 2025, count: 37 },
];
(async function () {
  Chart.defaults.elements.line.tension = 0.25;
  Chart.defaults.backgroundColor = "#0090ff";
  Chart.defaults.borderColor = "#0090ff";
  the_chart = new Chart(document.getElementById("perfchart"), {
    type: "line",
    data: {
      labels: data.map((row) => `${row.day}/${row.month}/${row.year % 100}`),
      datasets: [
        {
          label: "Avg. Score",
          data: data.map((row) => row.count),
        },
      ],
    },
  });
})();
function updateChartData(newData) {
  the_chart.data.labels = newData.map(
    (row) => `${row.day}/${row.month}/${row.year % 100}`
  );
  the_chart.data.datasets[0].data = newData.map((row) => row.count);
  the_chart.update();
}
function AddNewData(what) {
  data = data.concat(what);
  updateChartData(data);
}
var UI = document.getElementById("user_interface");

function Scrollto(where) {
  let topOffset = where.offsetTop;
  UI.scrollTo({
    top: topOffset,
    behavior: "smooth",
  });
}
function Attach(what, next) {
  console.log(`Looking for ${what}_menu_selector`);
  var btn = document.getElementById(`${what}_menu_selector`);
  var where = document.getElementById(`${what}_menu_spos`);
  var next_elem = document.getElementById(`${next}_menu_spos`);
  btn.addEventListener("click", () => {
    const topOffset = where.offsetTop;
    UI.scrollTo({ top: topOffset, behavior: "smooth" });
  });
  const curry = where.offsetTop;
  const nexty = next_elem ? next_elem.offsetTop : Infinity;
  UI.addEventListener("scroll", () => {
    var conty = UI.scrollTop + UI.clientHeight / 2;
    if (conty >= curry && conty <= nexty) {
      btn.className = "option selected";
    } else {
      btn.className = "option";
    }
  });
}
Attach("main", "pref");
Attach("pref", "stat");
Attach("stat", "end");
let IELTS_Score = document.getElementById("ielts_score");
let IELTS_Slider = document.getElementById("band_ielts");
let TOEIC_Score = document.getElementById("toeic_score");
let TOEIC_Slider = document.getElementById("band_toeic");
TOEIC_Score.innerHTML = `${TOEIC_Slider.value} points`;
IELTS_Score.innerHTML = `Band ${IELTS_Slider.value}`;
TOEIC_Slider.addEventListener("input", () => {
  TOEIC_Score.innerHTML = `${TOEIC_Slider.value} points`;
});
IELTS_Slider.addEventListener("input", () => {
  IELTS_Score.innerHTML = `Band ${IELTS_Slider.value}`;
});
let GenerateTest = document.getElementById("generate_test");
let Errors = document.getElementById("errors");
let IncludeListening = document.getElementById("include_listening");
let IncludeWriting = document.getElementById("include_writing");
let IncludeReading = document.getElementById("include_reading");
GenerateTest.addEventListener("click", () => {
  var selected = document.querySelector('input[name="test_format"]:checked');

  if (selected) {
    var TypeOfTest = selected.id;
  } else {
    Errors.innerHTML = "You must select one type of test!";
    return;
  }
  var HasListening = IncludeListening.checked;
  var HasReading = IncludeReading.checked;
  var HasWriting = IncludeWriting.checked;
  Errors.innerHTML = "";
  if (!(HasListening || HasReading || HasWriting)) {
    Errors.innerHTML = "You must select at least one skill to practice!";
    return;
  }

  console.log("===TEST DATA===");
  console.log(`Type: ${TypeOfTest.toUpperCase()}`);
  console.log(`Include Listening: ${HasListening ? "YES" : "NO"}`);
  console.log(`Include Reading: ${HasReading ? "YES" : "NO"}`);
  console.log(`Include Writing: ${HasWriting ? "YES" : "NO"}`);
  console.log(
    `Desired Target: ${
      TypeOfTest == "ielts"
        ? `Band ${IELTS_Slider.value}`
        : `${TOEIC_Slider.value} points`
    }`
  );
});
/*UI.addEventListener('scroll', () => {
  const containerRect = container.getBoundingClientRect();
  [main,pref,stat].forEach(

  )
  
});*/
