/* =========================================================
   ENGZI - SCRIPT.JS
   BẢN LOCAL ỔN ĐỊNH
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
   ========================================================= */

const ENGZI_CONFIG = {
    placementQuestions: 30,
    totalDoors: 11,
    normalDoors: 10,
    partsPerDoor: 180,

    questionsMin: 8,
    questionsMax: 15,

    maxHearts: 5,
    xpPerCorrect: 2,
    hardReviewQuestions: 15
};


/* =========================================================
   DEFAULT STATE
   ========================================================= */

const DEFAULT_STATE = {
    goal: null,
    learningSource: null,
    learnerName: "",
    language: "english",
    onboardingCompleted: false,
    onboardingVersion: 2,

    testScore: 0,
    testLevel: "",

    hearts: 5,
    streak: 0,
    xp: 0,
    level: 1,

    completedLessons: [],
    completedParts: [],
    completedDoors: [],

    mistakes: [],
    vocabulary: [],
    grammar: [],

    lastStudyDate: null,

    currentDoor: 1,
    currentPart: 1,
    currentLesson: 1,

    placementCompleted: false
};


/* =========================================================
   GOALS
   ========================================================= */

const GOALS = {
    communication: {
        name: "Giao tiếp",
        icon: "💬"
    },

    travel: {
        name: "Du lịch",
        icon: "🌍"
    },

    school: {
        name: "Trường học",
        icon: "🏫"
    },

    work: {
        name: "Công việc",
        icon: "💼"
    },

    entertainment: {
        name: "Giải trí",
        icon: "🎬"
    },

    study: {
        name: "Học tập",
        icon: "📚"
    }
};


/* =========================================================
   DOORS
   ========================================================= */

const DOORS = [
    {
        id: 1,
        title: "Cơ bản",
        icon: "🌱",
        description: "Những câu tiếng Anh đầu tiên"
    },

    {
        id: 2,
        title: "Giao tiếp",
        icon: "💬",
        description: "Giao tiếp hằng ngày"
    },

    {
        id: 3,
        title: "Cuộc sống",
        icon: "🏠",
        description: "Gia đình và cuộc sống"
    },

    {
        id: 4,
        title: "Du lịch",
        icon: "🌍",
        description: "Tiếng Anh khi đi du lịch"
    },

    {
        id: 5,
        title: "Trường học",
        icon: "🏫",
        description: "Học tập và trường lớp"
    },

    {
        id: 6,
        title: "Công việc",
        icon: "💼",
        description: "Tiếng Anh nơi làm việc"
    },

    {
        id: 7,
        title: "Xã hội",
        icon: "👥",
        description: "Giao tiếp xã hội"
    },

    {
        id: 8,
        title: "Tự nhiên",
        icon: "🌳",
        description: "Thế giới xung quanh"
    },

    {
        id: 9,
        title: "Nâng cao",
        icon: "🔥",
        description: "Câu tiếng Anh khó hơn"
    },

    {
        id: 10,
        title: "Thành thạo",
        icon: "🏆",
        description: "Luyện tập tổng hợp"
    },

    {
        id: 11,
        title: "Vô hạn",
        icon: "♾️",
        description: "AI luyện tập không giới hạn"
    }
];


/* =========================================================
   LESSON TOPICS
   ========================================================= */

const LESSON_TOPICS = [
    "Chào hỏi",
    "Tạm biệt",
    "Giới thiệu bản thân",
    "Hỏi tên",
    "Quê quán",
    "Tuổi",
    "Gia đình",
    "Sức khỏe",
    "Bạn bè",
    "Sở thích",
    "Thời gian",
    "Ngày tháng",
    "Màu sắc",
    "Số đếm",
    "Đồ ăn",
    "Đồ uống",
    "Nhà cửa",
    "Trường học",
    "Công việc",
    "Mua sắm",
    "Thời tiết",
    "Giao thông",
    "Du lịch",
    "Khách sạn",
    "Nhà hàng",
    "Phương hướng",
    "Cảm xúc",
    "Thì hiện tại",
    "Thì quá khứ",
    "Thì tương lai"
];


/* =========================================================
   STATE
   ========================================================= */

let state = loadState();

let placementQuestions = [];
let placementIndex = 0;
let placementScore = 0;
let placementAnswered = false;
let placementSelectedAnswer = null;

let currentLessonData = null;
let currentLessonOpenAnswer = "";
let currentQuestionIndex = 0;
let currentLessonScore = 0;
let currentAnswered = false;
let currentSelectedAnswer = null;

let hardReviewData = [];
let hardReviewIndex = 0;
let hardReviewScore = 0;
let hardReviewAnswered = false;
let hardReviewSelectedAnswer = null;
let partViewMode = "parts";


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function setText(id, value) {
    const element = $(id);

    if (element) {
        element.textContent = value;
    }
}


function showElement(id) {
    const element = $(id);

    if (element) {
        element.classList.remove("hidden");
    }
}


function hideElement(id) {
    const element = $(id);

    if (element) {
        element.classList.add("hidden");
    }
}


/* =========================================================
   STORAGE
   ========================================================= */

function loadState() {
    try {
        const saved = localStorage.getItem("engzi_state");

        if (!saved) {
            return { ...DEFAULT_STATE };
        }

        const parsed = JSON.parse(saved);

        return {
            ...DEFAULT_STATE,
            ...parsed
        };

    } catch (error) {
        console.error("Không thể đọc state:", error);

        return {
            ...DEFAULT_STATE
        };
    }
}


function saveState() {
    try {
        localStorage.setItem(
            "engzi_state",
            JSON.stringify(state)
        );
    } catch (error) {
        console.error("Không thể lưu state:", error);
    }
}


/* =========================================================
   RESET
   ========================================================= */

function resetState() {
    state = {
        ...DEFAULT_STATE
    };

    saveState();
    updateUI();
}


/* =========================================================
   SCREEN
   ========================================================= */

function showScreen(screenId) {

    document.querySelectorAll(".screen").forEach(function(screen) {
        screen.classList.remove("active");
    });

    const target = $(screenId);

    if (target) {
        target.classList.add("active");
    }

    window.scrollTo(0, 0);
}


/* =========================================================
   START APP
   ========================================================= */

function startApp() {

    console.log("Engzi: bắt đầu");

    if (state.onboardingVersion >= 2 && (state.onboardingCompleted || state.placementCompleted)) {
        showScreen("homeScreen");
        renderDoors();
        updateUI();
        return;
    }

    // Luôn đi qua onboarding đầy đủ ở lần đầu: tên → ngôn ngữ → biết đến Engzi → mục tiêu → trình độ.
    showScreen("profileIntroScreen");
    const nameInput = $("learnerName");
    if (nameInput) nameInput.value = state.learnerName || "";
    updateUI();
}


/* =========================================================
   ONBOARDING
   ========================================================= */
function continueFromProfile() {
    const input = $("learnerName");
    const name = (input?.value || "").trim();
    if (!name) { alert("Bạn hãy nhập tên để Engzi biết cách chào bạn nhé!"); input?.focus(); return; }
    state.learnerName = name;
    saveState();
    showScreen("languageScreen");
}

function selectLanguage(language, button) {
    document.querySelectorAll("[data-language]").forEach(el => el.classList.remove("selected"));
    button?.classList.add("selected");
    state.language = language;
    saveState();
}

function continueFromLanguage() {
    if (state.language !== "english") {
        alert("Engzi hiện hỗ trợ đầy đủ Tiếng Anh. Các ngôn ngữ khác sẽ được bổ sung sau nhé!");
        state.language = "english";
        saveState();
        return;
    }
    showScreen("sourceScreen");
}

function selectSource(source, button) {
    state.learningSource = source;
    document.querySelectorAll("#sourceScreen .goal-card").forEach(el => el.classList.remove("selected"));
    button?.classList.add("selected");
    const next = $("sourceContinue");
    if (next) next.disabled = false;
    saveState();
}

function continueFromSource() {
    if (!state.learningSource) return;
    showScreen("goalScreen");
}

/* =========================================================
   GOAL
   ========================================================= */

function getGoalName(goal) {

    if (!GOALS[goal]) {
        return "";
    }

    return GOALS[goal].name;
}


function selectGoal(goal) {

    if (!GOALS[goal]) {
        console.error("Mục tiêu không tồn tại:", goal);
        return;
    }

    state.goal = goal;

    saveState();

    document.querySelectorAll(".goal-card").forEach(function(card) {
        card.classList.remove("selected");
    });

    const selectedCard = document.querySelector(
        '.goal-card[data-goal="' + goal + '"]'
    );

    if (selectedCard) {
        selectedCard.classList.add("selected");
    }

    setText(
        "goalText",
        GOALS[goal].icon + " " + GOALS[goal].name
    );

    const continueButton = $("goalContinue");

    if (continueButton) {
        continueButton.disabled = false;
        continueButton.removeAttribute("disabled");
    }

    console.log("Đã chọn:", goal);
}


function goToInfo() {

    if (!state.goal) {
        alert("Hãy chọn mục tiêu học trước nhé!");
        return;
    }

    setText(
        "infoGoalText",
        GOALS[state.goal].icon + " " + GOALS[state.goal].name
    );

    showScreen("infoScreen");
}


