export class LoadingTime {
    private loadingTime: number = 0;
    private interval: any = null;
    private history: Array<{command: string, message: string, timestamp: Date}> = [];

    private addHistoryEntry(command: string, message: string): void {
        this.history.push({ command, message, timestamp: new Date() });
    }

    public start(message: string = '', consoleLog: boolean = false): LoadingTime {
        if (this.interval) {
            if (consoleLog) {
                console.log(`Timer is already running. ${message}`);
            }
            return this;
        }
        this.loadingTime = 0;
        this.interval = setInterval(() => {
            this.loadingTime += 10;
        }, 10);
        if (consoleLog) {
            console.log(`Timer started. ${message}`);
        }
        this.addHistoryEntry('start', message);
        return this;
    }

    public pause(message: string = '', consoleLog: boolean = false): LoadingTime {
        if (!this.interval) {
            if (consoleLog) {
                console.log(`Timer is not running. ${message}`);
            }
            return this;
        }
        clearInterval(this.interval);
        this.interval = null;
        if (consoleLog) {
            console.log(`Timer paused. ${message}`);
        }
        this.addHistoryEntry('pause', message);
        return this;
    }

    public midStep(message: string = '', consoleLog: boolean = true): LoadingTime {
        if (consoleLog) {
            console.log(`Current Timer: ${this.loadingTime}ms. ${message}`);
        }
        this.addHistoryEntry('midStep', message);
        return this;
    }

    public stop(message: string = '', consoleLog: boolean = false): LoadingTime {
        clearInterval(this.interval);
        this.interval = null;
        if (consoleLog) {
            console.log(`Timer stopped at ${this.loadingTime}ms. ${message}`);
        }
        this.loadingTime = 0;
        this.addHistoryEntry('stop', message);
        return this;
    }

    public report(): LoadingTime {
        console.log("Timer Commands History:");
        this.history.forEach(entry => {
            console.log(`${entry.timestamp.toISOString()} - ${entry.command}: ${entry.message}`);
        });
        return this;
    }
}

// Usage example
/*
async function demo() {
    const timer = new LoadingTime();
    timer.start("Starting the process.", true);
    await new Promise(resolve => setTimeout(resolve, 100));
    timer.pause("Taking a short break.", true);
    await new Promise(resolve => setTimeout(resolve, 100));
    timer.start("Resuming the process.", true);
    timer.midStep("Checking the mid-step timer.", true);
    await new Promise(resolve => setTimeout(resolve, 100));
    timer.stop("Process completed.", true);

    // Reporting the command history
    timer.report();
}
//demo();
*/