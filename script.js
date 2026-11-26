// Menu mobile
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const loginRole = sessionStorage.getItem("sicsLoginRole");
const navRole = ["officer", "pengurus"].includes(loginRole) ? loginRole : "public";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".nav-links [data-nav-role]").forEach((link) => {
    const allowedRoles = link.dataset.navRole.split(",").map((role) => role.trim());
    link.hidden = !allowedRoles.includes(navRole);
});

if (!prefersReducedMotion) {
    document.querySelectorAll(".navbar, main").forEach((element, index) => {
        element.classList.add("page-motion-enter");
        element.style.setProperty("--page-motion-delay", `${index * 45}ms`);
    });
}

document.addEventListener("click", (event) => {
    if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
    ) {
        return;
    }

    const target = event.target instanceof Element ? event.target : null;
    const link = target ? target.closest("a[href]") : null;

    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) {
        return;
    }

    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) {
        return;
    }

    const destination = new URL(link.href, window.location.href);
    const currentPage = new URL(window.location.href);

    if (
        destination.origin !== currentPage.origin ||
        !destination.pathname.toLowerCase().endsWith(".html") ||
        (destination.pathname === currentPage.pathname && destination.search === currentPage.search)
    ) {
        return;
    }

    event.preventDefault();
    document.body.classList.add("is-leaving-page");
    window.setTimeout(() => {
        window.location.assign(destination.href);
    }, prefersReducedMotion ? 0 : 300);
});

window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-leaving-page");
});

if (menuBtn && navLinks) {
    if (!navLinks.id) {
        navLinks.id = "primary-navigation";
    }

    menuBtn.type = "button";
    menuBtn.setAttribute("aria-controls", navLinks.id);
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Buka menu");

    const setMenuOpen = (isOpening) => {
        const menuItems = Array.from(navLinks.children);

        menuBtn.setAttribute("aria-expanded", String(isOpening));
        menuBtn.setAttribute("aria-label", isOpening ? "Tutup menu" : "Buka menu");
        menuBtn.textContent = isOpening ? "×" : "☰";

        if (isOpening) {
            menuItems.forEach((item, index) => {
                item.style.setProperty("--menu-delay", `${index * 70}ms`);
                item.classList.remove("is-visible");
            });
            navLinks.classList.add("show");
            void navLinks.offsetHeight;
            menuItems.forEach((item) => item.classList.add("is-visible"));
        } else {
            navLinks.classList.remove("show");
        }
    };

    menuBtn.addEventListener("click", () => {
        setMenuOpen(menuBtn.getAttribute("aria-expanded") !== "true");
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target instanceof Element && event.target.closest("a")) {
            setMenuOpen(false);
        }
    });

    document.addEventListener("click", (event) => {
        if (
            menuBtn.getAttribute("aria-expanded") === "true" &&
            event.target instanceof Node &&
            !navLinks.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {
            setMenuOpen(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false);
            menuBtn.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900 && menuBtn.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false);
        }
    });
}

// Tahun otomatis
const year = document.querySelector("#year");

if (year) {
    year.textContent = new Date().getFullYear();
}

