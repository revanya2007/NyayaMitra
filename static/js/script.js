/**
 * script.js — Frontend Logic for NyayaMitra AI Chat
 * ==================================================
 *
 * Phase 2: Real Gemini AI Integration
 *
 * This script handles:
 *   - Sending questions to the Flask /ask endpoint via fetch()
 *   - Displaying user and bot messages in the chat UI
 *   - Loading spinner / typing indicator while waiting
 *   - Graceful error handling if the API fails
 *   - Language switching (English / Tamil)
 *   - Quick suggestion chips and dashboard card pre-fills
 *   - Auto-scroll and auto-resize textarea
 */

// ============================================================
// DOM Element References
// ============================================================
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatForm = document.getElementById('chatForm');
const clearChatBtn = document.getElementById('clearChatBtn');
const langSelect = document.getElementById('langSelect');
const sendBtn = document.getElementById('sendBtn');
const loadHistoryBtn = document.getElementById('loadHistoryBtn');
const hideHistoryBtn = document.getElementById('hideHistoryBtn');
const historyContainer = document.getElementById('historyContainer');
const historyCards = document.getElementById('historyCards');

// ============================================================
// Localization text dictionary (English & Tamil)
// ============================================================
const localization = {
    en: {
        welcomeTitle: "Namaskar! 🙏 Welcome to NyayaMitra AI Assistant.",
        welcomeBody: "I am your AI legal & scheme guide powered by Google Gemini. Ask me questions about agricultural lands, regional farmer schemes, crop disputes, or general tenant queries.",
        welcomeAction: "How may I assist you today? Feel free to type in English, Tamil, or select from the quick topics below.",
        placeholder: "Type your agricultural, scheme, or legal question here...",
        typing: "NyayaMitra is thinking...",
        clearAlert: "Chat cleared successfully!",
        errorMessage: "Sorry, I am currently unable to answer. Please try again later.",
        historyError: "Sorry, unable to load chat history. Please try again later.",
        historyEmpty: "No saved chat history found.",
        historyLoading: "Loading saved chat history...",
        loadHistory: "Load History",
        hideHistory: "Hide History"
    },
    ta: {
        welcomeTitle: "வணக்கம்! 🙏 நியாயமித்ரா AI உதவி மையத்திற்கு வரவேற்கிறோம்.",
        welcomeBody: "நான் Google Gemini மூலம் இயங்கும் உங்களது செயற்கை நுண்ணறிவு (AI) சட்ட மற்றும் அரசுத் திட்ட வழிகாட்டி. விவசாய நிலங்கள், விவசாயிகளுக்கான அரசுத் திட்டங்கள் அல்லது நிலப் பிரச்சனைகள் குறித்த உங்கள் கேள்விகளை என்னிடம் கேட்கலாம்.",
        welcomeAction: "இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்? ஆங்கிலம் அல்லது தமிழில் தட்டச்சு செய்யவும்.",
        placeholder: "உங்கள் விவசாயம், அரசுத் திட்டம் அல்லது சட்ட ரீதியான கேள்வியை இங்கே தட்டச்சு செய்யவும்...",
        typing: "நியாயமித்ரா சிந்தித்துக் கொண்டிருக்கிறது...",
        clearAlert: "உரையாடல் வரலாறு வெற்றிகரமாக அழிக்கப்பட்டது!",
        errorMessage: "மன்னிக்கவும், தற்போது பதிலளிக்க இயலவில்லை. பின்னர் முயற்சிக்கவும்.",
        historyError: "மன்னிக்கவும், உரையாடல் வரலாற்றை ஏற்ற முடியவில்லை. பின்னர் முயற்சிக்கவும்.",
        historyEmpty: "சேமிக்கப்பட்ட உரையாடல் வரலாறு எதுவும் இல்லை.",
        historyLoading: "வரலாறு ஏற்றப்படுகிறது...",
        loadHistory: "வரலாறு",
        hideHistory: "வரலாற்றை மறை"
    }
};

// ============================================================
// State Variables
// ============================================================
let currentLang = 'en';       // Active language
let typingIndicator = null;   // Reference to the typing indicator DOM node
let isWaitingForResponse = false; // Prevents double-sending

