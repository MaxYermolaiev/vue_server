class Validator {
    constructor() {
        this.errors=null;
    }
    test_date=(value)=> {

        //console.log(value.match(/[0-9]{4}-[0-9]{2}-[0-9]{2},\s[0-9]{2}\:[0-9]{2}:[0-9]{2}/))
       return /\d{4}-\d{2}-\d{2},\s\d{2}:\d{2}:\d{2}/.test(value);
    };
    test(fields,schema){
        //this.#schemaParser(fields,schema)
        //console.log(this.errors)
        //return this.errors;
        return null;
    }
    test_action(data){
        let errors=[];

        let totalSeconds = new Date(data.start_date).getTime()+86400000;
        if(new Date(data.start_date).toLocaleDateString()<new Date().toLocaleDateString()|| new Date(data.end_date).toLocaleDateString()<new Date(totalSeconds).toLocaleDateString()) {
            errors.push("Date is not valid")
        }
        if(data.title.length<3) {
            errors.push("Action title is not valid")
        }
        if(data.title.description<2) {
            errors.push("Description is too short")
        }
        if(!/(low)|(high)|(middle)/i.test(data.priority)){
            errors.push("Priority is not correct")
        }
    return errors;
    }

}
const validator = new Validator();
module.exports = validator;
