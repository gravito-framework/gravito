import { type HttpMethod } from '../../http/types';
import { NodeType, type RouteHandler } from './types';
export declare class RadixNode {
    segment: string;
    type: NodeType;
    children: Map<string, RadixNode>;
    paramChild: RadixNode | null;
    wildcardChild: RadixNode | null;
    handlers: Map<HttpMethod, RouteHandler[]>;
    paramName: string | null;
    regex: RegExp | null;
    constructor(segment?: string, type?: NodeType);
    toJSON(): any;
    static fromJSON(json: any): RadixNode;
}
//# sourceMappingURL=RadixNode.d.ts.map