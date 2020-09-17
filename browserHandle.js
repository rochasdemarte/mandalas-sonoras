var browser = navigator.userAgent || navigator.vendor || window.opera;

let isInstagram = browser.includes("Instagram");
let isFacebook = browser.includes("FBAV");
let appName = '';

if (isInstagram) {
  appName = 'Instagram';
  browserHandle(appName);
} else if (isFacebook) {
  appName = 'Facebook';
  browserHandle(appName);
}

function browserHandle(app) {
  document.body.innerHTML = `
  <div class="browser-handle-div">
    <h1 class="titulo">MANDALAS SONORAS</h1>
    <h2>Opa!<br><mark>Abra no Navegador</mark> para experimentar!</h2>
    <p>Infelizmente o navegador<br>in-app do ${app} não suporta o uso do <mark>microfone</mark>.</p>
    <p>Abra a página no seu navegador para poder experimentar a plataforma.</p>
    <div class="icon-container">
      <a class="btn-icon" href="https://www.instagram.com/mandalas.sonoras/"><i class="fa fa-instagram"></i></a>
      <a class="btn-icon" href="https://github.com/rochasdemarte/mandalas-sonoras/"><i class="fa fa-github"></i></a>
    </div>
    <hr>
  </div>
  `;
}
