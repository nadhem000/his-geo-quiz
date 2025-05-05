
// Game configuration
const QUESTIONS_PER_STAGE = 10;
const EASY_MODE_TIME = 30; // seconds per question
const HARD_MODE_TIME = 20; // seconds per question
const STAGE_ADVANCE_SCORE = 50; // percentage needed to advance
// Game state
let currentPage = "category"; // category, mode, quiz
let selectedCategory = "";
let gameMode = ""; // easy or hard
let soundEnabled = true;
let currentQuestionIndex = 0;
let currentStage = 1;
let score = 0;
let timer;
let timeLeft;
let questions = []; // Will hold filtered questions for current game
let highScores = {
	history: {
		easy: [],
		hard: []
	},
	geography: {
		easy: [],
		hard: []
	}
};
// DOM Elements
const categoryPage = document.getElementById("category-page");
const modePage = document.getElementById("mode-page");
const quizPage = document.getElementById("quiz-page");
const categoryButtons = document.querySelectorAll(".category-btn");
const easyModeBtn = document.getElementById("easy-mode-btn");
const hardModeBtn = document.getElementById("hard-mode-btn");
const questionText = document.getElementById("question-text");
const questionImage = document.getElementById("question-image");
const optionsContainer = document.getElementById("options-container");
const textAnswerInput = document.getElementById("text-answer");
const submitAnswerBtn = document.getElementById("submit-answer");
const easyModeContainer = document.getElementById("easy-mode-container");
const hardModeContainer = document.getElementById("hard-mode-container");
const feedbackElement = document.getElementById("feedback");
const currentScoreElement = document.getElementById("current-score");
const currentStageElement = document.getElementById("current-stage");
const timerElement = document.getElementById("timer");
const progressBar = document.getElementById("progress");
const soundToggleBtns = document.querySelectorAll("#sound-toggle, #quiz-sound-toggle");
const highScoresModal = document.getElementById("high-scores-modal");
const highScoresContent = document.getElementById("high-scores-content");
const highScoresList = document.getElementById("high-scores-list");
const highScoresBtns = document.querySelectorAll("#high-scores-btn, #quiz-high-scores-btn");
const closeModalBtn = document.querySelector(".close-modal");
const connectionStatus = document.getElementById("connection-status");
const onlineToggle = document.getElementById("online-toggle");
// Log file creation
const gamePath = "C:\\Users\\hermes2\\Documents\\My Games\\newquiz.html";
try {
	const fs = require('fs');
	if (!fs.existsSync(`${gamePath}\\log.txt`)) {
		fs.writeFileSync(`${gamePath}\\log.txt`, 'Quiz Game Log File\n');
	}
	} catch (e) {
	console.log("Running in browser - filesystem access not available");
};
// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
	loadGameData();
	setupEventListeners();
	showCurrentPage();
});
function loadGameData() {
	// Load high scores from localStorage
	const savedHighScores = localStorage.getItem('quizHighScores');
	if (savedHighScores) {
		highScores = JSON.parse(savedHighScores);
	}
	// Load sound preference from localStorage
	const savedSoundPref = localStorage.getItem('quizSoundPref');
	if (savedSoundPref !== null) {
		soundEnabled = savedSoundPref === 'true';
		updateSoundButtons();
	}
}
function setupEventListeners() {
	// Category selection
	categoryButtons.forEach(btn => {
		btn.addEventListener('click', function() {
			selectedCategory = this.dataset.category;
			currentPage = 'mode';
			showCurrentPage();
		});
	});
	// Mode selection
	easyModeBtn.addEventListener('click', function() {
		gameMode = 'easy';
		startGame();
	});
	hardModeBtn.addEventListener('click', function() {
		gameMode = 'hard';
		startGame();
	});
	// Sound toggles
	soundToggleBtns.forEach(btn => {
		btn.addEventListener('click', toggleSound);
	});
	// High score buttons
	highScoresBtns.forEach(btn => {
		btn.addEventListener('click', showHighScores);
	});
	// Close modal button
	closeModalBtn.addEventListener('click', hideHighScores);
	// Submit answer in hard mode
	submitAnswerBtn.addEventListener('click', checkTextAnswer);
	textAnswerInput.addEventListener('keypress', function(e) {
		if (e.key === 'Enter') {
			checkTextAnswer();
		}
	});
	// Online/offline toggle placeholder
	onlineToggle.addEventListener('click', function() {
		alert('Online functionality would be implemented here');
	});
}
function showCurrentPage() {
	// Hide all pages first
	categoryPage.classList.add('hidden');
	modePage.classList.add('hidden');
	quizPage.classList.add('hidden');
	// Show the current page
	switch(currentPage) {
		case 'category':
		categoryPage.classList.remove('hidden');
		clearInterval(timer);
		break;
		case 'mode':
		modePage.classList.remove('hidden');
		break;
		case 'quiz':
		quizPage.classList.remove('hidden');
		break;
		}if (currentPage !== 'quiz') {
		clearInterval(timer);
	}
}

