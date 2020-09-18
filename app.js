
let input;
let track;
let rms;
let fft;
let ampLevel;
let divide;

let oscNum;
let oscDivide;
let angulo = 0.0;

let r1;
let g1;
let b1;
let r2;
let g2;
let b2;
let r3;
let g3;
let b3;

let pageParam;

let orbitaSlider;
let larguraSlider;
let rateSlider;
let anguloSlider;
let volumeSlider;

let osc = [];
let oscParam = [];

let showControls = false;

let isMobile = (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);

const explainerDiv = document.querySelector('.explainer-div');
const infoDiv = document.querySelector('.info-div');
const infoDivContainer = document.querySelector('.info-div-container');
const home = document.querySelector('.sobre-div');
const config = document.querySelector('.config-div');
const controles = document.querySelector('.controle-geral');
const ferramentasBar = document.querySelector('.nav-ferramentas');
const ondasBar = document.querySelector('.nav-ondas');
const tools = document.querySelectorAll('.ferramentas');
const mb = document.querySelector('.menu-bar');
let navBarOpen = false;
let showNavBar = true;

function setup(){

  var cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('display', 'block');
  cnv.parent('app-holder');

  background(0);
  pageParam = {
    r1: 0,
    g1: 0,
    b1: 0,
  }
  smooth();
  noStroke();
  oscNum = width > height ? Math.round(width/1.7) : Math.round(height/1.7);
  oscDivide = oscNum/100
  osc = Array(round(random(3,10)));

  for (var o = 0; o < osc.length; o++) {
    osc[o] = [];
    oscParam[o] = setOscParam();

    for (var i = 0; i < oscNum; i++) {
      //Parametros: Diametro, Órbita, Largura
      osc[o][i] = new Osc(i*oscParam[o].diametro, (i)+oscParam[o].orbita*o, oscParam[o].largura);
    }
    AddOndaCtr(o);
    setControlesOnda(o);
  }
  // Cria os sliders para controle de todas as ondas juntas
  setControlesGeral();
  orbitaSlider = document.querySelector('[name=orbita]');
  larguraSlider = document.querySelector('[name=length]');
  rateSlider = document.querySelector('[name=rate]');
  anguloSlider = document.querySelector('[name=angulo]');
  volumeSlider = document.querySelector('[name=volume]');

  r1 = document.querySelector('[name=r1]');
  g1 = document.querySelector('[name=g1]');
  b1 = document.querySelector('[name=b1]');

  r2 = document.querySelector('[name=r2]');
  g2 = document.querySelector('[name=g2]');
  b2 = document.querySelector('[name=b2]');

  r3 = document.querySelector('[name=r3]');
  g3 = document.querySelector('[name=g3]');
  b3 = document.querySelector('[name=b3]');
  //track = new SoundFile(this, "Revide-2.mp3");

  // Criar Audio input e usar o 1º canal
  input = new p5.AudioIn();

  // Iniciar Audio Input (Play() para monitorar e Start() para não monitorar)
  input.start();
  //input.play();

  // Criar novo Analizador de Amplitude
  rms = new p5.Amplitude();

  // Cria novo Analizador de Frequencia
  fft = new p5.FFT();

  // Linkas input no Analizador de Amplitude e Frequencia
  rms.setInput(input);
  fft.setInput(input);
}

