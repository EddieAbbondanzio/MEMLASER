var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
let Snapshot = class Snapshot {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Snapshot.prototype, "id", void 0);
__decorate([
    Column({ type: "json" }),
    __metadata("design:type", Object)
], Snapshot.prototype, "meta", void 0);
__decorate([
    Column({ type: "integer" }),
    __metadata("design:type", Number)
], Snapshot.prototype, "nodeCount", void 0);
__decorate([
    Column({ type: "integer" }),
    __metadata("design:type", Number)
], Snapshot.prototype, "edgeCount", void 0);
__decorate([
    Column({ type: "integer" }),
    __metadata("design:type", Number)
], Snapshot.prototype, "traceFunctionCount", void 0);
Snapshot = __decorate([
    Entity({ name: "snapshots" })
], Snapshot);
export { Snapshot };
//# sourceMappingURL=snapshot.js.map