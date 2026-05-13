/**
 * MOTOR ALFA - SISTEMA DE PLANTILLAS DINÁMICAS
 */

document.addEventListener('DOMContentLoaded', () => {
    const cfg = window.ALFA_CONFIG;
    if (!cfg) return;

    // 1. APLICAR MODO Y COLOR
    document.body.className = `mode-${cfg.MODO.toLowerCase()}`;
    document.documentElement.style.setProperty('--primary', cfg.COLOR_PRIMARIO);

    // 2. ACTUALIZAR TEXTOS DINÁMICOS CON SEGURIDAD
    const safeSetText = (id, text, isHTML = false) => {
        const el = document.getElementById(id);
        if (el) {
            if (isHTML) el.innerHTML = text;
            else el.innerText = text;
        }
    };

    safeSetText('site-title', cfg.NOMBRE_NEGOCIO);
    safeSetText('logo-display', cfg.NOMBRE_NEGOCIO);
    safeSetText('footer-logo', cfg.NOMBRE_NEGOCIO);
    safeSetText('ai-name-display', cfg.PERSONALIDAD_IA);
    safeSetText('diag-title-display', cfg.DIAG_TITULO);
    safeSetText('sol-title-display', cfg.SOLUCION_TITULO, true);
    safeSetText('sol-desc-display', cfg.SOLUCION_DESC);
    safeSetText('sol-btn-display', cfg.SOLUCION_BTN);

    // Diagnóstico Grid
    const diagGrid = document.getElementById('diag-grid-display');
    if (diagGrid) {
        diagGrid.innerHTML = '';
        cfg.PREGUNTAS_DOLOR.forEach((q, i) => {
            diagGrid.innerHTML += `
                <div class="diagnostico-card" data-aos="fade-up" data-aos-delay="${i*100}">
                    <div class="card-num">0${i+1}</div>
                    <p>${q}</p>
                </div>
            `;
        });
    }

    // 3. INYECTAR BANNERS CON TEXTOS ÚNICOS
    const hero = document.getElementById('hero-section');
    if (hero) {
        cfg.BANNERS.forEach((img, index) => {
            const slideData = cfg.SLIDES[index] || { TITULO: "Bienvenido", SUBTITULO: "" };
            const slide = document.createElement('div');
            slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), url('${img}')`;
            slide.innerHTML = `
                <div class="slide-content">
                    <h1 data-aos="fade-right">${slideData.TITULO}</h1>
                    <p data-aos="fade-right" data-aos-delay="200">${slideData.SUBTITULO}</p>
                    <button class="btn-hero-pulse" onclick="document.getElementById('chat-input').focus();" data-aos="zoom-in" data-aos-delay="400">
                        ${cfg.HERO_CTA}
                    </button>
                </div>
            `;
            hero.appendChild(slide);
        });
    }

    // 4. LÓGICA DE CHAT
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');

    if (chatMessages) {
        let conversationHistory = [{ 
            role: "system", 
            content: `Eres el asistente oficial de ${cfg.NOMBRE_NEGOCIO}. Tu personalidad es: ${cfg.PERSONALIDAD_IA}. 
            NO menciones que eres una IA de ventas. Habla como un experto del negocio. 
            Tu objetivo es ayudar al cliente y pedir su WhatsApp: ${cfg.WHATSAPP}` 
        }];

        addMessage(cfg.MENSAJE_IA_INICIAL, 'ai');

        function addMessage(text, sender = 'ai') {
            const msgDiv = document.createElement('div');
            msgDiv.className = `msg ${sender}`;
            msgDiv.innerHTML = text;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            chatInput.value = '';
            conversationHistory.push({ role: "user", content: text });

            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${cfg.API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: conversationHistory,
                        max_tokens: 300
                    })
                });

                const data = await response.json();
                const aiText = data.choices[0].message.content;
                addMessage(aiText, 'ai');
                conversationHistory.push({ role: "assistant", content: aiText });
            } catch (e) {
                addMessage("Error de conexión. Contacta al WhatsApp: " + cfg.WHATSAPP);
            }
        }

        if (sendBtn) sendBtn.addEventListener('click', sendMessage);
        if (chatInput) chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });

        if (micBtn) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'es-MX';
                micBtn.addEventListener('click', () => {
                    if (micBtn.classList.contains('recording')) {
                        recognition.stop();
                    } else {
                        recognition.start();
                        micBtn.classList.add('recording');
                        micBtn.innerText = "🛑";
                    }
                });
                recognition.onresult = (event) => { if(chatInput) chatInput.value = event.results[0][0].transcript; };
                recognition.onend = () => {
                    micBtn.classList.remove('recording');
                    micBtn.innerText = "🎤";
                    if (chatInput && chatInput.value.trim() !== "") sendMessage();
                };
            }
        }
    }

    // LÓGICA DE TOGGLE MÓVIL
    const chatSidebar = document.getElementById('chat-sidebar');
    const mobileFab = document.getElementById('mobile-fab');
    const closeChat = document.getElementById('close-chat');
    const heroCTA = document.querySelectorAll('.btn-hero-pulse');

    const openChat = () => {
        if (chatSidebar) chatSidebar.classList.add('active');
        if (chatInput) chatInput.focus();
    };

    const hideChat = () => {
        if (chatSidebar) chatSidebar.classList.remove('active');
    };

    if (mobileFab) mobileFab.addEventListener('click', openChat);
    if (closeChat) closeChat.addEventListener('click', hideChat);
    heroCTA.forEach(btn => btn.addEventListener('click', openChat));

    let currentSlide = 0;
    setInterval(() => {
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides.length > 0) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }
    }, 5000);
});