function draw(){
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }


  background(pageParam.r1, pageParam.g1, pageParam.b1);

  // Controle de Volume
  input.amp(volumeSlider.value);
  //track.amp(1.0);

  // ampLevel retorna um valor entre 0 and 1.
  ampLevel = rms.getLevel();
  angulo+= anguloSlider.value*ampLevel;
  divide = rateSlider.value;

  // spectrum retorna uma array com valores de 0 a 255.
  let spectrum = fft.analyze();

  for(var o = 0; o < osc.length; o++){

    //console.log(oscParam[o].filterValue+'  '+oscParam[o].filtro);

    for (var i = 0; i < spectrum.length; i++) {
      // spectrum[i] - de 0 até 255
      if (oscParam[o].filtroOn == 1) {
        oscParam[o].filterValue = spectrum[oscParam[o].filtro]/255;
      } else {
        oscParam[o].filterValue = 1.0;
      }

      // Filtro Vermelho
      if (oscParam[o].filtroROn == 1) {
        oscParam[o].filterRValue = spectrum[oscParam[o].filtroR]/255;
      } else {
        oscParam[o].filterRValue = 1.0;
      }
      // Filtro Verde
      if (oscParam[o].filtroGOn == 1) {
        oscParam[o].filterGValue = spectrum[oscParam[o].filtroG]/255;
      } else {
        oscParam[o].filterGValue = 1.0;
      }
      // Filtro Azul
      if (oscParam[o].filtroBOn == 1) {
        oscParam[o].filterBValue = spectrum[oscParam[o].filtroB]/255;
      } else {
        oscParam[o].filterBValue = 1.0;
      }

    }

    for (var t = 0; t < osc[o].length; t++) {
      //
      if (t < osc[o][t].hidelength) {
        osc[o][t].oscillate(
          (t*oscParam[o].velocidade)*(ampLevel*oscParam[o].filterValue)*divide, // xRate
          (t*oscParam[o].velocidade)*(ampLevel*oscParam[o].filterValue)*divide  // yRate
        );
        osc[o][t].display(
          width/2,  //  xLoc
          height/2, //  yLoc
          color(
            (oscParam[o].filterRValue*oscParam[o].r)-sin(2*angulo)*t/100,   // Vermelho -sin(2*angulo)*t/100
            (oscParam[o].filterGValue*oscParam[o].g),                       // Verde
            (oscParam[o].filterBValue*oscParam[o].b)-100*sin(angulo/10),    // Azul
            oscParam[o].a-(t/oscDivide)          // Alpha
          )
        );
      }
      //
      osc[o][t].updateSize(t*oscParam[o].diametro);
      osc[o][t].showlength(larguraSlider.value*oscParam[o].largura);
      osc[o][t].updateOrbita(t+((orbitaSlider.value*oscParam[o].orbita)/2)*sin(angulo/5)*o);
    }
  }
}
//-----------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  width = windowWidth;
  height = windowHeight;
}
//-----------------------------
let showBar = x => {
  if (!deviceSetted) {
    testDevices();
  }
  x.classList.toggle("muda");
  if (!navBarOpen) {
    ferramentasBar.style.right = '0';
    navBarOpen = true;
  } else {
    ferramentasBar.style.right = '-100px';
    navBarOpen = false;
  }
}
//-----------------------------
function setControlesGeral(){
  // Controle Geral:
  controles.innerHTML +=
  `<div id="ctrl-geral">
  CONTROLE GERAL
  <hr class="hr-ctrl">
  <label for="orbita">Órbita</label>
  <input class="slider" type="range" name="orbita" min="0" max="1" step="0.01" value="${random(0.6,1)}">
  <br>
  <label for="length">Comprimento</label>
  <input class="slider" type="range" name="length" min="0" max="1" step="0.01" value="${random(0.3,0.8)}">
  <hr class="hr-ctrl">
  <label for="volume">Volume</label>
  <input class="slider" type="range" name="volume" min="0.0" max="1.0" step="0.05" value="0.7">
  <br>
  <label for="angulo">Ângulo</label>
  <input class="slider" type="range" name="angulo" min="0.0" max="0.8" step="0.05" value="0.4">
  <br>
  <label for="rate">Ritmo</label>
  <input class="slider" type="range" name="rate" min="0" max="10" step="1" value="7">
  <br>
  <hr class="hr-ctrl">
  </div>`;
}