// Animasi masuk bertahap
document.addEventListener("DOMContentLoaded", () => {
    const entranceElements = document.querySelectorAll(
        ".hero-content, .container > .label, .container > h1, .container > h2, " +
        ".container > .description, .profile-box, .philosophy-item, .info-item, " +
        ".page-intro, .complaint-intro, .info-section-heading, .complaint-section-heading, " +
        ".card, .news-card, .announcement-card, .org-announcement-card, .accordion-item"
    );

    entranceElements.forEach((element, index) => {
        element.style.setProperty("--entrance-delay", `${Math.min(index * 45, 360)}ms`);
        element.classList.add("fade-in-up");
    });

    if (entranceElements.length > 0) {
        void document.body.offsetHeight;
        entranceElements.forEach((element) => element.classList.add("is-visible"));
    }

    const loginForm = document.querySelector("#login-form");

    if (loginForm) {
        const roleSelect = loginForm.querySelector("#user-role");
        const identityLabel = loginForm.querySelector("#identity-label");
        const identityInput = loginForm.querySelector("#user-identity");
        const formatMessage = "Please match the requested format.";
        let isNavigating = false;

        const validateIdentity = () => {
            if (roleSelect.value === "mahasiswa") {
                identityInput.value = identityInput.value.replace(/[^0-9]/g, "");
                identityInput.setCustomValidity(
                    identityInput.value && !/^[0-9]{12}$/.test(identityInput.value)
                        ? formatMessage
                        : ""
                );
            } else if (roleSelect.value === "pengurus") {
                identityInput.setCustomValidity(
                    identityInput.value && !/^[0-9]{12}CSSA$/.test(identityInput.value)
                        ? formatMessage
                        : ""
                );
            } else if (roleSelect.value === "officer") {
                identityInput.setCustomValidity(
                    identityInput.value && !/^[0-9]{13}OFFICER$/.test(identityInput.value)
                        ? formatMessage
                        : ""
                );
            }
        };

        identityInput.addEventListener("input", validateIdentity);
        identityInput.addEventListener("paste", () => {
            if (roleSelect.value === "mahasiswa") {
                setTimeout(validateIdentity, 0);
            }
        });

        roleSelect.addEventListener("change", () => {
            identityInput.value = "";
            identityInput.setCustomValidity("");

            if (roleSelect.value === "mahasiswa") {
                identityLabel.textContent = "NIM";
                identityInput.name = "nim";
                identityInput.placeholder = "Masukkan NIM";
                identityInput.inputMode = "numeric";
                identityInput.pattern = "[0-9]{12}";
                identityInput.maxLength = 12;
                identityInput.title = formatMessage;
                identityInput.disabled = false;
            } else if (roleSelect.value === "pengurus") {
                identityLabel.textContent = "ID Pengurus Organisasi";
                identityInput.name = "organizationId";
                identityInput.placeholder = "Contoh: 123456789012CSSA";
                identityInput.removeAttribute("inputmode");
                identityInput.pattern = "[0-9]{12}CSSA";
                identityInput.maxLength = 16;
                identityInput.title = formatMessage;
                identityInput.disabled = false;
            } else if (roleSelect.value === "officer") {
                identityLabel.textContent = "NIM Officer";
                identityInput.name = "officerNim";
                identityInput.placeholder = "Contoh: 1234567890098OFFICER";
                identityInput.removeAttribute("inputmode");
                identityInput.pattern = "[0-9]{13}OFFICER";
                identityInput.maxLength = 20;
                identityInput.title = formatMessage;
                identityInput.disabled = false;
            } else {
                identityLabel.textContent = "Identitas";
                identityInput.name = "identity";
                identityInput.placeholder = "Pilih peran terlebih dahulu";
                identityInput.removeAttribute("inputmode");
                identityInput.removeAttribute("pattern");
                identityInput.removeAttribute("maxlength");
                identityInput.removeAttribute("title");
                identityInput.disabled = true;
            }
        });

        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (isNavigating) {
                return;
            }

            isNavigating = true;
            sessionStorage.setItem("sicsLoginRole", roleSelect.value);
            sessionStorage.setItem("sicsLoginIdentity", identityInput.value.trim());
            document.body.classList.add("is-transitioning");
            const destination = roleSelect.value === "officer"
                ? "officer.html"
                : roleSelect.value === "pengurus"
                    ? "pengurus.html"
                    : "beranda.html";

            const transitionDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? 0
                : 420;

            window.setTimeout(() => {
                window.location.replace(destination);
            }, transitionDuration);
        });
    }

    const complaintForm = document.querySelector("#complaint-form");

    if (complaintForm) {
        const status = document.querySelector("#complaint-status");
        const complaintSuccess = document.querySelector("#complaint-success");
        const resubmitButton = document.querySelector("#complaint-resubmit");
        const reporterName = complaintForm.querySelector("#reporter-name");
        let isSubmitting = false;

        complaintForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (isSubmitting) {
                return;
            }

            complaintForm.classList.add("was-validated");

            if (!complaintForm.checkValidity()) {
                status.classList.add("d-none");
                const invalidField = complaintForm.querySelector(":invalid");

                if (invalidField) {
                    invalidField.focus();
                }

                return;
            }

            isSubmitting = true;
            status.classList.add("d-none");
            complaintForm.classList.add("is-hiding");

            window.setTimeout(() => {
                complaintForm.hidden = true;
                complaintForm.classList.remove("is-hiding");
                complaintSuccess.hidden = false;
                window.requestAnimationFrame(() => {
                    complaintSuccess.classList.add("is-visible");
                });
                complaintSuccess.focus();
            }, 320);
        });

        resubmitButton.addEventListener("click", () => {
            complaintSuccess.classList.remove("is-visible");
            complaintSuccess.hidden = true;
            complaintForm.hidden = false;
            complaintForm.classList.add("is-restoring");
            complaintForm.reset();
            complaintForm.classList.remove("was-validated");
            isSubmitting = false;

            window.requestAnimationFrame(() => {
                complaintForm.classList.remove("is-restoring");
            });

            reporterName.focus();
        });
    }

    const announcementCards = document.querySelectorAll(".announcement-card");
    const newsCards = document.querySelectorAll(".news-card");

    if (announcementCards.length > 0 || newsCards.length > 0) {
        const announcementDetails = [
            "Universitas Klabat (UNKLAB) membuka penerimaan mahasiswa baru S1 Informatika, Sistem Informasi, dan Teknologi Informasi. Pendaftaran dilakukan secara online melalui tahapan pembayaran virtual account, pengisian formulir, hingga ujian seleksi atau tes kemampuan akademik sesuai jadwal resmi panitia.",
            "Mahasiswa aktif FILKOM wajib melaksanakan bimbingan akademik bersama Dosen Wali sebelum perkuliahan, lalu melakukan pengesahan KRS secara online melalui portal Sistem Informasi Universitas (SIU) UNKLAB sebelum batas waktu berakhir.",
            "Mahasiswa tingkat akhir atau yang memenuhi syarat dapat mengajukan proposal tugas akhir/skripsi serta pendaftaran Kerja Praktik (Magang Industri) melalui sekretariat fakultas atau sistem akademik pada hari dan jam kerja."
        ];
        const newsDetails = [
            "Program Studi Sistem Informasi resmi meraih predikat Akreditasi Unggul dari LAM-INFOKOM, mencerminkan komitmen mutu institusi dalam menyelenggarakan pendidikan berkualitas dan berdaya saing global.",
            "Melalui pembelajaran berbasis proyek, mahasiswa aktif menciptakan berbagai karya seperti aplikasi web pariwisata, sistem kecerdasan buatan (AI), dan perangkat lunak penunjang efisiensi operasional.",
            "FILKOM rutin menggelar seminar dan workshop bersama praktisi industri guna memperluas wawasan mahasiswa mengenai tren teknologi modern seperti AI dan keamanan siber.",
            "Kurikulum dirancang adaptif dan berbasis industri untuk mengintegrasikan teknologi mutakhir serta penanaman nilai moral (Character Building and Christian Values)."
        ];

        const detailModal = document.createElement("div");
        detailModal.className = "detail-modal";
        detailModal.hidden = true;

        const backdrop = document.createElement("div");
        backdrop.className = "detail-modal-backdrop";
        backdrop.setAttribute("aria-hidden", "true");

        const dialog = document.createElement("section");
        dialog.className = "detail-modal-dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("aria-labelledby", "detail-modal-title");
        dialog.setAttribute("aria-describedby", "detail-modal-description");

        const closeButton = document.createElement("button");
        closeButton.className = "detail-modal-close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Tutup detail");
        closeButton.textContent = "×";

        const title = document.createElement("h2");
        title.id = "detail-modal-title";

        const description = document.createElement("p");
        description.id = "detail-modal-description";

        dialog.append(closeButton, title, description);
        detailModal.append(backdrop, dialog);
        document.body.append(detailModal);

        let lastTrigger = null;
        let closeTimeout = null;

        const closeDetail = () => {
            if (detailModal.hidden) {
                return;
            }

            detailModal.classList.remove("is-visible");
            document.body.classList.remove("detail-modal-open");
            window.clearTimeout(closeTimeout);
            closeTimeout = window.setTimeout(() => {
                detailModal.hidden = true;
                if (lastTrigger) {
                    lastTrigger.focus();
                }
            }, 220);
        };

        const attachDetails = (cards, details) => {
            cards.forEach((card, index) => {
                const trigger = card.querySelector(".btn");

                if (!trigger || !details[index]) {
                    return;
                }

                trigger.addEventListener("click", (event) => {
                    event.preventDefault();
                    window.clearTimeout(closeTimeout);
                    lastTrigger = trigger;
                    title.textContent = card.querySelector("h2").textContent.trim();
                    description.textContent = details[index];
                    detailModal.hidden = false;
                    document.body.classList.add("detail-modal-open");
                    window.requestAnimationFrame(() => {
                        detailModal.classList.add("is-visible");
                        closeButton.focus();
                    });
                });
            });
        };

        attachDetails(announcementCards, announcementDetails);
        attachDetails(newsCards, newsDetails);
        closeButton.addEventListener("click", closeDetail);
        backdrop.addEventListener("click", closeDetail);
        document.addEventListener("keydown", (event) => {
            if (detailModal.hidden) {
                return;
            }

            if (event.key === "Escape") {
                closeDetail();
            } else if (event.key === "Tab") {
                event.preventDefault();
                closeButton.focus();
            }
        });
    }

    const logoutButton = document.querySelector("#logout-btn");

    if (logoutButton) {
        const role = sessionStorage.getItem("sicsLoginRole");
        const validRoles = ["mahasiswa", "pengurus", "officer"];
        const requiredRoles = (
            document.body.dataset.requiredRoles ||
            document.body.dataset.requiredRole ||
            ""
        ).split(",").map((requiredRole) => requiredRole.trim()).filter(Boolean);

        if (!validRoles.includes(role) || (requiredRoles.length > 0 && !requiredRoles.includes(role))) {
            window.location.replace("login.html");
            return;
        }

        logoutButton.addEventListener("click", () => {
            if (!window.confirm("Apakah Anda yakin ingin keluar?")) {
                return;
            }

            sessionStorage.removeItem("sicsLoginRole");
            sessionStorage.removeItem("sicsLoginIdentity");
            window.location.replace("login.html");
        });
    }
});