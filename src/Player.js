class Player {
  constructor ({neat, games, onEndGeneration}) {
    this.neat = neat
    this.simultaneousGames = []
    this.gamesFinished = 0
    this.onEndGeneration = onEndGeneration

    for (let i = 0; i < 1; i++) {
      // new asteroid game
      this.simultaneousGames.push(new Game({
        onGameOver: () => this.endGeneration()
      }))
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

  endGeneration () {
    if (this.gamesFinished + 1 < this.simultaneousGames.length) {
      this.gamesFinished++
      return
    }

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