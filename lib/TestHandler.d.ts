import { Executable } from 'scaffold-kit';
interface IterateFileParameter {
    message: string;
    expected: string | null;
    generated: () => string | null;
}
declare type IterateFileCallback = (param: IterateFileParameter) => void;
declare class TestHandler {
    private executable;
    private command;
    private fixtureDirectory?;
    private expectedDirectory;
    private tempDirectory;
    private destroyed;
    private executed;
    constructor(executable: Executable, command: string, expectedDirectory: string, fixtureDirectory?: string);
    destroy(): void;
    execute(): Promise<void>;
    iterateFiles: (callback: IterateFileCallback) => void;
}
export default TestHandler;
