class Utils {

    static dateformat(date){       

        return date.getDate() + '/' + 
        (date.getMonth()+1) + '/' +
        date.getFullYear() + ' ' +
        date.getHours() + ':' + 
        date.getMinutes();
       
        }
    }

