export const generateRandomUsername = () => {
    const randomNumber = Math.floor(100 + Math.random() * 900);
    const username = 'User' + randomNumber;
    return username;
}