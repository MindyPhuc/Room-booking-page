function validPassword(password) {
    const reg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,20}/;
    return reg.test(password);
}

console.log(validPassword('Mindy@1234'));