/* =========================================================
   CHOOSE LEVEL
   ========================================================= */

function chooseInfo(source) {

    const levelMap = {
        beginner: { label: "🌱 Mới bắt đầu", door: 1, score: 0 },
        basic: { label: "🌿 Cơ bản", door: 3, score: 10 },
        good: { label: "🌳 Khá", door: 5, score: 20 },
        advanced: { label: "🔥 Tốt", door: 7, score: 25 }
    };

    if (!levelMap[source]) {
        startPlacementTest();
        return;
    }

    const selected = levelMap[source];

    state.learningSource = source;
    state.testScore = selected.score;
    state.testLevel = selected.label + " (tự đánh giá)";
    state.placementCompleted = true;
    state.onboardingCompleted = true;
    state.currentDoor = selected.door;
    state.currentPart = 1;
    state.currentLesson = 1;

    saveState();

    showScreen("resultScreen");

    setText("testScore", "—");
    setText("testLevel", selected.label);
    setText(
        "testMessage",
        "Bạn đã chọn mức bắt đầu. Engzi sẽ đưa bạn vào Cây học tập từ Cửa " +
        selected.door + ". Bạn vẫn có thể làm bài kiểm tra 30 câu sau."
    );
}


/* =========================================================
   PLACEMENT QUESTION BANK
   ========================================================= */

const PLACEMENT_BANK = [

    {
        id: 1,
        question: "Hello! What is your name?",
        answers: [
            "My name is Nam.",
            "I am fine.",
            "I am 12 years old.",
            "Good night."
        ],
        correct: 0,
        explanation: "Câu hỏi hỏi tên nên câu trả lời phù hợp là 'My name is Nam.'",
        difficulty: "very-easy",
        topic: "Giới thiệu"
    },

    {
        id: 2,
        question: "How are you?",
        answers: [
            "I'm fine, thank you.",
            "I'm twelve.",
            "I'm from Vietnam.",
            "My name is Lan."
        ],
        correct: 0,
        explanation: "'How are you?' hỏi tình trạng/sức khỏe.",
        difficulty: "very-easy",
        topic: "Giao tiếp"
    },

    {
        id: 3,
        question: "Where are you from?",
        answers: [
            "I'm from Vietnam.",
            "I'm thirteen.",
            "I'm fine.",
            "I'm a student."
        ],
        correct: 0,
        explanation: "'Where are you from?' hỏi bạn đến từ đâu.",
        difficulty: "very-easy",
        topic: "Quê quán"
    },

    {
        id: 4,
        question: "How old are you?",
        answers: [
            "I'm thirteen.",
            "I'm from Vietnam.",
            "I'm fine.",
            "My name is Minh."
        ],
        correct: 0,
        explanation: "'How old are you?' hỏi tuổi.",
        difficulty: "very-easy",
        topic: "Tuổi"
    },

    {
        id: 5,
        question: "Choose the correct sentence.",
        answers: [
            "She is my friend.",
            "She are my friend.",
            "She am my friend.",
            "She be my friend."
        ],
        correct: 0,
        explanation: "Với 'she', động từ to be ở hiện tại là 'is'.",
        difficulty: "easy",
        topic: "To be"
    },

    {
        id: 6,
        question: "I ___ a student.",
        answers: [
            "am",
            "is",
            "are",
            "be"
        ],
        correct: 0,
        explanation: "Với chủ ngữ 'I', dùng 'am'.",
        difficulty: "easy",
        topic: "To be"
    },

    {
        id: 7,
        question: "They ___ my friends.",
        answers: [
            "are",
            "is",
            "am",
            "be"
        ],
        correct: 0,
        explanation: "Với 'they', dùng 'are'.",
        difficulty: "easy",
        topic: "To be"
    },

    {
        id: 8,
        question: "What time do you get up?",
        answers: [
            "At seven o'clock.",
            "On Monday.",
            "In the kitchen.",
            "Because I'm tired."
        ],
        correct: 0,
        explanation: "Câu hỏi hỏi thời gian nên dùng 'At seven o'clock.'",
        difficulty: "easy",
        topic: "Thời gian"
    },

    {
        id: 9,
        question: "I usually ___ breakfast at 7 a.m.",
        answers: [
            "have",
            "has",
            "having",
            "had"
        ],
        correct: 0,
        explanation: "Với 'I' ở hiện tại đơn, dùng động từ nguyên mẫu 'have'.",
        difficulty: "easy",
        topic: "Hiện tại đơn"
    },

    {
        id: 10,
        question: "She ___ to school every day.",
        answers: [
            "goes",
            "go",
            "going",
            "gone"
        ],
        correct: 0,
        explanation: "Với 'she' ở hiện tại đơn, động từ 'go' thêm -es thành 'goes'.",
        difficulty: "medium",
        topic: "Hiện tại đơn"
    },

    {
        id: 11,
        question: "There ___ a book on the table.",
        answers: [
            "is",
            "are",
            "am",
            "be"
        ],
        correct: 0,
        explanation: "Có một quyển sách nên dùng 'There is'.",
        difficulty: "medium",
        topic: "There is"
    },

    {
        id: 12,
        question: "There ___ three apples in the basket.",
        answers: [
            "are",
            "is",
            "am",
            "be"
        ],
        correct: 0,
        explanation: "'Three apples' là số nhiều nên dùng 'There are'.",
        difficulty: "medium",
        topic: "There are"
    },

    {
        id: 13,
        question: "I ___ TV yesterday.",
        answers: [
            "watched",
            "watch",
            "watching",
            "watches"
        ],
        correct: 0,
        explanation: "'Yesterday' cho biết hành động xảy ra trong quá khứ.",
        difficulty: "medium",
        topic: "Quá khứ đơn"
    },

    {
        id: 14,
        question: "She is ___ than her brother.",
        answers: [
            "taller",
            "tall",
            "tallest",
            "more tall"
        ],
        correct: 0,
        explanation: "So sánh hơn với tính từ ngắn 'tall' dùng 'taller'.",
        difficulty: "medium",
        topic: "So sánh"
    },

    {
        id: 15,
        question: "I have lived here ___ 2020.",
        answers: [
            "since",
            "for",
            "at",
            "on"
        ],
        correct: 0,
        explanation: "'Since' đi với một mốc thời gian như 2020.",
        difficulty: "hard",
        topic: "Hiện tại hoàn thành"
    },

    {
        id: 16,
        question: "If it rains, we ___ at home.",
        answers: [
            "will stay",
            "stayed",
            "staying",
            "have stayed"
        ],
        correct: 0,
        explanation: "Câu điều kiện loại 1: If + hiện tại đơn, mệnh đề chính dùng will + V.",
        difficulty: "hard",
        topic: "Điều kiện"
    },

    {
        id: 17,
        question: "He has ___ his homework.",
        answers: [
            "finished",
            "finish",
            "finishing",
            "finishes"
        ],
        correct: 0,
        explanation: "Sau 'has' trong hiện tại hoàn thành dùng quá khứ phân từ.",
        difficulty: "hard",
        topic: "Hiện tại hoàn thành"
    },

    {
        id: 18,
        question: "I was tired because I ___ all day.",
        answers: [
            "had worked",
            "work",
            "am working",
            "will work"
        ],
        correct: 0,
        explanation: "Hành động xảy ra trước một thời điểm trong quá khứ có thể dùng quá khứ hoàn thành.",
        difficulty: "hard",
        topic: "Quá khứ hoàn thành"
    },

    {
        id: 19,
        question: "Would you like some coffee?",
        answers: [
            "Yes, please.",
            "Yes, I am.",
            "Yes, I do.",
            "Yes, I was."
        ],
        correct: 0,
        explanation: "Đây là lời mời, câu trả lời tự nhiên là 'Yes, please.'",
        difficulty: "medium",
        topic: "Giao tiếp"
    },

    {
        id: 20,
        question: "Could you help me?",
        answers: [
            "Sure.",
            "I'm twelve.",
            "It's Monday.",
            "I'm from Vietnam."
        ],
        correct: 0,
        explanation: "'Could you help me?' là lời nhờ giúp đỡ.",
        difficulty: "medium",
        topic: "Giao tiếp"
    },

    {
        id: 21,
        question: "How much is this shirt?",
        answers: [
            "It's $20.",
            "It's blue.",
            "It's mine.",
            "It's large."
        ],
        correct: 0,
        explanation: "'How much' hỏi giá tiền.",
        difficulty: "medium",
        topic: "Mua sắm"
    },

    {
        id: 22,
        question: "Where is the nearest hotel?",
        answers: [
            "It's next to the bank.",
            "It's very expensive.",
            "It's delicious.",
            "It's Tuesday."
        ],
        correct: 0,
        explanation: "Câu hỏi hỏi vị trí nên câu trả lời phải chỉ vị trí.",
        difficulty: "medium",
        topic: "Du lịch"
    },

    {
        id: 23,
        question: "I am going to ___ my grandmother tomorrow.",
        answers: [
            "visit",
            "visited",
            "visiting",
            "visits"
        ],
        correct: 0,
        explanation: "Sau 'going to' dùng động từ nguyên mẫu.",
        difficulty: "medium",
        topic: "Tương lai"
    },

    {
        id: 24,
        question: "She can ___ English very well.",
        answers: [
            "speak",
            "speaks",
            "speaking",
            "spoke"
        ],
        correct: 0,
        explanation: "Sau động từ khuyết thiếu 'can' dùng động từ nguyên mẫu.",
        difficulty: "medium",
        topic: "Modal verbs"
    },

    {
        id: 25,
        question: "This is the book ___ I bought yesterday.",
        answers: [
            "that",
            "where",
            "when",
            "who"
        ],
        correct: 0,
        explanation: "'That' có thể thay cho vật trong mệnh đề quan hệ.",
        difficulty: "hard",
        topic: "Mệnh đề quan hệ"
    },

    {
        id: 26,
        question: "If I ___ more time, I would learn another language.",
        answers: [
            "had",
            "have",
            "will have",
            "having"
        ],
        correct: 0,
        explanation: "Điều kiện loại 2 dùng If + quá khứ đơn.",
        difficulty: "hard",
        topic: "Điều kiện"
    },

    {
        id: 27,
        question: "The movie was ___ interesting that I watched it twice.",
        answers: [
            "so",
            "such",
            "too",
            "very"
        ],
        correct: 0,
        explanation: "Cấu trúc 'so + adjective + that'.",
        difficulty: "hard",
        topic: "Cấu trúc câu"
    },

    {
        id: 28,
        question: "By next year, I ___ English for five years.",
        answers: [
            "will have studied",
            "study",
            "studied",
            "am studying"
        ],
        correct: 0,
        explanation: "Hành động kéo dài đến một thời điểm trong tương lai dùng tương lai hoàn thành.",
        difficulty: "hard",
        topic: "Tương lai hoàn thành"
    },

    {
        id: 29,
        question: "She asked me where I ___.",
        answers: [
            "lived",
            "live",
            "am living",
            "will live"
        ],
        correct: 0,
        explanation: "Trong câu tường thuật với động từ quá khứ, thường lùi thì.",
        difficulty: "hard",
        topic: "Câu tường thuật"
    },

    {
        id: 30,
        question: "Neither Tom nor his friends ___ ready.",
        answers: [
            "are",
            "is",
            "am",
            "be"
        ],
        correct: 0,
        explanation: "Với 'Neither...nor', động từ thường hòa hợp với chủ ngữ gần nó: 'his friends' → are.",
        difficulty: "hard",
        topic: "Ngữ pháp"
    }

];