function getCurrentQuestionBank() {
    switch(currentStage) {
        case 1: return QUESTION_BANK;
        case 2: return QUESTION_BANK2;
        case 3: return QUESTION_BANK3;
        default: return QUESTION_BANK;
    }
}
function startGame() {
    // Reset game state
    currentQuestionIndex = 0;
    currentStage = 1;
    score = 0;
    questions = [...getCurrentQuestionBank()[selectedCategory]]; // Modified line
    // Shuffle questions
    shuffleArray(questions);
    // Initialize UI
    updateScoreDisplay();
    currentStageElement.textContent = currentStage;
    // Show quiz page
    currentPage = 'quiz';
    showCurrentPage();
    // Load first question
    loadQuestion();
}
function loadQuestion() {
	// Clear any existing timer
	clearInterval(timer);
	// Get current question
	const question = questions[currentQuestionIndex];
	// Update UI
	questionText.textContent = question.question;
	// Handle image
	if (question.image) {
		questionImage.innerHTML = `<img src="${question.image}" alt="Question image">`;
		} else {
		questionImage.innerHTML = '<span>No Image</span>';
	}
	// Set up for game mode
	if (gameMode === 'easy') {
		easyModeContainer.classList.remove('hidden');
		hardModeContainer.classList.add('hidden');
		// Clear previous options
		optionsContainer.innerHTML = '';
		// Add new options
		question.options.forEach((option, index) => {
			const btn = document.createElement('button');
			btn.className = 'option-btn';
			btn.textContent = option;
			btn.dataset.index = index;
			btn.addEventListener('click', function() {
				checkAnswer(parseInt(this.dataset.index));
			});
			optionsContainer.appendChild(btn);
		});
		} else {
		easyModeContainer.classList.add('hidden');
		hardModeContainer.classList.remove('hidden');
		textAnswerInput.value = '';
		textAnswerInput.focus();
	}
	// Start timer
	timeLeft = gameMode === 'easy' ? EASY_MODE_TIME : HARD_MODE_TIME;
	timerElement.textContent = timeLeft;
	timer = setInterval(updateTimer, 1000);
	// Update progress bar
	const progress = ((currentQuestionIndex % QUESTIONS_PER_STAGE) + 1) / QUESTIONS_PER_STAGE * 100;
	progressBar.style.width = `${progress}%`;
}
function updateTimer() {
	timeLeft--;
	timerElement.textContent = timeLeft;
	if (timeLeft <= 0) {
		clearInterval(timer);
		handleTimeOut();
	}
}
function handleTimeOut() {
	const question = questions[currentQuestionIndex];
	showFeedback(false, question.options[question.correctAnswer]);
	nextQuestion();
}

