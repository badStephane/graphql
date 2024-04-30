import { MAJpage } from './graph.js';

const endpoint = "https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql";
let headers = {
    "content-type": "application/json",
};
let options = {
    "method": "POST",
    "headers": headers,
};

export function home() {
    let container = document.getElementById('container');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.innerHTML = '';
    container.classList.add('home');

    let divError = document.createElement('div');
    divError.id = 'divError';
    divError.className = 'divError';
    divError.style.display = 'none';
    container.appendChild(divError);

    let divConnexion = document.createElement('div');
    divConnexion.className = 'divConnexion';
    // divConnexion.style.display = 'none';

    let titledivConnexion = document.createElement('div');
    titledivConnexion.className = 'titledivConnexion';
    titledivConnexion.textContent = "Login Form";
    divConnexion.appendChild(titledivConnexion);

    let formConnexion = document.createElement('form');
    formConnexion.id = 'formConnexion';
    formConnexion.className = 'formConnexion';

    let inputuser = document.createElement('input');
    inputuser.id = 'inputuser';
    inputuser.type = 'text';
    inputuser.placeholder = 'Username / email';
    divConnexion.appendChild(inputuser);

    let inputpassword = document.createElement('input');
    inputpassword.id = 'inputpassword';
    inputpassword.type = 'password';
    inputpassword.placeholder = 'Mot de passe';
    divConnexion.appendChild(inputpassword);

    let buttonConnexion = document.createElement('button');
    buttonConnexion.id = 'buttonConnexion';
    buttonConnexion.className = 'buttonConnexion';
    buttonConnexion.textContent = 'Se connecter'
    divConnexion.appendChild(buttonConnexion);

    divConnexion.appendChild(formConnexion);
    container.appendChild(divConnexion);

    buttonConnexion.addEventListener('click', connexion)
}

home();

function connexion() {
    // Requete connexion :
    // https://learn.zone01dakar.sn/api/auth/signin
    // username:password base64 encoding
    var dataEncodedStringBtoA = btoa(document.getElementById('inputuser').value + ':' + document.getElementById('inputpassword').value)
    fetch(('https://learn.zone01dakar.sn/api/auth/signin'), {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer' + dataEncodedStringBtoA
        },
    })
        .then(response => {
            if (!response.ok) {
                console.log('response.status : ', response.status)
                let divError = document.getElementById('divError');
                if (response.status === 401) {
                    divError.textContent = 'Utilisateur non autorisé';
                } else {
                    divError.textContent = 'Code erreur : ' + response.status;
                }
                divError.style.display = 'block';
                throw new Error(`Erreur de réseau: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            headers.Authorization = 'Bearer ' + data;
            fetchData();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données:', error);
        });
}


// Requete API :
// https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql
async function fetchData() {
    let user = {};

    // requeté d'information sur l'utilisateur (table user)
    const queryuserInfo = {
        "query": `
        {
            user {
            lastName
            firstName
            email
            auditRatio
          }
        }`
    };
    options.body = JSON.stringify(queryuserInfo);
    const responseUserInfo = await fetch(endpoint, options);
    const dataUserInfo = await responseUserInfo.json();
    if (dataUserInfo.errors !== undefined) {
        console.log("Error : ", dataUserInfo.errors); // error
    }
    user.firstName = dataUserInfo.data.user[0].firstName;
    user.lastName = dataUserInfo.data.user[0].lastName;
    user.email = dataUserInfo.data.user[0].email;
    user.auditRatio = dataUserInfo.data.user[0].auditRatio;

    // requéte du level 
    const queryuserLevel = {
        "query": `
        {
            user {
            events(where: {event: {path: {_ilike: "/dakar/div-01"}}})  {
              level
            }
          }
        }`
    };
    options.body = JSON.stringify(queryuserLevel);
    const responseUserLevel = await fetch(endpoint, options);
    const dataUserLevel = await responseUserLevel.json();
    if (dataUserLevel.errors !== undefined) {
        console.log("Error : ", dataUserLevel.errors); // error
    }
    // console.log('dataUserLevel : ', dataUserLevel)
    user.lvl = dataUserLevel.data.user[0].events[0].level;

    // requeté d'xp utilisateur (table transaction)
    const queryuserXP = {
        "query": `
        {
            transaction(where: {type: {_eq: "xp"} event: {path: {_ilike: "/dakar/div-01"}}}, order_by: {id: asc}) {
                amount
                createdAt
            }
        }`
    };
    options.body = JSON.stringify(queryuserXP);
    const responseUserXP = await fetch(endpoint, options);
    const dataUserXP = await responseUserXP.json();
    if (dataUserXP.errors !== undefined) {
        console.log("Error : ", dataUserXP.errors); // error
    }

    user.listTransaction = dataUserXP.data.transaction;
    // console.log("Liste des transaction : ", listTransaction);

    let sum = 0;
    for (let i = 0; i < user.listTransaction.length; i++) {
        sum += user.listTransaction[i].amount
    }
    user.maxXP = sum;

    // requéte de la somme d'audit reçu (Received)
    const queryXPdown = {
        "query": `
        {
            transaction_aggregate(where: {type: {_eq: "down"} event: {path: {_ilike: "/dakar/div-01"}}}, order_by: {id: asc}) {
            	aggregate {sum {amount}}
            }
        }`
    };
    options.body = JSON.stringify(queryXPdown);
    const responseXPdown = await fetch(endpoint, options);
    const dataXPdown = await responseXPdown.json();
    if (dataXPdown.errors !== undefined) {
        console.log("Error : ", dataXPdown.errors); // error
    }
    user.XPdown = dataXPdown.data.transaction_aggregate.aggregate.sum.amount;

    // requéte de la somme d'audit envoyé (Done)
    const queryXPup = {
        "query": `
        {
            transaction_aggregate(where: {type: {_eq: "up"} event: {path: {_ilike: "/dakar/div-01"}}}, order_by: {id: asc}) {
            	aggregate {sum {amount}}
            }
        }`
    };
    options.body = JSON.stringify(queryXPup);
    const responseXPup = await fetch(endpoint, options);
    const dataXPup = await responseXPup.json();
    if (dataXPup.errors !== undefined) {
        console.log("Error : ", dataXPup.errors); // error
    }
    user.XPup = dataXPup.data.transaction_aggregate.aggregate.sum.amount;
    MAJpage(user);
}