/* =========================================================
   SHUFFLE
   ========================================================= */

function shuffle(array) {

    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        const temp = result[i];

        result[i] = result[j];
        result[j] = temp;
    }

    return result;
}


/* =========================================================
   SHUFFLE ANSWERS
   ========================================================= */

function shuffleQuestionAnswers(question) {

    const answerObjects = question.answers.map(function(answer, index) {
        return {
            text: answer,
            originalIndex: index
        };
    });

    const shuffled = shuffle(answerObjects);

    return {
        ...question,

        answers: shuffled.map(function(item) {
            return item.text;
        }),

        correct: shuffled.findIndex(function(item) {
            return item.originalIndex === question.correct;
        })
    };
}


/* =========================================================
   PLACEMENT TEST
   ========================================================= */

function startPlacementTest() {

    // Luôn dùng đúng 30 câu. Câu hỏi được sắp từ dễ → khó,
    // thay vì random toàn bộ bài test, để người học tăng độ khó tự nhiên.
    const difficultyOrder = {
        "very-easy": 0,
        "easy": 1,
        "medium": 2,
        "hard": 3,
        "very_hard": 4,
        "very-hard": 4
    };

    placementQuestions = PLACEMENT_BANK
        .slice()
        .sort(function(a, b) {
            const da = difficultyOrder[a.difficulty] ?? 99;
            const db = difficultyOrder[b.difficulty] ?? 99;
            return da - db || a.id - b.id;
        })
        .slice(0, ENGZI_CONFIG.placementQuestions);

    placementIndex = 0;
    placementScore = 0;
    placementAnswered = false;
    placementSelectedAnswer = null;

    state.testScore = 0;
    state.testLevel = "";

    saveState();

    showScreen("testScreen");

    renderPlacementQuestion();
}


function createPlacementTest() {
    startPlacementTest();
}


function renderPlacementQuestion() {

    if (!placementQuestions.length) {
        return;
    }

    const originalQuestion =
        placementQuestions[placementIndex];

    const question =
        shuffleQuestionAnswers(originalQuestion);

    placementQuestions[placementIndex] = question;

    placementAnswered = false;

    setText(
        "testQuestionNumber",
        placementIndex + 1
    );

    setText(
        "testQuestion",
        question.question
    );

    setText(
        "testTopic",
        question.topic
    );

    const progress =
        ((placementIndex + 1) /
            placementQuestions.length) * 100;

    const progressBar = $("testProgress");

    if (progressBar) {
        progressBar.style.width =
            progress + "%";
    }

    const answersContainer =
        $("testAnswers");

    if (!answersContainer) {
        return;
    }

    answersContainer.innerHTML = "";

    question.answers.forEach(function(answer, index) {

        const button =
            document.createElement("button");

        button.className = "answer-option";

        button.textContent =
            answer;

        button.addEventListener(
            "click",
            function() {
                answerPlacement(index);
            }
        );

        answersContainer.appendChild(button);
    });

    hideElement("testExplanation");

    const nextButton =
        $("testNextButton");

    if (nextButton) {
        nextButton.disabled = true;
        nextButton.textContent =
            placementIndex ===
            placementQuestions.length - 1
                ? "Xem kết quả"
                : "Tiếp tục →";
    }
}


function answerPlacement(index) {
    // Motion feedback hook

    if (placementAnswered) return;

    placementSelectedAnswer = index;

    document.querySelectorAll("#testAnswers .answer-option").forEach(function(button, i) {
        button.classList.toggle("selected", i === index);
    });

    const nextButton = $("testNextButton");
    if (nextButton) {
        nextButton.disabled = false;
        nextButton.textContent = "Kiểm tra";
    }
}

function nextPlacementQuestion() {
    if (placementSelectedAnswer === null) return;

    if (!placementAnswered) {
        const question = placementQuestions[placementIndex];
        placementAnswered = true;

        const buttons = document.querySelectorAll("#testAnswers .answer-option");
        buttons.forEach(function(button, buttonIndex) {
            button.disabled = true;
            if (buttonIndex === question.correct) button.classList.add("correct");
            if (buttonIndex === placementSelectedAnswer && placementSelectedAnswer !== question.correct) button.classList.add("wrong");
        });

        if (placementSelectedAnswer === question.correct) {
            placementScore++;
        } else {
            showExplanation("testExplanation", question.explanation);
        }

        const nextButton = $("testNextButton");
        if (nextButton) nextButton.textContent = placementIndex === placementQuestions.length - 1 ? "Xem kết quả" : "Tiếp tục →";
        return;
    }

    placementIndex++;
    if (placementIndex >= placementQuestions.length) {
        finishPlacementTest();
        return;
    }

    placementSelectedAnswer = null;
    renderPlacementQuestion();
}


function finishPlacementTest() {

    const total =
        placementQuestions.length || 30;

    const percentage =
        (placementScore / total) * 100;

    let level = "";

    if (percentage < 30) {
        level = "🌱 Mới bắt đầu";
    } else if (percentage < 50) {
        level = "🌿 Cơ bản";
    } else if (percentage < 70) {
        level = "🌳 Khá";
    } else if (percentage < 85) {
        level = "🔥 Tốt";
    } else {
        level = "🏆 Nâng cao";
    }

    state.testScore = placementScore;
    state.testLevel = level;
    state.placementCompleted = true;
    state.onboardingCompleted = true;
    state.onboardingVersion = 2;

    // Quy đổi kết quả thành điểm bắt đầu trên Cây học tập.
    if (percentage < 30) {
        state.currentDoor = 1;
    } else if (percentage < 50) {
        state.currentDoor = 3;
    } else if (percentage < 70) {
        state.currentDoor = 5;
    } else if (percentage < 85) {
        state.currentDoor = 7;
    } else {
        state.currentDoor = 9;
    }

    state.currentPart = 1;
    state.currentLesson = 1;

    saveState();

    setText(
        "testScore",
        placementScore
    );

    setText(
        "testLevel",
        level
    );

    setText(
        "testMessage",
        "Engzi đã phân tích kết quả và đưa bạn đến điểm bắt đầu phù hợp trên Cây học tập."
    );

    showScreen("resultScreen");
}


function finishTest() {

    showScreen("homeScreen");

    renderDoors();
    updateUI();
}


/* =========================================================
   LESSON QUESTION BANK
   ========================================================= */

