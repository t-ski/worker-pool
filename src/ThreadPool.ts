import { Worker as Thread, SHARE_ENV } from "worker_threads";

import { IWorkerPoolOptions, WorkerPool } from "./WorkerPool";


interface IThreadOptions {
	workingDir?: string;
	devMode?: boolean;
}

interface IThreadPoolOptions extends IWorkerPoolOptions {
	threadOptions: IThreadOptions;
};


export class ThreadPool<I, O, E> extends WorkerPool<Thread, I, O, E> {
	private readonly threadOptions: IThreadOptions;

	constructor(threadModulePath: string, options: IThreadPoolOptions) {
		super(threadModulePath, options);

		this.threadOptions = options.threadOptions ?? {};
	}
	
	protected createWorker(): Promise<Thread> {
    	const thread = new Thread(this.workerModulePath, {
    		argv: process.argv.slice(2),
    		env: SHARE_ENV,
			workerData: this.threadOptions
    	});
		
		thread.on("message", (output: O) => {
			this.deactivateWorker(thread, output); 
		});
		/* thread.on("error", (potentialStatus: number|unknown) => {
			// TODO: Spin up new (?)
		}); */
        
    	return new Promise((resolve) => {
    		thread.once("online", () => resolve(thread));
    	});
	}
    
	protected destroyWorker(thread: Thread) {
    	thread.terminate();
	}

	protected activateWorker(thread: Thread, input: I) {
    	thread.postMessage(input);
	}
}