// ============================================================
// Initialize: Show welcome message on page load
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    appendWelcomeMessage(localization[currentLang]);
    initializeHistoryEvents();
});

// ============================================================
// Helper: Auto-scroll chat window to the bottom
// ============================================================
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============================================================
// Helper: Convert Markdown-like text to basic HTML
// Handles **bold**, *italic*, \n, and bullet points
// ============================================================
function formatResponse(text) {
    // Escape HTML special characters to prevent XSS
    let formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em> (but not inside already-converted <strong>)
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert markdown headers (### Header) to bold text
    formatted = formatted.replace(/^###\s+(.+)$/gm, '<strong class="d-block mt-2 mb-1 text-emerald">$1</strong>');
    formatted = formatted.replace(/^##\s+(.+)$/gm, '<strong class="d-block mt-2 mb-1 fs-6 text-emerald">$1</strong>');

    // Convert markdown bullet points (- item) to styled list items
    formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '<span class="d-block ps-3 mb-1">• $1</span>');

    // Convert numbered lists (1. item) to styled items
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<span class="d-block ps-3 mb-1">$1. $2</span>');

    // Convert newlines to <br> tags
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

// ============================================================
// Append a message bubble to the chat window
// sender: 'user' or 'bot'
// text: the message content
// ============================================================
function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'd-flex', 'mb-4', 'animate-message');

    if (sender === 'user') {
        // User message: right-aligned with user icon
        messageDiv.classList.add('user-message');
        messageDiv.innerHTML = `
            <div class="message-icon bg-emerald text-white ms-3">
                <i class="fa-solid fa-user"></i>
            </div>
            <div class="message-content p-3 rounded-4 shadow-sm">
                <p class="mb-0">${text.replace(/\n/g, '<br>')}</p>
            </div>
        `;
    } else {
        // Bot message: left-aligned with robot icon, formatted text
        messageDiv.classList.add('bot-message');
        messageDiv.innerHTML = `
            <div class="message-icon bg-emerald text-white me-3">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="message-content p-3 rounded-4 shadow-sm">
                <div class="mb-0">${formatResponse(text)}</div>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// ============================================================
// Show the "typing..." indicator while waiting for Gemini
// ============================================================
function showTypingIndicator() {
    const text = localization[currentLang].typing;
    typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot-message', 'd-flex', 'mb-4', 'typing-indicator-node');
    typingIndicator.innerHTML = `
        <div class="message-icon bg-emerald text-white me-3">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="message-content p-3 rounded-4 shadow-sm">
            <div class="typing-dots-container d-flex align-items-center gap-2">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
                <span class="text-muted fs-14">${text}</span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingIndicator);
    scrollToBottom();
}

// ============================================================
// Remove the typing indicator from the chat
// ============================================================
function removeTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.remove();
        typingIndicator = null;
    }
}

// ============================================================
// Disable / Enable the send button and input while waiting
// ============================================================
function setInputState(disabled) {
    chatInput.disabled = disabled;
    sendBtn.disabled = disabled;
    if (disabled) {
        sendBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-white me-2"></i> Sending';
    } else {
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane text-white me-2"></i> Send';
    }
}

// ============================================================
// Main: Handle chat form submission
// Sends the question to Flask /ask endpoint via fetch()
// ============================================================
async function handleChatSubmit(event) {
    event.preventDefault();

    const messageText = chatInput.value.trim();
    if (!messageText || isWaitingForResponse) return;

    // 1. Display the user's message in the chat
    appendMessage('user', messageText);
    chatInput.value = '';
    chatInput.style.height = 'auto'; // Reset textarea height

    // 2. Show typing indicator and disable input
    isWaitingForResponse = true;
    setInputState(true);
    showTypingIndicator();

    try {
        // 3. Send the question to the Flask backend via POST /ask
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: messageText }),
        });

        // 4. Parse the JSON response
        const data = await response.json();

        // 5. Remove typing indicator
        removeTypingIndicator();

        // 6. Check if the response contains an answer or an error
        if (response.ok && data.answer) {
            // Success: Display the AI's answer
            appendMessage('bot', data.answer);
        } else {
            // Server returned an error response
            const errorMsg = data.error || localization[currentLang].errorMessage;
            appendMessage('bot', `⚠️ ${errorMsg}`);
        }

    } catch (error) {
        // 7. Network error or fetch failed
        console.error('Fetch error:', error);
        removeTypingIndicator();
        appendMessage('bot', `⚠️ ${localization[currentLang].errorMessage}`);

    } finally {
        // 8. Re-enable the input regardless of success or failure
        isWaitingForResponse = false;
        setInputState(false);
        chatInput.focus();
    }
}

