class Player {
  constructor ({neat, games, onEndGeneration}) {
    this.neat = neat
    this.simultaneousGames = []
    this.gamesFinished = 0
    this.onEndGeneration = onEndGeneration

    for (let i = 0; i < games; i++) {
      // new asteroid game
      const newGame = new Game(this.onGameOver);
      this.simultaneousGames.push(newGame);
    }
  }

  startGeneration = () => {
    this.gamesFinished = 0

    for (let i = 0; i < this.simultaneousGames.length; i++) {
      this.simultaneousGames[i].startGame(this.neat.population[i]);
    }
  }

  onGameOver = () => {
    if (this.gamesFinished + 1 < this.simultaneousGames.length) {
      this.gamesFinished++;
      return;
    } else {
      this.endGeneration();
    }
  }

  endGeneration = () => {
    this.neat.sort();
    const newGeneration = [];

    for (let i = 0; i < this.neat.elitism; i++) {
      newGeneration.push(this.neat.population[i]);
    }

    for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
      newGeneration.push(this.neat.getOffspring());
    }

    this.neat.population = newGeneration;
    this.neat.mutate();
    this.neat.generation++;
    this.onEndGeneration({
      generation: this.neat.generation,
      score: this.neat.getFittest().score,
    });
    // this.startGeneration();
  }

}