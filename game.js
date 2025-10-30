const canvas = document.getElementById('canvasJogo');
const ctx = canvas.getContext("2d");
const larguraTela=canvas.width;
const alturaTela = canvas.height;
const larguraCano = 70;
let gravidade = 0.15;
let movimentoPassaro = 0;
let jogoAtivo = false;
let pontuacao = 0;
let velocidadeCanos = 1.5;
let limitePontuacao = 5;
let pontuacaoMaxima = parseInt(localStorage.getItem("pontuacaoMaxima") || "0", 10);
let passaroY = alturaTela / 2;
let passaroX = 100;
let listaDeCano = [];
let canosPassados = new Set(); // Rastreia canos pelos quais o pássaro já passou

// Carregamento de imagens com tratamento de erro
const imagemFundo = new Image();
imagemFundo.src = "fundo.png";
imagemFundo.onerror = () => console.error("Erro ao carregar fundo.png");

const imagemPassaro = new Image();
imagemPassaro.src = "passaro.png";
imagemPassaro.onerror = () => console.error("Erro ao carregar passaro.png");

const imagemCano = new Image();
imagemCano.src = "cano.png";
imagemCano.onerror = () => console.error("Erro ao carregar cano.png");

const botaoComecar = document.getElementById("botaoComecar");


function iniciarJogo() {
    jogoAtivo = true;
    listaDeCano = [];
    canosPassados.clear();

    passaroY = alturaTela / 2;
    movimentoPassaro = 0;
    pontuacao = 0;
    gravidade = 0.15;
    velocidadeCanos = 1.5;
    limitePontuacao = 5;
    botaoComecar.style.display = 'none';

    loopJogo();
}


function desenharFundo() {
    ctx.drawImage(imagemFundo, 0, 0, larguraTela, alturaTela);
}


function desenharPassaro() {
    ctx.drawImage(imagemPassaro, passaroX, passaroY, 34, 24);
}

function criarCano() {
    const tamanhoGap = Math.floor(Math.random() * 50) + 100;
    const posicaoGap = Math.floor(Math.random() * (alturaTela - tamanhoGap - 100)) + 50;
    const canoId = Date.now() + Math.random(); // ID único para rastrear cada cano
    listaDeCano.push({x: larguraTela, y: posicaoGap, gap: tamanhoGap, id: canoId});
}

function desenhaCanos() {
    listaDeCano.forEach(cano => {
        // Cano superior (invertido)
        ctx.save();
        ctx.translate(cano.x + larguraCano / 2, cano.y - imagemCano.height / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(imagemCano, -larguraCano / 2, -imagemCano.height / 2, larguraCano, imagemCano.height);
        ctx.restore();

        // Cano inferior
        ctx.drawImage(imagemCano, cano.x, cano.y + cano.gap, larguraCano, imagemCano.height);
    });
}

function moverCanos() {
    listaDeCano.forEach(cano => {
        cano.x -= velocidadeCanos;
    });
    
    // Remove canos que saíram da tela (mais eficiente fazer fora do forEach)
    listaDeCano = listaDeCano.filter(cano => cano.x > -larguraCano);
}

function verificarColisoes() {
    const passaroLargura = 34;
    const passaroAltura = 24;
    
    // Verifica colisão com canos e pontuação
    for(const cano of listaDeCano) {
        // Verifica se o pássaro passou pelo cano (pontuação)
        if (!canosPassados.has(cano.id) && passaroX > cano.x + larguraCano) {
            canosPassados.add(cano.id);
            pontuacao += 1; // Pontuação real por passar pelo cano
        }
        
        // Verifica se o pássaro está na mesma posição X do cano (sobreposição horizontal)
        if (passaroX + passaroLargura > cano.x && passaroX < cano.x + larguraCano) {
            // Gap seguro: entre cano.y (onde termina o cano superior) e cano.y + cano.gap (onde começa o cano inferior)
            // Verifica se o pássaro está completamente dentro do gap seguro
            const dentroDoGap = (passaroY >= cano.y && passaroY + passaroAltura <= cano.y + cano.gap);
            
            // Se NÃO está completamente dentro do gap, colidiu com algum cano
            if (!dentroDoGap) {
                gameOver();
                return;
            }
        }
    }

    // Verifica colisão com bordas da tela
    if (passaroY < 0 || passaroY + passaroAltura > alturaTela) {
        gameOver();
    }
}

function gameOver() {
    jogoAtivo = false;
    botaoComecar.style.display = "block";
    atualizarPontuacaoMaxima();
}

function exibirPontuacao() {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    
    ctx.fillText(`Pontuação: ${Math.floor(pontuacao)}`, 10, 30);
    
    if (pontuacaoMaxima > 0) {
        ctx.textAlign = "right";
        ctx.fillText(`Recorde: ${pontuacaoMaxima}`, larguraTela - 10, 30);
    }
    
    ctx.textAlign = "left"; // Reset para outros textos
}

function atualizarPontuacaoMaxima() {
    if (pontuacao > pontuacaoMaxima) {
        pontuacaoMaxima = Math.floor(pontuacao);
        localStorage.setItem("pontuacaoMaxima", pontuacaoMaxima.toString());
    }
}



function loopJogo() {
    if (!jogoAtivo) return;
    
    ctx.clearRect(0, 0, larguraTela, alturaTela);
    desenharFundo();
    desenharPassaro();
    desenhaCanos();

    // Física do pássaro
    movimentoPassaro += gravidade;
    passaroY += movimentoPassaro;

    moverCanos();
    verificarColisoes();
    exibirPontuacao();

    // Aumenta dificuldade baseado na pontuação (mais gradual)
    if (pontuacao >= limitePontuacao) {
        velocidadeCanos += 0.03;
        gravidade += 0.003;
        limitePontuacao += 5;
    }

    // Cria novos canos (com mais espaço entre eles)
    if (listaDeCano.length === 0 || listaDeCano[listaDeCano.length - 1].x < larguraTela - 350) {
        criarCano();
    }

    requestAnimationFrame(loopJogo);
}
document.addEventListener("keydown", (evento) => {
    if (evento.code === "Space") {
        evento.preventDefault(); // Previne scroll da página
        if (jogoAtivo) {
            movimentoPassaro = -4.5;
        } else if (botaoComecar.style.display !== "none") {
            // Permite iniciar o jogo pressionando espaço
            iniciarJogo();
        }
    }
});

botaoComecar.onclick = () => iniciarJogo();