// ============================================================
// Quick Suggestion chips: Populate input with pre-written text
// ============================================================
function suggestPrompt(text) {
    chatInput.value = text;
    chatInput.focus();
}

// ============================================================
// Dashboard card click: Scroll to chat and pre-fill input
// ============================================================
function prefillChat(category) {
    const input = document.getElementById('chatInput');
    const section = document.getElementById('chat-section');

    let text = "";
    if (currentLang === 'en') {
        if (category === 'legal') text = "I have a legal question regarding land lease tenancy rights.";
        if (category === 'schemes') text = "Tell me about government schemes eligibility for organic farming subsidies.";
        if (category === 'land') text = "What paperwork is required for land mutation registry updates?";
        if (category === 'complaint') text = "I want to draft a formal complaint regarding delay in crop loss insurance payout.";
    } else if (currentLang === 'ta') {
        if (category === 'legal') text = "நில குத்தகை மற்றும் விவசாய உரிமைகள் பற்றிய சட்ட கேள்வி என்னிடம் உள்ளது.";
        if (category === 'schemes') text = "இயற்கை விவசாய மானியங்களுக்கான அரசுத் திட்டங்கள் பற்றி எனக்குக் கூறுங்கள்.";
        if (category === 'land') text = "நிலப்பட்டா மாறுதல் செய்ய என்னென்ன ஆவணங்கள் தேவைப்படும்?";
        if (category === 'complaint') text = "பயிர் காப்பீட்டுத் தொகை கிடைப்பதில் தாமதம் ஏற்படுவது குறித்து நான் ஒரு புகார் மனு எழுத வேண்டும்.";
    }

    input.value = text;

    // Smooth scroll to chat window
    section.scrollIntoView({ behavior: 'smooth' });

    // Focus the chat input box after scroll
    setTimeout(() => {
        input.focus();
    }, 800);
}

// ============================================================
// Clear Chat: Remove all messages and show fresh welcome
// ============================================================
clearChatBtn.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    const texts = localization[currentLang];
    appendWelcomeMessage(texts);
});

// ============================================================
// Helper: Inject the localized welcome message
// ============================================================
function appendWelcomeMessage(texts) {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.classList.add('message', 'bot-message', 'd-flex', 'mb-4', 'animate-message');
    welcomeDiv.innerHTML = `
        <div class="message-icon bg-emerald text-white me-3">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="message-content p-3 rounded-4 shadow-sm">
            <p class="mb-0 fw-bold">${texts.welcomeTitle}</p>
            <p class="mb-0 mt-2">${texts.welcomeBody}</p>
            <p class="mb-0 mt-2 text-emerald fw-semibold fs-14">${texts.welcomeAction}</p>
        </div>
    `;
    chatMessages.appendChild(welcomeDiv);
    scrollToBottom();
}

// ============================================================
// Language selector: Switch between English and Tamil
// ============================================================
langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;

    // Update the input placeholder text
    chatInput.placeholder = localization[currentLang].placeholder;

    // Update history buttons text
    if (loadHistoryBtn) loadHistoryBtn.innerHTML = `<i class="fa-solid fa-clock-rotate-left me-1"></i> ${localization[currentLang].loadHistory}`;
    if (hideHistoryBtn) hideHistoryBtn.innerHTML = `<i class="fa-solid fa-eye-slash me-1"></i> ${localization[currentLang].hideHistory}`;

    // Clear chat and show welcome in chosen language
    chatMessages.innerHTML = '';
    appendWelcomeMessage(localization[currentLang]);

    // If history is currently shown, reload it with new language formatting
    if (historyContainer && !historyContainer.classList.contains('d-none')) {
        loadChatHistory();
    }
});

// ============================================================
// Auto-resize the textarea as the user types
// ============================================================
chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if (this.scrollHeight > 120) {
        this.style.overflowY = 'auto';
        this.style.height = '120px';
    } else {
        this.style.overflowY = 'hidden';
    }
});

