(() => {
    const storageKey = "sicsPublishedContent";
    const contentTypes = ["berita", "agenda", "agenda-internal", "pengumuman"];
    const typeLabels = {
        berita: "Berita",
        agenda: "Agenda publik",
        "agenda-internal": "Agenda organisasi",
        pengumuman: "Pengumuman"
    };
    const statusElements = document.querySelectorAll("[data-content-status]");
    const internalContentContainer = document.querySelector("[data-internal-content]");

    if (
        internalContentContainer &&
        !["pengurus", "officer"].includes(sessionStorage.getItem("sicsLoginRole"))
    ) {
        window.location.replace("login.html");
        return;
    }

    const showStatus = (message, isError = false) => {
        statusElements.forEach((element) => {
            element.textContent = message;
            element.hidden = !message;
            element.classList.toggle("is-error", isError);
        });
    };

    const isValidItem = (item) => item &&
        typeof item.id === "string" &&
        contentTypes.includes(item.type) &&
        typeof item.title === "string" &&
        typeof item.body === "string" &&
        typeof item.createdAt === "string" &&
        Number.isFinite(Date.parse(item.createdAt)) &&
        typeof item.updatedAt === "string" &&
        Number.isFinite(Date.parse(item.updatedAt));

    const readItems = () => {
        let stored;

        try {
            stored = window.localStorage.getItem(storageKey);
        } catch (error) {
            console.error("Tidak dapat membaca konten tersimpan.", error);
            showStatus("Penyimpanan lokal tidak dapat diakses di browser ini.", true);
            return null;
        }

        if (stored === null) {
            return [];
        }

        try {
            const items = JSON.parse(stored);

            if (!Array.isArray(items) || items.some((item) => !isValidItem(item))) {
                throw new Error("Format konten tersimpan tidak valid.");
            }

            return items;
        } catch (error) {
            console.error("Data konten lokal tidak dapat dibaca.", error);
            showStatus("Data konten lokal rusak atau tidak valid. Data tidak diubah.", true);
            return null;
        }
    };

    const saveItems = (items) => {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(items));
            return true;
        } catch (error) {
            console.error("Tidak dapat menyimpan konten.", error);
            showStatus("Konten gagal disimpan. Periksa ruang dan izin penyimpanan browser.", true);
            return false;
        }
    };

    const formatDate = (dateValue) => new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date(dateValue));

    const createElement = (tagName, className, text) => {
        const element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (text) {
            element.textContent = text;
        }

        return element;
    };

    const renderPublicContent = (items) => {
        contentTypes.forEach((type) => {
            const container = document.querySelector(`[data-published-content="${type}"]`);

            if (!container) {
                return;
            }

            const emptyState = document.querySelector(`[data-published-empty="${type}"]`);
            const publishedItems = items
                .filter((item) => item.type === type)
                .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt));

            container.replaceChildren();

            publishedItems.forEach((item) => {
                const cardClass = type === "berita"
                    ? "news-card published-news-card"
                    : type === "agenda"
                        ? "card org-announcement-card published-content-card"
                        : "announcement-card published-content-card";
                const card = createElement("article", cardClass);
                const date = createElement("span", "date", formatDate(item.createdAt));
                const title = createElement(type === "agenda" ? "h3" : "h2", "", item.title);
                const body = createElement("p", "", item.body);

                if (type === "berita") {
                    const content = createElement("div", "news-content");
                    content.append(date, title, body);
                    card.append(content);
                } else {
                    card.append(date, title, body);
                }

                container.append(card);
            });

            container.hidden = publishedItems.length === 0;

            if (emptyState) {
                emptyState.hidden = publishedItems.length > 0;
            }
        });
    };

    const renderInternalContent = (items) => {
        if (!internalContentContainer) {
            return;
        }

        const internalItems = items
            .filter((item) => item.type === "agenda-internal")
            .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt));

        internalContentContainer.replaceChildren();

        internalItems.forEach((item) => {
            const card = createElement("article", "card org-announcement-card published-content-card");
            const date = createElement("span", "date", formatDate(item.createdAt));
            const title = createElement("h3", "", item.title);
            const body = createElement("p", "", item.body);
            card.append(date, title, body);
            internalContentContainer.append(card);
        });

        internalContentContainer.hidden = internalItems.length === 0;
    };

    const sortItems = (items) => items.slice()
        .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt));

    const managerForm = document.querySelector("#officer-content-form");
    const managerList = document.querySelector("#officer-content-list");
    let renderManagerContents = null;

    if (managerForm && managerList) {
        if (sessionStorage.getItem("sicsLoginRole") !== "officer") {
            window.location.replace("login.html");
            return;
        }

        const typeField = managerForm.querySelector("#content-type");
        const titleField = managerForm.querySelector("#content-title");
        const bodyField = managerForm.querySelector("#content-body");
        const submitButton = managerForm.querySelector("#content-submit");
        const cancelButton = managerForm.querySelector("#content-cancel");
        let editingId = null;

        const resetForm = () => {
            managerForm.reset();
            editingId = null;
            submitButton.textContent = "Terbitkan";
            cancelButton.hidden = true;
        };

        renderManagerContents = (items) => {
            managerList.replaceChildren();
            const sortedItems = sortItems(items);

            if (sortedItems.length === 0) {
                managerList.append(createElement("p", "description", "Belum ada konten tambahan."));
                return;
            }

            sortedItems.forEach((item) => {
                const card = createElement("article", "card officer-content-item");
                const meta = createElement("p", "date", `${typeLabels[item.type]} · ${formatDate(item.createdAt)}`);
                const title = createElement("h3", "", item.title);
                const body = createElement("p", "officer-content-item-body", item.body);
                const actions = createElement("div", "officer-form-actions");
                const editButton = createElement("button", "btn officer-secondary-btn", "Ubah");
                const deleteButton = createElement("button", "btn officer-delete-btn", "Hapus");

                editButton.type = "button";
                editButton.dataset.contentAction = "edit";
                editButton.dataset.contentId = item.id;
                deleteButton.type = "button";
                deleteButton.dataset.contentAction = "delete";
                deleteButton.dataset.contentId = item.id;
                actions.append(editButton, deleteButton);
                card.append(meta, title, body, actions);
                managerList.append(card);
            });
        };

        const renderAll = () => {
            const items = readItems();

            if (items === null) {
                managerList.replaceChildren();
                return;
            }

            renderManagerContents(items);
            renderPublicContent(items);
            renderInternalContent(items);
        };

        managerForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const title = titleField.value.trim();
            const body = bodyField.value.trim();
            const type = typeField.value;

            if (!title || !body || !contentTypes.includes(type)) {
                showStatus("Lengkapi judul, isi, dan jenis konten sebelum menerbitkan.", true);
                return;
            }

            const items = readItems();

            if (items === null) {
                return;
            }

            const now = new Date().toISOString();
            let nextItems;
            const wasEditing = Boolean(editingId);

            if (editingId) {
                nextItems = items.map((item) => item.id === editingId
                    ? { ...item, type, title, body, updatedAt: now }
                    : item);
            } else {
                nextItems = items.concat({
                    id: window.crypto && typeof window.crypto.randomUUID === "function"
                        ? window.crypto.randomUUID()
                        : `${now}-${Math.random().toString(36).slice(2)}`,
                    type,
                    title,
                    body,
                    createdAt: now,
                    updatedAt: now
                });
            }

            if (saveItems(nextItems)) {
                resetForm();
                renderAll();
                showStatus(wasEditing ? "Perubahan konten berhasil disimpan." : "Konten berhasil diterbitkan.");
            }
        });

        managerList.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-content-action]");

            if (!button) {
                return;
            }

            const items = readItems();

            if (items === null) {
                return;
            }

            const item = items.find((entry) => entry.id === button.dataset.contentId);

            if (!item) {
                showStatus("Konten yang dipilih tidak ditemukan. Muat ulang daftar dan coba lagi.", true);
                return;
            }

            if (button.dataset.contentAction === "edit") {
                editingId = item.id;
                typeField.value = item.type;
                titleField.value = item.title;
                bodyField.value = item.body;
                submitButton.textContent = "Simpan Perubahan";
                cancelButton.hidden = false;
                titleField.focus();
                return;
            }

            if (button.dataset.contentAction === "delete" && window.confirm(`Hapus konten "${item.title}"?`)) {
                const nextItems = items.filter((entry) => entry.id !== item.id);

                if (saveItems(nextItems)) {
                    if (editingId === item.id) {
                        resetForm();
                    }

                    renderAll();
                    showStatus("Konten berhasil dihapus.");
                }
            }
        });

        cancelButton.addEventListener("click", resetForm);
        renderAll();
    } else {
        const items = readItems();

        if (items !== null) {
            renderPublicContent(items);
            renderInternalContent(items);
        }
    }

    window.addEventListener("storage", (event) => {
        if (event.key !== storageKey && event.key !== null) {
            return;
        }

        const items = readItems();

        if (items !== null) {
            renderPublicContent(items);
            renderInternalContent(items);

            if (renderManagerContents) {
                renderManagerContents(items);
            }
        }
    });
})();
