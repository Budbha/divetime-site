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

    emailjs.init("ytGJlEL6XswFfUEHJ");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitBtn = form.querySelector("button[type='submit']");
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправка...";

        const formData = {
            name: form.name.value,
            phone: form.phone.value,
            email: form.email.value,
            course: form.course.value,
            message: form.message.value
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            await emailjs.send("service_udai0uq", "template_4q698od", formData);
            await emailjs.send("service_udai0uq", "template_2lmx1qq", formData);
            submitBtn.textContent = "Отправлено";
            formMessage.textContent = "";
            form.reset();
        } catch (error) {
            submitBtn.textContent = "Ошибка";
            formMessage.textContent = "Не удалось отправить";
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}
