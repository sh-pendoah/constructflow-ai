"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceDoc = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const complianceDocSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    type: {
        type: String,
        enum: ['coi', 'license', 'permit', 'certification', 'other'],
        required: true,
    },
    title: { type: String, required: true, trim: true },
    company: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    contractorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Contractor' },
    contractorName: { type: String, trim: true },
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'COIVendor' },
    documentNumber: { type: String, trim: true },
    issueDate: { type: Date },
    expirationDate: { type: Date },
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRING', 'EXPIRED', 'INACTIVE'],
        default: 'ACTIVE',
    },
    documentUrl: { type: String, required: true },
    notes: { type: String, trim: true },
    alerts: {
        '30_DAY': { type: Boolean },
        '30_DAY_sentAt': { type: Date },
        '15_DAY': { type: Boolean },
        '15_DAY_sentAt': { type: Date },
        '7_DAY': { type: Boolean },
        '7_DAY_sentAt': { type: Date },
    },
    lastStatusChange: { type: Date },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
complianceDocSchema.index({ tenantId: 1, company: 1, type: 1 });
complianceDocSchema.index({ status: 1 });
complianceDocSchema.index({ expirationDate: 1 });
complianceDocSchema.index({ contractorId: 1 });
exports.ComplianceDoc = mongoose_1.default.model('ComplianceDoc', complianceDocSchema);
