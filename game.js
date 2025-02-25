const canvas = document.getElementById('canvasJogo');
const ctx = canvas.getContext("2d");
const larguraTela=canvas.width;
const alturaTela = canvas.height;
const larguraCano = 70;
let gravidade = 0.25;
let movimentoPassaro = 0;
let jogoAtivo = false;
let pontuacao = 0;
let velocidadeCanos = 2;
let limitePontuacao = 5;
let pontuacaoMaxima = parseInt(localStorage.getItem("pontuacaoMaxima")|| "0",10);
let passaroY = alturaTela /2
let passaroX= 100;
let listaDeCano = [];

const imagemFundo = new Image();
imagemFundo.src = "fundo.png";

const imagemPassaro = new Image();
imagemPassaro.src = "passaro.png";

const imagemCano = new Image();
imagemCano.src = "cano.png";

const botaoComecar = document.getElementById("botaoComecar");


function iniciarJogo() {
    
    jogoAtivo = true
    listaDeCano=[];

    passaroY=alturaTela/2;
    movimentoPassaro=0;
    pontuacao=0;
    gravidade=0.25;
    velocidadeCanos=2;
    limitePontuacao=5;
    botaoComecar.style.display='none';

    loopJogo()
}


function desenharFundo() {
    ctx.drawImage(imagemFundo,0,0,larguraTela,alturaTela);
}


function desenharPassaro() {
    ctx.drawImage(imagemPassaro,passaroX,passaroY,34,24);
}

function criarCano() {

    const tamanhoGap = Math.floor(Math.random()*50)+100;
    const posicaoGap = Math.floor(Math.random()*(alturaTela-tamanhoGap-100))+50;
    listaDeCano.push({x:larguraTela,y:posicaoGap,gap:tamanhoGap});
    
}

function desenhaCanos() {

    listaDeCano.forEach(cano =>{
        ctx.save();

        ctx.translate(cano.x+larguraCano/2,cano.y-imagemCano.height/2)

        ctx.rotate(Math.PI);

        ctx.drawImage(imagemCano,-larguraCano/2,-imagemCano.height/2,larguraCano,imagemCano.height);

        ctx.restore();

        ctx.drawImage(imagemCano,cano.x,cano.y+cano.gap,larguraCano,imagemCano.height);
    })
    
}

function moverCanos() {

    listaDeCano.forEach(cano =>{

        cano.x-=velocidadeCanos;

        listaDeCano=listaDeCano.filter(cano=>cano.x>-larguraCano);
    })
    
}

function verificarColisoes() {

    for(const cano of listaDeCano){

        if ((passaroY<cano.y||passaroY>cano.y+cano.gap)&&
        (passaroX+34>cano.x &&passaroX<cano.x+larguraCano)){
            
            jogoAtivo = false;
            botaoComecar.style.display="block"

            atualizarPontuacaoMaxima()
            return;
        }
    }

    if (passaroY<=0||passaroY>=alturaTela-24) {

        jogoAtivo=false;
        botaoComecar.style.display="block";
        atualizarPontuacaoMaxima();
        
    }




    
}

function exibirPontuacao() {

    ctx.fillStyle="#fff"
    ctx.font="24px Arial"

    ctx.fillText(`Pontuação: ${Math.floor(pontuacao)}`,10,30)

    ctx.fillText(`Recorde: ${pontuacaoMaxima}`,larguraTela-150,30)

    
}

function atualizarPontuacaoMaxima() {
    if (pontuacao>pontuacaoMaxima) {

        pontuacaoMaxima=Math.floor(pontuacao);

        localStorage.setitem("pontuacaoMaxima",pontuacaoMaxima);
        
    }
    
}



function loopJogo() {
    if (!jogoAtivo)return;
    ctx.clearRect(0,0,larguraTela,alturaTela);
    desenharFundo();

    desenharPassaro();
    
    desenhaCanos();

    movimentoPassaro+=gravidade;
    passaroY+=movimentoPassaro;

    moverCanos();

    verificarColisoes();
    pontuacao+=0.01;
    exibirPontuacao();

    if (pontuacao>=limitePontuacao) {
        velocidadeCanos+=0.05;
        gravidade+=0.005;

        limitePontuacao+=5;
    }

    if (listaDeCano.length===0 || listaDeCano[listaDeCano.length-1].x<larguraTela-300) {
        criarCano()
        
    }

    requestAnimationFrame(loopJogo);
}
document.addEventListener("keydown",(evento)=>{
    if (evento.code==="Space"&&jogoAtivo) {

        movimentoPassaro=-6;
        
    }
})

botaoComecar.onclick= () => iniciarJogo();