const QUESTION_BANK = [

    {
        id: 101,
        question: "How do you say 'Xin chào' in English?",
        answers: [
            "Hello",
            "Goodbye",
            "Thanks",
            "Sorry"
        ],
        correct: 0,
        explanation: "'Hello' nghĩa là 'Xin chào'.",
        topic: "Chào hỏi"
    },

    {
        id: 102,
        question: "How do you say 'Tạm biệt'?",
        answers: [
            "Goodbye",
            "Hello",
            "Please",
            "Welcome"
        ],
        correct: 0,
        explanation: "'Goodbye' nghĩa là 'Tạm biệt'.",
        topic: "Tạm biệt"
    },

    {
        id: 103,
        question: "What is your name?",
        answers: [
            "My name is Minh.",
            "I'm fine.",
            "I'm twelve.",
            "I'm from Vietnam."
        ],
        correct: 0,
        explanation: "Câu hỏi 'What is your name?' hỏi tên.",
        topic: "Giới thiệu"
    },

    {
        id: 104,
        question: "Nice to meet you.",
        answers: [
            "Nice to meet you, too.",
            "I'm twelve.",
            "Good night.",
            "I'm hungry."
        ],
        correct: 0,
        explanation: "Câu đáp tự nhiên là 'Nice to meet you, too.'",
        topic: "Giao tiếp"
    },

    {
        id: 105,
        question: "Where are you from?",
        answers: [
            "I'm from Vietnam.",
            "I'm fine.",
            "I'm twelve.",
            "I'm a student."
        ],
        correct: 0,
        explanation: "Dùng 'I'm from...' để nói mình đến từ đâu.",
        topic: "Quê quán"
    },

    {
        id: 106,
        question: "How old are you?",
        answers: [
            "I'm twelve years old.",
            "I'm from Vietnam.",
            "I'm fine.",
            "My name is Nam."
        ],
        correct: 0,
        explanation: "Dùng 'I'm ... years old' để nói tuổi.",
        topic: "Tuổi"
    },

    {
        id: 107,
        question: "How are you?",
        answers: [
            "I'm fine, thank you.",
            "I'm twelve.",
            "I'm from Vietnam.",
            "My name is Lan."
        ],
        correct: 0,
        explanation: "'How are you?' hỏi tình trạng/sức khỏe.",
        topic: "Sức khỏe"
    },

    {
        id: 108,
        question: "I ___ a student.",
        answers: [
            "am",
            "is",
            "are",
            "be"
        ],
        correct: 0,
        explanation: "Với 'I', dùng 'am'.",
        topic: "Ngữ pháp"
    },

    {
        id: 109,
        question: "She ___ my friend.",
        answers: [
            "is",
            "are",
            "am",
            "be"
        ],
        correct: 0,
        explanation: "Với 'she', dùng 'is'.",
        topic: "Ngữ pháp"
    },

    {
        id: 110,
        question: "They ___ happy.",
        answers: [
            "are",
            "is",
            "am",
            "be"
        ],
        correct: 0,
        explanation: "Với 'they', dùng 'are'.",
        topic: "Ngữ pháp"
    },

    {
        id: 111,
        question: "I usually ___ breakfast at 7.",
        answers: [
            "have",
            "has",
            "having",
            "had"
        ],
        correct: 0,
        explanation: "Với 'I' ở hiện tại đơn dùng 'have'.",
        topic: "Hiện tại đơn"
    },

    {
        id: 112,
        question: "She ___ to school every day.",
        answers: [
            "goes",
            "go",
            "going",
            "gone"
        ],
        correct: 0,
        explanation: "Với 'she', 'go' thành 'goes'.",
        topic: "Hiện tại đơn"
    },

    {
        id: 113,
        question: "I ___ TV yesterday.",
        answers: [
            "watched",
            "watch",
            "watching",
            "watches"
        ],
        correct: 0,
        explanation: "'Yesterday' cho biết hành động trong quá khứ.",
        topic: "Quá khứ"
    },

    {
        id: 114,
        question: "I am going to ___ tomorrow.",
        answers: [
            "travel",
            "traveled",
            "travels",
            "traveling"
        ],
        correct: 0,
        explanation: "Sau 'going to' dùng động từ nguyên mẫu.",
        topic: "Tương lai"
    },

    {
        id: 115,
        question: "Can you help me?",
        answers: [
            "Sure.",
            "I'm twelve.",
            "It's Monday.",
            "I'm hungry."
        ],
        correct: 0,
        explanation: "'Sure' là cách đáp tự nhiên khi đồng ý giúp.",
        topic: "Giao tiếp"
    },

    {
        id: 116,
        question: "How much is this?",
        answers: [
            "It's ten dollars.",
            "It's blue.",
            "It's mine.",
            "It's big."
        ],
        correct: 0,
        explanation: "'How much' hỏi giá.",
        topic: "Mua sắm"
    },

    {
        id: 117,
        question: "Where is the bathroom?",
        answers: [
            "It's over there.",
            "I'm hungry.",
            "It's delicious.",
            "I'm twelve."
        ],
        correct: 0,
        explanation: "Câu hỏi hỏi vị trí nên câu trả lời cần chỉ vị trí.",
        topic: "Du lịch"
    },

    {
        id: 118,
        question: "Would you like some water?",
        answers: [
            "Yes, please.",
            "Yes, I am.",
            "Yes, I do.",
            "Yes, I was."
        ],
        correct: 0,
        explanation: "Lời mời thường được đáp bằng 'Yes, please.'",
        topic: "Giao tiếp"
    }
];


/* =========================================================
   GENERATE QUESTIONS
   ========================================================= */

function generateQuestions(
    door = 1,
    part = 1,
    lesson = 1
) {
    // Mỗi bài luôn có đúng 10 câu.
    const selected = shuffle(QUESTION_BANK)
        .slice(0, 10)
        .map(function(question) {
            return shuffleQuestionAnswers(question);
        });

    return selected;
}



async function generateQuestionsAI(door, part, lesson) {
    const apiBase = (window.ENGZI_AI_API_BASE || "").replace(/\/$/, "");
    try {
        if (door === 11) {
            const res = await fetch(apiBase + "/api/ai/daily", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({goal:getGoalName(state.goal) || "giao tiếp", level:state.level || "A1"})});
            if (!res.ok) throw new Error("daily-ai");
            const data = await res.json();
            window.engziDailyPart = data;
            const flat = [];
            (data.lessons || []).forEach(function(lessonData){
                (lessonData.questions || []).forEach(function(q){ q.lessonTitle=lessonData.title; q.learningContent=lessonData.learningContent; flat.push(q); });
            });
            if (flat.length) return flat.slice(0,175);
        } else {
            const res = await fetch(apiBase + "/api/ai/questions", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({goal:getGoalName(state.goal) || "giao tiếp", level:state.level || "A1", door, part, lesson})});
            if (res.ok) { const data = await res.json(); if (Array.isArray(data) && data.length) return data; }
        }
    } catch (e) {}
    return generateQuestions(door, part, lesson);
}

function renderLearningContent(question) {
    const main = $("lessonAnswers");
    if (!main) return;
    const old = $("lessonLearningContent");
    if (old) old.remove();
    const content = document.createElement("div");
    content.id = "lessonLearningContent";
    content.className = "lesson-learning-content";
    content.innerHTML = "<strong>📚 Hôm nay học</strong><div>" + escapeHtml(question.learningContent || question.lessonTitle || "Luyện tập tiếng Anh") + "</div>";
    main.parentNode.insertBefore(content, main);
}

function escapeHtml(text){ const d=document.createElement("div"); d.textContent=text||""; return d.innerHTML; }
function startQuestionSpeech(text){ speakText(text); }
function startSpeakingAnswer(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ alert("Chrome/Edge chưa hỗ trợ nhận giọng nói trên thiết bị này."); return; }
    const status=$("lessonSpeechStatus");
    const btn=$("lessonSpeakButton");
    const rec=new SR(); rec.lang="en-US"; rec.interimResults=false; rec.maxAlternatives=1;
    if(btn) btn.disabled=true; if(status) status.textContent="🎙️ Đang nghe...";
    rec.onresult=function(e){ const text=e.results[0][0].transcript; if(status) status.textContent="Bạn nói: " + text + " — AI sẽ dùng nội dung này để nhận xét."; const q=currentLessonData.questions[currentQuestionIndex]; q.userSpeech=text; const next=$("lessonNextButton"); if(next){ currentSelectedAnswer=0; next.disabled=false; } };
    rec.onerror=function(){ if(status) status.textContent="Không nhận được giọng nói. Hãy thử lại."; };
    rec.onend=function(){ if(btn) btn.disabled=false; }; rec.start();
}

/* =========================================================
   START LESSON
   ========================================================= */

function isLessonUnlocked(door, part, lesson) {
    if (door < 1 || door > 10 || part < 1 || part > 180 || lesson < 1 || lesson > 10) return false;
    if (door > 1 && !state.completedDoors.includes(String(door - 1))) return false;
    if (part > 1 && !state.completedParts.includes(door + "-" + (part - 1))) return false;
    if (lesson > 1 && !state.completedLessons.includes(door + "-" + part + "-" + (lesson - 1))) return false;
    return true;
}

