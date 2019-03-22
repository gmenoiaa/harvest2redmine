interface Command {
    execute(args: Array<any>): Promise<any>;
}
