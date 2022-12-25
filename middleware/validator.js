class Validator {
    test(data) {
        let errors = [];
        for(let key in data){
            if (key==='email') {
                (/^([A-Za-z0-9])+@([A-Za-z0-9_])+\.([A-Za-z]{2,4})$/.test(data.email))?null:errors.push("Email is not valid");
            }
            if (key==='phone') {
                (/^(\+380)(99|50|95|66|93|96|97|63)([0-9]){7}/.test(data.phone) && data.phone.length === 13)?null:errors.push("Phone is not valid")
            }
            if (key==='password') {
                (/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]){8,32}/.test(data.password))?null:errors.push("Password should contain lower,capital letter and digit")
            }
            if (key==='firstname') {
                /([A-Za-z]){2,32}/.test(data.firstname)?null:errors.push("First name is not correct")
            }
            if (key==='lastname') {
                /([A-Za-z]){2,32}/.test(data.lastname)?null:errors.push("Last name is not correct")
            }
        }
        return errors;
    }
    test_action(data) {
        let errors = [];

        let totalSeconds = new Date(data.start_date).getTime() + 86400000;
        if (new Date(data.start_date).toLocaleDateString() < new Date().toLocaleDateString() || new Date(data.end_date).toLocaleDateString() < new Date(totalSeconds).toLocaleDateString()) {
            errors.push("Date is not valid")
        }
        if (data.title.length < 3) {
            errors.push("Action title is not valid")
        }
        if (data.title.description < 2) {
            errors.push("Description is too short")
        }
        if (!/(low)|(high)|(middle)/i.test(data.priority)) {
            errors.push("Priority is not correct")
        }
        return errors;
    }
}

const validator = new Validator();
module.exports = validator;
