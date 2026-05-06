import '../pages/index.css';
import validationSettings from '../validationSettings.json';
import { enableValidation, clearValidation } from './validation';
import { openModal, closeModal } from "./modal";
import { createCard, handleLikeCard, handleDeleteCard } from "./card";
import { apiRequest } from "./api";

//#region Инициализация DOM элементов и вспомогательных функций
// Все формы на странице
const formList = document.forms;

// Элементы профиля
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileImg = document.querySelector(".profile__image-photo");

// Модальное окно изменения данных профиля
const modalEditProfile = document.querySelector(".popup_type_edit");
const modalEditProfileForm = formList['edit-profile'];
const changeProfileBtn = document.querySelector(".profile__edit-button");

// Модальное окно добавления карточки
const modalNewPlace = document.querySelector(".popup_type_new-card");
const modalNewPlaceForm = formList['new-place'];
const addPlaceBtn = document.querySelector(".profile__add-button");
const placeNameField = modalNewPlaceForm.elements['place-name'];
const placeLinkField = modalNewPlaceForm.elements['link'];

// Модальное окно просмотра картинки
const modalViewImg = document.querySelector(".popup_type_image");
const img = modalViewImg.querySelector('.popup__image');
const description = modalViewImg.querySelector('.popup__caption');

// Модальное окно редактирования аватара пользователя
const modalEditProfileImg = document.querySelector(".popup_type_profile_image");
const modalEditProfileImgForm = document.forms['edit-profile-img'];
const changeProfileImgBtn = document.querySelector(".profile__image-edit-button");
const profileLinkField = modalEditProfileImgForm.elements['link'];

// Модальное окно подтверждения удаления карточки
const modalDeletePlace = document.querySelector(".popup_type_delete_place");
const modalDeletePlaceBtn = modalDeletePlace.querySelector('.popup__button');

// Функция-обработчик ошибки получения данных
const handleResponseError = (error) => {
    console.error(error);
};

/**
 * Переключает кнопку между состояниями загрузки и обычным
 * @param {HTMLButtonElement} button - сама кнопка
 * @param {boolean} isLoading - true если идёт загрузка
 * @param {string} [loadingText='Сохранение...'] - текст во время загрузки
 */
const toggleButtonLoading = (button, isLoading, loadingText = 'Сохранение...') => {
    if (!button) return;

    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
    } else {
        button.textContent = button.dataset.originalText || 'Сохранить';
        button.disabled = false;
    }
};
//#endregion

//#region Обработка событий на карточке места
// Функция-обработчик клика просмотра картинки
const handleClickViewImgCard = (evt) => {
    const cardElement = evt.target.closest('.card');
    const { name, link } = cardElement._cardInfo;

    description.textContent = name;
    img.src = link;
    img.alt = `Фотография места: ${ name }`;

    openModal(modalViewImg);
};

// Функция-обработчик клика лайка карточки
const handleClickLikeCard = (evt) => {
    const cardElement = evt.target.closest('.card');
    const { _id, likes } = cardElement._cardInfo;
    const storedUser = JSON.parse(sessionStorage.getItem('userData'));
    let method = 'PUT';

    if (likes.some((user) => user._id === storedUser._id)) {
        method = 'DELETE';
    }

    apiRequest(`cards/likes/${ _id }`, method).then((response) => handleLikeCard(evt, response)).catch(handleResponseError);
};

// Функция-обработчик удаления карточки
const handleModalDeleteCard = (evt) => {
    const cardElement = evt.target.closest('.card');
    const { _id, owner } = cardElement._cardInfo;
    const storedUser = JSON.parse(sessionStorage.getItem('userData'));

    if (owner._id !== storedUser._id) {
        console.error('У Вас нет прав на удаление этого элемента');
        return;
    }

    const submitBtn = modalDeletePlace.querySelector('.popup__button');
    toggleButtonLoading(submitBtn, true, 'Удаление...');

    apiRequest(`/cards/${ _id }`, 'DELETE').then(() => handleDeleteCard(evt)).catch(handleResponseError).finally(() => {
        toggleButtonLoading(submitBtn, false, 'Да');
        closeModal(modalDeletePlace);
    });
};

// Функция-обработчик клика удаления карточки
const handleClickDeleteCard = (evt) => {
    openModal(modalDeletePlace);

    modalDeletePlaceBtn.addEventListener('click', () => handleModalDeleteCard(evt), { once: true });
};
//#endregion

//#region Обработка событий в модальных окнах
// Функция-обработчик ответа на запрос обновления профиля
const handleUpdateProfileResponse = (response) => {
    const { _id, name, cohort, about } = response;

    profileTitle.textContent = name;
    profileDescription.textContent = about;

    sessionStorage.setItem('userData', JSON.stringify({ _id, name, cohort }));
};

/**
 * Функция обработчик отправки значения формы редактирования профиля
 */
