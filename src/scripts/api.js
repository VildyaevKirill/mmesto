import credentials from "../../credentials.json";

const { ENDPOINT, TOKEN, GROUP_ID } = credentials;

/* Универсальный заголовок запроса */
const requestHeader = {
    authorization: TOKEN,
    'Content-Type': 'application/json'
};

/**
 * Универсальный метод запроса к API.
 * @param {string} resourcePath - путь к ресурсу
 * @param {string} [method='GET'] - HTTP-метод запроса
 * @param {Object|null} [body=null] - тело запроса (только для POST, PUT, PATCH)
 * @returns {Promise<any>} - JSON-ответ сервера
 */
const apiRequest = async (resourcePath, method = 'GET', body = null) => {
    const options = {
        method,
        headers: requestHeader,
    };

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${ ENDPOINT }/v1/${ GROUP_ID }/${ resourcePath }`, options);
    let responseData = null;

    try {
        responseData = await response.json();
    } catch {
        responseData = null;
    }

    if (!response.ok) {
        const errorMessage = `Ошибка ${ response.status }: ${ response.statusText }${ responseData ? `\nПричина: ${ responseData.message }` : '' }`;

        const error = new Error(errorMessage);

        error.status = response.status;
        error.body = responseData;

        throw error;
    }

    return responseData;
};

export { apiRequest };