function checkAnswer(selectedIndex) {
	// First check if we have valid questions
	if (!questions || questions.length === 0) {
		console.error("No questions available");
		return;
	}
	
	// Get current question with safety checks
	const question = questions[currentQuestionIndex];
	if (!question || !question.options || question.correctAnswer === undefined) {
		console.error("Invalid question structure:", question);
		return;
	}
	
	// Check if selectedIndex is valid
	if (selectedIndex < 0 || selectedIndex >= question.options.length) {
		console.error("Invalid answer selection");
		return;
	}
	
	const isCorrect = selectedIndex === question.correctAnswer;
	showFeedback(isCorrect, question.options[question.correctAnswer]);
	
	if (isCorrect) {
		score += gameMode === 'easy' ? 10 : 20;
		updateScoreDisplay();
	}
	
	nextQuestion();
}
function checkTextAnswer() {
	const question = questions[currentQuestionIndex];
	const userAnswer = textAnswerInput.value.trim().toLowerCase();
	const correctAnswer = question.options[question.correctAnswer].toLowerCase();
	const isCorrect = userAnswer === correctAnswer;
	showFeedback(isCorrect, question.options[question.correctAnswer]);
	if (isCorrect) {
		score += 20; // Hard mode gives more points
		updateScoreDisplay();
	}
	nextQuestion();
}
function showFeedback(isCorrect, correctAnswer) {
	// Play sound
	if (soundEnabled) {
		const sound = isCorrect ? 'correct' : 'wrong';
		playSound(sound);
	}
	// Show visual feedback
	feedbackElement.textContent = isCorrect ? '👍 صواب!' : `👎 خطأ! الإجابة الصحيحة هي: ${correctAnswer}`;
	feedbackElement.style.color = isCorrect ? 'green' : 'red';
	feedbackElement.classList.remove('hidden');
	// Hide feedback after delay
	setTimeout(() => {
		feedbackElement.classList.add('hidden');
	}, 2000);
}
function nextQuestion() {
	currentQuestionIndex++;
	// Check if stage is complete (every 10 questions)
	if (currentQuestionIndex % QUESTIONS_PER_STAGE === 0) {
		checkStageCompletion();
	} 
	// Check if game is over (no more questions)
	else if (currentQuestionIndex >= questions.length) {
		endGame();
	} 
	// Otherwise load next question
	else {
		loadQuestion();
	}
}

