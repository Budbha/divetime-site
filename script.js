const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const form = document.querySelector(".booking-form");
const formMessage = document.querySelector(".form-message");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            navLinks.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

if (form && formMessage) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitBtn = form.querySelector("button[type='submit']");
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = "Отправка...";
        formMessage.textContent = "";

        const browserLang = navigator.language.slice(0, 2);

        const formData = {
            name: form.name.value.trim(),
            phone: form.phone.value.trim(),
            email: form.email.value.trim(),
            course: form.course.value,
            message: form.message.value.trim(),
            lang: ["ru", "en", "et"].includes(browserLang) ? browserLang : "ru"
        };

        try {
            await new Promise((resolve) => setTimeout(resolve, 3000));

            const response = await fetch("/api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error("Ошибка отправки");
            }

            submitBtn.textContent = "Отправлено ✅";
            form.reset();

        } catch (error) {
            submitBtn.textContent = "Ошибка ❌";

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                formMessage.textContent = "";
            }, 3000);
        }
    });
}
