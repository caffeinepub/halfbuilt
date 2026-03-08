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
export interface backendInterface {
    getProject(id: bigint): Promise<Project>;
    listProjects(): Promise<Array<Project>>;
}
