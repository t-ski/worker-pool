import { ChildProcess, fork } from "child_process";
import { IWorkerPoolOptions, WorkerPool } from "./WorkerPool";


export interface IProcessPoolOptions extends IWorkerPoolOptions {
    processOptions?: {
        args?: string[];
        cwd?: string;
    };
}


export class ProcessPool<I extends string|Buffer, O extends string|Buffer, E> extends WorkerPool<ChildProcess, I, O, E, IProcessPoolOptions> {
	constructor(childProcessModulePath: string, options: IProcessPoolOptions) {
		super(childProcessModulePath, options);
	}
    
	protected createWorker(): Promise<ChildProcess> {        
    	const childProcess = fork(this.workerModulePath, this.options.processOptions?.args ?? [], {
			cwd: this.options.processOptions?.cwd ?? process.cwd(),
			silent: true
    	});
		childProcess.stdout.on("data", (message: Buffer) => process.stdout.write(message.toString()));
		childProcess.stderr.on("data", (err: Buffer) => process.stderr.write(err.toString()));
		
    	return new Promise((resolve) => {
			childProcess
			.on("message", (output: O) => {
				this.deactivateWorker(childProcess, output);
			})
			.on("error", (err: Error) => {
				// TODO: Spin up new (?)
				throw err;
			});

			setImmediate(() => resolve(childProcess));
		});
	}
    
	protected destroyWorker(childProcess: ChildProcess) {
    	childProcess.send("terminate");
		
    	childProcess.kill();
	}

	protected activateWorker(childProcess: ChildProcess, input: I) {
    	childProcess.send(input);
	}
}