// ============================================================
// Enter key submits, Shift+Enter adds a new line
// ============================================================
chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

// ============================================================
// Phase 3: Fetch and Display Chat History
// ============================================================
function initializeHistoryEvents() {
    if (loadHistoryBtn) {
        loadHistoryBtn.addEventListener('click', loadChatHistory);
    }
    if (hideHistoryBtn) {
        hideHistoryBtn.addEventListener('click', () => {
            if (historyContainer) {
                historyContainer.classList.add('d-none');
            }
        });
    }
}

async function loadChatHistory() {
    if (!historyContainer || !historyCards) return;
    
    const texts = localization[currentLang];
    
    // 1. Show loading state in history cards area
    historyContainer.classList.remove('d-none');
    historyCards.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-emerald mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted">${texts.historyLoading}</p>
        </div>
    `;
    
    // Scroll history container into view
    historyContainer.scrollIntoView({ behavior: 'smooth' });

    try {
        // 2. Fetch history from endpoint
        const response = await fetch('/history');
        const data = await response.json();

        if (response.ok) {
            // Check if database error payload was returned or list is empty
            if (data.error) {
                showHistoryError(data.error);
                return;
            }
            
            if (!Array.isArray(data) || data.length === 0) {
                historyCards.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fa-solid fa-folder-open text-muted fs-2 mb-3"></i>
                        <p class="text-muted mb-0">${texts.historyEmpty}</p>
                    </div>
                `;
                return;
            }

            // 3. Clear history cards and render
            historyCards.innerHTML = '';
            data.forEach(item => {
                // Parse timestamp and format beautifully (e.g. 08 Jun 2026, 04:30 PM)
                let dateStr = "";
                try {
                    const dateObj = new Date(item.timestamp);
                    dateStr = dateObj.toLocaleString(currentLang === 'ta' ? 'ta-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                } catch (e) {
                    dateStr = item.timestamp || "";
                }

                // Create Card element
                const cardCol = document.createElement('div');
                cardCol.classList.add('col-md-6', 'animate-message');
                cardCol.innerHTML = `
                    <div class="card h-100 border-0 shadow-sm rounded-4" style="transition: transform 0.2s ease;">
                        <div class="card-body p-4 d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-emerald-light text-emerald px-3 py-2 rounded-pill fw-semibold fs-12">
                                    <i class="fa-solid fa-message me-1"></i> Saved Query
                                </span>
                                <small class="text-muted">
                                    <i class="fa-regular fa-calendar-alt me-1"></i> ${dateStr}
                                </small>
                            </div>
                            <h6 class="fw-bold mb-2 text-dark">Q: ${item.query}</h6>
                            <hr class="my-2 border-light">
                            <div class="flex-grow-1 text-muted fs-14">
                                <strong class="text-emerald d-block mb-1"><i class="fa-solid fa-robot me-1"></i> NyayaMitra:</strong>
                                <div class="response-content">${formatResponse(item.response)}</div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add minor hover effect styling dynamically or via CSS
                const cardElement = cardCol.querySelector('.card');
                cardElement.addEventListener('mouseenter', () => {
                    cardElement.style.transform = 'translateY(-4px)';
                    cardElement.style.boxShadow = '0 8px 24px rgba(18,53,20,0.08)';
                });
                cardElement.addEventListener('mouseleave', () => {
                    cardElement.style.transform = 'none';
                    cardElement.style.boxShadow = 'none';
                });
                
                historyCards.appendChild(cardCol);
            });

        } else {
            // Server error response
            const errorMsg = data.error || texts.historyError;
            showHistoryError(errorMsg);
        }
    } catch (error) {
        console.error('Error fetching chat history:', error);
        showHistoryError(texts.historyError);
    }
}

function showHistoryError(message) {
    if (!historyCards) return;
    historyCards.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger border-0 rounded-4 shadow-sm p-4 d-flex align-items-center gap-3">
                <i class="fa-solid fa-triangle-exclamation text-danger fs-3"></i>
                <div>
                    <h6 class="alert-heading fw-bold mb-1">Database Connection Alert</h6>
                    <p class="mb-0 fs-14">${message}</p>
                </div>
            </div>
        </div>
    `;
}
