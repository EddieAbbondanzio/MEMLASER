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
let SnapshotStats = class SnapshotStats {
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], SnapshotStats.prototype, "id", void 0);
__decorate([
    Column({ type: "integer" }),
    __metadata("design:type", Number)
], SnapshotStats.prototype, "size", void 0);
__decorate([
    Column({ type: "datetime" }),
    __metadata("design:type", Date)
], SnapshotStats.prototype, "createdAt", void 0);
__decorate([
    Column({ type: "datetime" }),
    __metadata("design:type", Date)
], SnapshotStats.prototype, "importedAt", void 0);
SnapshotStats = __decorate([
    Entity({ name: "snapshot_stats" })
], SnapshotStats);
export { SnapshotStats };
//# sourceMappingURL=snapshotStats.js.map