async function startLesson(door = 1, part = 1, lesson = 1) {
    if (state.hearts <= 0) {
        alert("❤️ Bạn đã hết tim. Hãy vào Ôn tập để khôi phục 1 tim trước nhé!");
        showReview();
        return;
    }

    if (!isLessonUnlocked(door, part, lesson)) {
        alert("🔒 Bạn cần hoàn thành nội dung phía trước trước nhé!");
        return;
    }

    showAILoading(true);
    let questions = await generateQuestionsAI(door, part, lesson);
    showAILoading(false);

    currentLessonData = { door, part, lesson, questions };
    currentQuestionIndex = 0;
    currentLessonScore = 0;
    currentAnswered = false;
    currentSelectedAnswer = null;

    state.currentDoor = door;
    state.currentPart = part;
    state.currentLesson = lesson;
    saveState();
    showScreen("lessonScreen");
    renderLessonQuestion();
}


/* =========================================================
   RENDER LESSON
   ========================================================= */

function renderLessonQuestion() {

    if (!currentLessonData) {
        return;
    }

    const total =
        currentLessonData.questions.length;

    if (
        currentQuestionIndex >= total
    ) {
        finishLesson();

        return;
    }

    const question =
        currentLessonData.questions[
            currentQuestionIndex
        ];

    currentAnswered = false;
    currentSelectedAnswer = null;
    currentLessonOpenAnswer = "";

    setText(
        "currentDoorNumber",
        currentLessonData.door
    );

    setText(
        "currentPartNumber",
        currentLessonData.part
    );

    setText(
        "currentLessonNumber",
        currentLessonData.lesson
    );

    setText(
        "lessonQuestionNumber",
        currentQuestionIndex + 1
    );

    setText(
        "lessonQuestionTotal",
        total
    );

    setText(
        "lessonQuestion",
        question.question
    );

    setText(
        "lessonType",
        question.topic || "Luyện tập"
    );

    renderLearningContent(question);

    const progress =
        ((currentQuestionIndex) /
            total) * 100;

    const progressBar =
        $("lessonProgress");

    if (progressBar) {
        progressBar.style.width =
            progress + "%";
    }

    const answers =
        $("lessonAnswers");

    if (!answers) {
        return;
    }

    answers.innerHTML = "";
    const type = (question.type || "multiple_choice").toLowerCase();
    if(type === "listening") {
        const b=document.createElement("button"); b.className="primary-btn"; b.textContent="🔊 Nghe câu AI đọc"; b.onclick=function(){ startQuestionSpeech(question.question); }; answers.appendChild(b);
        const input=document.createElement("input"); input.className="lesson-open-input"; input.placeholder="Viết lại câu bạn vừa nghe..."; input.oninput=function(){ currentLessonOpenAnswer=input.value.trim(); const next=$("lessonNextButton"); if(next) next.disabled=!currentLessonOpenAnswer; }; answers.appendChild(input);
    } else if(type === "speaking" || type === "conversation") {
        const b=document.createElement("button"); b.id="lessonSpeakButton"; b.className="primary-btn"; b.textContent="🎙️ Nói để AI nhận xét"; b.onclick=startSpeakingAnswer; answers.appendChild(b);
        const st=document.createElement("div"); st.id="lessonSpeechStatus"; st.className="speech-status"; st.textContent="Nhấn nút rồi nói tiếng Anh."; answers.appendChild(st);
    } else if(type === "writing") {
        const input=document.createElement("textarea"); input.className="lesson-open-input"; input.placeholder="Viết câu trả lời của bạn..."; input.oninput=function(){ currentLessonOpenAnswer=input.value.trim(); const next=$("lessonNextButton"); if(next) next.disabled=!currentLessonOpenAnswer; }; answers.appendChild(input);
    } else {
        (question.answers || []).forEach(function(answer,index){ const button=document.createElement("button"); button.className="answer-option"; button.textContent=answer; button.addEventListener("click",function(){answerLesson(index);}); answers.appendChild(button); });
    }

    hideElement("lessonExplanation");

    const feedback =
        $("lessonFeedback");

    if (feedback) {
        feedback.className =
            "feedback hidden";

        feedback.textContent = "";
    }

    const nextButton =
        $("lessonNextButton");

    if (nextButton) {
        nextButton.disabled = true;
        nextButton.textContent =
            "Kiểm tra";
    }

    setText(
        "lessonHearts",
        state.hearts
    );
}


/* =========================================================
   ANSWER LESSON
   ========================================================= */

function answerLesson(index) {
    // Motion feedback hook

    if (currentAnswered || !currentLessonData) return;

    currentSelectedAnswer = index;

    document.querySelectorAll("#lessonAnswers .answer-option").forEach(function(button, buttonIndex) {
        button.classList.toggle("selected", buttonIndex === index);
    });

    const nextButton = $("lessonNextButton");
    if (nextButton) {
        nextButton.disabled = false;
        nextButton.textContent = "Kiểm tra";
    }
}

function gradeCurrentLessonAnswer() {
    if (!currentLessonData || currentSelectedAnswer === null || currentAnswered) return false;

    const question = currentLessonData.questions[currentQuestionIndex];
    if(["listening","speaking","conversation","writing"].includes((question.type||"").toLowerCase())) {
        if(!currentLessonOpenAnswer && !question.userSpeech) return false;
        currentAnswered = true;
        currentLessonScore++; state.xp += ENGZI_CONFIG.xpPerCorrect;
        showFeedback("lessonFeedback", "🤖 AI đã nhận câu trả lời của bạn. Hãy xem nhận xét bên dưới.");
        showExplanation("lessonExplanation", question.explanation || "Câu trả lời phù hợp với bài học. Hãy tiếp tục luyện tập để AI đánh giá chính xác hơn.");
        saveState(); updateUI(); setText("lessonHearts", state.hearts);
        const nextButton=$("lessonNextButton"); if(nextButton) nextButton.textContent=currentQuestionIndex===currentLessonData.questions.length-1?"Hoàn thành":"Tiếp tục →";
        return true;
    }
    currentAnswered = true;

    const buttons = document.querySelectorAll("#lessonAnswers .answer-option");
    buttons.forEach(function(button, buttonIndex) {
        button.disabled = true;
        if (buttonIndex === question.correct) button.classList.add("correct");
        if (buttonIndex === currentSelectedAnswer && currentSelectedAnswer !== question.correct) button.classList.add("wrong");
    });

    if (currentSelectedAnswer === question.correct) {
        currentLessonScore++;
        state.xp += ENGZI_CONFIG.xpPerCorrect;
        showFeedback("lessonFeedback", "✅ Chính xác!");
    } else {
        state.hearts = Math.max(0, state.hearts - 1);
        saveMistake(question);
        showFeedback("lessonFeedback", "❌ Chưa đúng. Xem giải thích nhé!");
        showExplanation("lessonExplanation", question.explanation);
    }

    saveState();
    updateUI();
    setText("lessonHearts", state.hearts);

    const nextButton = $("lessonNextButton");
    if (nextButton) {
        if (state.hearts === 0) {
            nextButton.textContent = "❤️ Ôn tập ngay";
        } else {
            nextButton.textContent = currentQuestionIndex === currentLessonData.questions.length - 1 ? "Hoàn thành" : "Tiếp tục →";
        }
    }
    return true;
}


/* =========================================================
   NEXT LESSON QUESTION
   ========================================================= */

function nextLessonQuestion() {
    if (hardReviewData.length > 0 && !currentLessonData) {
        nextHardReviewQuestion();
        return;
    }
    if (!currentLessonData) return;

    // Nếu vừa chọn đáp án: lần bấm đầu tiên là KIỂM TRA.
    if (!currentAnswered) {
        if (currentSelectedAnswer === null) return;
        gradeCurrentLessonAnswer();
        return;
    }

    // Hết tim: kết thúc ngay, không được xem câu tiếp theo.
    if (state.hearts <= 0) {
        currentLessonData = null;
        currentQuestionIndex = 0;
        currentLessonScore = 0;
        currentAnswered = false;
        currentSelectedAnswer = null;
        showReview();
        return;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex >= currentLessonData.questions.length) {
        finishLesson();
        return;
    }

    currentSelectedAnswer = null;
    renderLessonQuestion();
}


/* =========================================================
   FINISH LESSON
   ========================================================= */

function finishLesson() {

    if (!currentLessonData) {
        return;
    }

    if (typeof currentLessonData.door !== "number") {
        currentLessonData = null;
        currentQuestionIndex = 0;
        currentLessonScore = 0;
        currentAnswered = false;
        currentSelectedAnswer = null;
        showReview();
        return;
    }

    const lessonKey =
        currentLessonData.door +
        "-" +
        currentLessonData.part +
        "-" +
        currentLessonData.lesson;

    if (
        !state.completedLessons.includes(
            lessonKey
        )
    ) {

        state.completedLessons.push(
            lessonKey
        );
    }

    const partKey =
        currentLessonData.door +
        "-" +
        currentLessonData.part;

    if (
        !state.completedParts.includes(
            partKey
        )
    ) {

        state.completedParts.push(
            partKey
        );
    }

    const doorKey =
        String(
            currentLessonData.door
        );

    if (
        !state.completedDoors.includes(
            doorKey
        ) &&
        currentLessonData.lesson >= 180
    ) {

        state.completedDoors.push(
            doorKey
        );
    }

    setText(
        "completedDoorNumber",
        currentLessonData.door
    );

    setText(
        "completedPartNumber",
        currentLessonData.part
    );

    setText(
        "completedLessonNumber",
        currentLessonData.lesson
    );

    setText(
        "lessonXpEarned",
        currentLessonScore *
        ENGZI_CONFIG.xpPerCorrect
    );

    setText(
        "lessonScore",
        currentLessonScore +
        "/" +
        currentLessonData.questions.length
    );

    updateStreak();

    saveState();

    showScreen(
        "lessonCompleteScreen"
    );

    updateUI();
}


