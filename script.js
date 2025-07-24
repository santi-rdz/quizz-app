"use strict";

const subjectsUL = document.querySelector(".subjects");
const subjectImg = document.querySelector(".subject-img");
const subjectName = document.querySelector(".subject-name");
const content = document.querySelector(".content");
const themeBtn = document.querySelector(".theme-toggle");

let currentSubject;
let dataSubjects = [];
let currentSubjectData;
let currentQ = 0;
let score = 0;
let currentAnswer;
let isLight = localStorage.getItem("isLight") || false;
if (isLight === "true") document.body.classList.add("light");

fetch("data.json")
  .then((res) => res.json())
  .then((data) => (dataSubjects = data.quizzes));

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  isLight = document.body.classList.contains("light");
  localStorage.setItem("isLight", isLight);
});

function startQuiz(subject) {
  currentSubject = subject.dataset.subject;
  currentSubjectData = dataSubjects.find((d) => d.title === currentSubject);
  if (!currentSubjectData) return;

  currentQ = 0;
  score = 0;
  document.body.classList.add("quizActive");
  subjectImg.src = currentSubjectData.icon;
  subjectName.textContent = currentSubjectData.title;

  renderQuestion();
}

function renderQuestion() {
  const questionObj = currentSubjectData.questions[currentQ];
  const { question, options, answer } = questionObj;
  currentAnswer = answer;

  content.innerHTML = `
    <section
      class="start-menu my-container mt-[clamp(3rem,2.6479rem+1.5023vw,4rem)] flex flex-col gap-10 md:gap-16 lg:flex-row lg:gap-24"
    >
      <header class="lg:flex-1">
        <p class="text-6 light:text-gray-500 mb-[clamp(1rem,0.8239rem+0.7512vw,1.5rem)] text-blue-300 italic">
          Question <span class="currentQ">${currentQ + 1}</span> of <span class="totalQ">10</span>
        </p>
        <h1 class="quiz-question lg:min-h-44 text-3 light:text-blue-900 font-medium text-balance text-white">${question}</h1>
        <div class="progress-bar bg-blue-850 light:bg-white mt-6 h-4 w-full rounded-full p-1 lg:mt-23">
          <div class="progress-value h-full rounded-full bg-purple-600 transition-all duration-300" style="width: ${currentQ * 10}%"></div>        
        </div>
      </header>
      <form action="#" class="flex-1 form">
        <ul class="answers text-4 light:text-blue-900 space-y-4 font-medium text-white md:items-start"></ul>
        <button
          type="submit"
          class="submit text-4 mt-4 w-full cursor-pointer rounded-xl bg-purple-600 p-5 font-medium text-white transition-[background-color_scale] duration-300 hover:scale-105 hover:bg-purple-600/80"
        >
          Submit Answer
        </button>
        <button
          type="button"
          class="next hidden text-4 mt-4 w-full cursor-pointer rounded-xl bg-purple-600 p-5 font-medium text-white transition-[background-color_scale_opacity] duration-400 hover:scale-105 hover:bg-purple-600/80"
        >
          ${currentQ + 1 < 10 ? "Next Question" : "My score"} &rarr;
        </button>
      </form>
    </section>
  `;
  const progress = document.querySelector(".progress-value");
  const width = ((currentQ + 1) / 10) * 100;

  requestAnimationFrame(() => {
    progress.style.width = `${width}%`;
  });
  updateOptions(options);
}
function updateOptions(options) {
  const opt = ["A", "B", "C", "D"];
  const answersUL = document.querySelector(".answers");
  answersUL.innerHTML = "";

  options.forEach((option, i) => {
    const li = document.createElement("li");
    li.className = "answer animate-slideLeft";

    li.innerHTML = `
      <label  class="bg-blue-850 has-disabled:pointer-events-none light:bg-white correct:ring-green-500 correct:ring-2 incorrect:ring-2 incorrect:ring-red-500 light:shadow-[rgba(143,160,193,0.14)] hover:bg-blue-850/70 hover:light:bg-white/75 relative flex w-full cursor-pointer items-center rounded-xl p-4 text-start shadow-lg shadow-blue-900/15 transition-[background-color_scale] duration-300 ease-out hover:scale-105 hover:ring-2 hover:ring-purple-600 has-checked:ring-2 has-checked:ring-purple-600">
        <input type="radio" value="${option}" name="answer" class="peer mr-3 hidden" />
        <span class="text-grey-500 correct:bg-green-500 incorrect:bg-red-500 correct:text-white incorrect:text-white mr-[clamp(1rem,0.6479rem+1.5023vw,2rem)] inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 peer-checked:bg-purple-600 peer-checked:text-white">
          ${opt[i]}
        </span>
        <span class="answer-value max-w-[18ch]"></span>
      </label>
    `;

    li.querySelector(".answer-value").textContent = option;
    answersUL.appendChild(li);
  });
}

