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
let WhetherSlidersMatter = true;
function UpdateSliders() {
  TOEIC_Score.innerHTML = `${TOEIC_Slider.value} points`;
  IELTS_Score.innerHTML = `Band ${IELTS_Slider.value}`;
  localStorage.setItem("ielts_target", IELTS_Slider.value);
  localStorage.setItem("toeic_target", TOEIC_Slider.value);
}
IELTS_Slider.value = localStorage.getItem("ielts_target") ?? 5.5;
TOEIC_Slider.value = localStorage.getItem("toeic_target") ?? 700;
UpdateSliders();
TOEIC_Slider.addEventListener("input", UpdateSliders);
IELTS_Slider.addEventListener("input", UpdateSliders);
let GenerateTest = document.getElementById("generate_test");
let Errors = document.getElementById("errors");
//let IncludeListening = document.getElementById("include_listening");
let IncludeReading = document.getElementById("include_reading");
let IELTSIncludeWritingPart1 = document.getElementById("include_writing1");
let IELTSIncludeWritingPart2 = document.getElementById("include_writing2");
let TOEICIncludeWritingPart6 = document.getElementById("include_writing6");
let TOEICIncludeWritingPart7 = document.getElementById("include_writing7");
let TOEICIncludeWritingPart8 = document.getElementById("include_writing8");
let TOEICIncludeWritingParts1to5 = document.getElementById("include_writing1to5");

GenerateTest.addEventListener("click", () => {
  /*var selected = document.querySelector('input[name="test_format"]:checked');

  if (selected) {
    var TypeOfTest = selected.id;
  } else {
    Errors.innerHTML = "You must select one type of test!";
    return;
  }*/
  var TypeOfTest = document.querySelector('input[name="type"]:checked').id;
  if (!TypeOfTest) {
    Errors.innerHTML = "You must select one type of test!";
    return;
  }
  //var HasListening = IncludeListening.checked;
  var HasReading = IncludeReading.checked;
  var IELTSHasWritingPart1 = IELTSIncludeWritingPart1.checked;
  var IELTSHasWritingPart2 = IELTSIncludeWritingPart2.checked;
  var TOEICHasWritingPart6 = TOEICIncludeWritingPart6.checked;
  var TOEICHasWritingPart7 = TOEICIncludeWritingPart7.checked;
  var TOEICHasWritingPart8 = TOEICIncludeWritingPart8.checked;
  var TOEICHasWritingParts1to5 = TOEICIncludeWritingParts1to5.checked;
  Errors.innerHTML = "";
  if (!(HasReading 
    || IELTSHasWritingPart1 
    || IELTSHasWritingPart2 
    || TOEICHasWritingPart6
    || TOEICHasWritingPart7
    || TOEICHasWritingPart8
    || TOEICHasWritingParts1to5)) {
    Errors.innerHTML = "You must select at least one skill to practice!";
    return;
  }

  // console.log("===TEST DATA===");
  // console.log(`Type: ${TypeOfTest.toUpperCase()}`);
  // console.log(`Include Listening: ${HasListening ? "YES" : "NO"}`);
  // console.log(`Include Reading: ${HasReading ? "YES" : "NO"}`);
  // console.log(`Include Writing: ${IELTSHasWritingPart1 ? "YES" : "NO"}`);

  if (WhetherSlidersMatter) {
    console.log(
      `Current performance: ${
        TypeOfTest == "ielts"
          ? `Band ${IELTS_Slider.value}`
          : `${TOEIC_Slider.value} points`
      }`
    );

    sessionStorage.setItem(
      "target",
      TypeOfTest == "ielts" ? IELTS_Slider.value : TOEIC_Slider.value
    );
  }

  const params = new URLSearchParams();
  params.set("type", TypeOfTest);
  // right side of && evaluates (run) if left is true, otherwise it stops immediately
  // basically a 'shorthand if' if you will
  let parts = "";
  
  if (HasReading) parts += "reading ";
  if (TypeOfTest != "toeic") {
    if (IELTSHasWritingPart1)	parts += "writing1 ";
    if (IELTSHasWritingPart2)	parts += "writing2 ";
  } else {
    if (TOEICHasWritingPart6) parts += "writing6 ";
    if (TOEICHasWritingPart7) parts += "writing7 ";
    if (TOEICHasWritingPart8) parts += "writing8 ";
    if (TOEICHasWritingParts1to5) parts += "writing1to5 ";
  }

  params.append("include", parts.slice(0, -1));
  console.log('help')
  console.log(parts);
  // Who in their right mind thinks of short-circuit evaluation?
  // oh stack overflow users do
  window.location.href = "/test/index.html?" + params.toString();
});

