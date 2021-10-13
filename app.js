
//Começamos aqui

var user = null;
//Buttons
var formLogin = document.querySelector("form.login-form");
var btnLogout = document.querySelector('.logout')

formLogin.addEventListener("submit", (e)=>{
    //Don't recargue
    e.preventDefault();
    //Grab the vars
    let email = document.querySelector('[name=email]').value;
    let password = document.querySelector('[name=password]').value;

    //Firebase auth
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        // Signed in
        user = userCredential.user;
        document.querySelector('.login').style.display = "none";
        document.querySelector('.container-login').style.display = "block";
        //alert('Logado com sucesso')
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        document.querySelector('.login').style.display = "none";
        document.querySelector('.container-no-login').style.display = "block";
        document.querySelector('.deslogado').style.display = "none";
        //alert('Não foi possível logar, email oi senha incorretos')
    });
})

firebase.auth().onAuthStateChanged((val)=>{
    if (val){
        user = val;
        document.querySelector('.login').style.display = "none";
        document.querySelector('.container-login').style.display = "block";
    
        //Listen database auteration

        db.collection('tarefas').where("userId", "==", user.uid).onSnapshot((data)=>{
            let list = document.querySelector('#tarefas');
            list.innerHTML = "";
            let tarefas = data.docs;
            tarefas = tarefas.sort((a, b)=>{
                if(a.data().horario < b.data().horario){
                    return -1;
                }else{
                    return +1;
                }
            })

            tarefas.map((val)=>{
                list.innerHTML += ` <li>${val.data().tarefa} <a tarefa-id="${val.id}" class="excluir" href="javascript:void(0)">(X)</a></li>`;
            })
        
            var excluirTarefas = document.querySelectorAll('.excluir');

            excluirTarefas.forEach(element => {
                element.addEventListener('click', (e)=>{
                    e.preventDefault();
                    let docId = element.getAttribute('tarefa-id')
                
                    db.collection('tarefas').doc(docId).delete();
                })
            });
        })
    }
    
})

//Logout
btnLogout.addEventListener('click',(e)=>{
    e.preventDefault();
    firebase.auth().signOut().then(() => {
        //Clear the user variable
        user = null;
        //Elements
        document.querySelector('.login').style.display = "block";
        document.querySelector('.container-login').style.display = "none";
        //Reset the form
        formLogin.reset();
    }).catch((error) => {
        alert('Não foi possível deslogar '+ error);
    });
})

var formCadastro = document.querySelector('form.cadastro-tarefa');

formCadastro.addEventListener('submit', (e)=>{
    e.preventDefault();
    let tarefa = document.querySelector('[name=tarefa]').value;
    let dateTime = document.querySelector('[name=datetime]').value;
    
    if(tarefa == "" || dateTime == ""){
        alert('Prencha todos os campos');
    }else{
        //Create or insert in the collection
        let atualDate = new Date().getTime();

        if(atualDate > new Date(dateTime).getTime()){
            alert('Você informou uma data no passado')
        }else {
            db.collection('tarefas').add({
                tarefa: tarefa,
                horario: new Date(dateTime).getTime(),
                userId: user.uid
            })
        
            alert('Sua tarefa foi cadastrada')
        }
        formCadastro.reset();
    }
})