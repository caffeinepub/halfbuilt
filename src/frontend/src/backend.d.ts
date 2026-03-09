import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Project {
    id: bigint;
    name: string;
    tags: Array<string>;
    description: string;
    causeOfDeath: string;
    category: string;
    potentialScore: number;
    price: number;
}
export interface CommunityLinks {
    x: string;
    discord: string;
    reddit: string;
}
export interface backendInterface {
    getCommunityLinks(): Promise<CommunityLinks>;
    getFounderSpotsRemaining(): Promise<bigint>;
    getProject(id: bigint): Promise<Project>;
    listProjects(): Promise<Array<Project>>;
    submitProject(name: string, githubUrl: string, abandonmentReason: string, askingPrice: number, isPublic: boolean): Promise<bigint>;
}
