export declare class ProjectAgent {
    private client;
    constructor(apiKey: string);
    analyzeProject(projectId: string): Promise<{
        projectId: string;
        projectName: any;
        report: string | null;
        timestamp: string;
    }>;
}
