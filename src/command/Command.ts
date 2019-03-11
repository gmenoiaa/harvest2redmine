interface Command {
    execute(args: Array<string>): Promise<any>;
}
