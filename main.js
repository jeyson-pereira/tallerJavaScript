// Constructor del tablero
(function () {
  self.Board = function (width, height) {
    this.width = width;
    this.height = height;
    this.playing = false;
    this.game_over = false;
    this.bars = [];
    this.ball = null;
  };

  self.Board.prototype = {
    get elements() {
      var elements = this.bars.map(function (bar) {
        return bar;
      });
      elements.push(this.ball);
      return elements;
    },
  };
})();

// Constructor de la bola
(function () {
  self.Ball = function (x, y, radius, board) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed_y = 0;
    this.speed_x = 2;
    this.board = board;
    this.direction = -1;
    this.bounce_angle = 0;
    this.max_bounce_angle = Math.PI / 12;
    this.speed = 2;
    board.ball = this;
    this.kind = "circle";
  };

  // Movimiento, tamaño y colision de la bola (con alguna barra)
  self.Ball.prototype = {
    move: function () {
      this.x = this.x + this.speed_x * this.direction;
      this.y += this.speed_y;
    },
    get width() {
      return this.radius * 2;
    },
    get height() {
      return this.radius * 2;
    },
    // reacción a colision con la barra recibida
    collision: function (bar) {
      let relative_intersect_y = bar.y + bar.height / 2 - this.y;
      let normalized_intersect_y = relative_intersect_y / (bar.height / 2);

      this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

      this.speed_y = this.speed * -Math.sin(this.bounce_angle);
      this.speed_x = this.speed * Math.cos(this.bounce_angle);

      if (this.x > this.board.width / 2) this.direction = -1;
      else this.direction = 1;
    },
  };
})();

// Constructor de la barra
(function () {
  self.Bar = function (x, y, width, height, board) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.board = board;
    this.board.bars.push(this);
    this.kind = "rectangle";
    this.speed = 5;
  };

  // Movimiento de la barra
  self.Bar.prototype = {
    down: function () {
      this.y += this.speed;
    },
    up: function () {
      this.y -= this.speed;
    },
    toString: function () {
      return "x: " + this.x + " y: " + this.y;
    },
  };
})();

// Manejo del canvas donde dibuja, borra y controla el juego
(function () {
  self.BoardView = function (canvas, board) {
    this.canvas = canvas;
    this.canvas.width = board.width;
    this.canvas.height = board.height;
    this.board = board;
    this.ctx = canvas.getContext("2d");
  };

  self.BoardView.prototype = {
    clean: function () {
      this.ctx.clearRect(0, 0, this.board.width, this.board.height);
    },
    draw: function () {
      for (let i = this.board.elements.length - 1; i >= 0; i--) {
        let el = this.board.elements[i];
        draw(this.ctx, el);
      }
    },
    check_colisions: function () {
      for (let i = this.board.bars.length - 1; i >= 0; i--) {
        let bar = this.board.bars[i];
        if (hit(bar, this.board.ball)) {
          this.board.ball.collision(bar);
        }
      }
    },
    play: function () {
      if (this.board.playing) {
        this.clean();
        this.draw();
        this.check_colisions();
        this.board.ball.move();
      }
    },
  };

  // Validar colisiones entre puntos a y b
  function hit(a, b) {
    let hit = false;
    // colisiones horizontales
    if (b.x + b.width >= a.x && b.x < a.x + a.width) {
      // colisiones verticales
      if (b.y + b.height >= a.y && b.y < a.y + a.height) {
        hit = true;
      }
    }
    // colision A con B
    if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
      //Colisiones verticales
      if (b.y <= a.y && b.y + b.height >= a.y + a.height) {
        hit = true;
      }
    }
    // colision B con A
    if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
      // colisiones verticales
      if (a.y <= b.y && a.y + a.height >= b.y + b.height) {
        hit = true;
      }
    }
    return hit;
  }

  // contexto del canvas y los elementos en coordenadas
  function draw(ctx, element) {
    switch (element.kind) {
      case "rectangle":
        ctx.fillRect(element.x, element.y, element.width, element.height);
        break;
      case "circle":
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.radius, 0, 7);
        ctx.fill();
        ctx.closePath();
        break;
    }
  }
})();

// Inicializar los elementos mediante su constructor
let board = new Board(800, 400);
let bar = new Bar(20, 100, 40, 100, board);
let bar2 = new Bar(735, 100, 40, 100, board);
let canvas = document.getElementById("canvas");
let board_view = new BoardView(canvas, board);
let ball = new Ball(350, 100, 10, board);

// Detección de teclas mediante eventos keydown
document.addEventListener("keydown", function (event) {
  event.preventDefault();
  // Manejo de movimiento mediante flecha arriba y abajo
  if (event.keyCode == 38) {
    event.preventDefault();
    bar.up();
  } else if (event.keyCode == 40) {
    event.preventDefault();
    bar.down();
  } else if (event.keyCode === 87) {
    event.preventDefault();
    // Movimiento mediante W
    bar2.up();
  } else if (event.keyCode === 83) {
    event.preventDefault();
    // Movimiento mediante S
    bar2.down();
  } else if (event.keyCode === 32) {
    event.preventDefault();
    board.playing = !board.playing;
  }
});

board_view.draw(); // Dibujar canvas al cargar pagina

window.requestAnimationFrame(controller); // Animación por frames mediante el controlador

setTimeout(function () {
  ball.direction = -1;
}, 4000);

// controlador del juego
function controller() {
  board_view.play();
  window.requestAnimationFrame(controller);
}
