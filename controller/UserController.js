class UserController {

    constructor(formIdCreate, formIdUpdate, tableID){

        this.formEL = document.getElementById(formIdCreate);

        this.formUpdateEL = document.getElementById(formIdUpdate);

        this.tableEL = document.getElementById(tableID);  

        this.onSubmit();

        this.onEdit();
        
        this.selectAll();
    }

    onEdit(){
        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e=>{
            this.showPanelCreate();
        })

        this.formUpdateEL.addEventListener('submit', event => {

            event.preventDefault();

            let btn = this.formUpdateEL.querySelector('[type="submit"]');

            btn.disable = true;

            let values = this.getValues(this.formUpdateEL);

            let index = this.formUpdateEL.dataset.trIndex;

            let tr = this.tableEL.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);            

        this.getPhoto(this.formUpdateEL).then(
            (content) => {

                if (!values.photo) {
                    result._photo = userOld._photo
                } else {
                    result._photo = content;
                }
                
            let user = new User();

            user.loadFromJSON(result);

            user.save();
            
            this.getTr(user, tr);

            this.updateCount();
                    
            this.formUpdateEL.reset();

            btn.disable = false;
            },

            (e)=>{
            console.error(e);
            }
        )

        this.showPanelCreate();

        });
    }

    onSubmit(){

        this.formEL.addEventListener('submit', (event) => {

            event.preventDefault();

            let btn = this.formEL.querySelector('[type="submit"]');

            btn.disable = true;

            let values = this.getValues(this.formEL);

            if (!values){
                return false;
            }

            this.getPhoto(this.formEL).then(
                (content) => {
                    
                values.photo = content;

                values.save();

                this.addLine(values);

                this.formEL.reset();

                btn.disable = true;
                },

                (e)=>{
                console.error(e);
                }
            )
        });
    }

    getPhoto (formEL){

        return new Promise ((resolve, reject) => {

        let fileReader = new FileReader();

        let elements = [...formEL.elements].filter(item =>{
            if (item.name === 'photo') {
                return item
            } 
        });                  

        let file = elements[0].files[0];

        fileReader.onload = ()=>{
            
            resolve(fileReader.result);
        };

        fileReader.onerror = (e) => {

            reject(e);
        }
          
        if (file){
        fileReader.readAsDataURL(file);   
        } else {
            resolve('dist/img/boxed-bg.jpg');
        }

        })
    };

    getValues(formEL){

        let user = {};
        let isValid = true;
       [...formEL.elements].forEach(function(field, index){


        if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
            field.parentElement.classList.add('has-error');
            isValid = false;
        }
            if (field.name === 'gender'){               
                if (field.checked){ 
                    user[field.name] = field.value;                    
                }                
            }
            else if (field.name == 'admin') {    

                user[field.name] = field.checked; 

            }else {
                user[field.name] = field.value;   
            }
        })
        
        if (!isValid){
            return false;
        }

        return new User(
            user.name, 
            user.gender, 
            user.birth, 
            user.country, 
            user.email, 
            user.password, 
            user.photo, 
            user.admin);      
    };

    addEventsTr(tr){
        tr.querySelector('.btn-delete').addEventListener('click', e=>{
            if(confirm('Você deseja realmente excluir esse usuário?')){

                tr.remove();

                this.updateCount();
            }           
        });

        tr.querySelector('.btn-edit').addEventListener('click', e =>{
            let json = JSON.parse(tr.dataset.user);
    
            this.formUpdateEL.dataset.trIndex = tr.sectionRowIndex;
    
            for (let name in json){
            let field = this.formUpdateEL.querySelector('[name=' + name.replace('_', '') + ']')
                
                if (field){
                    switch (field.type){
                        case 'file':
                            continue;
                        break;
    
                        case 'radio':
                            field = this.formUpdateEL.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;                     
                        break;
    
                        case 'checkbox':
                            field.checked = json[name]; 
                        break;
    
                        default:
                            field.value = json[name];                    
                    }               
                }       
            }
            
            this.formUpdateEL.querySelector('.photo').src = json._photo;

            this.showPanelUpadate();
        });
    
        tr.querySelector('.btn-delete').addEventListener('click', e=>{
            this.showPanelCreate();
        });
    }

    getUsersStorage() {

        let users = [];

        if (localStorage.getItem('users')){

            users = JSON.parse(localStorage.getItem('users'));
        }

        return users;
    }

    selectAll() {

        let users = this.getUsersStorage();

        users.forEach (dataUsers => {

            let user = new User();
            
            user.loadFromJSON(dataUsers);

            this.addLine(user);
        })
    }

    addLine (dataUser){

    let tr = this.getTr(dataUser);

    this.tableEL.appendChild(tr);

    this.updateCount()            
    }

    getTr(dataUser, tr = null) {

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `   
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin)? ' Sim ' : ' Não '}</td>
            <td>${Utils.dateformat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>         
    `
    this.addEventsTr(tr);

    return tr;
    }

    showPanelCreate(){
        document.querySelector('#box-user-create').style.display = 'block';
        document.querySelector('#box-user-update').style.display = 'none';
    }

    showPanelUpadate(){
        document.querySelector('#box-user-create').style.display = 'none';
        document.querySelector('#box-user-update').style.display = 'block';
    }

    updateCount(){
        let numberUser = 0;
        
        let adminUser = 0;

    [ ... this.tableEL.children].forEach(tr => {

        numberUser++;
        
       let user = JSON.parse(tr.dataset.user);

        if (user._admin == true) adminUser++;

        document.querySelector('#number-users').innerHTML = numberUser;
        document.querySelector('#number-users-admins').innerHTML = adminUser;

        });
    }
        
}