function setControlesOnda(ondaNum){
  // Controle Individual:
  let ondaCtrl = document.createElement('div');
  ondaCtrl.id = `ctrl-onda-${ondaNum}`;
  ondaCtrl.classList.add('ctrl-onda');
  ondaCtrl.innerHTML +=
  `CONTROLE ONDA ${ondaNum}
  <hr class="hr-ctrl">
  <label for="orbita ${ondaNum}">Órbita</label>
  <input oninput="updateOscParam(${ondaNum}, 'orbita', this.value)" class="slider" type="range" name="orbita ${ondaNum}" min="0" max="400" step="0.5" value="${oscParam[ondaNum].orbita}">
  <br>
  <label for="length ${ondaNum}">Comprimento</label>
  <input oninput="updateOscParam(${ondaNum}, 'largura', this.value)" class="slider" type="range" name="length ${ondaNum}" min="0" max="${oscNum}" step="1" value="${oscParam[ondaNum].largura}">
  <br>
  <label for="velocidade ${ondaNum}">Velocidade</label>
  <input oninput="updateOscParam(${ondaNum}, 'velocidade', this.value)" class="slider" type="range" name="velocidade ${ondaNum}" min="-0.05" max="0.05" step="0.0005" value="${oscParam[ondaNum].velocidade}">
  <br>
  <label for="tamanho ${ondaNum}">Tamanho</label>
  <input oninput="updateOscParam(${ondaNum}, 'diametro', this.value)" class="slider" type="range" name="tamanho ${ondaNum}" min="0.02" max="0.20" step="0.01" value="${oscParam[ondaNum].diametro}">
  <br>
  <hr class="hr-ctrl">
  <label for="filtro ${ondaNum}">Filtro</label>
  <input oninput="updateOscParam(${ondaNum}, 'filtro-on', this.value)" class="slider toggle" type="range" name="filtro-btn ${ondaNum}" min="0" max="1" step="1" value="${oscParam[ondaNum].filtroOn}">
  <br>
  <div style="display: none;" name="filtro${ondaNum}">
    <label>Grave / Agudo</label>
    <input oninput="updateOscParam(${ondaNum}, 'filtro', this.value)" style="margin-top: 10px;" class="slider" type="range" min="0" max="600" step="1" value="${oscParam[ondaNum].filtro}">
  </div>
  <hr class="hr-ctrl">
  <label>COR ONDA ${ondaNum}</label>
  <hr class="hr-ctrl">
  <label for="r ${ondaNum}">Vermelho</label>
  <input oninput="updateOscParam(${ondaNum}, 'filtro-r-on', this.value)" class="slider toggle" type="range" name="filtro-btn-r ${ondaNum}" min="0" max="1" step="1" value="${oscParam[ondaNum].filtroROn}">
  <br>
  <input oninput="updateOscParam(${ondaNum}, 'r', this.value)" class="slider" type="range" name="r ${ondaNum}" min="0" max="255" step="1" value="${oscParam[ondaNum].r}">
  <br>

  <div style="display: none;" name="filtroR${ondaNum}">
    <label>Grave / Agudo</label>
    <input oninput="updateOscParam(${ondaNum}, 'filtro-r', this.value)" style="margin-top: 10px;" class="slider" type="range" min="0" max="600" step="1" value="${oscParam[ondaNum].filtroR}">
  </div>
  <hr class="hr-ctrl">

  <label for="g ${ondaNum}">Verde</label>
  <input oninput="updateOscParam(${ondaNum}, 'filtro-g-on', this.value)" class="slider toggle" type="range" name="filtro-btn-g ${ondaNum}" min="0" max="1" step="1" value="${oscParam[ondaNum].filtroGOn}">
  <br>
  <input oninput="updateOscParam(${ondaNum}, 'g', this.value)" class="slider" type="range" name="g ${ondaNum}" min="0" max="255" step="1" value="${oscParam[ondaNum].g}">
  <br>

  <div style="display: none;" name="filtroG${ondaNum}">
    <label>Grave / Agudo</label>
    <input oninput="updateOscParam(${ondaNum}, 'filtro-g', this.value)" style="margin-top: 10px;" class="slider" type="range" min="0" max="600" step="1" value="${oscParam[ondaNum].filtroG}">
  </div>
  <hr class="hr-ctrl">

  <label for="b ${ondaNum}">Azul</label>
  <input oninput="updateOscParam(${ondaNum}, 'filtro-b-on', this.value)" class="slider toggle" type="range" name="filtro-btn-b ${ondaNum}" min="0" max="1" step="1" value="${oscParam[ondaNum].filtroBOn}">
  <br>
  <input oninput="updateOscParam(${ondaNum}, 'b', this.value)" class="slider" type="range" name="b ${ondaNum}" min="0" max="255" step="1" value="${oscParam[ondaNum].b}">
  <hr class="hr-ctrl">

  <div style="display: none;" name="filtroB${ondaNum}">
    <label>Grave / Agudo</label>
    <input oninput="updateOscParam(${ondaNum}, 'filtro-b', this.value)" style="margin-top: 10px;" class="slider" type="range" min="0" max="600" step="1" value="${oscParam[ondaNum].filtroB}">
  </div>
  <hr class="hr-ctrl">
  `;
  controles.appendChild(ondaCtrl);
}
//-----------------------------
function updateOscParam(ondaNum, item, valor) {
  switch (item) {
    case 'diametro':
      oscParam[ondaNum].diametro = valor;
      break;
    case 'orbita':
      oscParam[ondaNum].orbita = valor;
      break;
    case 'largura':
      oscParam[ondaNum].largura = valor;
      break;
    case 'velocidade':
      oscParam[ondaNum].velocidade = valor;
      break;
    case 'filtro':
      oscParam[ondaNum].filtro = valor;
      break;
    case 'filtro-on':
      if (valor == '1') {
        document.querySelector(`[name=filtro${ondaNum}]`).style.display = "block";
      } else {
        document.querySelector(`[name=filtro${ondaNum}]`).style.display = "none";
      }
      oscParam[ondaNum].filtroOn = valor;
      break;
    case 'r':
      oscParam[ondaNum].r = valor;
      break;
    case 'g':
      oscParam[ondaNum].g = valor;
      break;
    case 'b':
      oscParam[ondaNum].b = valor;
      break;
    case 'filtro-r':
      oscParam[ondaNum].filtroR = valor;
      break;
    case 'filtro-r-on':
      if (valor == '1') {
        document.querySelector(`[name=filtroR${ondaNum}]`).style.display = "block";
      } else {
        document.querySelector(`[name=filtroR${ondaNum}]`).style.display = "none";
      }
      oscParam[ondaNum].filtroROn = valor;
      break;
    case 'filtro-g':
      oscParam[ondaNum].filtroG = valor;
      break;
    case 'filtro-g-on':
      if (valor == '1') {
        document.querySelector(`[name=filtroG${ondaNum}]`).style.display = "block";
      } else {
        document.querySelector(`[name=filtroG${ondaNum}]`).style.display = "none";
      }
      oscParam[ondaNum].filtroGOn = valor;
      break;
    case 'filtro-b':
      oscParam[ondaNum].filtroB = valor;
      break;
    case 'filtro-b-on':
      if (valor == '1') {
        document.querySelector(`[name=filtroB${ondaNum}]`).style.display = "block";
      } else {
        document.querySelector(`[name=filtroB${ondaNum}]`).style.display = "none";
      }
      oscParam[ondaNum].filtroBOn = valor;
      break;
  }
}
//-----------------------------
function openCtrl() {
  for (var i = 0; i < osc.length; i++) {
    document.querySelector(`#ctrl-onda-${i}`).style.display = 'none';
    oscParam[i].oscSelected = false;
  }
  document.querySelector(`#ctrl-geral`).style.display = 'block';
}
//-----------------------------
function openCtrlOndas(ondaNum) {
  for (var i = 0; i < osc.length; i++) {
    if (ondaNum != i) {
      document.querySelector(`#ctrl-onda-${i}`).style.display = 'none';
      oscParam[i].oscSelected = false;
    } else {
      document.querySelector(`#ctrl-onda-${ondaNum}`).style.display = 'block';
      document.querySelector(`#ctrl-geral`).style.display = 'none';
      oscParam[i].oscSelected = true;
    }
  }
}
//-----------------------------
function AddOndaCtr(ondaNum){
  // Controle Individual:
  ondasBar.innerHTML +=
  `<a id="onda-btn-${ondaNum}" onclick="openCtrlOndas(${ondaNum})" href="#ctrl-onda-${ondaNum}" class="btn ferramentas" style="padding-top: 10%; font-size: 1.2em; text-align: center;border: 3px solid rgba(${oscParam[ondaNum].r}, ${oscParam[ondaNum].g}, ${oscParam[ondaNum].b}, 0.5);" >${ondaNum}</a>`;
}
function DelOndaCtr(ondaNum) {
  var ctrOndaDiv = document.querySelector(`#ctrl-onda-${ondaNum}`);
  var ondabtn = document.querySelector(`#onda-btn-${ondaNum}`);

  controles.removeChild(ctrOndaDiv);
  ondasBar.removeChild(ondabtn);
}
//-----------------------------
function setOscParam() {
  return {
    diametro: random(0.02,0.15),
    orbita: random(20),
    largura: oscNum,

    velocidade: 0.0025,
    filtro: 0,
    filtroOn: 0,
    filterValue: 1.0,

    filtroROn: 0,
    filtroR: 0,
    filterRValue: 1.0,

    filtroGOn: 0,
    filtroG: 0,
    filterGValue: 1.0,

    filtroBOn: 0,
    filtroB: 0,
    filteBValue: 1.0,

    r: random(0,255),
    g: random(0,255),
    b: random(0,255),
    a: 100,

    oscSelected: false,
  }
}
document.querySelector("#app-holder").ondblclick = () => {
  if (!home.classList.contains('active')) {
    showCtrlGeral();
  }
}
function showCtrlGeral() {
  if (!showNavBar) {
    mb.style.opacity = 1;
    ferramentasBar.style.opacity = 1;
    ondasBar.style.opacity = 1;
    controles.style.opacity = 1;
    showNavBar = true;
  } else {
    mb.style.opacity = 0;
    ferramentasBar.style.opacity = 0;
    ondasBar.style.opacity = 0;
    controles.style.opacity = 0;
    showNavBar = false;
  }
}
//-----------------------------
tools.forEach((tool, i) => {
  tool.onclick = () => {
    if (tool.name != 'Tela cheia' && tool.name != 'Adicionar Onda' && tool.name != 'Remover Onda') {
    //Procurar todas que estiverem com e tirar
      for (var j = 0; j < tools.length; j++) {
        if(j !== i && tools[j].classList.contains('active')){
          tools[j].classList.toggle('active');
        }
      }
      //ai depois colocar a classe na clicada
      tool.classList.toggle('active');
    }

    if (tool.name === "Página principal") {
      if (tool.classList.contains('active')) {
        // button action here...
        controles.style.visibility = 'hidden';
        controles.style.opacity = 0;
        ondasBar.style.left = '-100px';
        config.style.visibility = 'hidden';
        config.style.opacity = 0;

        home.style.visibility = 'visible';
        home.style.opacity = 1;
      } else {
        // cleaning button action here...

        home.style.visibility = 'hidden';
        home.style.opacity = 0;
      }
    } else if (tool.name === 'Tela cheia') {
      tool.children[0].classList.toggle('fa-expand');
      tool.children[0].classList.toggle('fa-compress');
      toggleFullScreen();
    } else if (tool.name === 'Controles de Onda') {
      if (tool.classList.contains('active')) {
        // button action here...
        home.style.visibility = 'hidden';
        home.style.opacity = 0;
        config.style.visibility = 'hidden';
        config.style.opacity = 0;

        controles.style.visibility = 'visible';
        controles.style.opacity = 1;
        ondasBar.style.left = '10px';
      } else {
        // cleaning button action here...

        controles.style.visibility = 'hidden';
        controles.style.opacity = 0;
        ondasBar.style.left = '-100px';
      }
    } else if (tool.name === 'Configurações') {
      if (tool.classList.contains('active')) {
        // button action here...
        home.style.visibility = 'hidden';
        home.style.opacity = 0;
        controles.style.visibility = 'hidden';
        controles.style.opacity = 0;
        ondasBar.style.left = '-100px';

        config.style.visibility = 'visible';
        config.style.opacity = 1;
      } else {
        // cleaning button action here...

        config.style.visibility = 'hidden';
        config.style.opacity = 0;
      }
    } else if (tool.name === 'Adicionar Onda' && osc.length < 10) {
      osc[osc.length] = [];
      oscParam[oscParam.length] = setOscParam();
      for (var k = 0; k < oscNum; k++) {
        //Parametros: Diametro, Órbita, Largura
        osc[osc.length-1][k] = new Osc(k*oscParam[osc.length-1].diametro, (k)+oscParam[osc.length-1].orbita*(osc.length-1), oscParam[osc.length-1].largura);
      }
      console.log('add: ' + (osc.length-1));
      AddOndaCtr(osc.length-1);
      setControlesOnda(osc.length-1);
    } else if (tool.name === 'Remover Onda') {
      DelOndaCtr(osc.length-1);
      console.log('removing: ' + (osc.length-1));
      osc.pop();
      oscParam.pop();
    }
  }
  // Explainer Tool DIV
  tool.onmouseover = (e) => {
    let divY = e.clientY;
    explainerDiv.innerHTML = tool.name;
    explainerDiv.style.top = divY -20 + "px";
    explainerDiv.style.right = "80px";
    explainerDiv.style.visibility = 'visible';
    explainerDiv.style.opacity = 1;
    explainerTimer(2000, explainerDiv);
  }
  tool.onmouseout = (e) => {
    clearTimeout(exptimer);
    explainerDiv.style.visibility = 'hidden';
    explainerDiv.style.opacity = 0;
  }
});
let exptimer;
function explainerTimer(intervalo, obj) {
  exptimer = setTimeout(function(){
    if (isMobile) {
      obj.style.visibility = 'hidden';
      obj.style.opacity = 0;
    }
  }, intervalo);
}
//-----------------------------
let tutorialCounter = 0;
const tutFrases = [
  'Dê dois clicks na tela <br> para mostrar ou esconder <br> a barra de ferramentas'
  +`<br><br><button class="btn-tut" onclick="tutPlus(1)">Ok, entendi.</button>`,

  'Gostaria de iniciar<br>um tutorial rápido?'
  +'<br><br><button class="btn-tut" onclick="tutPlus(2)">Sim</button>'
  +'<button class="btn-tut" onclick="tutPlus(8)">Não</button>',

  'Clique nos icones <br> da barra de ferramentas<br>para abrir e fechar<br> suas janelas'
  +'<br><br><button class="btn-tut" onclick="tutPlus(3)">Próximo</button>',

  '<i class="fa fa-home" style="font-size:1.8em"></i><br><br>Aqui você acessa<br>a nossa página inicial'
  +'<br><br><button class="btn-tut" onclick="tutPlus(4)">Próximo</button>',

  '<i class="fa fa-sliders" style="font-size:1.8em"></i><br><br>Aqui você acessa<br>os controles para interagir<br>com as ondas'
  +'<br><br><button class="btn-tut" onclick="tutPlus(5)">Próximo</button>',

  '<i class="fa fa-gear" style="font-size:1.8em"></i><br><br>Aqui você acessa<br>as configurações gerais<br>da plataforma'
  +'<br><br><button class="btn-tut" onclick="tutPlus(6)">Próximo</button>',

  '<i class="fa fa-expand" style="font-size:1.8em"></i><br><br>Esse botão<br>habilita ou desabilita<br>o modo Tela cheia'
  +'<br><br><button class="btn-tut" onclick="tutPlus(7)">Próximo</button>',

  '<i class="fa fa-plus" style="font-size:1.8em"></i>&nbsp&nbsp&nbsp<i class="fa fa-minus" style="font-size:1.8em"></i><br><br>'
  +'Com esses controles<br>você pode adicionar<br>e remover ondas'
  +'<br><br><button class="btn-tut" onclick="tutPlus(8)">Próximo</button>',

  'Ótimo,<br>isso é tudo que<br>precisa para começar'
  +'<br><br><button class="btn-tut" onclick="tutPlus(-1)">Interagir</button>'
];
function tutPlus(num) {
  tutorialCounter = num;
  tutorial();
}
function tutorial() {
  if (tutorialCounter > -1) {
    infoDiv.innerHTML = tutFrases[tutorialCounter];
    infoDiv.style.top = "60px";
    infoDiv.style.right = "80px";
    infoDiv.style.visibility = 'visible';
    infoDiv.style.opacity = 1;
    if (tutorialCounter === 2) {
      infoDivContainer.style.visibility = 'visible';
      infoDivContainer.style.opacity = 1;
      infoDivContainer.style.zIndex = 98;
    }
  } else {
    infoDivContainer.style.visibility = 'hidden';
    infoDivContainer.style.opacity = 0;
    infoDiv.style.visibility = 'hidden';
    infoDiv.style.opacity = 0;
  }
}
//-----------------------------
let deviceInput = 0;
function setAudioInput(i) {
  document.getElementById(`device-${deviceInput}`).classList.toggle('device-selected');
  input.setSource(i);
  deviceInput = i;
  document.getElementById(`device-${deviceInput}`).classList.toggle('device-selected');
}
function setConfig(){
  // Controle Geral:
  config.innerHTML +=
  `<label>Input de Áudio:</label><br>`;
  for (var i = 0; i < audioDevices.length; i++) {
    config.innerHTML += `<br><div id="device-${i}" class="btn-entrar" onclick="setAudioInput(${i})">${audioDevices[i]}</div>`;
  }
  config.innerHTML +=
  `<hr class="hr-ctrl">
  <label>COR FUNDO</label>
  <hr class="hr-ctrl">
  <label for="r1">Vermelho </label>
  <input oninput="updatePageParam('r1', this.value)" class="slider" type="range" name="r1" min="0" max="255" step="1" value="${pageParam.r1}">
  <br>

  <label for="g1">Verde </label>
  <input oninput="updatePageParam('g1', this.value)" class="slider" type="range" name="g1" min="0" max="255" step="1" value="${pageParam.g1}">
  <br>
  <label for="b1">Azul </label>
  <input oninput="updatePageParam('b1', this.value)" class="slider" type="range" name="b1" min="0" max="255" step="1" value="${pageParam.b1}">
  <hr class="hr-ctrl">`;
}
//-----------------------------
function updatePageParam(item, valor) {
  if (pageParam.r1 > 180 && pageParam.g1 > 180 && pageParam.b1 > 180) {
    mb.style.background = 'rgba(0, 0, 0, 0.5)';
  } else {
    mb.style.background = 'rgba(0, 0, 0, 0.0)';
  }

  switch (item) {
    case 'r1':
      pageParam.r1 = valor;
      break;
    case 'g1':
      pageParam.g1 = valor;
      break;
    case 'b1':
      pageParam.b1 = valor;
      break;
    case 'r2':
      pageParam.r2 = valor;
      break;
    case 'g2':
      pageParam.g2 = valor;
      break;
    case 'b2':
      pageParam.b2 = valor;
      break;
    case 'r3':
      pageParam.r3 = valor;
      break;
    case 'g3':
      pageParam.g3 = valor;
      break;
    case 'b3':
      pageParam.b3 = valor;
      break;
  }
}
//-----------------------------
let audioDevices = [];
let deviceSetted = false;
function testDevices() {
navigator.mediaDevices.enumerateDevices()
  .then(function(devices) {
    devices.forEach(function(device, i) {
      if (device.kind === 'audioinput') {
        audioDevices[i] = device.label;
        deviceSetted = true;
        console.log(audioDevices);
      }
    });
    setConfig();
    input.setSource(0);
    document.getElementById('device-0').classList.toggle('device-selected');
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  });
}
function chooseDevice() {

}
function testar() {
  //toggleFullScreen();
  if (!navBarOpen) {
    showBar(mb);
  }
  mb.style.opacity = 1;
  ferramentasBar.style.opacity = 1;
  document.querySelector('#homepage').classList.toggle('active');
  home.style.visibility = 'hidden';
  home.style.opacity = 0;
  tutorial();
}
function zerar() {
  testar();
  for (var i = 1; i < osc.length; i++) {
    DelOndaCtr(i);
  }
  osc.splice(1, osc.length-1);
  oscParam.splice(1,oscParam.length-1);
}
//-----------------------------
function toggleFullScreen(){
  let fs = fullscreen();
  fullscreen(!fs);
}
//-----------------------------
class Osc {
  //Parametros: Diametro, Órbita X, Órbita Y
  constructor(tempSize, raio, hidelength) {
    this.xtheta = 0.0;
    this.ytheta = 0.0;
    this.oscSize = tempSize;
    this.xR = raio;
    this.yR = raio;
    this.hidelength = hidelength;
  }

  oscillate(xRate, yRate) {
    this.xtheta += xRate;
    this.ytheta += yRate;
  }

  display(xLoc, yLoc, col) {
    let x = sin(this.xtheta/2)*this.xR;
    let y = cos(this.ytheta/2)*this.yR;
    fill(col);
    ellipse(x+xLoc, y+yLoc, this.oscSize, this.oscSize);
  }

  showlength(newlength){
    // de 0 a oscNum+1
    this.hidelength = newlength;
  }

  updateSize(newSize){
    this.oscSize = newSize;
  }

  updateOrbita(newRaio){
    this.xR = newRaio;
    this.yR = newRaio;
  }
}