const handleEditProfileFormSubmit = (evt) => {
    evt.preventDefault();

    const name = modalEditProfileForm.elements['name'].value;
    const description = modalEditProfileForm.elements['description'].value;
    const submitBtn = modalEditProfile.querySelector('.popup__button');
    toggleButtonLoading(submitBtn, true, 'Сохранение...');

    apiRequest('users/me ', 'PATCH', {
        name, about: description
    }).then(handleUpdateProfileResponse).catch(handleResponseError).finally(() => {
        toggleButtonLoading(submitBtn, false, 'Сохранить');
        closeModal(modalEditProfile);
    });
}

changeProfileBtn.addEventListener("click", () => {
    modalEditProfileForm.elements['name'].value = profileTitle.textContent;
    modalEditProfileForm.elements['description'].value = profileDescription.textContent;

    openModal(modalEditProfile, () => clearValidation(modalEditProfileForm, validationSettings));
});

// Функция-обработчик ответа на запрос добавления новой карточки
const handleAddNewPlaceResponse = (response) => {
    createCard({
        data: response,
        handleDeleteCard: handleClickDeleteCard,
        handleLikeCard: handleClickLikeCard,
        handleViewImage: handleClickViewImgCard
    });
};

/**
 * Функция обработчик отправки значения формы добавления новой карточки
 */
const handleAddNewPlaceFormSubmit = (evt) => {
    evt.preventDefault();

    const submitBtn = modalNewPlace.querySelector('.popup__button');
    toggleButtonLoading(submitBtn, true, 'Сохранение...');

    apiRequest('cards', 'POST', {
        name: placeNameField.value, link: placeLinkField.value
    }).then(handleAddNewPlaceResponse).catch(handleResponseError).finally(() => {
        toggleButtonLoading(submitBtn, false, 'Сохранить');
        closeModal(modalNewPlace);
    });
};

addPlaceBtn.addEventListener("click", () => {
    openModal(modalNewPlace, () => clearValidation(modalNewPlaceForm, validationSettings));
});

// Функция-обработчик ответа на запрос изменения аватара пользователя
const handleEditProfileImgResponse = (response) => {
    const { name, avatar } = response;

    profileImg.src = avatar;
    profileImg.alt = `Фотография профиля: ${ name }`;
};

/**
 * Функция обработчик отправки значения формы изменения аватара пользователя
 */
const handleEditProfileImgFormSubmit = (evt) => {
    evt.preventDefault();

    const submitBtn = modalEditProfileImg.querySelector('.popup__button');
    toggleButtonLoading(submitBtn, true, 'Сохранение...');

    apiRequest('users/me/avatar', 'PATCH', {
        avatar: profileLinkField.value
    }).then(handleEditProfileImgResponse).catch(handleResponseError).finally(() => {
        toggleButtonLoading(submitBtn, false, 'Сохранить');
        closeModal(modalEditProfileImg);
    });
};

changeProfileImgBtn.addEventListener("click", () => {
    openModal(modalEditProfileImg, () => clearValidation(modalEditProfileImgForm, validationSettings));
});

modalNewPlace.addEventListener('submit', handleAddNewPlaceFormSubmit);
modalEditProfile.addEventListener('submit', handleEditProfileFormSubmit);
modalEditProfileImg.addEventListener('submit', handleEditProfileImgFormSubmit);

enableValidation(validationSettings);
//#endregion

//#region Запросы данных для первичного отображения
// Функция-обработчик ответа на запрос получения данных о пользователе
const handleUserResponse = (response) => {
    const { _id, name, cohort, avatar, about } = response;

    profileTitle.textContent = name;
    profileDescription.textContent = about;
    profileImg.src = avatar;
    profileImg.alt = `Фотография профиля: ${ name }`;

    sessionStorage.setItem('userData', JSON.stringify({ _id, name, cohort }));
};

// Функция-обработчик ответа на запрос получения карточек
const handleCardsResponse = (response) => {
    response
        .sort((cardA, cardB) => new Date(cardA.createdAt) - new Date(cardB.createdAt))
        .forEach((card) => {
            createCard({
                data: card,
                handleDeleteCard: handleClickDeleteCard,
                handleLikeCard: handleClickLikeCard,
                handleViewImage: handleClickViewImgCard
            });
        });
};

// Фабрика промисов, аналог Promise.all, но с гарантией последовательного выполнения:
// сначала выполняется запрос пользователя и получение его id,
// а затем — запрос карточек, уже с учётом полученного пользователя.
// Используется, чтобы избежать гонки данных и обеспечить корректный порядок загрузки.
const executeSequentially = (promiseFactories) => {
    let result = Promise.resolve();

    promiseFactories.forEach(function (promiseFactory) {
        result = result.then(promiseFactory);
    });

    return result;
};

// Инициализация данных
executeSequentially([
    () => apiRequest('users/me').then(handleUserResponse).catch(handleResponseError),
    () => apiRequest('cards').then(handleCardsResponse).catch(handleResponseError)
]);
//#endregion