document.addEventListener("click", (e) => {
  const clicked = e.target;

  if (clicked.closest(".subject")) {
    const subject = clicked.closest(".subject");

    startQuiz(subject);
  }

  if (clicked.matches(".submit")) {
    e.preventDefault();
    if (!validateAnswer()) return;
    toggleButtons();
    return;
  }

  if (clicked.closest(".answer")) {
    document.querySelector(".error")?.remove();
  }

  if (clicked.matches(".next")) {
    nextQuestion();
  }
  if (clicked.matches(".again")) {
    renderMenu();
  }
});

function validateAnswer() {
  const selectedOption = document.querySelector('input[name="answer"]:checked');
  if (!selectedOption) {
    showAlert();
    return false;
  }

  const answerLI = selectedOption.closest(".answer");
  if (selectedOption.value === currentAnswer) {
    answerLI.classList.add("correct");
    score++;
  } else {
    const correct = document.querySelector(`input[name="answer"][value="${currentAnswer}"]`).closest(".answer");
    correct.classList.add("correctAnswer");
    answerLI.classList.add("incorrect");
  }
  document.querySelectorAll('input[name="answer"]').forEach((input) => (input.disabled = true));
  selectedOption.checked = false;
  return true;
}

function showAlert() {
  if (document.querySelector(".error")) return;

  const form = document.querySelector("form");

  const errorMsg = document.createElement("span");
  errorMsg.className = "text-4 error light:text-red-500 mt-4 flex items-center justify-center text-white md:mt-8";
  errorMsg.innerHTML = `<img src="assets/images/icon-incorrect.svg" alt="" />Please select an answer`;

  form.append(errorMsg);
}

function toggleButtons() {
  const submitBtn = document.querySelector(".submit");
  const nextBtn = document.querySelector(".next");
  submitBtn.classList.toggle("hidden");
  nextBtn.classList.toggle("hidden");
}

function nextQuestion() {
  currentQ++;
  if (currentQ >= currentSubjectData.questions.length) {
    const { icon, title } = currentSubjectData;
    content.innerHTML = `
    <section
        class="completed my-container mt-[clamp(3rem,2.6479rem+1.5023vw,4rem)] flex flex-col gap-10 md:gap-16 lg:flex-row lg:gap-24"
      >
        <header class="info-box lg:flex-1">
          <h1 class="text-2 light:text-blue-900 font-light text-nowrap text-white">
            Quiz Completed <br /><strong class="font-medium">You Scored</strong>
          </h1>
        </header>
        <form action="#" class="flex-1">
          <div
            class="bg-blue-850 light:bg-white lig flex flex-col items-center rounded-3xl p-12 shadow-lg shadow-blue-900/15"
          >
            <div class="subject-box flex items-center gap-4">
              <img
                class="subject-img light:bg-purple-100 rounded-sm bg-purple-50 p-1"
                src=${icon}
                alt=""
              />
              <p class="subject-name text-4 light:text-blue-900 font-medium text-white">${title}</p>
            </div>
            <h3 class="score text-1 light:text-blue-900 mt-10 font-medium text-white">${score}</h3>
            <span class="text-5 light:text-grey-500 mt-4 text-blue-300">Out of 10</span>
          </div>
          <button
            type="submit"
            class="text-4 again light:shadow-[rgba(143,160,193,0.14)] mt-4 w-full cursor-pointer rounded-xl bg-purple-600 p-5 font-medium text-white transition-[background-color_scale] duration-300 hover:scale-105 hover:bg-purple-600/80"
          >
            Play Again
          </button>
        </form>
      </section>
    `;
    return;
  }
  document.querySelector(".error")?.remove();
  renderQuestion();
}

