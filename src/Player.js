class Player {
  constructor ({neat, games, onEndGeneration}) {
    this.neat = neat
    this.simultaneousGames = []
    this.gamesFinished = 0
    // this.onGameOver = onEndGeneration

    for (let i = 0; i < 1; i++) {
      // new asteroid game
      const newGame = new Game(this.onGameOver);
      this.simultaneousGames.push(newGame);
    }
  }

  startGeneration () {
    this.gamesFinished = 0

    for (let i = 0; i < this.simultaneousGames.length; i++) {
      // this.simultaneousGames[i].snake.brain = this.neat.population[i]
      // this.simultaneousGames[i].snake.brain.score = 0
      console.log('asdasdasdasdasd', this.simultaneousGames[i]);
      this.simultaneousGames[i].startGame();
    }
  }

  onGameOver = score => {
    if (this.gamesFinished + 1 < this.simultaneousGames.length) {
      this.gamesFinished++;
      return;
    } else {
      this.endGeneration(score);
    }
  }

  endGeneration = score => {
    console.log('is this ok?', score)
    this.neat.sort()

    this.onEndGeneration({
      generation: this.neat.generation,
      max: this.neat.getFittest().score,
      avg: Math.round(this.neat.getAverage()),
      min: this.neat.population[this.neat.popsize - 1].score
    })

    const newGeneration = []

    for (let i = 0; i < this.neat.elitism; i++) {
      newGeneration.push(this.neat.population[i])
    }

    for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
      newGeneration.push(this.neat.getOffspring())
    }

    this.neat.population = newGeneration
    this.neat.mutate()
    this.neat.generation++
    this.startGeneration()
  }

}