/* =========================================================
   EXIT LESSON
   ========================================================= */

function exitLesson() {

    currentLessonData = null;
    currentQuestionIndex = 0;
    currentLessonScore = 0;
    currentAnswered = false;
    currentSelectedAnswer = null;
    hardReviewData = [];
    hardReviewIndex = 0;
    hardReviewAnswered = false;
    hardReviewSelectedAnswer = null;

    goHome();
}


/* =========================================================
   FEEDBACK
   ========================================================= */

function showFeedback(id, message) {

    const element = $(id);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove("hidden");
}


function showExplanation(id, message) {

    const element = $(id);

    if (!element) {
        return;
    }

    element.innerHTML =
        "<strong>💡 Tại sao?</strong><br>" +
        message;

    element.classList.remove(
        "hidden"
    );
}


/* =========================================================
   MISTAKES
   ========================================================= */

function saveMistake(question) {
    const index = state.mistakes.findIndex(function(item) { return item.id === question.id; });
    const item = {
        id: question.id,
        question: question.question,
        answers: question.answers.slice(),
        correct: question.correct,
        explanation: question.explanation,
        topic: question.topic || "Lỗi sai"
    };

    if (index === -1) state.mistakes.push(item);
    else state.mistakes[index] = item;
}


/* =========================================================
   HARD REVIEW
   ========================================================= */

function startHardReview() {

    hardReviewData =
        shuffle(
            QUESTION_BANK
        )
        .slice(
            0,
            ENGZI_CONFIG.hardReviewQuestions
        )
        .map(function(question) {
            return shuffleQuestionAnswers(question);
        });

    hardReviewIndex = 0;
    hardReviewScore = 0;
    hardReviewAnswered = false;
    hardReviewSelectedAnswer = null;
    currentLessonData = null;

    showScreen("lessonScreen");

    renderHardReviewQuestion();
}


function renderHardReviewQuestion() {

    if (
        hardReviewIndex >=
        hardReviewData.length
    ) {

        finishHardReview();

        return;
    }

    const question =
        hardReviewData[
            hardReviewIndex
        ];

    hardReviewAnswered = false;
    hardReviewSelectedAnswer = null;

    setText(
        "currentDoorNumber",
        "🔥"
    );

    setText(
        "currentPartNumber",
        "Ôn"
    );

    setText(
        "currentLessonNumber",
        "Tập"
    );

    setText(
        "lessonQuestionNumber",
        hardReviewIndex + 1
    );

    setText(
        "lessonQuestionTotal",
        hardReviewData.length
    );

    setText(
        "lessonQuestion",
        question.question
    );

    setText(
        "lessonType",
        "Ôn tập khó"
    );

    const progressBar =
        $("lessonProgress");

    if (progressBar) {

        progressBar.style.width =
            (
                hardReviewIndex /
                hardReviewData.length *
                100
            ) + "%";
    }

    const answers =
        $("lessonAnswers");

    if (!answers) {
        return;
    }

    answers.innerHTML = "";

    question.answers.forEach(
        function(answer, index) {

            const button =
                document.createElement("button");

            button.className =
                "answer-option";

            button.textContent =
                answer;

            button.addEventListener(
                "click",
                function() {
                    answerHardReview(index);
                }
            );

            answers.appendChild(button);
        }
    );

    hideElement("lessonExplanation");

    const nextButton =
        $("lessonNextButton");

    if (nextButton) {
        nextButton.disabled = true;
        nextButton.textContent =
            "Kiểm tra";
    }

    setText(
        "lessonHearts",
        state.hearts
    );
}


function answerHardReview(index) {
    if (hardReviewAnswered) return;

    hardReviewSelectedAnswer = index;
    document.querySelectorAll("#lessonAnswers .answer-option").forEach(function(button, i) {
        button.classList.toggle("selected", i === index);
    });

    const nextButton = $("lessonNextButton");
    if (nextButton) {
        nextButton.disabled = false;
        nextButton.textContent = "Kiểm tra";
    }
}

function gradeHardReviewAnswer() {
    if (hardReviewSelectedAnswer === null || hardReviewAnswered) return;

    hardReviewAnswered = true;
    const question = hardReviewData[hardReviewIndex];
    const buttons = document.querySelectorAll("#lessonAnswers .answer-option");

    buttons.forEach(function(button, buttonIndex) {
        button.disabled = true;
        if (buttonIndex === question.correct) button.classList.add("correct");
        if (buttonIndex === hardReviewSelectedAnswer && hardReviewSelectedAnswer !== question.correct) button.classList.add("wrong");
    });

    if (hardReviewSelectedAnswer === question.correct) {
        hardReviewScore++;
        showFeedback("lessonFeedback", "✅ Chính xác!");
    } else {
        showFeedback("lessonFeedback", "❌ Chưa đúng!");
        showExplanation("lessonExplanation", question.explanation);
    }

    const nextButton = $("lessonNextButton");
    if (nextButton) nextButton.textContent = hardReviewIndex === hardReviewData.length - 1 ? "Xem kết quả" : "Tiếp tục →";
}


function nextHardReviewQuestion() {
    if (!hardReviewAnswered) {
        if (hardReviewSelectedAnswer === null) return;
        gradeHardReviewAnswer();
        return;
    }

    hardReviewIndex++;
    if (hardReviewIndex >= hardReviewData.length) {
        finishHardReview();
        return;
    }

    hardReviewSelectedAnswer = null;
    renderHardReviewQuestion();
}


function finishHardReview() {

    const wasZero =
        state.hearts === 0;

    if (wasZero) {

        state.hearts =
            Math.min(
                ENGZI_CONFIG.maxHearts,
                state.hearts + 1
            );
    }

    state.xp +=
        hardReviewScore *
        ENGZI_CONFIG.xpPerCorrect;

    saveState();

    alert(
        "🔥 Ôn tập hoàn thành!\n" +
        "Đúng: " +
        hardReviewScore +
        "/" +
        hardReviewData.length +
        "\n❤️ Tim hiện tại: " +
        state.hearts
    );

    hardReviewData = [];
    hardReviewIndex = 0;
    hardReviewAnswered = false;
    hardReviewSelectedAnswer = null;
    goHome();
}


/* =========================================================
   REVIEW
   ========================================================= */

function showReview() {
    showScreen("reviewScreen");
}


function startReview(type) {
    if (type === "mistakes") {
        if (!state.mistakes.length) {
            alert("📖 Bạn chưa có câu sai nào để ôn.");
            return;
        }

        currentLessonData = {
            door: "📖",
            part: "Ôn",
            lesson: "Lỗi",
            questions: state.mistakes.map(function(item) {
                return shuffleQuestionAnswers({
                    id: item.id,
                    question: item.question,
                    answers: item.answers || ["Đáp án A","Đáp án B","Đáp án C","Đáp án D"],
                    correct: Number.isInteger(item.correct) ? item.correct : 0,
                    explanation: item.explanation || "Hãy xem lại kiến thức của câu này.",
                    topic: item.topic || "Lỗi sai"
                });
            }).slice(0, 10)
        };

        currentQuestionIndex = 0;
        currentLessonScore = 0;
        currentAnswered = false;
        currentSelectedAnswer = null;
        showScreen("lessonScreen");
        renderLessonQuestion();
        return;
    }

    if (type === "vocabulary") {
        alert("📚 Phần ôn từ vựng sẽ dựa trên các từ bạn đã học. Hãy hoàn thành thêm bài học để có dữ liệu ôn tập nhé!");
        return;
    }

    showReview();
}


/* =========================================================
   INFINITE PRACTICE
   ========================================================= */

async function startInfinitePractice() {
    showAILoading(true);
    let questions = await generateQuestionsAI(11, 0, 0);
    showAILoading(false);
    if(!questions.length){ alert("AI hôm nay chưa tạo được nội dung. Hãy kiểm tra GEMINI_API_KEY rồi thử lại."); return; }
    currentLessonData = { door: 11, part: new Date().toISOString().slice(0,10), lesson: "AI", questions: questions.slice(0,175) };
    currentQuestionIndex = 0; currentLessonScore = 0; currentAnswered = false; currentSelectedAnswer = null; currentLessonOpenAnswer="";
    showScreen("lessonScreen"); renderLessonQuestion();
}



/* =========================================================
   DOORS
   ========================================================= */

