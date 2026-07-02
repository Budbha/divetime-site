const express = require("express");
const path = require("path");
const { Resend } = require("resend");

const app = express();
const PORT = process.env.PORT || 3000;

// Разрешаем парсинг JSON в теле запросов
app.use(express.json());

// Статические файлы подключим ниже, после явных маршрутов
// (чтобы маршруты вида /en и /ru обрабатывались явно).
function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Обработка отправки формы
app.post("/api/send", async (req, res) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || "DiveTime <onboarding@resend.dev>";

    if (!RESEND_API_KEY) {
        console.error("Error: RESEND_API_KEY is missing");
        return res.status(500).json({
            ok: false,
            message: "RESEND_API_KEY is missing"
        });
    }

    if (!ADMIN_EMAIL) {
        console.error("Error: ADMIN_EMAIL is missing");
        return res.status(500).json({
            ok: false,
            message: "ADMIN_EMAIL is missing"
        });
    }

    const resend = new Resend(RESEND_API_KEY);

    try {
        const {
            name,
            phone,
            email,
            course,
            message,
            lang
        } = req.body;

        if (!name || !phone || !course) {
            return res.status(400).json({
                ok: false,
                message: "Required fields are missing"
            });
        }

        const safeName = escapeHtml(name);
        const safePhone = escapeHtml(phone);
        const safeEmail = escapeHtml(email || "Не указан");
        const safeCourse = escapeHtml(course);
        const safeMessage = escapeHtml(message || "Без комментария");

        const currentLang = ["ru", "en", "et"].includes(lang) ? lang : "ru";

        const clientTexts = {
            ru: {
                subject: "Заявка получена — DiveTime",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
                        <h2>Привет, ${safeName}!</h2>
                        <p>Мы получили вашу заявку на курс:</p>
                        <p><strong>${safeCourse}</strong></p>
                        <p>Скоро свяжемся с вами и расскажем детали.</p>
                        <br>
                        <p>С уважением,<br><strong>DiveTime</strong></p>
                    </div>
                `
            },
            en: {
                subject: "Request received — DiveTime",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
                        <h2>Hi, ${safeName}!</h2>
                        <p>We have received your request for:</p>
                        <p><strong>${safeCourse}</strong></p>
                        <p>We will contact you soon with more details.</p>
                        <br>
                        <p>Best regards,<br><strong>DiveTime</strong></p>
                    </div>
                `
            },
            et: {
                subject: "Taotlus vastu võetud — DiveTime",
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
                        <h2>Tere, ${safeName}!</h2>
                        <p>Saime sinu taotluse kursusele:</p>
                        <p><strong>${safeCourse}</strong></p>
                        <p>Võtame sinuga peagi ühendust.</p>
                        <br>
                        <p>Lugupidamisega,<br><strong>DiveTime</strong></p>
                    </div>
                `
            }
        };

        const selectedClientText = clientTexts[currentLang];

        // Отправка подтверждения клиенту
        if (email) {
            await resend.emails.send({
                from: SENDER_EMAIL,
                to: email,
                subject: selectedClientText.subject,
                html: selectedClientText.html
            });
        }

        // Отправка уведомления администратору
        await resend.emails.send({
            from: SENDER_EMAIL,
            to: ADMIN_EMAIL,
            subject: "Новая заявка DiveTime",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
                    <h2>Новая заявка DiveTime</h2>

                    <p><strong>Имя:</strong> ${safeName}</p>
                    <p><strong>Телефон:</strong> ${safePhone}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Курс:</strong> ${safeCourse}</p>
                    <p><strong>Комментарий:</strong> ${safeMessage}</p>
                    <p><strong>Язык:</strong> ${currentLang}</p>
                </div>
            `,
            replyTo: email || undefined
        });

        return res.status(200).json({
            ok: true
        });

    } catch (error) {
        console.error("Send email error:", error);

        return res.status(500).json({
            ok: false,
            message: error.message || "Email sending failed"
        });
    }
});


// Явные маршруты для чистых URL (без .html)
app.get('/en', (req, res) => {
    res.sendFile(path.join(__dirname, 'en.html'));
});

app.get('/ru', (req, res) => {
    res.sendFile(path.join(__dirname, 'ru.html'));
});

// Редиректы старых URL с .html -> чистые URL
app.get('/en.html', (req, res) => res.redirect(301, '/en'));
app.get('/ru.html', (req, res) => res.redirect(301, '/ru'));

// Отдаём остальные статические файлы (скрипты, стили, изображения и т.д.)
app.use(express.static(__dirname));

// Все остальные GET-запросы возвращают index.html (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
