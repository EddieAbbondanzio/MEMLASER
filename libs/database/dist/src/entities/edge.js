var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Node } from "./node.js";
import { EdgeType } from "../valueObjects/edge.js";
let Edge = class Edge {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Edge.prototype, "id", void 0);
__decorate([
    Column({ type: "integer" }),
    __metadata("design:type", Number)
], Edge.prototype, "index", void 0);
__decorate([
    Column({ type: "integer" }),
    __metadata("design:type", String)
], Edge.prototype, "type", void 0);
__decorate([
    Column({ type: "text" }),
    __metadata("design:type", String)
], Edge.prototype, "name", void 0);
__decorate([
    Column({ type: "integer" }),
    OneToOne(() => Node, n => n.id),
    __metadata("design:type", Number)
], Edge.prototype, "fromNodeId", void 0);
__decorate([
    Column({ type: "integer" }),
    OneToOne(() => Node, n => n.id),
    __metadata("design:type", Number)
], Edge.prototype, "toNodeId", void 0);
Edge = __decorate([
    Entity({ name: "edges" })
], Edge);
export { Edge };
//# sourceMappingURL=edge.js.map