let SetSliders = document.getElementById("set_sliders");
let SliderMessage = document.getElementById("whether_sliders_matter");
SetSliders.checked = localStorage.getItem("sliders") == "yes";
function UpdateWTM() {
  WhetherSlidersMatter = SetSliders.checked;
  IELTS_Slider.disabled = !WhetherSlidersMatter;
  TOEIC_Slider.disabled = !WhetherSlidersMatter;
  if (WhetherSlidersMatter) {
    SliderMessage.innerHTML = "";
    localStorage.setItem("sliders", "yes");
  } else {
    SliderMessage.innerHTML =
      "You must enable personalization for these sliders to apply.";
    localStorage.setItem("sliders", "no");
  }
}
UpdateWTM();
SetSliders.addEventListener("change", UpdateWTM);
//let DarkModeSelector = document.getElementById("darkmode");

//DarkModeSelector.checked = localStorage.getItem("darkmode") == "yes";

document.getElementById("default").checked =
  localStorage.getItem("theme") == "default";
document.getElementById("light").checked =
  localStorage.getItem("theme") == "light";
document.getElementById("dark").checked =
  localStorage.getItem("theme") == "dark";

function UpdateDarkMode() {
  var selected = document.querySelector('input[name="theme"]:checked').id;
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
  localStorage.setItem("theme", selected);
}
document.querySelectorAll('input[name="theme"]').forEach((e) => {
  e.addEventListener("change", UpdateDarkMode);
});
//DarkModeSelector.addEventListener("change", UpdateDarkMode);
const c = "01234567890123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const randc = () => {
  return c[Math.floor(Math.random() * c.length)] ?? c[0];
};
function ResetEverything() {
  localStorage.clear();
  //DarkModeSelector.checked = false;
  SetSliders.checked = false;
  IELTS_Slider.value = 5.5;
  TOEIC_Slider.value = 700;

  UpdateWTM();
  UpdateSliders();
  document.getElementById("default").checked = false;
  document.getElementById("light").checked = true;
  document.getElementById("dark").checked = false;
  UpdateDarkMode();
}
if (localStorage.getItem("used_before")) {
  //do nothing!
} else {
  ResetEverything();
  localStorage.setItem("used_before", "yes");
}
document.getElementById("deleteall").addEventListener("click", () => {
  if (confirm("Are you sure? This cannot be undone")) {
    let code = "";
    for (let j = 0; j < 5; j++) {
      for (let i = 0; i < 5; i++) {
        code += randc();
      }
      if (j == 4) {
        continue;
      }
      code += "-";
    }
    if (prompt(`Please type the following code to confirm: ${code}`) == code) {
      ResetEverything();
    }
  }
});
/*UI.addEventListener('scroll', () => {
  const containerRect = container.getBoundingClientRect();
  [main,pref,stat].forEach(

  )
  
});*/

// run initially because
new Promise((resolve) =>
  setTimeout(resolve, 50)
).then(() => {
  if (document.getElementById("toeic").checked) {
    document.getElementById("ielts_options").className = "hidden";
    document.getElementById("toeic_options").className = "";
  } else {
    document.getElementById("ielts_options").className = "";
    document.getElementById("toeic_options").className = "hidden";
  }
});

document.getElementById("test_format").addEventListener("change", () => {
  if (document.getElementById("toeic").checked) {
    document.getElementById("ielts_options").className = "hidden";
    document.getElementById("toeic_options").className = "";
  } else {
    document.getElementById("ielts_options").className = "";
    document.getElementById("toeic_options").className = "hidden";
  }
});
