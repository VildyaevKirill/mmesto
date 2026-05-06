/**
 * Функция открытия модального окна
 */
function openModal(modal, onClose) {
    modal.classList.add("popup_opened");
    addModalListeners(modal, onClose);
}

/**
 * Функция закрытия модального окна
 */
function closeModal(modal, onClose) {
    modal.classList.remove("popup_opened");
    removeModalListeners(modal);

    // Если передан аргумент и он является функцией, то выполняем
    if (typeof onClose === 'function') {
        onClose();
    }
}

/**
 * Функция с условием закрытия модального окна
 */
function handleClose(e, modal, onClose) {
    if (e.target === modal || e.target.classList.contains("popup__close") || e.key === "Escape") {
        closeModal(modal, onClose);
    }
}

/**
 * Функция добавления слушателей событий на модальное окно
 */
function addModalListeners(modal, onClose) {
    modal._closeHandler = (e) => handleClose(e, modal, onClose);
    modal._escHandler = (e) => handleClose(e, modal, onClose);

    modal.addEventListener('mousedown', modal._closeHandler);
    document.addEventListener('keydown', modal._escHandler);
}

/**
 * Функция удаления слушателей события на модальном окне
 */
function removeModalListeners(modal) {
    modal.removeEventListener("mousedown", modal._closeHandler);
    document.removeEventListener("keydown", modal._escHandler);

    delete modal._closeHandler;
    delete modal._escHandler;
}

export { openModal, closeModal };