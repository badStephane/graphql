import { home } from './main.js';

export function MAJpage(user) {
    // console.log("User : ", user);
    let container = document.getElementById('container');
    container.classList.remove('home');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.innerHTML = '';

    // Information utilisateur
    let divUser = document.createElement('div');
    divUser.className = 'divUser';
    let divInfo = document.createElement('div');
    divInfo.className = 'divInfo';

    // logout
    let logout = document.createElement('button')
    logout.id = 'logoutButton';
    logout.className = 'logout';
    logout.textContent = 'LogOut';
    divInfo.appendChild(logout);

    let divName = document.createElement('div');
    divName.className = 'divName';
    let name = document.createElement('h3');
    name.textContent = user.firstName + ' ' + user.lastName;
    divName.appendChild(name);
    let email = document.createElement('h4');
    email.className = 'email'
    email.textContent = user.email
    divName.appendChild(email);
    divInfo.appendChild(divName);

    // utilisateur + xp max
    let divxp = document.createElement('div');
    divxp.className = 'divxp';
    let lvl = document.createElement('div');
    lvl.textContent = 'Level : ' + user.lvl;
    divxp.appendChild(lvl);
    let totalXP = document.createElement('div');
    totalXP.textContent = 'XP total : ' + Math.round(user.maxXP / 1000) + ' kb';
    divxp.appendChild(totalXP);
    divInfo.appendChild(divxp);
    divUser.appendChild(divInfo);


    // info ratio d'audit
    let divaudit = document.createElement('div');
    divaudit.className = 'divaudit';
    let titleaudit = document.createElement('h4');
    titleaudit.textContent = "Information d'audit";
    divaudit.appendChild(titleaudit);
    let XPdone = document.createElement('div');
    XPdone.classList = 'XPdone';
    XPdone.innerHTML = '⬆️ Done &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ' + Math.round(user.XPup / 10000) / 100 + ' MB';
    divaudit.appendChild(XPdone);

    // graph svg des ratio d'audit
    // calcul du % de la barre
    let traceXPup = 0;
    let traceXPdown = 0;
    if (user.XPup > user.XPdown) {
        traceXPdown = user.XPdown / user.XPup
        traceXPup = 1;
    } else {
        traceXPup = user.XPup / user.XPdown;
        traceXPdown = 1;
    }

    let svgAudit = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let lineDone = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineDone.setAttribute('x1', 0);
    lineDone.setAttribute('y1', 5);
    lineDone.setAttribute('x2', `${traceXPup * 100}%`); //user.XPup);
    lineDone.setAttribute('y2', 5);
    lineDone.setAttribute('stroke-width', 20);
    lineDone.setAttribute('stroke', 'green');
    svgAudit.appendChild(lineDone);
    let lineReceived = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineReceived.setAttribute('x1', 0);
    lineReceived.setAttribute('y1', 30);
    lineReceived.setAttribute('x2', `${traceXPdown * 100}%`); //user.XPdown);
    lineReceived.setAttribute('y2', 30);
    lineReceived.setAttribute('stroke-width', 20);
    lineReceived.setAttribute('stroke', 'red');
    svgAudit.appendChild(lineReceived);

    divaudit.appendChild(svgAudit);

    let XPreceived = document.createElement('div');
    XPreceived.className = 'XPreceived';
    XPreceived.innerHTML = '⬇️ Received &nbsp;&nbsp; ' + Math.round(user.XPdown / 10000) / 100 + ' MB';
    divaudit.appendChild(XPreceived);
    let ratio = document.createElement('div');
    ratio.innerHTML = 'ℹ️ Audit ratio &nbsp;' + (user.auditRatio).toFixed(1);
    divaudit.appendChild(ratio);
    divUser.appendChild(divaudit);

    container.appendChild(divUser);

    // Graph d'xp de l'utilisateur
    let divgraph = document.createElement('div');
    divgraph.className = 'divgraph';
    let title = document.createElement('h1');
    title.textContent = "Graphique de l'XP";
    divgraph.appendChild(title);

    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', 80);
    svg.setAttribute('height', 50);
    svg.setAttribute('viewBox', "0 0 100 100");
    let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', 100);
    rect.setAttribute('height', 100);
    rect.setAttribute('fill', "grey");
    svg.appendChild(rect);

    let firstDate = Date.parse(user.listTransaction[0].createdAt);
    let lastDate = Date.parse(user.listTransaction[user.listTransaction.length - 1].createdAt);
    let amplitudeDate = new Date(lastDate - firstDate);
    amplitudeDate.setMonth(amplitudeDate.getMonth() + 1); // décalage de 1 mois sur l'amplitude de la date

    let sum = 0;
    let maxgraph = (user.maxXP + 100000);
    for (let i = 0; i < user.listTransaction.length; i++) {
        sum += user.listTransaction[i].amount;
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        if (i != 0) {
            line.setAttribute('x1', ((Date.parse(user.listTransaction[i].createdAt) - firstDate) * 100) / amplitudeDate);
            let y = (sum * 100) / maxgraph;
            line.setAttribute('y1', 100 - y);
            line.setAttribute('x2', ((Date.parse(user.listTransaction[i - 1].createdAt) - firstDate) * 100) / amplitudeDate);
            let ypreview = ((sum - user.listTransaction[i].amount) * 100) / maxgraph;
            line.setAttribute('y2', 100 - ypreview);
            line.setAttribute('stroke', 'yellow');
            line.setAttribute('stroke-width', '0.3');
            svg.appendChild(line);
        }
    }

    let datafirstDate = new Date(firstDate);
    let datalastDate = new Date(lastDate);
    let titlelineLegendex = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titlelineLegendex.setAttribute('x', 15);
    titlelineLegendex.setAttribute('y', 99);
    titlelineLegendex.setAttribute('fill', 'white');
    titlelineLegendex.setAttribute('font-size', 3);
    titlelineLegendex.textContent = 'Axe des dates : du ' + String(datafirstDate.getDate()).padStart(2, '0') + '/' + String(datafirstDate.getMonth() + 1).padStart(2, '0') + '/' + datafirstDate.getFullYear() + ' au ' + String(datalastDate.getDate()).padStart(2, '0') + '/' + String(datalastDate.getMonth() + 1).padStart(2, '0') + '/' + datalastDate.getFullYear();
    svg.appendChild(titlelineLegendex);

    let titlelineLegendey = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titlelineLegendey.setAttribute('x', 1);
    titlelineLegendey.setAttribute('y', 55);
    titlelineLegendey.setAttribute('fill', 'white');
    titlelineLegendey.setAttribute('font-size', 4);
    titlelineLegendey.setAttribute('transform', "rotate(-90 4,55)");
    titlelineLegendey.textContent = "Axe de l'XP reçu";
    svg.appendChild(titlelineLegendey);

    divgraph.appendChild(svg);
    container.appendChild(divgraph);

    logout.addEventListener('click', () => {
        localStorage.removeItem('auth')
        home();
    });
}