function checkStageCompletion() {
    const stageQuestions = Math.min(QUESTIONS_PER_STAGE, questions.length - (currentQuestionIndex - QUESTIONS_PER_STAGE));
    const stageScore = calculateStageScore();
    const percentage = (stageScore / (stageQuestions * (gameMode === 'easy' ? 10 : 20))) * 100;

    if (percentage >= STAGE_ADVANCE_SCORE) {
        // Advance to next stage
        currentStage++;
        
        // NEW CODE: Load questions for next stage
        questions = [...getCurrentQuestionBank()[selectedCategory]];
        shuffleArray(questions);
        currentQuestionIndex = 0;

        currentStageElement.textContent = currentStage;
        // Play success sound
        if (soundEnabled) {
            playSound('levelup');
        }
        // Show stage complete message
        feedbackElement.textContent = `أنهيت ${currentStage-1} بنجاح! المرور الى المستوى ${currentStage}`;
        feedbackElement.style.color = 'blue';
        feedbackElement.classList.remove('hidden');
        // Load next question after delay
        setTimeout(() => {
            feedbackElement.classList.add('hidden');
            loadQuestion();
        }, 2000);
    } else {
        // Failed to advance - end game
        feedbackElement.textContent = `Stage ${currentStage} Failed! Need ${STAGE_ADVANCE_SCORE}% to advance`;
        feedbackElement.style.color = 'red';
        feedbackElement.classList.remove('hidden');
        setTimeout(endGame, 2000);
    }
}
function calculateStageScore() {
	// Calculate score for the current stage only
	const startIndex = currentQuestionIndex - (currentQuestionIndex % QUESTIONS_PER_STAGE);
	const endIndex = Math.min(startIndex + QUESTIONS_PER_STAGE, questions.length);
	// This is simplified - in a real game you'd track correct answers per question
	return score - (startIndex * (gameMode === 'easy' ? 10 : 20));
}
function endGame() {
	// Save high score
	saveHighScore();
	// Show game over message
	feedbackElement.textContent = `Game Over! Final Score: ${score}`;
	feedbackElement.style.color = 'black';
	feedbackElement.classList.remove('hidden');
	// Return to category selection after delay
	setTimeout(() => {
		currentPage = 'category';
		showCurrentPage();
	}, 3000);
}
function updateScoreDisplay() {
	currentScoreElement.textContent = score;
}
function toggleSound() {
	soundEnabled = !soundEnabled;
	localStorage.setItem('quizSoundPref', soundEnabled);
	updateSoundButtons();
}
function updateSoundButtons() {
	const soundText = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
	soundToggleBtns.forEach(btn => {
		btn.textContent = soundText;
	});
}
function playSound(type) {
	if (!soundEnabled) return;
	
	// Create new audio element each time to allow overlapping sounds
	const audio = new Audio();
	
	// These are very short audio clips
   const sounds = {
       correct: "assets/sounds/correct.wav",
       wrong: "assets/sounds/wrong.wav",
       levelup: "assets/sounds/levelup.wav"
   };
	
	try {
		audio.src = sounds[type] || sounds.correct;
		audio.volume = 0.5;
		
		// Try to play immediately
		const playPromise = audio.play();
		
		// Handle potential play() rejection
		if (playPromise !== undefined) {
			playPromise.catch(error => {
				// Fallback - play on next user interaction
				document.addEventListener('click', function playOnClick() {
					audio.play().finally(() => {
						document.removeEventListener('click', playOnClick);
					});
				}, { once: true });
			});
		}
		} catch (e) {
		console.error("Audio error:", e);
	}
}
function showHighScores() {
	// Populate high scores list
	highScoresList.innerHTML = '';
	const categoryScores = highScores[selectedCategory] || { easy: [], hard: [] };
	const easyScores = document.createElement('div');
	easyScores.innerHTML = '<h3>Easy Mode</h3>';
	if (categoryScores.easy.length > 0) {
		categoryScores.easy.forEach((score, index) => {
			easyScores.innerHTML += `<p>${index+1}. ${score}</p>`;
		});
		} else {
		easyScores.innerHTML += '<p>No scores yet</p>';
	}
	highScoresList.appendChild(easyScores);
	const hardScores = document.createElement('div');
	hardScores.innerHTML = '<h3>Hard Mode</h3>';
	if (categoryScores.hard.length > 0) {
		categoryScores.hard.forEach((score, index) => {
			hardScores.innerHTML += `<p>${index+1}. ${score}</p>`;
		});
		} else {
		hardScores.innerHTML += '<p>No scores yet</p>';
	}
	highScoresList.appendChild(hardScores);
	// Show modal
	highScoresModal.style.display = 'flex';
}
function hideHighScores() {
	highScoresModal.style.display = 'none';
}
function saveHighScore() {
	if (!highScores[selectedCategory]) {
		highScores[selectedCategory] = { easy: [], hard: [] };
	}
	const modeScores = highScores[selectedCategory][gameMode];
	modeScores.push(score);
	// Sort descending and keep top 10
	modeScores.sort((a, b) => b - a);
	if (modeScores.length > 10) {
		modeScores.length = 10;
	}
	// Save to localStorage
	localStorage.setItem('quizHighScores', JSON.stringify(highScores));
}
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
// Close modal when clicking outside content
window.addEventListener('click', function(event) {
	if (event.target === highScoresModal) {
		hideHighScores();
	}
});