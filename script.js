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
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        formMessage.textContent = "Заявка подготовлена. Позже сюда можно подключить backend или отправку на email.";
        form.reset();
    });
}
