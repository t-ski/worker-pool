# Worker Pool

## Abstract Class

The abstract `WorkerPool` class allows to implement an arbitrary modular worker mechanism:

``` ts
interface IWorkerPoolOptions {
    baseSize?: number;
    timeout?: number;
    maxPending?: number;
}

abstract class WorkerPool<Worker extends EventEmitter, IOptions extends IWorkerPoolOptions, I, O, E> extends EventEmitter {
    protected readonly options: IOptions;
    protected readonly workerModulePath: string;

    constructor(workerModulePath: string, options?: IOptions);

    protected abstract createWorker(): Worker | Promise<Worker>;
    protected abstract activateWorker(worker: Worker, dataIn: I): void;
    protected abstract destroyWorker(worker: Worker): void;
}
```

| Generic | Description |
| :- | :- |
| `Worker` | Worker class (instances to activate) |
| `I` | Worker input type |
| `O` | Worker output type |
| `E` | Worker error type |

## ThreadPool

<sup>*Pseudo concurrency*</sup>

``` ts
class ThreadPool<I, O, E>
```

## Process Pool

<sup>*Real concurrency (multi core)*</sup>

``` ts
interface IProcessPoolOptions extends IWorkerPoolOptions {
    processOptions?: {
        args?: string[];
        cwd?: string;
    };
}

class ProcessPool<I extends string|Buffer, O extends string| Buffer, E>
```

> Due to IPC nature, input and output of process pool workers must be serialisable.

##

<sub>&copy; Thassilo Martin Schiepanski</sub>
