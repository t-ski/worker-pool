import { Worker as Thread, SHARE_ENV } from "worker_threads";

import { IWorkerPoolOptions, WorkerPool } from "./WorkerPool";


export class ThreadPool<I, O, E> extends WorkerPool<Thread, I, O, E> {
	constructor(threadModulePath: string, options?: IWorkerPoolOptions) {
		super(threadModulePath, options);
	}
	
	protected createWorker(): Promise<Thread> {
    	const thread = new Thread(this.workerModulePath, {
    		argv: process.argv.slice(2),
    		env: SHARE_ENV
    	});
		
		thread.on("message", (output: O) => {
			this.deactivateWorker(thread, output); 
		});
		thread.on("error", (err: E) => {
			// TODO: Spin up new (?)
			throw err;
		});
        
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