function renderDoors() {

    const container =
        $("doorsContainer");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    DOORS.forEach(
        function(door) {

            const completed =
                state.completedDoors.includes(
                    String(door.id)
                );

            const card =
                document.createElement("button");

            card.className =
                "door-card";

            card.innerHTML = `
                <div class="door-icon">
                    ${door.icon}
                </div>

                <div class="door-info">
                    <strong>
                        Cửa ${door.id}: ${door.title}
                    </strong>

                    <small>
                        ${door.description}
                    </small>

                    <span>
                        ${
                            door.id === 11
                                ? "♾️ Vô hạn"
                                : "180 phần • 18.000 câu"
                        }
                    </span>
                </div>

                <div class="door-status">
                    ${
                        completed
                            ? "✅"
                            : "→"
                    }
                </div>
            `;

            const unlocked = door.id === 1 || (door.id === 11 ? state.completedDoors.includes("10") : state.completedDoors.includes(String(door.id - 1)));
            card.disabled = !unlocked;
            if (!unlocked) card.classList.add("locked");
            card.addEventListener("click", function() { openDoor(door.id); });

            container.appendChild(card);
        }
    );
}


/* =========================================================
   OPEN DOOR
   ========================================================= */

function openDoor(doorId) {
    if (doorId === 11) {
        if (!state.completedDoors.includes("10")) {
            alert("🔒 Hãy hoàn thành Cửa 10 trước nhé!");
            return;
        }
        startInfinitePractice();
        return;
    }

    if (doorId > 1 && !state.completedDoors.includes(String(doorId - 1))) {
        alert("🔒 Hãy hoàn thành Cửa " + (doorId - 1) + " trước nhé!");
        return;
    }

    openPart(doorId, 1);
}


/* =========================================================
   OPEN PART
   ========================================================= */

function openPart(
    doorId,
    partId
) {

    state.currentDoor =
        doorId;

    state.currentPart =
        partId;

    saveState();

    const door =
        DOORS.find(
            function(item) {
                return item.id === doorId;
            }
        );

    if (door) {

        setText(
            "partDoorTitle",
            "🚪 Cửa " + door.id
        );

        setText(
            "partTitle",
            "📚 Phần " + partId
        );

        setText(
            "partDescription",
            door.description
        );
    }

    renderParts(
        doorId,
        partId
    );

    showScreen("partScreen");
}


/* =========================================================
   RENDER PARTS
   ========================================================= */

function renderParts(doorId, currentPart) {
    const container = $("partsContainer");
    if (!container) return;
    partViewMode = "parts";
    container.innerHTML = "";

    for (let part = 1; part <= 180; part++) {
        const card = document.createElement("button");
        card.className = "part-card";
        const completed = state.completedParts.includes(doorId + "-" + part);
        const unlocked = part === 1 ? (doorId === 1 || state.completedDoors.includes(String(doorId - 1))) : state.completedParts.includes(doorId + "-" + (part - 1));
        card.disabled = !unlocked;
        if (unlocked) card.classList.add("unlocked");
        if (completed) card.classList.add("completed");
        card.innerHTML = `<div class="part-number">${completed ? "✅" : unlocked ? "📚" : "🔒"}</div><div><strong>Phần ${part}</strong><small>${LESSON_TOPICS[(part - 1) % LESSON_TOPICS.length]}</small><span>10 bài học</span></div>`;
        if (unlocked) card.addEventListener("click", function() { openPartLessons(doorId, part); });
        container.appendChild(card);
    }
}

function openPartLessons(doorId, partId) {
    partViewMode = "lessons";
    state.currentDoor = doorId;
    state.currentPart = partId;
    saveState();

    setText("partDoorTitle", "🚪 Cửa " + doorId);
    setText("partTitle", "📚 Phần " + partId + " — Bài học");
    setText("partDescription", "Hoàn thành lần lượt 10 bài để mở Phần tiếp theo.");

    const container = $("partsContainer");
    if (!container) return;
    container.innerHTML = "";

    for (let lesson = 1; lesson <= 10; lesson++) {
        const card = document.createElement("button");
        card.className = "part-card";
        const key = doorId + "-" + partId + "-" + lesson;
        const completed = state.completedLessons.includes(key);
        const unlocked = lesson === 1 || state.completedLessons.includes(doorId + "-" + partId + "-" + (lesson - 1));
        card.disabled = !unlocked;
        if (unlocked) card.classList.add("unlocked");
        if (completed) card.classList.add("completed");
        card.innerHTML = `<div class="part-number">${completed ? "✅" : unlocked ? "📝" : "🔒"}</div><div><strong>Bài ${lesson}</strong><small>${LESSON_TOPICS[((lesson - 1) + (partId - 1)) % LESSON_TOPICS.length]}</small><span>${doorId === 11 ? "AI • số câu linh hoạt" : "10 câu"}</span></div>`;
        if (unlocked) card.addEventListener("click", function() { startLesson(doorId, partId, lesson); });
        container.appendChild(card);
    }
}

function goBackFromPart() {
    if (partViewMode === "lessons") {
        const doorId = state.currentDoor || 1;
        const partId = state.currentPart || 1;
        setText("partTitle", "📚 Các phần");
        setText("partDescription", "Chọn một Phần để xem 10 bài học.");
        renderParts(doorId, partId);
        return;
    }
    goHome();
}


/* =========================================================
   HOME
   ========================================================= */

function goHome() {

    showScreen("homeScreen");

    renderDoors();
    updateUI();
}


/* =========================================================
   RANKING
   ========================================================= */

function goRanking() {

    setText(
        "rankingXp",
        state.xp + " XP"
    );

    showScreen("rankingScreen");
}


/* =========================================================
   PROFILE
   ========================================================= */

function goProfile() {

    setText(
        "profileXp",
        state.xp
    );

    setText(
        "profileStreak",
        state.streak
    );

    setText(
        "profileLevel",
        state.level
    );

    const percentage =
        getProgressPercent();

    setText(
        "profileProgress",
        percentage + "%"
    );

    const progressBar =
        $("profileProgressBar");

    if (progressBar) {
        progressBar.style.width =
            percentage + "%";
    }

    showScreen("profileScreen");
}


/* =========================================================
   PROGRESS
   ========================================================= */

function getTotalNormalLessons() {

    return (
        ENGZI_CONFIG.normalDoors *
        ENGZI_CONFIG.partsPerDoor
    );
}


function getProgressPercent() {

    const total =
        getTotalNormalLessons();

    if (total <= 0) {
        return 0;
    }

    const completed =
        state.completedLessons.length;

    return Math.min(
        100,
        Math.round(
            completed /
            total *
            100
        )
    );
}


/* =========================================================
   STREAK
   ========================================================= */

function updateStreak() {

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    if (
        state.lastStudyDate === today
    ) {
        return;
    }

    if (!state.lastStudyDate) {

        state.streak = 1;

    } else {

        const previous =
            new Date(
                state.lastStudyDate
            );

        const current =
            new Date(today);

        const difference =
            Math.floor(
                (
                    current -
                    previous
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );

        if (difference === 1) {

            state.streak++;

        } else {

            state.streak = 1;
        }
    }

    state.lastStudyDate =
        today;
}


/* =========================================================
   UI UPDATE
   ========================================================= */

function updateUI() {
    const greeting = $("learnerGreeting");
    if (greeting) greeting.textContent = state.learnerName || "bạn";


    setText(
        "heartCount",
        state.hearts
    );

    setText(
        "streakCount",
        state.streak
    );

    setText(
        "xpCount",
        state.xp
    );

    setText(
        "lessonHearts",
        state.hearts
    );

    setText(
        "testHearts",
        state.hearts
    );

    setText(
        "profileXp",
        state.xp
    );

    setText(
        "profileStreak",
        state.streak
    );

    setText(
        "profileLevel",
        state.level
    );

    setText(
        "rankingXp",
        state.xp + " XP"
    );

    setText(
        "profileProgress",
        getProgressPercent() + "%"
    );

    if (state.goal) {

        setText(
            "goalText",
            GOALS[state.goal].icon +
            " " +
            GOALS[state.goal].name
        );

        const selected =
            document.querySelector(
                '.goal-card[data-goal="' +
                state.goal +
                '"]'
            );

        if (selected) {
            selected.classList.add(
                "selected"
            );
        }

        const continueButton =
            $("goalContinue");

        if (continueButton) {
            continueButton.disabled =
                false;
        }
    }
}


/* =========================================================
   BUTTON BIND
   ========================================================= */

function bindButtons() {

    const goalContinue =
        $("goalContinue");

    if (goalContinue) {

        goalContinue.addEventListener(
            "click",
            goToInfo
        );
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function login() {
    const email = $("loginUsername")?.value.trim();
    const password = $("loginPassword")?.value;
    if (!email || !password) { alert("Vui lòng nhập email và mật khẩu!"); return; }
    try {
        const response = await fetch("/api/login", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok && data.status === "success") {
            state.learnerName = data.name || state.learnerName || email.split("@")[0];
            saveState();
            alert("Đăng nhập thành công!");
            showScreen(state.onboardingCompleted || state.placementCompleted ? "homeScreen" : "profileIntroScreen");
            if (state.onboardingCompleted || state.placementCompleted) { renderDoors(); updateUI(); }
        } else { alert(data.message || "Đăng nhập thất bại!"); }
    } catch (error) { console.error(error); alert("Không thể kết nối máy chủ Engzi."); }
}

/* =========================================================
   REGISTER
   ========================================================= */

async function register() {
    const email = $("registerUsername")?.value.trim();
    const password = $("registerPassword")?.value;
    if (!email || !password) { alert("Vui lòng nhập email và mật khẩu!"); return; }
    if (password.length < 8) { alert("Mật khẩu cần có ít nhất 8 ký tự."); return; }
    try {
        const response = await fetch("/api/register", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name: state.learnerName || "" })
        });
        const data = await response.json();
        if (response.ok && data.status === "success") {
            alert("Tạo tài khoản thành công! Hãy đăng nhập bằng email và mật khẩu Engzi.");
            showScreen("loginScreen");
            const loginEmail = $("loginUsername"); if (loginEmail) loginEmail.value = email;
            const loginPassword = $("loginPassword"); if (loginPassword) loginPassword.value = "";
        } else { alert(data.message || "Đăng ký thất bại!"); }
    } catch (error) { console.error(error); alert("Không thể kết nối máy chủ Engzi."); }
}