function renderMenu() {
  document.body.classList.remove("quizActive");
  content.innerHTML = `
  <section
        class="start-menu my-container mt-[clamp(3rem,2.6479rem+1.5023vw,4rem)] flex flex-col gap-10 md:gap-16 lg:flex-row lg:gap-24"
      >
        <header class="lg:flex-1">
          <h1 class="text-2 light:text-blue-900 font-light text-nowrap text-white">
            Welcome to the <br /><strong class="font-medium">Frontend Quiz!</strong>
          </h1>
          <p class="text-5 light:text-gray-500 mt-[clamp(1rem,0.2958rem+3.0047vw,3rem)] text-blue-300 italic">
            Pick a subject to get started
          </p>
        </header>
        <ul class="subjects text-4 light:text-blue-900 flex-1 grow space-y-4 font-medium text-white md:items-start">
          <li class="subject animate-slideLeft grow" data-subject="HTML">
            <button
              class="bg-blue-850 light:bg-white light:shadow-[rgba(143,160,193,0.14)] hover:bg-blue-850/70 hover:light:bg-white/75 hover:light:ring hover:light:ring-fuchsia-200 w-full cursor-pointer rounded-3xl p-4 text-start shadow-lg shadow-blue-900/15 transition-[background-color_transform_shadow] duration-300 ease-out hover:-translate-y-1"
            >
              <img
                class="mr-[clamp(1rem,0.6479rem+1.5023vw,2rem)] inline-block rounded-lg bg-orange-50 p-1"
                src="assets/images/icon-html.svg"
                alt=""
              />HTML
            </button>
          </li>
          <li class="subject animate-slideLeft" data-subject="CSS">
            <button
              class="bg-blue-850 light:bg-white light:shadow-[rgba(143,160,193,0.14)] hover:bg-blue-850/70 hover:light:bg-white/75 hover:light:ring hover:light:ring-fuchsia-200 w-full cursor-pointer rounded-3xl p-4 text-start shadow-lg shadow-blue-900/15 transition-[background-color_transform_shdaow] duration-300 ease-out hover:-translate-y-1"
            >
              <img
                class="mr-[clamp(1rem,0.6479rem+1.5023vw,2rem)] inline-block rounded-lg bg-orange-50 p-1"
                src="assets/images/icon-css.svg"
                alt=""
              />CSS
            </button>
          </li>
          <li class="subject animate-slideLeft grow" data-subject="JavaScript">
            <button
              class="bg-blue-850 light:bg-white light:shadow-[rgba(143,160,193,0.14)] hover:bg-blue-850/70 hover:light:bg-white/75 hover:light:ring hover:light:ring-fuchsia-200 w-full cursor-pointer rounded-3xl p-4 text-start shadow-lg shadow-blue-900/15 transition-[background-color_transform_shdaow] duration-300 ease-out hover:-translate-y-1"
            >
              <img
                class="mr-[clamp(1rem,0.6479rem+1.5023vw,2rem)] inline-block rounded-lg bg-blue-50 p-1"
                src="assets/images/icon-js.svg"
                alt=""
              />JavaScript
            </button>
          </li>
          <li class="subject animate-slideLeft grow" data-subject="Accessibility">
            <button
              class="bg-blue-850 light:bg-white light:shadow-[rgba(143,160,193,0.14)] hover:bg-blue-850/70 hover:light:bg-white/75 hover:light:ring hover:light:ring-fuchsia-200 w-full cursor-pointer rounded-3xl p-4 text-start shadow-lg shadow-blue-900/15 transition-[background-color_transform_shdaow] duration-300 ease-out hover:-translate-y-1"
            >
              <img
                class="mr-[clamp(1rem,0.6479rem+1.5023vw,2rem)] inline-block rounded-lg bg-blue-50 p-1"
                src="assets/images/icon-accessibility.svg"
                alt=""
              />Accessibility
            </button>
          </li>
        </ul>
      </section>
      `;
}
