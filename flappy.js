/**
 * Creates firstHTML new HTML element with class.
 * @function
 */
function newHTMLElement(tagName, className) {
    const HTMLElement = document.createElement(tagName);
    HTMLElement.className = className;
    return HTMLElement;
}

/**
 * Creates firstHTML <div class="pipe"></div>.
 */
function Pipe(upSideDown = false) {
    this.element = newHTMLElement('div', 'pipe');

    const border = newHTMLElement('div', 'border');
    const body = newHTMLElement('div', 'body');
    this.element.appendChild(upSideDown ? body : border);
    this.element.appendChild(upSideDown ? border : body);

    this.setLenght = length => body.style.height = `${length}px`;
    /* this.setLenght = length => body.style.height = `${screen.height}px`; */
}

/**
 * Creates firstHTML pair of pipes (top and bottom) and sets the initial position.
 */
function PairOfPipes(length, openning, xAxis) {
    this.element = newHTMLElement('div', 'pipeSetContainer');

    this.superior = new Pipe(true);
    this.inferior = new Pipe(false);

    this.element.appendChild(this.superior.element);
    this.element.appendChild(this.inferior.element);

    this.setOpenningPosition = () => {
        const superiorPipesLenght = Math.random() * (length - openning);
        const inferiorPipesLenght = length - openning - superiorPipesLenght;
        this.superior.setLenght(superiorPipesLenght);
        this.inferior.setLenght(inferiorPipesLenght);
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0]);
    this.setX = xAxis => this.element.style.left = `${xAxis}px`;
    this.getLargura = () => this.element.clientWidth;

    this.setOpenningPosition();
    this.setX(xAxis);
}

/**
 * Creates the four pairs of pipes, sets their initial position and the distance between them.
 */
function pipesSet(length, width, openning, distance, scoreAPoint) {
    this.pairs = [
        new PairOfPipes(length, openning, width),
        new PairOfPipes(length, openning, width + distance),
        new PairOfPipes(length, openning, width + distance * 2),
        new PairOfPipes(length, openning, width + distance * 3)
    ]

    let speed = 3;
    this.animar = () => {
        this.pairs.forEach(par => {
            par.setX(par.getX() - speed)

            // Creates firstHTML Loop
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + distance * this.pairs.length);
                par.setOpenningPosition()
            }

            const middleOfTheScreen = width / 2;
            const transpassedTheMiddle = par.getX() + speed >= middleOfTheScreen &&
                par.getX() < middleOfTheScreen;
            if (transpassedTheMiddle) scoreAPoint();
        })
    }
}


/**
 * Creates the element for the bird and set its initial position at the middle of the screen.
 */
function Bird(screenHeight) {
    let isFlapping = false;

    this.element = newHTMLElement('img', 'bird');
    this.element.src = './img/bird.png';

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
    this.setY = yAxis => this.element.style.bottom = `${yAxis}px`;

    window.onkeydown = e => isFlapping = true;
    window.onkeyup = e => isFlapping = false;

    this.animar = () => {
        const newYAxis = this.getY() + (isFlapping ? 5 : -5);
        const maxHeight = screenHeight - this.element.clientHeight;

        if (newYAxis <= 0) {
            this.setY(0);
        } else if (newYAxis >= maxHeight) {
            this.setY(maxHeight);
        } else {
            this.setY(newYAxis);
        }
    }
    this.setY(screenHeight / 2);
}

/**
 * Insert the HTMLElement for the scoreboard.
 */
function Progress() {
    this.element = newHTMLElement('span', 'progress');
    this.updateScore = points => {
        this.element.innerHTML = points
    }
    this.updateScore(0);
}

function getElementsPosition(firstHTMLElement, secondHTMLElement) {
    const firstHTML = firstHTMLElement.getBoundingClientRect();
    const secondHTML = secondHTMLElement.getBoundingClientRect();

    const horizontal = firstHTML.left + firstHTML.width >= secondHTML.left &&
        secondHTML.left + secondHTML.width >= firstHTML.left;

    const vertical = firstHTML.top + firstHTML.height >= secondHTML.top &&
        secondHTML.top + secondHTML.height >= firstHTML.top;

    return horizontal && vertical;
}

/**
 * Check if the bird hit the pipes
 */
function checkOverLap(bird, pipeSet) {
    let overLapped = false;
    pipeSet.pairs.forEach(pairOfPipes => {
        if (!overLapped) {
            const superior = pairOfPipes.superior.element;
            const inferior = pairOfPipes.inferior.element;
            overLapped = getElementsPosition(bird.element, superior) ||
                getElementsPosition(bird.element, inferior);
        }
    })
    return overLapped;
}

/**
 * Builds the game environment.
 */
function FlappyBird() {
    let points = 0;

    const gameScreen = document.querySelector('[flappy]');
    const length = gameScreen.clientHeight;
    const width = gameScreen.clientWidth;

    const progress = new Progress();
    const pipeSet = new pipesSet(length, width, 210, 450,
        () => progress.updateScore(++points));
    const bird = new Bird(length);

    gameScreen.appendChild(progress.element);
    gameScreen.appendChild(bird.element);
    pipeSet.pairs.forEach(par => gameScreen.appendChild(par.element))

    this.start = () => {
        const timer = setInterval(() => {
            pipeSet.animar();
            bird.animar();

            if (checkOverLap(bird, pipeSet)) {
                clearInterval(timer)
                document.getElementById('gameOver').classList.remove('dHide');
            }
        }, 20)
    }
}

/**
 * Start the game.
 */
let enterEvent = document.querySelector('body');
let gameOn = false;

enterEvent.addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (!gameOn) {
            new FlappyBird().start();
            gameOn = true;
            document.getElementById('menuStart').classList.add('dHide');
        }
    }
});