/* =========================================================
   NEXT BUTTON SUPPORT
   ========================================================= */

function nextLesson() {

    if (
        hardReviewData.length > 0 &&
        hardReviewIndex <
        hardReviewData.length &&
        hardReviewAnswered
    ) {

        nextHardReviewQuestion();

        return;
    }

    nextLessonQuestion();
}


/* =========================================================
   WINDOW EXPORT
   ========================================================= */

window.Engzi = {

    startApp,

    selectGoal,
    goToInfo,
    chooseInfo,

    startPlacementTest,
    createPlacementTest,

    nextPlacementQuestion,
    finishPlacementTest,
    finishTest,

    startLesson,
    answerLesson,
    nextLessonQuestion,
    finishLesson,
    exitLesson,

    startHardReview,
    startReview,
    startInfinitePractice,
    openAIConversation,
    selectPersona,
    sendAIMessage,
    toggleMic,
    speakLastAI,
    clearAIChat,

    showReview,

    goHome,
    goRanking,
    goProfile,

    openDoor,
    openPart,

    login,
    register,

    resetState
};


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "🌳 Engzi đã tải thành công!"
        );

        bindButtons();

        updateUI();

        /*
         * Không tự chuyển màn hình.
         * Màn hình welcome sẽ hiện trước.
         */

        showScreen(
            "welcomeScreen"
        );
    }
);

/* =========================================================
   ENGZI MOTION HELPERS
   ========================================================= */

function engziPop(id) {
    const el = $(id);
    if (!el) return;
    el.classList.remove("engzi-stat-pop");
    void el.offsetWidth;
    el.classList.add("engzi-stat-pop");
}

function engziCelebrate() {
    document.body.classList.remove("engzi-celebrate");
    void document.body.offsetWidth;
    document.body.classList.add("engzi-celebrate");

    const symbols = ["✦","★","●","◆","✿","✨"];
    for (let i = 0; i < 18; i++) {
        const p = document.createElement("span");
        p.className = "engzi-confetti";
        p.textContent = symbols[i % symbols.length];
        p.style.left = (8 + Math.random() * 84) + "vw";
        p.style.top = (10 + Math.random() * 18) + "vh";
        p.style.fontSize = (10 + Math.random() * 10) + "px";
        p.style.animationDelay = (Math.random() * .25) + "s";
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1500);
    }
}

function engziAnimateAnswer(ok) {
    const selected = document.querySelector(
        ".answer-btn.selected, .answer-option.selected, .answer-card.selected"
    );
    if (selected) {
        selected.classList.add(ok ? "engzi-correct" : "engzi-wrong");
    }
}

function engziAnimateUnlocks() {
    document.querySelectorAll(
        ".door-card, .part-card, .lesson-card"
    ).forEach((el, i) => {
        el.style.animationDelay = Math.min(i * 35, 450) + "ms";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(engziAnimateUnlocks, 120);
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "success") {
        const greeting = state.learnerName ? `Chào mừng trở lại, ${state.learnerName}!` : "Đăng nhập Google thành công!";
        alert(greeting);
        showScreen(state.onboardingCompleted || state.placementCompleted ? "homeScreen" : "profileIntroScreen");
        if (state.onboardingCompleted || state.placementCompleted) { renderDoors(); updateUI(); }
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("authError") === "google") {
        alert("Đăng nhập Google chưa thành công. Hãy kiểm tra cấu hình OAuth trong README.");
        showScreen("loginScreen");
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

/* =========================================================
   GEMINI AI CONVERSATION
========================================================= */
let aiPersona = "một người bạn thân thiện";
let aiHistory = [];
let aiLastReply = "";
let speechRecognition = null;

function openAIConversation() {
    showScreen("conversationScreen");
    if (!aiHistory.length) {
        addAIMessage("ai", "Hi! 👋 Mình là bạn đồng hành AI của Engzi. Hãy nói với mình bằng tiếng Anh nhé!");
        aiHistory.push({role:"assistant", text:"Hi! 👋 Mình là bạn đồng hành AI của Engzi. Hãy nói với mình bằng tiếng Anh nhé!"});
    }
}

function selectPersona(button) {
    document.querySelectorAll('.persona-card').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    aiPersona = button.dataset.persona || "một người bạn thân thiện";
    clearAIChat();
    openAIConversation();
}

function addAIMessage(role, text) {
    const box = $("aiChatMessages"); if (!box) return;
    const row = document.createElement("div"); row.className = "ai-msg " + (role === "user" ? "user" : "ai");
    const bubble = document.createElement("div"); bubble.className = "ai-bubble"; bubble.textContent = text;
    row.appendChild(bubble); box.appendChild(row); box.scrollTop = box.scrollHeight;
}

async function sendAIMessage() {
    const input = $("aiChatInput"); if (!input) return;
    const message = input.value.trim(); if (!message) return;
    input.value = ""; addAIMessage("user", message);
    aiHistory.push({role:"user", text:message});
    const send = document.querySelector(".chat-send"); if (send) { send.disabled=true; send.textContent="AI..."; }
    try {
        const apiBase = (window.ENGZI_AI_API_BASE || "").replace(/\/$/, "");
        const res = await fetch(apiBase + "/api/ai/conversation", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({
            persona:aiPersona, level:state.level || "A1", goal:getGoalName(state.goal) || "giao tiếp", message, history:aiHistory.slice(-12)
        })});
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "AI error");
        aiLastReply = data.reply || "Let's continue!";
        addAIMessage("ai", aiLastReply); aiHistory.push({role:"assistant",text:aiLastReply});
        const correction = $("aiCorrection");
        if (correction) { correction.textContent = data.correction ? "✏️ Sửa lỗi: " + data.correction : ""; correction.classList.toggle("hidden", !data.correction); }
        if (data.followUp) addAIMessage("ai", data.followUp);
        speakText(aiLastReply);
    } catch(e) {
        addAIMessage("ai", window.ENGZI_AI_API_BASE ? "⚠️ Chưa kết nối được máy chủ AI. Hãy kiểm tra URL backend và GEMINI_API_KEY trên máy chủ." : "⚠️ AI đang chạy qua máy chủ Engzi. Nếu bạn mở bằng GitHub Pages, hãy cấu hình ENGZI_AI_API_BASE trong api-config.js.");
    } finally { if (send) {send.disabled=false;send.textContent="Gửi ➜";} }
}

function clearAIChat() {
    aiHistory=[]; aiLastReply="";
    const box=$("aiChatMessages"); if(box) box.innerHTML="";
    const c=$("aiCorrection"); if(c) c.classList.add("hidden");
}
function speakText(text) { if (!('speechSynthesis' in window) || !text) return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang="en-US"; u.rate=.92; window.speechSynthesis.speak(u); }
function speakLastAI(){ speakText(aiLastReply); }
function toggleMic() {
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ alert("Trình duyệt này chưa hỗ trợ microphone Speech Recognition. Hãy dùng Chrome/Edge."); return; }
    if(speechRecognition){ speechRecognition.stop(); return; }
    const mic=$("micButton"), status=$("micStatus"), input=$("aiChatInput");
    speechRecognition=new SR(); speechRecognition.lang="en-US"; speechRecognition.interimResults=false; speechRecognition.maxAlternatives=1;
    speechRecognition.onstart=()=>{mic.classList.add("recording");mic.textContent="⏹️";status.textContent="Đang nghe... hãy nói tiếng Anh";};
    speechRecognition.onresult=e=>{input.value=e.results[0][0].transcript;status.textContent="Đã nhận giọng nói ✓";sendAIMessage();};
    speechRecognition.onerror=()=>{status.textContent="Không nhận được giọng nói";};
    speechRecognition.onend=()=>{speechRecognition=null;mic.classList.remove("recording");mic.textContent="🎙️";if(status.textContent==="Đang nghe... hãy nói tiếng Anh")status.textContent="Microphone sẵn sàng";};
    speechRecognition.start();
}
