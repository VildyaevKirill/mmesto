// Темплейт карточки
const cardTemplate = document.querySelector("#card-template").content.querySelector(".places__item");

const placesWrap = document.querySelector(".places__list");

/**
 * Функция создания элемента карточки
 */
function createCardElement({ data, onDelete, onLike, onViewImage }) {
    const { _id, name, link, owner, likes, createdAt } = data;
    const storedUser = JSON.parse(sessionStorage.getItem('userData'));

    const cardElement = cardTemplate.cloneNode(true);

    cardElement.setAttribute('data-card-id', _id);
    cardElement._cardInfo = data;

    const deleteButton = cardElement.querySelector(".card__delete-button");
    const likeButton = cardElement.querySelector(".card__like-button");
    const likeCount = cardElement.querySelector(".card__like-count");
    const cardImage = cardElement.querySelector(".card__image");

    cardImage.src = link;
    cardImage.alt = `Фотография места: ${ name }`;

    cardElement.querySelector(".card__title").textContent = name;

    if (owner._id !== storedUser._id) {
        deleteButton.remove();
    } else {
        deleteButton.addEventListener("click", onDelete);
    }

    likeButton.addEventListener("click", onLike);
    likeCount.textContent = likes.length;

    if (likes.some((user) => user._id === storedUser._id)) {
        likeButton.classList.add("card__like-button--active");
    }

    // Проверка атрибута, что он является функцией
    if (typeof onViewImage === "function") {
        cardImage.addEventListener("click", onViewImage);
    }

    return cardElement;
}

/**
 * Удаление карточки
 */
function handleDeleteCard(evt) {
    const cardElement = evt.target.closest('.card');

    cardElement.remove();
}

/**
 * Добавление/удаление лайка
 */
function handleLikeCard(evt, response) {
    const cardElement = evt.target.closest('.card');
    const likeButton = cardElement.querySelector(".card__like-button");
    const likeCount = cardElement.querySelector(".card__like-count");

    cardElement._cardInfo = response;
    likeButton.classList.toggle("card__like-button--active");
    likeCount.textContent = response.likes.length;
}

/**
 * Добавление карточки
 */
function createCard({ data, handleDeleteCard, handleLikeCard, handleViewImage }) {
    placesWrap.prepend(createCardElement({
        data,
        onDelete: handleDeleteCard,
        onLike: handleLikeCard,
        onViewImage: handleViewImage
    }));
}

export { createCard, handleLikeCard, handleDeleteCard };